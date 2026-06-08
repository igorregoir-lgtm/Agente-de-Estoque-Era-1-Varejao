import { SkuAmostra, AnaliseSku, RelatorioExecutivo, FaseTese } from "./types";

export const SKUS_AM_DADOS: SkuAmostra[] = [
  {
    sku: "JUNT-TM",
    nome: "Junta Homocinética Vetor VT5031",
    categoria: "Transmissão",
    estoqueAtual: 2,
    saidas: [58, 52, 60], // Média ~56.7/mês (anteriormente ~13.1/sem)
    custo: 180.00,
    preco: 310.00,
    leadTimeDias: 10,
    moq: 10,
    nivelServicoAlvo: 98,
    custoArmazenagemPercentual: 25,
    desvioPrazoEntrega: 2.0
  },
  {
    sku: "PAST-FR",
    nome: "Pastilha Freio Diant. Cobreq N-2032",
    categoria: "Freios",
    estoqueAtual: 5,
    saidas: [95, 102, 98], // Média ~98.3/mês (anteriormente ~22.75/sem)
    custo: 65.00,
    preco: 110.00,
    leadTimeDias: 5,
    moq: 20,
    nivelServicoAlvo: 95,
    custoArmazenagemPercentual: 20,
    desvioPrazoEntrega: 1.0
  },
  {
    sku: "SENS-OX",
    nome: "Sensor de Oxigênio Bosch Sonda Lambda",
    categoria: "Injeção",
    estoqueAtual: 1,
    saidas: [18, 22, 20], // Média ~20.0/mês (anteriormente ~4.5/sem)
    custo: 145.00,
    preco: 290.00,
    leadTimeDias: 7,
    moq: 5
  },
  {
    sku: "AMOR-DI",
    nome: "Amortecedor Diant. Cofap GP32282",
    categoria: "Suspensão",
    estoqueAtual: 85,
    saidas: [35, 40, 36], // Média ~37.0/mês (anteriormente ~8.5/sem)
    custo: 210.00,
    preco: 390.00,
    leadTimeDias: 12,
    moq: 4
  },
  {
    sku: "OL-MO",
    nome: "Óleo de Motor Castrol Edge 5W30 Sintético",
    categoria: "Lubrificantes",
    estoqueAtual: 120,
    saidas: [275, 290, 285], // Média ~283.3/mês (anteriormente ~65.5/sem)
    custo: 32.00,
    preco: 58.00,
    leadTimeDias: 4,
    moq: 48
  },
  {
    sku: "FIL-AR",
    nome: "Filtro de Ar Tecfil ARL1032",
    categoria: "Filtros",
    estoqueAtual: 45,
    saidas: [72, 80, 75], // Média ~75.7/mês (anteriormente ~17.5/sem)
    custo: 18.00,
    preco: 35.00,
    leadTimeDias: 5,
    moq: 20
  },
  {
    sku: "BOM-AG",
    nome: "Bomba d'Água Urba UB0621",
    categoria: "Arrefecimento",
    estoqueAtual: 6,
    saidas: [40, 45, 41], // Média ~42.0/mês (anteriormente ~9.75/sem)
    custo: 115.00,
    preco: 210.00,
    leadTimeDias: 7,
    moq: 12
  },
  {
    sku: "DISC-FR",
    nome: "Disco de Freio Diant. Fremax BD4412",
    categoria: "Freios",
    estoqueAtual: 8,
    saidas: [58, 64, 60], // Média ~60.7/mês (anteriormente ~14.0/sem)
    custo: 90.00,
    preco: 175.00,
    leadTimeDias: 6,
    moq: 10
  },
  {
    sku: "VEL-IG",
    nome: "Jogo de Vela de Ignição NGK BKR7E",
    categoria: "Ignição",
    estoqueAtual: 50,
    saidas: [45, 52, 49], // Média ~48.7/mês (anteriormente ~11.25/sem)
    custo: 45.00,
    preco: 85.00,
    leadTimeDias: 5,
    moq: 10
  },
  {
    sku: "BOB-IG",
    nome: "Bobina de Ignição Magneti Marelli BI0022",
    categoria: "Ignição",
    estoqueAtual: 4,
    saidas: [16, 20, 18], // Média ~18.0/mês (anteriormente ~4.25/sem)
    custo: 135.00,
    preco: 250.00,
    leadTimeDias: 8,
    moq: 5
  },
  {
    sku: "COR-DE",
    nome: "Correia Dentada Gates 40859x19XS",
    categoria: "Transmissão",
    estoqueAtual: 22,
    saidas: [30, 42, 33], // Média ~35.0/mês (anteriormente ~8.1/sem)
    custo: 55.00,
    preco: 105.00,
    leadTimeDias: 9,
    moq: 15
  },
  {
    sku: "FIL-OL",
    nome: "Filtro de Óleo Tecfil PSL74",
    categoria: "Filtros",
    estoqueAtual: 180,
    saidas: [245, 260, 250], // Média ~251.7/mês (anteriormente ~58.25/sem)
    custo: 12.00,
    preco: 24.00,
    leadTimeDias: 5,
    moq: 50
  },
  {
    sku: "ROL-TR",
    nome: "Rolamento de Roda Traseira SKF BAH-0062",
    categoria: "Rolamentos",
    estoqueAtual: 35,
    saidas: [10, 12, 11], // Média ~11.0/mês (anteriormente ~2.6/sem)
    custo: 80.00,
    preco: 160.00,
    leadTimeDias: 10,
    moq: 5
  },
  {
    sku: "BIE-DI",
    nome: "Bieleta Dianteira Cofap BTC01103",
    categoria: "Suspensão",
    estoqueAtual: 3,
    saidas: [46, 52, 48], // Média ~48.7/mês (anteriormente ~11.25/sem)
    custo: 35.00,
    preco: 68.00,
    leadTimeDias: 6,
    moq: 15
  },
  {
    sku: "FIL-CO",
    nome: "Filtro de Combustível Fram G5857",
    categoria: "Filtros",
    estoqueAtual: 200,
    saidas: [170, 185, 180], // Média ~178.3/mês (anteriormente ~41.25/sem)
    custo: 15.00,
    preco: 30.00,
    leadTimeDias: 4,
    moq: 50
  }
];

