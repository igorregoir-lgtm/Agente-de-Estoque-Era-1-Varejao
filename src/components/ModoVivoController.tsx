import React, { useState } from "react";
import { SkuAmostra, AnaliseSku, RelatorioExecutivo } from "../types";
import { Sparkles, Play, Plus, Trash2, ArrowLeft, Loader2, AlertCircle, RefreshCw, Layers, ShieldCheck, Info, Database, Check, FileText } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

interface ModoVivoControllerProps {
  onBackToTese: () => void;
  onAnalysisResult: (data: { analises: AnaliseSku[]; relatorio: RelatorioExecutivo }) => void;
}

export default function ModoVivoController({ onBackToTese, onAnalysisResult }: ModoVivoControllerProps) {
  // Pre-populate with mock items representing typical inventory scenarios
  const [items, setItems] = useState<SkuAmostra[]>([
    {
      sku: "EMBR-DI",
      nome: "Kit de Embreagem LUK 622307500",
      categoria: "Transmissão",
      estoqueAtual: 1, // Becomes Critical!
      saidas: [18, 16, 20], // Monthly demand averaging ~18
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
      saidas: [35, 38, 36], // Monthly demand averaging ~36.3
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
  const [newCategoria, setNewCategoria] = useState("Geral");
  const [newStock, setNewStock] = useState<number>(5);
  const [newCusto, setNewCusto] = useState<number>(50);
  const [newPreco, setNewPreco] = useState<number>(95);
  const [newLeadTime, setNewLeadTime] = useState<number>(5);
  const [newMoq, setNewMoq] = useState<number>(10);
  const [newSaidas, setNewSaidas] = useState("15, 12, 18"); // Comma-separated monthly values

  // DB Sync and Upload State
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSuccessMessage, setDbSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim()) return;

    // Parse the comma-separated monthly consumption history
    const parsedSaidas = newSaidas
      .split(",")
      .map(num => parseInt(num.trim()) || 0);

    const newItem: SkuAmostra = {
      sku: newSku.toUpperCase().trim(),
      nome: newName.trim(),
      categoria: newCategoria.trim(),
      estoqueAtual: Number(newStock),
      saidas: parsedSaidas,
      custo: Number(newCusto),
      preco: Number(newPreco),
      leadTimeDias: Number(newLeadTime),
      moq: Number(newMoq)
    };

    setItems([...items, newItem]);
    setNewSku("");
    setNewName("");
    setNewCategoria("Geral");
    setNewStock(5);
    setNewCusto(50);
    setNewPreco(95);
    setNewLeadTime(5);
    setNewMoq(10);
    setNewSaidas("15, 12, 18");
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

  const handleUpdatePreco = (idx: number, price: number) => {
    const updated = [...items];
    updated[idx].preco = Math.max(0, price);
    setItems(updated);
  };

  const handleUpdateSaidas = (idx: number, val: string) => {
    const updated = [...items];
    const parsed = val.split(",").map(num => parseInt(num.trim()) || 0);
    updated[idx].saidas = parsed;
    setItems(updated);
  };

  const handleUpdateLeadTime = (idx: number, lt: number) => {
    const updated = [...items];
    updated[idx].leadTimeDias = Math.max(1, lt);
    setItems(updated);
  };

  const handleUpdateMoq = (idx: number, moqVal: number) => {
    const updated = [...items];
    updated[idx].moq = Math.max(1, moqVal);
    setItems(updated);
  };


  const handleLoadFromDb = async () => {
    setDbLoading(true);
    setErrorMessage(null);
    setDbSuccessMessage(null);
    try {
      const { data, error } = await supabase
        .from("skus_amostra")
        .select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        const mappedItems: SkuAmostra[] = data.map((d: any) => ({
          sku: d.sku,
          nome: d.nome,
          categoria: d.categoria || "Geral",
          estoqueAtual: Number(d.estoqueAtual ?? 0),
          saidas: Array.isArray(d.saidas) ? d.saidas.map(Number) : [10, 10, 10],
          custo: Number(d.custo ?? 0),
          preco: Number(d.preco ?? 0),
          leadTimeDias: Number(d.leadTimeDias ?? 5),
          moq: Number(d.moq ?? 1)
        }));
        setItems(mappedItems);
        setDbSuccessMessage(`Sucesso! ${mappedItems.length} SKUs carregados do Supabase.`);
      } else {
        setErrorMessage("Nenhum dado encontrado na tabela skus_amostra.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erro ao carregar dados do Supabase: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    setDbLoading(true);
    setErrorMessage(null);
    setDbSuccessMessage(null);
    try {
      const { error } = await supabase
        .from("skus_amostra")
        .upsert(items, { onConflict: "sku" });

      if (error) throw error;
      setDbSuccessMessage(`Sucesso! ${items.length} SKUs sincronizados e salvos no Supabase.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erro ao salvar dados no Supabase: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);
    setDbSuccessMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.split(",")[1];
          if (!base64Data) {
            throw new Error("Não foi possível ler o arquivo.");
          }

          const response = await fetch("/api/parse-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || (file.name.endsWith(".csv") ? "text/csv" : "application/pdf"),
              fileName: file.name
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Falha ao processar o arquivo.");
          }

          if (data.skus && Array.isArray(data.skus)) {
            const parsedSkus: SkuAmostra[] = data.skus.map((s: any) => ({
              sku: String(s.sku || "").toUpperCase().trim(),
              nome: String(s.nome || "Produto Sem Nome"),
              categoria: String(s.categoria || "Geral"),
              estoqueAtual: Number(s.estoqueAtual ?? 0),
              saidas: Array.isArray(s.saidas) ? s.saidas.map(Number) : [10, 10, 10],
              custo: Number(s.custo ?? 50.00),
              preco: Number(s.preco ?? 95.00),
              leadTimeDias: Number(s.leadTimeDias ?? 5),
              moq: Number(s.moq ?? 10)
            }));

            setItems((prev) => {
              const prevMap = new Map(prev.map((item) => [item.sku, item]));
              parsedSkus.forEach((skuObj) => {
                prevMap.set(skuObj.sku, skuObj);
              });
              return Array.from(prevMap.values());
            });

            setDbSuccessMessage(`Sucesso! ${parsedSkus.length} SKUs importados do arquivo ${file.name}.`);
          } else {
            throw new Error("Estrutura de SKUs não retornada pelo parser de IA.");
          }
        } catch (err: any) {
          console.error(err);
          setErrorMessage("Erro ao processar arquivo: " + err.message);
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Erro ao ler o arquivo no navegador.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Falha ao abrir arquivo: " + err.message);
      setUploading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setDbSuccessMessage(null);
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

      onAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro de rede ao consultar o servidor.");
      if (err.message.includes("GEMINI_API_KEY") || err.message.includes("chave de API") || err.message.includes("não configurada")) {
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
    setDbSuccessMessage(null);

    // Build authentic precalculated metrics matching Era 1 rules in the browser
    setTimeout(() => {
      try {
        const simulatedAnalyses: AnaliseSku[] = items.map((item) => {
          const N = item.saidas.length;
          const avgMonthlyDemand = item.saidas.reduce((a, b) => a + b, 0) / N;
          const avgDailyDemand = avgMonthlyDemand / 30;
          const avgWeeklyDemand = avgMonthlyDemand / 4.33;

          // Standard deviation of monthly sales
          let devMonthly = 0;
          if (N >= 2) {
            const variance = item.saidas.reduce((sum, val) => sum + Math.pow(val - avgMonthlyDemand, 2), 0) / (N - 1);
            devMonthly = Math.sqrt(variance);
          } else {
            devMonthly = avgMonthlyDemand * 0.15; // default variation if 1 month
          }

          // Convert to daily standard deviation
          const devDaily = devMonthly / Math.sqrt(30);

          // Safety Stock (Z = 1.65)
          const safetyStock = Math.ceil(1.65 * devDaily * Math.sqrt(item.leadTimeDias));
          // Reorder Point
          const reorderPoint = Math.ceil((avgDailyDemand * item.leadTimeDias) + safetyStock);
          // Days until stockout
          const diasAteRuptura = avgDailyDemand > 0 ? (item.estoqueAtual / avgDailyDemand) : 999;

          // Status & Alerts
          let alertLevel: "Normal" | "Atenção" | "Crítico" = "Normal";
          if (diasAteRuptura <= item.leadTimeDias) {
            alertLevel = "Crítico";
          } else if (item.estoqueAtual <= reorderPoint) {
            alertLevel = "Atenção";
          }

          // Suggested order quantity (order up to ROP + avgMonthlyDemand)
          let suggestedQty = 0;
          let prioridade: "Máxima" | "Alta" | "Média" | "Baixa" = "Baixa";
          let justificacao = "";

          if (alertLevel === "Crítico" || alertLevel === "Atenção") {
            const deficit = (reorderPoint + avgMonthlyDemand) - item.estoqueAtual;
            // Round to nearest higher multiple of MOQ
            suggestedQty = Math.max(item.moq, Math.ceil(deficit / item.moq) * item.moq);
            prioridade = alertLevel === "Crítico" ? "Máxima" : "Alta";
            justificacao = `Estoque de segurança comprometido (${item.estoqueAtual} un) frente a uma demanda média mensal de ${avgMonthlyDemand.toFixed(0)} un. Gatilho de reabastecimento acionado (Ponto de Reposição ótimo de ${reorderPoint} un). Sugerido pedido de compra de ${suggestedQty} un respeitando o MOQ (${item.moq} un).`;
          } else {
            prioridade = "Baixa";
            justificacao = `Estoque equilibrado em ${item.estoqueAtual} un. O saldo atual cobre confortavelmente o Lead Time de ${item.leadTimeDias} dias e o estoque de segurança. Sem necessidade de reposição no momento.`;
          }

          // Excess capital: value of stock exceeding target maximum (ROP + avgMonthlyDemand)
          const maxTargetStock = reorderPoint + avgMonthlyDemand;
          const isExcess = item.estoqueAtual > maxTargetStock;
          const capImobilizado = isExcess ? (item.estoqueAtual - maxTargetStock) * item.custo : 0;

          if (isExcess) {
            justificacao = `Excesso de estoque detectado: ${item.estoqueAtual} un excede o teto recomendado de ${maxTargetStock.toFixed(0)} un. Capital de R$ ${capImobilizado.toFixed(2)} imobilizado desnecessariamente no almoxarifado. Compra suspensa para economizar caixa.`;
          }

          // Revenue at risk (deficit during lead time * preco)
          const leadTimeDemand = avgDailyDemand * item.leadTimeDias;
          const riskDeficit = leadTimeDemand - item.estoqueAtual;
          const recEmRisco = alertLevel === "Crítico" && riskDeficit > 0 ? riskDeficit * item.preco : 0;

          return {
            sku: item.sku,
            nome: item.nome,
            categoria: item.categoria,
            receitaPotencial: item.preco * avgWeeklyDemand * 8, // 8-week horizon potential revenue
            classeABC: (item.preco * avgWeeklyDemand) > 500 ? "A" : (item.preco * avgWeeklyDemand) > 150 ? "B" : "C",
            cv: avgMonthlyDemand > 0 ? (devMonthly / avgMonthlyDemand) : 0,
            classeXYZ: devMonthly / avgMonthlyDemand > 0.4 ? "Z" : devMonthly / avgMonthlyDemand > 0.15 ? "Y" : "X",
            cluster: alertLevel === "Crítico" ? `${(item.preco * avgWeeklyDemand) > 500 ? "AX" : "BX"} (Giro Alto Crítico)` : isExcess ? "CY (Excesso Parado)" : "BY (Consumo Médio)",
            prioridadeGestao: prioridade,
            capitalImobilizado: Math.max(0, capImobilizado),
            custoManutencaoSemana: Math.max(0, capImobilizado * 0.005),
            custoRupturaEstimado: Math.max(0, recEmRisco * 0.5),
            indicePrioridade: alertLevel === "Crítico" ? 90 : alertLevel === "Atenção" ? 60 : 10,
            estoqueSeguranca: safetyStock,
            pontoReposicao: reorderPoint,
            diasAteRuptura: diasAteRuptura,
            nivelAlerta: alertLevel,
            receitaEmRisco: recEmRisco,
            qtdSugerida: suggestedQty,
            valorPedido: suggestedQty * item.custo,
            prazoChegada: item.leadTimeDias,
            justificativa: justificacao
          };
        });

        // Summary Report
        const totalImobilizadoSim = simulatedAnalyses.reduce((sum, item) => sum + item.capitalImobilizado, 0);
        const totalRupturaSim = simulatedAnalyses.reduce((sum, item) => sum + item.receitaEmRisco, 0);

        const reportSim: RelatorioExecutivo = {
          situacao: `A simulação com dados mensais indicou desvios de saldo. Foram encontrados R$ ${totalImobilizadoSim.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em estoque excedente parado frente a R$ ${totalRupturaSim.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em risco logístico imediato.`,
          capitalImobilizadoTotal: totalImobilizadoSim,
          receitaEmRiscoTotal: totalRupturaSim,
          economiasPotenciais: totalImobilizadoSim,
          top5Acoes: simulatedAnalyses.filter(i => i.qtdSugerida > 0).map(i => ({
            acao: `Gatilho de Reposição: Pedir ${i.qtdSugerida} un do SKU ${i.sku} (MOQ: ${i.moq}).`,
            justificativa: i.justificativa
          })),
          notaAoComprador: "Decisão simulada em conformidade com as regras financeiras da Era 1. O saldo é calculado usando o consumo diário derivado da média mensal e desvio padrão para calibrar o estoque de segurança."
        };

        setIsLoading(false);
        onAnalysisResult({ analises: simulatedAnalyses, relatorio: reportSim });
      } catch (err: any) {
        console.error(err);
        setErrorMessage("Erro ao executar simulação local: " + err.message);
        setIsLoading(false);
      }
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
          Altere as quantidades em estoque, custos, preços e histórico de vendas mensais. Suba planilhas ou relatórios em PDF com OCR inteligente. Salve as simulações diretamente na nuvem do Supabase.
        </p>
      </div>

      {/* DB & Document Upload Control Bar */}
      <div className="p-5 bg-brand-navy border border-slate-800/40 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Supabase Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleLoadFromDb}
            disabled={dbLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700/50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            title="Carregar lote completo de SKUs do Supabase"
          >
            {dbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" /> : <Database className="w-3.5 h-3.5 text-brand-teal" />}
            <span>Carregar do Banco</span>
          </button>

          <button
            onClick={handleSaveToDb}
            disabled={dbLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700/50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            title="Salvar alterações do lote atual no Supabase"
          >
            {dbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Salvar no Banco</span>
          </button>
        </div>

        {/* File Drag-and-drop / selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative">
            <input
              type="file"
              accept=".csv,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <button
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-xs font-mono text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <FileText className="w-3.5 h-3.5 fill-slate-950" />}
              <span>Subir Relatório (CSV / PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK STATUS TOAST */}
      {dbSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-xs text-emerald-400 font-mono flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{dbSuccessMessage}</span>
        </div>
      )}

      {/* ERROR CORNER / SECRETS GUIDE COUPLING */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-[#2e100d]/60 border border-red-500/20 space-y-4 text-slate-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-400 text-sm font-sans">
                {isKeyMissing ? "GEMINI_API_KEY Não Localizada no Workspace" : "Falha na chamada ao Modelo da IA ou Banco de Dados"}
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
                <li>Nossas rotas Express passantes passarão a consultar a IA e realizar OCR em tempo real a cada lote enviado!</li>
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
            Modifique saldo físico, custos, preços e vendas mensais históricas abaixo
          </span>
        </div>

        {/* Form fields edit loop */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#04060b]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-navy-light text-slate-400 border-b border-slate-800/40 font-mono text-[10px]">
                <th className="p-3">SKU</th>
                <th className="p-3">Peça de Reposição</th>
                <th className="p-3 text-center w-20">Estoque</th>
                <th className="p-3 text-center w-24">Custo Unit.</th>
                <th className="p-3 text-center w-24">Preço Venda</th>
                <th className="p-3 text-center w-20">Lead Time</th>
                <th className="p-3 text-center w-20">MOQ</th>
                <th className="p-3 text-center w-36 font-semibold">Vendas Mensais Recentes</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="p-3 text-brand-teal font-semibold font-mono text-sm">{item.sku}</td>
                  <td className="p-3 font-sans truncate max-w-[150px] text-slate-200">{item.nome}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={item.estoqueAtual}
                      onChange={(e) => handleUpdateStock(idx, Number(e.target.value))}
                      className="w-14 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-brand-teal font-bold font-mono focus:outline-none focus:border-brand-teal/60"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 font-mono">
                      <span className="text-[10px] text-slate-500 font-bold">R$</span>
                      <input
                        type="number"
                        value={item.custo}
                        onChange={(e) => handleUpdateCusto(idx, Number(e.target.value))}
                        className="w-18 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 focus:outline-none focus:border-brand-teal/60"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 font-mono">
                      <span className="text-[10px] text-slate-500 font-bold">R$</span>
                      <input
                        type="number"
                        value={item.preco}
                        onChange={(e) => handleUpdatePreco(idx, Number(e.target.value))}
                        className="w-18 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 focus:outline-none focus:border-brand-teal/60"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={item.leadTimeDias}
                      onChange={(e) => handleUpdateLeadTime(idx, Number(e.target.value))}
                      className="w-14 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 font-mono focus:outline-none focus:border-brand-teal/60"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={item.moq}
                      onChange={(e) => handleUpdateMoq(idx, Number(e.target.value))}
                      className="w-14 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 font-mono focus:outline-none focus:border-brand-teal/60"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="text"
                      value={item.saidas.join(", ")}
                      onChange={(e) => handleUpdateSaidas(idx, e.target.value)}
                      className="w-28 px-1.5 py-1 bg-brand-navy-dark border border-slate-800 rounded text-center text-slate-205 font-mono focus:outline-none focus:border-brand-teal/60"
                      title="Separe por vírgulas (Ex: 45, 52, 49)"
                    />
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
          <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold tracking-wider">ADICIONAR NOVO SKU DE TESTE (VARIÁVEIS DE CONTROLE DE COMPRAS)</span>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <input
                type="text"
                placeholder="SKU (Ex: EMBR-DI)"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white placeholder-slate-600 font-mono font-semibold"
                required
              />
              <input
                type="text"
                placeholder="Descrição (Ex: Kit de Embreagem)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white placeholder-slate-600 col-span-1 md:col-span-2 font-sans"
                required
              />
              <input
                type="text"
                placeholder="Categoria (Ex: Suspensão)"
                value={newCategoria}
                onChange={(e) => setNewCategoria(e.target.value)}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white placeholder-slate-600 font-sans"
                required
              />
              <input
                type="number"
                placeholder="Estoque Atual"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Custo (R$)"
                value={newCusto}
                onChange={(e) => setNewCusto(Number(e.target.value))}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
                min="0"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input
                type="number"
                placeholder="Preço Venda (R$)"
                value={newPreco}
                onChange={(e) => setNewPreco(Number(e.target.value))}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Lead Time (Dias)"
                value={newLeadTime}
                onChange={(e) => setNewLeadTime(Number(e.target.value))}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="MOQ (Lote Mínimo)"
                value={newMoq}
                onChange={(e) => setNewMoq(Number(e.target.value))}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono"
                min="1"
                required
              />
              <input
                type="text"
                placeholder="Vendas Mensais (Ex: 15, 12, 18)"
                value={newSaidas}
                onChange={(e) => setNewSaidas(e.target.value)}
                className="p-2.5 text-xs bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white font-mono font-semibold col-span-1 md:col-span-2"
                required
              />
            </div>
            
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-navy-dark border border-slate-800 hover:bg-slate-800/40 text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-teal" />
                <span>Adicionar Novo SKU ao Lote</span>
              </button>
            </div>
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
            <span>Auditar Lote com Inteligência Artificial (IA Real)</span>
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
            Fiel às Diretrizes do Color System e Métricas Mensais da allla
          </span>
        </div>
      </div>
    </div>
  );
}

