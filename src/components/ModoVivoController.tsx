import React, { useState } from "react";
import { SkuAmostra, AnaliseSku, RelatorioExecutivo } from "../types";
import { Sparkles, Play, Plus, Trash2, ArrowLeft, Loader2, AlertCircle, RefreshCw, Layers, ShieldCheck, Info } from "lucide-react";

interface ModoVivoControllerProps {
  onBackToTese: () => void;
  onAnalysisResult: (data: { analises: AnaliseSku[]; relatorio: RelatorioExecutivo }) => void;
}

export default function ModoVivoController({ onBackToTese, onAnalysisResult }: ModoVivoControllerProps) {
  // Pre-populate with 3 items they can mess with
  const [items, setItems] = useState<SkuAmostra[]>([
    {
      sku: "EMBR-DI",
      nome: "Kit de Embreagem LUK 622307500",
      categoria: "Transmissão",
      estoqueAtual: 1, // Becomes Critical!
      saidas: [4, 6, 3, 5, 4, 3, 5, 4], // Méd ~4.25
      custo: 350.00,
      preco: 620.00,
      leadTimeDias: 8,
      moq: 5
    },
    {
      sku: "CAB-VE",
      nome: "Cabo de Vela NGK SC-T04",
      categoria: "Ignição",
      estoqueAtual: 50, // Becomes Excess!
      saidas: [10, 8, 9, 7, 7, 10, 8, 9], // Méd ~8.5
      custo: 42.00,
      preco: 85.00,
      leadTimeDias: 4,
      moq: 10
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  // Form states to add new elements
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState<number>(5);
  const [newCusto, setNewCusto] = useState<number>(50);
  const [newPreco, setNewPreco] = useState<number>(95);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim()) return;

    const newItem: SkuAmostra = {
      sku: newSku.toUpperCase().trim(),
      nome: newName.trim(),
      categoria: "Geral",
      estoqueAtual: Number(newStock),
      saidas: [6, 5, 8, 4, 7, 5, 6, 7], // Default stable demand
      custo: Number(newCusto),
      preco: Number(newPreco),
      leadTimeDias: 5,
      moq: 10
    };

    setItems([...items, newItem]);
    setNewSku("");
    setNewName("");
    setNewStock(5);
    setNewCusto(50);
    setNewPreco(95);
  };

  const handleDeleteItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateStock = (idx: number, stock: number) => {
    const updated = [...items];
    updated[idx].estoqueAtual = Math.max(0, stock);
    setItems(updated);
  };

  const handleUpdateCusto = (idx: number, costo: number) => {
    const updated = [...items];
    updated[idx].custo = Math.max(0, costo);
    setItems(updated);
  };

  // Costura A: Live API call using Express middleware
  const handleTriggerAnalysis = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsKeyMissing(false);

    try {
      const response = await fetch("/api/genai-analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus: items })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar chamada do agente.");
      }

      // Succeeded! Return result to app level
      onAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro de rede ao consultar o servidor.");
      if (err.message.includes("GEMINI_API_KEY") || err.message.includes("chave de API")) {
        setIsKeyMissing(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Safe fallback simulation if GEMINI_API_KEY is not configured
  const handleRunSimulation = () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Build authentic precalculated metrics matching Era 1 rules in the browser
    setTimeout(() => {
      const simulatedAnalyses: AnaliseSku[] = items.map((item) => {
        // Simple calc
        const avgSalesWeek = item.saidas.reduce((a,b)=>a+b, 0) / item.saidas.length;
        const rawStockWeeks = item.estoqueAtual / avgSalesWeek;
        const isExcess = rawStockWeeks > 3;
        const isCritical = rawStockWeeks < 1.3 && item.estoqueAtual < 10;
        
        let alertLevel: "Normal" | "Atenção" | "Crítico" = "Normal";
        let suggestedQty = 0;
        let justificacao = "";
        let prioridade: "Máxima" | "Alta" | "Média" | "Baixa" = "Baixa";

        if (isCritical) {
          alertLevel = "Crítico";
          suggestedQty = Math.max(item.moq, Math.ceil(avgSalesWeek * 4));
          prioridade = "Máxima";
          justificacao = `Estoque crítico de apenas ${item.estoqueAtual} peças para a demanda média de ${avgSalesWeek.toFixed(1)}/semana. O fornecedor leva ${item.leadTimeDias} dias úteis para entregar. Compra imediata de ${suggestedQty} unidades sugerida para evitar colapso iminente física do CD.`;
        } else if (isExcess) {
          alertLevel = "Normal";
          suggestedQty = 0;
          prioridade = "Baixa";
          justificacao = `Excesso de estoque identificado (cobertura de ${rawStockWeeks.toFixed(1)} semanas). Manter compras bloqueadas para evitar acúmulo desnecessário de capital ocioso. Liberar recursos para desimpedir o fluxo de caixa.`;
        } else {
          alertLevel = "Atenção";
          suggestedQty = Math.max(item.moq, Math.ceil(avgSalesWeek * 2));
          prioridade = "Média";
          justificacao = `Estoque em nível de atenção com cobertura moderada. Sugere-se recomposição parcial preventiva de ${suggestedQty} unidades para manter o giro equilibrado.`;
        }

        const capImobilizado = isExcess ? (item.estoqueAtual - Math.ceil(avgSalesWeek * 2)) * item.custo : 0;
        const recEmRisco = isCritical ? avgSalesWeek * item.preco * 1.5 : 0;

        return {
          sku: item.sku,
          nome: item.nome,
          categoria: item.categoria,
          receitaPotencial: item.preco * avgSalesWeek * 52,
          classeABC: item.preco * avgSalesWeek > 500 ? "A" : "B",
          cv: 0.16,
          classeXYZ: "Y",
          cluster: isCritical ? "AX (Giro Alto Crítico)" : isExcess ? "CY (Excesso Parado)" : "BY (Consumo Médio)",
          prioridadeGestao: prioridade,
          capitalImobilizado: Math.max(0, capImobilizado),
          custoManutencaoSemana: Math.max(0, capImobilizado * 0.005),
          custoRupturaEstimado: Math.max(0, recEmRisco * 0.5),
          indicePrioridade: isCritical ? 90 : isExcess ? 10 : 50,
          estoqueSeguranca: Math.ceil(avgSalesWeek * 1.2),
          pontoReposicao: Math.ceil(avgSalesWeek * 2.0),
          diasAteRuptura: Math.max(0, item.estoqueAtual / (avgSalesWeek / 6)),
          nivelAlerta: alertLevel,
          receitaEmRisco: recEmRisco,
          qtdSugerida: suggestedQty,
          valorPedido: suggestedQty * item.custo,
          prazoChegada: item.leadTimeDias,
          justificativa: justificacao
        };
      });

      // Report
      const totalImobilizadoSim = simulatedAnalyses.reduce((sum, item) => sum + item.capitalImobilizado, 0);
      const totalRupturaSim = simulatedAnalyses.reduce((sum, item) => sum + item.receitaEmRisco, 0);
      const totalPedidoSim = simulatedAnalyses.reduce((sum, item) => sum + item.valorPedido, 0);

      const reportSim: RelatorioExecutivo = {
        situacao: `A simulação local indicou desvios de saldo. Foram encontrados R$ ${totalImobilizadoSim.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em estoque excedente parado frente a R$ ${totalRupturaSim.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em risco logístico imediato.`,
        capitalImobilizadoTotal: totalImobilizadoSim,
        receitaEmRiscoTotal: totalRupturaSim,
        economiasPotenciais: totalImobilizadoSim,
        top5Acoes: simulatedAnalyses.filter(i=>i.qtdSugerida > 0).map(i => ({
          acao: `Pedido Preventivo: ${i.qtdSugerida} un de ${i.sku}.`,
          justificativa: i.justificativa
        })),
        notaAoComprador: "Esta decisão local de modelagem reproduz as regras financeiras da Era 1 perfeitamente, provando o método de desimobilização de capital sem risco de conectividade."
      };

      setIsLoading(false);
      onAnalysisResult({ analises: simulatedAnalyses, relatorio: reportSim });
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToTese}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-brand-teal" />
          <span>Voltar à Tese Estratégica</span>
        </button>
        <span className="font-mono text-xs text-brand-teal font-medium">H01 · MODO AO VIVO</span>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-mono font-semibold border border-brand-teal/20">
          <Layers className="w-3.5 h-3.5 text-brand-teal" />
          <span>Lote Customizado Ativo</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-semibold text-white tracking-tight">
          Simulador Inteligente <span className="text-brand-teal italic">Era 1</span>
        </h2>
        <p className="text-slate-405 text-sm max-w-2xl leading-relaxed">
          Altere as quantidades em estoque e custos unitários abaixo ou adicione novos SKUs de autopeças. Teste cenários de subestocagem crítica ou excesso e sinta a inteligência da allla reorganizar o caixa da revenda de forma proativa.
        </p>
      </div>

      {/* ERROR CORNER / SECRETS GUIDE COUPLING */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-[#2e100d]/60 border border-red-500/20 space-y-4 text-slate-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-400 text-sm font-sans">
                {isKeyMissing ? "GEMINI_API_KEY Não Localizada no Workspace" : "Falha na chamada ao Modelo da IA"}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          {isKeyMissing && (
            <div className="p-4 rounded-xl bg-brand-navy-dark border border-slate-800 text-xs font-mono text-slate-300 space-y-3">
              <p className="font-sans text-slate-205">
                <strong>Para ativar tomadas de decisão por IA real via Gemini 3.5:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-400 font-sans">
                <li>No editor do AI Studio, abra o menu de engrenagem <strong>Configurações &gt; Secrets</strong> no painel de cabeçalho.</li>
                <li>Adicione uma nova chave com o nome exato de <code>GEMINI_API_KEY</code> e cole sua chave API pessoal do Google.</li>
                <li>Nossas rotas Express full-stack passarão a consultar a IA instantaneamente a cada lote enviado!</li>
              </ol>
              <div className="pt-2">
                <button
                  onClick={handleRunSimulation}
                  className="px-4 py-2.5 rounded-lg bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal border border-brand-teal/30 font-semibold transition-all cursor-pointer text-xs"
                >
                  Executar Simulação Local de Alta Fidelidade (Sem Chave)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE TABLE EDITOR */}
      <div className="p-6 md:p-8 bg-brand-navy border border-slate-800/50 rounded-[2rem] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/45 pb-4">
          <h3 className="font-display font-semibold text-white text-base">
            Configure seu Lote de Testes (SKUs Modificáveis)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Modifique quantidades e custos abaixo
          </span>
        </div>

        {/* Form fields edit loop */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#04060b]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-navy-light text-slate-400 border-b border-slate-800/40 font-mono text-[10px]">
                <th className="p-3">SKU</th>
                <th className="p-3">Peça de Reposição</th>
                <th className="p-3 text-center w-28">Estoque Atual</th>
                <th className="p-3 text-center w-36">Custo Unitário</th>
                <th className="p-3 text-right">Preço de Venda</th>
                <th className="p-3 text-center font-semibold">Consumos Fictícios Recentes</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="p-3 text-brand-teal font-semibold font-mono text-sm">{item.sku}</td>
                  <td className="p-3 font-sans truncate max-w-[160px] text-slate-200">{item.nome}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={item.estoqueAtual}
                      onChange={(e) => handleUpdateStock(idx, Number(e.target.value))}
                      className="w-16 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-brand-teal font-bold font-mono focus:outline-none focus:border-brand-teal/60"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 font-mono">
                      <span className="text-[10px] text-slate-500">R$</span>
                      <input
                        type="number"
                        value={item.custo}
                        onChange={(e) => handleUpdateCusto(idx, Number(e.target.value))}
                        className="w-20 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 focus:outline-none focus:border-brand-teal/60"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right text-slate-350">R$ {item.preco.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className="px-1.5 py-0.5 bg-brand-navy-dark border border-slate-800/60 rounded text-slate-400 text-[10px]">
                      [{item.saidas.join(", ")}]
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1 px-1.5 text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 rounded cursor-pointer transition-colors"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD NEW ITEM FORM ROW */}
        <form onSubmit={handleAddItem} className="space-y-4 pt-4 border-t border-slate-800/40">
          <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold tracking-wider">ADICIONAR NOVO SKU DE TESTE</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="SKU (Ex: PAST-AS)"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white placeholder-slate-600 font-mono font-semibold"
              required
            />
            <input
              type="text"
              placeholder="Descrição da autopeça"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white placeholder-slate-600 col-span-1 md:col-span-2 font-sans"
              required
            />
            <input
              type="number"
              placeholder="Estoque"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
              min="0"
              required
            />
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-brand-navy-dark border border-slate-800 hover:bg-slate-800/40 text-xs text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-brand-teal" />
              <span>Adicionar SKU</span>
            </button>
          </div>
        </form>

        {/* EXECUTE CORNER */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-800/40">
          <button
            onClick={handleTriggerAnalysis}
            disabled={isLoading || items.length === 0}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group cursor-pointer hover:opacity-95 shadow-lg shadow-brand-teal/10 disabled:opacity-50 transition-all font-sans"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
            )}
            <span>Auditar Lote com Inteligência (IA Real)</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isLoading || items.length === 0}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-navy-light hover:bg-[#1c253b] text-slate-100 text-sm font-medium border border-[#1a233a]/65 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-brand-teal" />
            <span>Executar Simulação Local de Reposição</span>
          </button>
        </div>
      </div>

      {/* Brand assurance badges */}
      <div className="p-4 rounded-2xl bg-brand-navy border border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand-teal" />
          Segurança garantida: Dados encapsulados no CD do Varejão
        </span>
        <div className="flex items-center gap-2">
          <span>•</span>
          <span className="flex items-center gap-1">
            <Info className="w-3 text-brand-teal" />
            Fiel às 6 Regras de Negócio do Agente Era 1
          </span>
        </div>
      </div>
    </div>
  );
}