export const ANALISES_PRECOMPUTED: AnaliseSku[] = [
  {
    sku: "JUNT-TM",
    nome: "Junta Homocinética Vetor VT5031",
    categoria: "Transmissão",
    receitaPotencial: 310 * 13.1 * 8, // ~32k
    classeABC: "A",
    cv: 0.14,
    classeXYZ: "X",
    cluster: "AX (Consumo Alto e Estável)",
    prioridadeGestao: "Máxima",
    capitalImobilizado: 2 * 180.00,
    custoManutencaoSemana: 2 * 180.00 * 0.005,
    custoRupturaEstimado: 13.1 * 310.00 * 1.5,
    indicePrioridade: 95,
    estoqueSeguranca: 18,
    pontoReposicao: 26,
    diasAteRuptura: 1.1, // crítico!
    nivelAlerta: "Crítico",
    receitaEmRisco: 310.00 * 13.1 * 1.5, // 1.5 semanas de lead time afetadas
    qtdSugerida: 30, // Repõe para equilibrar e atende o MOQ (10)
    valorPedido: 30 * 180.00,
    prazoChegada: 10,
    justificativa: "Item de curva AX com estoque de apenas 2 unidades (suficiente para apenas 1 dia de giro). Lead time é de 10 dias. Ruptura iminente gerará perda imediata de R$ 6.091 em faturamento e enviará clientes ao concorrente. Compra urgente necessária."
  },
  {
    sku: "PAST-FR",
    nome: "Pastilha Freio Diant. Cobreq N-2032",
    categoria: "Freios",
    receitaPotencial: 110 * 22.75 * 8,
    classeABC: "A",
    cv: 0.12,
    classeXYZ: "X",
    cluster: "AX (Consumo Alto e Estável)",
    prioridadeGestao: "Máxima",
    capitalImobilizado: 5 * 65.00,
    custoManutencaoSemana: 5 * 65.00 * 0.005,
    custoRupturaEstimado: 22.75 * 110.00 * 1.5,
    indicePrioridade: 92,
    estoqueSeguranca: 25,
    pontoReposicao: 38,
    diasAteRuptura: 1.5,
    nivelAlerta: "Crítico",
    receitaEmRisco: 110 * 22.75 * 1.2,
    qtdSugerida: 60, // Múltiplo do MOQ (20)
    valorPedido: 60 * 65.00,
    prazoChegada: 5,
    justificativa: "Estoque crítico (5 un) diante de um consumo de 22.75 unidades por semana. Estoque atual zera em menos de 2 dias úteis, e o prazo de entrega da fábrica é de 5 dias. Pedido sugerido de 60 unidades para recompor estoque mínimo de segurança."
  },
  {
    sku: "SENS-OX",
    nome: "Sensor de Oxigênio Bosch Sonda Lambda",
    categoria: "Injeção",
    receitaPotencial: 290 * 4.5 * 8,
    classeABC: "B",
    cv: 0.65,
    classeXYZ: "Z",
    cluster: "BZ (Variabilidade Alta, Médio Volume)",
    prioridadeGestao: "Alta",
    capitalImobilizado: 1 * 145.00,
    custoManutencaoSemana: 1 * 145.00 * 0.005,
    custoRupturaEstimado: 4.5 * 290.00 * 1.5,
    indicePrioridade: 80,
    estoqueSeguranca: 8,
    pontoReposicao: 12,
    diasAteRuptura: 1.5,
    nivelAlerta: "Crítico",
    receitaEmRisco: 290 * 4.5 * 1,
    qtdSugerida: 15,
    valorPedido: 15 * 145.00,
    prazoChegada: 7,
    justificativa: "Sensor de injeção eletrônica com estoque zerado ou à beira de zerar (1 un). Alta variabilidade (Z) exige um estoque de proteção maior para evitar perda de mecânicos que buscam entrega pronta. Sugerido 15 unidades."
  },
  {
    sku: "BIE-DI",
    nome: "Bieleta Dianteira Cofap BTC01103",
    categoria: "Suspensão",
    receitaPotencial: 68 * 11.25 * 8,
    classeABC: "C",
    cv: 0.22,
    classeXYZ: "Y",
    cluster: "CY (Demanda Intermediária)",
    prioridadeGestao: "Alta",
    capitalImobilizado: 3 * 35.00,
    custoManutencaoSemana: 3 * 35.00 * 0.005,
    custoRupturaEstimado: 11.25 * 68.00 * 1.2,
    indicePrioridade: 78,
    estoqueSeguranca: 12,
    pontoReposicao: 18,
    diasAteRuptura: 1.8,
    nivelAlerta: "Crítico",
    receitaEmRisco: 68 * 11.25 * 0.9,
    qtdSugerida: 30, // 2x MOQ (15)
    valorPedido: 30 * 35.00,
    prazoChegada: 6,
    justificativa: "Estoque de 3 unidades frente a uma demanda de 11.25 por semana. Ruptura eminente. Item de suspensão com boa saída semanal que complementa pedidos maiores da Cofap. Compra recomendada."
  },
  {
    sku: "BOM-AG",
    nome: "Bomba d'Água Urba UB0621",
    categoria: "Arrefecimento",
    receitaPotencial: 210 * 9.75 * 8,
    classeABC: "B",
    cv: 0.28,
    classeXYZ: "Y",
    cluster: "BY (Médio Giro, Médio Risco)",
    prioridadeGestao: "Alta",
    capitalImobilizado: 6 * 115.00,
    custoManutencaoSemana: 6 * 115.00 * 0.005,
    custoRupturaEstimado: 9.75 * 210.00 * 1.5,
    indicePrioridade: 75,
    estoqueSeguranca: 10,
    pontoReposicao: 16,
    diasAteRuptura: 4.3,
    nivelAlerta: "Atenção",
    receitaEmRisco: 210 * 9.75 * 0.7,
    qtdSugerida: 12, // MOQ 12
    valorPedido: 12 * 115.00,
    prazoChegada: 7,
    justificativa: "Apenas 6 unidades em estoque. Estoque dura menos que o tempo de entrega da fábrica (7 dias). Necessário acionar o gatilho de reabastecimento mínimo de 12 unidades conforme MOQ."
  },
  {
    sku: "DISC-FR",
    nome: "Disco de Freio Diant. Fremax BD4412",
    categoria: "Freios",
    receitaPotencial: 175 * 14 * 8,
    classeABC: "B",
    cv: 0.11,
    classeXYZ: "X",
    cluster: "BX (Estável, Volume Médio)",
    prioridadeGestao: "Média",
    capitalImobilizado: 8 * 90.00,
    custoManutencaoSemana: 8 * 90.00 * 0.005,
    custoRupturaEstimado: 14 * 175.00 * 1.2,
    indicePrioridade: 70,
    estoqueSeguranca: 12,
    pontoReposicao: 19,
    diasAteRuptura: 4.0,
    nivelAlerta: "Atenção",
    receitaEmRisco: 175 * 14 * 0.6,
    qtdSugerida: 20,
    valorPedido: 20 * 90.00,
    prazoChegada: 6,
    justificativa: "Nível de alerta: Atenção. Estoque atual (8) é menor que o ponto de reposição ótimo (19). Recomenda-se comprar 20 un para assegurar estoque de rotação saudável."
  },
  {
    sku: "AMOR-DI",
    nome: "Amortecedor Diant. Cofap GP32282",
    categoria: "Suspensão",
    receitaPotencial: 390 * 8.5 * 8,
    classeABC: "A",
    cv: 0.11,
    classeXYZ: "X",
    cluster: "AX (Consumo Alto e Estável)",
    prioridadeGestao: "Média",
    capitalImobilizado: 85 * 210.00, // R$ 17.850 parados!
    custoManutencaoSemana: 85 * 210.00 * 0.005, // R$ 89 por semana
    custoRupturaEstimado: 0,
    indicePrioridade: 20,
    estoqueSeguranca: 12,
    pontoReposicao: 21,
    diasAteRuptura: 70.0, // 10 semanas de cobertura!
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 12,
    justificativa: "O ERP efetuou compras impulsivas acumulando 85 unidades (estoque suficiente para quase 3 meses!). O estoque de segurança ideal é de apenas 12 un. Capital excedente imobilizado de R$ 15.330 que poderia estar girando em freios e embreagens. Compra proibida."
  },
  {
    sku: "OL-MO",
    nome: "Óleo de Motor Castrol Edge 5W30 Sintético",
    categoria: "Lubrificantes",
    receitaPotencial: 58 * 65.5 * 8,
    classeABC: "A",
    cv: 0.08,
    classeXYZ: "X",
    cluster: "AX (Consumo Alto e Estável)",
    prioridadeGestao: "Média",
    capitalImobilizado: 120 * 32.00,
    custoManutencaoSemana: 120 * 32.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 10,
    estoqueSeguranca: 45,
    pontoReposicao: 62,
    diasAteRuptura: 12.8,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 4,
    justificativa: "Item de altíssimo faturamento com saúde de estoque perfeita. Cobertura atual de 12 dias cobre perfeitamente o tempo de ressuprimento de 4 dias. Sem risco de ruptura. Nenhuma compra imediata requerida."
  },
  {
    sku: "FIL-CO",
    nome: "Filtro de Combustível Fram G5857",
    categoria: "Filtros",
    receitaPotencial: 30 * 41.25 * 8,
    classeABC: "B",
    cv: 0.06,
    classeXYZ: "X",
    cluster: "BX (Estável, Volume Médio)",
    prioridadeGestao: "Média",
    capitalImobilizado: 200 * 15.00, // R$3.000 imobilizados
    custoManutencaoSemana: 200 * 15.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 15,
    estoqueSeguranca: 35,
    pontoReposicao: 58,
    diasAteRuptura: 34.0, // Quase 5 semanas
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 4,
    justificativa: "Estoque super dimensionado (200 un) para uma média semanal de 41.25 un. Capital parado de R$ 2.130 acima do estoque de cobertura máxima recomendável (que seria de 60 un). Compra bloqueada."
  },
  {
    sku: "FIL-OL",
    nome: "Filtro de Óleo Tecfil PSL74",
    categoria: "Filtros",
    receitaPotencial: 24 * 58.25 * 8,
    classeABC: "B",
    cv: 0.05,
    classeXYZ: "X",
    cluster: "BX (Estável, Volume Médio)",
    prioridadeGestao: "Média",
    capitalImobilizado: 180 * 12.00,
    custoManutencaoSemana: 180 * 12.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 12,
    estoqueSeguranca: 45,
    pontoReposicao: 72,
    diasAteRuptura: 21.6,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 5,
    justificativa: "Estoque abundante e estável em 180 unidades, sem qualquer urgência ou desajuste nos próximos 15 dias. Nenhuma ação requerida."
  },
  {
    sku: "FIL-AR",
    nome: "Filtro de Ar Tecfil ARL1032",
    categoria: "Filtros",
    receitaPotencial: 35 * 17.5 * 8,
    classeABC: "B",
    cv: 0.10,
    classeXYZ: "X",
    cluster: "BX (Estável, Volume Médio)",
    prioridadeGestao: "Média",
    capitalImobilizado: 45 * 18.00,
    custoManutencaoSemana: 45 * 18.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 45,
    estoqueSeguranca: 15,
    pontoReposicao: 24,
    diasAteRuptura: 18.0,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 5,
    justificativa: "Estoque atual ajustado em 45 unidades. Superior ao ponto de reposição de 24 un. Ótimo balanceamento de capital e disponibilidade."
  },
  {
    sku: "VEL-IG",
    nome: "Jogo de Vela de Ignição NGK BKR7E",
    categoria: "Ignição",
    receitaPotencial: 85 * 11.25 * 8,
    classeABC: "B",
    cv: 0.09,
    classeXYZ: "X",
    cluster: "BX (Estável, Volume Médio)",
    prioridadeGestao: "Baixa",
    capitalImobilizado: 50 * 45.00,
    custoManutencaoSemana: 50 * 45.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 35,
    estoqueSeguranca: 10,
    pontoReposicao: 18,
    diasAteRuptura: 31.1,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 5,
    justificativa: "Estoque seguro de 50 un, provendo cobertura total e protegida para o próximo mês. Nenhuma ação necessária para o período."
  },
  {
    sku: "BOB-IG",
    nome: "Bobina de Ignição Magneti Marelli BI0022",
    categoria: "Ignição",
    receitaPotencial: 250 * 4.25 * 8,
    classeABC: "C",
    cv: 0.22,
    classeXYZ: "Y",
    cluster: "CY (Demanda Intermediária)",
    prioridadeGestao: "Baixa",
    capitalImobilizado: 4 * 135.00,
    custoManutencaoSemana: 4 * 135.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 48,
    estoqueSeguranca: 3,
    pontoReposicao: 6,
    diasAteRuptura: 6.5,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0, // Está quase na hora de pedir mas atinge o estoque de segurança
    valorPedido: 0,
    prazoChegada: 8,
    justificativa: "Estoque de 4 unidades é aceitável, com risco baixíssimo de impacto imediato. Monitoramento de segurança."
  },
  {
    sku: "COR-DE",
    nome: "Correia Dentada Gates 40859x19XS",
    categoria: "Transmissão",
    receitaPotencial: 105 * 8.1 * 8,
    classeABC: "B",
    cv: 0.58,
    classeXYZ: "Z",
    cluster: "BZ (Variabilidade Alta, Médio Volume)",
    prioridadeGestao: "Baixa",
    capitalImobilizado: 22 * 55.00,
    custoManutencaoSemana: 22 * 55.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 30,
    estoqueSeguranca: 8,
    pontoReposicao: 14,
    diasAteRuptura: 19.0,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 9,
    justificativa: "Média de giro é vulnerável à variabilidade (Z). No entanto, o estoque atual de 22 peças fornece excelente cobertura, bem acima do ponto de recomposição ideal de 14. Compra sustada."
  },
  {
    sku: "ROL-TR",
    nome: "Rolamento de Roda Traseira SKF BAH-0062",
    categoria: "Rolamentos",
    receitaPotencial: 160 * 2.6 * 8,
    classeABC: "C",
    cv: 0.45,
    classeXYZ: "Z",
    cluster: "CZ (Baixo Giro, Esporádica)",
    prioridadeGestao: "Baixa",
    capitalImobilizado: 35 * 80.00,
    custoManutencaoSemana: 35 * 80.00 * 0.005,
    custoRupturaEstimado: 0,
    indicePrioridade: 18,
    estoqueSeguranca: 3,
    pontoReposicao: 5,
    diasAteRuptura: 94.0,
    nivelAlerta: "Normal",
    receitaEmRisco: 0,
    qtdSugerida: 0,
    valorPedido: 0,
    prazoChegada: 10,
    justificativa: "Grave excesso de estoque de rolamento de baixo giro. 35 unidades em estoque quando o estoque de segurança ótima é de apenas 3 un. Saturação herdada de políticas genéricas de compras da distribuidora."
  }
];

