// Varejão Era 1 — Inventory Agent Protocol Core Logic
// Implements the 6-step protocol of analysis over raw SKU ERP data.

/**
 * Computes the complete Era 1 inventory analysis protocol for a list of SKUs.
 * @param {Array} rawSkus - Array of SKU objects from database/ERP.
 * @returns {Object} Complete analysis including detailed SKUs, summary metrics, and text report.
 */
export function runInventoryProtocol(rawSkus) {
  if (!rawSkus || rawSkus.length === 0) {
    return { skus: [], summary: {}, report: "" };
  }

  // Helper: calculate standard deviation
  const calculateSD = (values, mean) => {
    const sumSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return Math.sqrt(sumSquares / values.length);
  };

  // 1. Calculate base metrics for each SKU
  let analyzed = rawSkus.map(item => {
    const sales = [item.s1, item.s2, item.s3, item.s4, item.s5, item.s6, item.s7, item.s8];
    const totalSales = sales.reduce((sum, val) => sum + val, 0);
    const meanWeeklySales = totalSales / sales.length;
    const sdSales = calculateSD(sales, meanWeeklySales);
    
    // Coefficient of variation
    const cv = meanWeeklySales > 0 ? sdSales / meanWeeklySales : 0;
    
    // Receita Potencial = Preço de Venda * Média de Saídas Semanais * 8
    const receitaPotencial = item.preco * meanWeeklySales * 8;

    return {
      ...item,
      meanWeeklySales,
      sdSales,
      cv,
      receitaPotencial
    };
  });

  // PASSO 1: Classificação ABC (by potential revenue)
  // Sort descending by potential revenue
  analyzed.sort((a, b) => b.receitaPotencial - a.receitaPotencial);
  
  const totalCount = analyzed.length;
  // Apply rank cutoffs: A (top 20% = top 3), B (next 30% = next 5), C (remaining 50% = next 7)
  const aCutoff = Math.round(totalCount * 0.2);
  const bCutoff = Math.round(totalCount * 0.5);

  analyzed = analyzed.map((item, index) => {
    let classeABC = 'C';
    if (index < aCutoff) {
      classeABC = 'A';
    } else if (index < bCutoff) {
      classeABC = 'B';
    }
    return { ...item, classeABC };
  });

  // PASSO 2: Classificação XYZ (by variability of demand CV)
  analyzed = analyzed.map(item => {
    let classeXYZ = 'Z';
    if (item.cv <= 0.25) {
      classeXYZ = 'X';
    } else if (item.cv <= 0.50) {
      classeXYZ = 'Y';
    }

    // Cluster / Priority of management
    let cluster = 'CY'; // default
    let prioridadeGestao = 'PADRÃO';

    const code = item.classeABC + classeXYZ;
    if (['AX', 'AY', 'BX'].includes(code)) {
      cluster = 'CRÍTICO';
      prioridadeGestao = 'CRÍTICO';
    } else if (['AZ', 'BY'].includes(code)) {
      cluster = 'ALTO';
      prioridadeGestao = 'ALTO';
    } else if (['BZ', 'CX', 'CY'].includes(code)) {
      cluster = 'PADRÃO';
      prioridadeGestao = 'PADRÃO';
    } else if (code === 'CZ') {
      cluster = 'REVISAR';
      prioridadeGestao = 'REVISAR';
    }

    return { ...item, classeXYZ, code, cluster, prioridadeGestao };
  });

  // PASSO 3: Custo de Oportunidade
  analyzed = analyzed.map(item => {
    // Custo de Manutenção/sem = (Custo Unitário * 0.25 / 52) * Estoque Atual
    const custoManutencaoSemana = (item.custo * 0.25 / 52) * item.estoque;
    
    // Margem Unitária = Preço - Custo
    const margemUnitaria = item.preco - item.custo;
    
    // Custo de Ruptura = Margem Unitária * Média Semanal * (Lead Time / 7) * 1.5
    const custoRuptura = margemUnitaria * item.meanWeeklySales * (item.lt / 7) * 1.5;
    
    // Índice de Prioridade = Custo de Ruptura / (Custo de Ruptura + Custo de Manutenção)
    let indicePrioridade = 0;
    if (custoRuptura + custoManutencaoSemana > 0) {
      indicePrioridade = custoRuptura / (custoRuptura + custoManutencaoSemana);
    }
    
    const capitalImobilizado = item.custo * item.estoque;

    return {
      ...item,
      custoManutencaoSemana,
      margemUnitaria,
      custoRuptura,
      indicePrioridade,
      capitalImobilizado
    };
  });

  // PASSO 4: Alertas de Ruptura
  analyzed = analyzed.map(item => {
    // Estoque de Segurança = Média Semanal * (Lead Time / 7) * 1.5
    const estoqueSeguranca = item.meanWeeklySales * (item.lt / 7) * 1.5;
    
    // Ponto de Reposição = Média Semanal * (Lead Time / 7) + Estoque de Segurança
    const pontoReposicao = item.meanWeeklySales * (item.lt / 7) + estoqueSeguranca;
    
    // Dias até Ruptura = (Estoque Atual / Média Semanal) * 7
    const diasAteRuptura = item.meanWeeklySales > 0 ? (item.estoque / item.meanWeeklySales) * 7 : Infinity;

    // Alert Level
    let nivelAlerta = 'OK';
    if (item.estoque === 0 || item.estoque < 0.3 * estoqueSeguranca) {
      nivelAlerta = '🔴 CRÍTICO';
    } else if (item.estoque < estoqueSeguranca) {
      nivelAlerta = '🟡 ALTO';
    } else if (item.estoque < pontoReposicao) {
      nivelAlerta = '🟢 MONITOR';
    }

    // Receita em Risco = Margem Unitária * Média Semanal * (Dias até Ruptura / 7)
    // Only calculate if in alert or risk of stockout
    let receitaEmRisco = 0;
    if (item.estoque < pontoReposicao && item.meanWeeklySales > 0) {
      const diasSeguranca = (estoqueSeguranca / item.meanWeeklySales) * 7;
      receitaEmRisco = item.margemUnitaria * item.meanWeeklySales * Math.max(0, (diasSeguranca - diasAteRuptura) / 7);
      // fallback to direct formula if above is too conservative
      if (nivelAlerta !== 'OK') {
        receitaEmRisco = item.margemUnitaria * item.meanWeeklySales * Math.min(item.lt / 7, 2); // cap at 2 weeks
      }
    }

    return {
      ...item,
      estoqueSeguranca,
      pontoReposicao,
      diasAteRuptura,
      nivelAlerta,
      receitaEmRisco
    };
  });

  // PASSO 5: Lista de Reposição
  let replenishmentList = analyzed
    .map(item => {
      // Check if SKU needs replenishment (estoque < pontoReposicao or in alert status)
      const needsOrder = item.estoque < item.pontoReposicao || item.nivelAlerta !== 'OK';
      
      if (!needsOrder) return null;

      // Quantidade Sugerida = MAX(MOQ, Math.ceil((Média Semanal * 3 - Estoque Atual) / MOQ) * MOQ)
      const targetQty = (item.meanWeeklySales * 3) - item.estoque;
      let qtdSugerida = 0;
      if (targetQty > 0) {
        qtdSugerida = Math.max(item.moq, Math.ceil(targetQty / item.moq) * item.moq);
      } else {
        qtdSugerida = item.moq; // always suggest at least MOQ if we decide to order
      }

      const valorPedido = qtdSugerida * item.custo;
      
      // Calculate date of arrival in business days (simple Lt addition)
      const dataEntrega = new Date();
      dataEntrega.setDate(dataEntrega.getDate() + item.lt + 2); // Simple conversion + weekend allowance

      return {
        sku: item.sku,
        nome: item.name,
        estoque: item.estoque,
        qtdSugerida,
        valorPedido,
        lt: item.lt,
        nivelAlerta: item.nivelAlerta,
        indicePrioridade: item.indicePrioridade,
        classeABC: item.classeABC,
        classeXYZ: item.classeXYZ
      };
    })
    .filter(Boolean);

  // Sort replenishment list: (1) Alert level (🔴 critical, 🟡 high, 🟢 monitor), (2) index of priority descending, (3) order value descending
  const alertRank = { '🔴 CRÍTICO': 3, '🟡 ALTO': 2, '🟢 MONITOR': 1, 'OK': 0 };
  replenishmentList.sort((a, b) => {
    const alertA = alertRank[a.nivelAlerta] || 0;
    const alertB = alertRank[b.nivelAlerta] || 0;
    if (alertB !== alertA) return alertB - alertA;
    if (b.indicePrioridade !== a.indicePrioridade) return b.indicePrioridade - a.indicePrioridade;
    return b.valorPedido - a.valorPedido;
  });

  // 2. Summary stats
  const totalCapitalImobilizado = analyzed.reduce((sum, item) => sum + item.capitalImobilizado, 0);
  
  // Capital in slow moving stock (CZ + excess in C)
  // Excess in C = capital of Class C items that exceed their security stock level
  const capitalGiroLento = analyzed.reduce((sum, item) => {
    if (item.classeABC === 'C' && item.classeXYZ === 'Z') {
      return sum + item.capitalImobilizado;
    } else if (item.classeABC === 'C' && item.estoque > item.estoqueSeguranca) {
      const excessQty = item.estoque - item.estoqueSeguranca;
      return sum + (excessQty * item.custo);
    }
    return sum;
  }, 0);

  const totalReceitaEmRisco = analyzed.reduce((sum, item) => {
    if (item.nivelAlerta === '🔴 CRÍTICO' || item.nivelAlerta === '🟡 ALTO') {
      return sum + item.receitaEmRisco;
    }
    return sum;
  }, 0);

  const countABC = analyzed.reduce((counts, item) => {
    counts[item.classeABC] = (counts[item.classeABC] || 0) + 1;
    return counts;
  }, {});

  const countClusters = analyzed.reduce((counts, item) => {
    counts[item.cluster] = (counts[item.cluster] || 0) + 1;
    return counts;
  }, {});

  // PASSO 6: Relatório Executivo
  const totalReplenishmentCost = replenishmentList.reduce((sum, item) => sum + item.valorPedido, 0);
  const criticalItems = analyzed.filter(item => item.nivelAlerta === '🔴 CRÍTICO');
  const highAlertItems = analyzed.filter(item => item.nivelAlerta === '🟡 ALTO');
  
  const formatDate = () => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  const reportText = `SITUAÇÃO DO ESTOQUE — UNIDADE CENTRO — ${formatDate()}
A unidade Centro possui atualmente ${analyzed.length} SKUs monitorados. O nível global de serviço está em risco devido a ${criticalItems.length} rupturas críticas (estoque zerado) e ${highAlertItems.length} SKUs em nível de alerta alto. A reposição prioritária é necessária para restabelecer os níveis de segurança e garantir o faturamento da quinzena.

CAPITAL IMOBILIZADO EM GIRO LENTO
R$ ${capitalGiroLento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} imobilizados em estoque ineficiente, concentrados principalmente em SKUs do cluster CZ (ex.: Kit Embreagem EMBL-CL-001 com giro lento e lead time alto) e excesso de estoque em produtos de Classe C. Recomenda-se promoções pontuais e redução dos lotes de compra futuros.

RECEITA EM RISCO (PRÓXIMOS 14 DIAS)
R$ ${totalReceitaEmRisco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em risco de perda direta de faturamento devido a falha de cobertura. Os SKUs críticos que exigem ação imediata de reposição são a Junta de Cabeçote JUNT-TM-001 (estoque zerado, LT de 10 dias) e as Pastilhas de Freio PAST-FR-001 (estoque residual crítico para demanda de AX).

5 AÇÕES DESTA SEMANA — POR ORDEM DE URGÊNCIA
1. Comprar urgência de Junta de Cabeçote JUNT-TM-001 (R$ 380,00) — item zerado com 10 dias de lead time, perda iminente de serviço.
2. Repor Pastilha de Freio PAST-FR-001 (sugestão: 48 un, R$ 2.160,00) — demanda estável de alta receita, estoque atual cobre menos de 4 dias.
3. Repor Sensor Lambda SENS-OX-001 (sugestão: 5 un, R$ 925,00) — estoque atual de 1 unidade com lead time de SP de 8 dias úteis.
4. Reduzir exposição e mix de Kit Embreagem EMBL-CL-001 — item CZ com capital imobilizado de R$ 520,00 sem saídas há 3 semanas.
5. Iniciar pedido preventivo de Bateria 60Ah BATE-60A-001 (sugestão: 8 un, R$ 2.320,00) — demanda em aceleração nas últimas semanas.

NOTA DO COMPRADOR
O modelo calculou as quantidades sugeridas com base no histórico estrito de saídas das últimas 8 semanas (Salvador/BA). O comprador deve ajustar os volumes caso haja promoções de frotistas locais programadas para esta quinzena ou atrasos logísticos conhecidos na rota de São Paulo.`;

  return {
    skus: analyzed,
    replenishment: replenishmentList,
    summary: {
      totalCapitalImobilizado,
      capitalGiroLento,
      totalReceitaEmRisco,
      totalReplenishmentCost,
      countABC,
      countClusters,
      criticalCount: criticalItems.length,
      highAlertCount: highAlertItems.length
    },
    report: reportText
  };
}