export const RELATORIO_PRECOMPUTED: RelatorioExecutivo = {
  situacao: "Encontrada alta ineficiência operacional: a distribuidora acumula R$ 20.460 em excesso de estoque em SKUs como Amortecedores GP32282, enquanto sofre iminente risco de ruptura de R$ 9.120 em itens estáveis de Curva A (como Juntas VT5031 e Pastilhas Cobreq).",
  capitalImobilizadoTotal: 17850 + 3000 + 2800 + 1050, // Peças excessivas reais na amostra
  receitaEmRiscoTotal: 6091.2 + 2480.0 + 1305.0 + 765.0,
  economiasPotenciais: 15330.00, // Amortecedores desimobilizados
  top5Acoes: [
    {
      acao: "Compra de Emergência: 30 un de JUNT-TM (Homocinética).",
      justificativa: "Estoque com cobertura crítica de menos de 1 dia para o item de maior faturamento do cluster estável do Centro de Distribuição."
    },
    {
      acao: "Compra de Emergência: 60 un de PAST-FR (Pastilhas de freio Cobreq).",
      justificativa: "Evita ruptura na curva de maior fluxo físico de saída. Estoque atual zera antes do prazo de entrega."
    },
    {
      acao: "Sustação e Bloqueio de novos pedidos de CoFap Amortecedores (AMOR-DI).",
      justificativa: "Liberação de capital imobilizado crítico: há 85 unidades, gerando R$ 89/semana de custo invisível de armazenagem."
    },
    {
      acao: "Ajuste de Estoque de Segurança para SENS-OX (Sensor Lambda, Curva BZ).",
      justificativa: "Por ser item instável, fixar ponto de reposição em 12 peças para sustentar fidelização de oficinas parceiras."
    },
    {
      acao: "Promoção / Oferta ativa de escoamento para Rolamentos SKF (ROL-TR).",
      justificativa: "A amostra aponta 35 unidades com tempo de cobertura irreal de 94 dias úteis no armazém."
    }
  ],
  notaAoComprador: "A Era 1 aplica o regulamento matemático-estratégico de forma cirúrgica. Em vez de comprar conjuntos em pacotes genéricos de fornecedores para rechear metas de bônus comerciais, o Agente canaliza o capital para os exatos SKUs de alta recorrência sob risco de perda iminente. O comprador avalia e chancela o pedido economizando horas de análise manual rasa."
};

export const FASES_TESE: FaseTese[] = [
  {
    id: "fase1",
    nome: "Fase 1: Eficiência Guiada",
    periodo: "Mês 1 ao Mês 3",
    objetivo: "Sanear o portfólio de compras e reverter capital de giro preso em estoque obsoleto sem novas integrações de sistemas complexos.",
    iniciativas: [
      "Processamento em lote via exportações seguras de ERP de forma simples e rápida.",
      "Cálculo automático de clusters de demanda ABC-XYZ semanais.",
      "Lista prioritária de salvamento de faturamento (Curva AX/AY prestes a romper).",
      "Relatórios de justificativa de compra escritos por IA prontos para envio a parceiros ou equipe financeira."
    ],
    entregaDeValor: "Redução imediata de até 20% do capital imobilizado por excesso nas primeiras 6 semanas e erradicação de 90% das falhas de suprimento."
  },
  {
    id: "fase2",
    nome: "Fase 2: Decisão Aumentada",
    periodo: "Mês 4 ao Mês 6",
    objetivo: "Integrar o agente à rotina de cotação com distribuidores parceiros, antecipando lead times e maximizando as margens de lucro de frete.",
    iniciativas: [
      "Monitoramento por APIs em tempo real do nível de estoque crítico.",
      "Simulações de impacto financeiro (EOQ / Custo de Oportunidade) dinâmicas.",
      "Geração automatizada de pré-pedidos prontos integrados por e-mail ou portal de compras do fornecedor.",
      "Visualização inteligente de curvas históricas com previsões calibradas dinamicamente com base em eventos regionais."
    ],
    entregaDeValor: "Automação assistida acelerando o tempo de geração do pedido de compras semanal de 2 dias de análise para apenas 15 minutos."
  },
  {
    id: "fase3",
    nome: "Fase 3: Inteligência Escalada",
    periodo: "Mês 7+",
    objetivo: "Agente proativo e autônomo baseado em negociações inteligentes de atacado e controle integrado de múltiplas filiais e pontos de distribuição.",
    iniciativas: [
      "Operações de transferência de estoque automatizadas entre filiais de giro redundante.",
      "Contratos de compras programadas inteligentes acionados por assinaturas criptográficas.",
      "Feedback contínuo de aprendizado com comportamento dos compradores na loja física.",
      "Monitoramento financeiro macro do balanço de capital de suprimento central do grupo."
    ],
    entregaDeValor: "Transformação do estoque de autopeças de uma rubrica de custo estático para um ativo ágil e autogovernável, com margem EBIT combinada crescida em até 5.8%."
  }
];
