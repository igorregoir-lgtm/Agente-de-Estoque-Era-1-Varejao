import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, FastForward, SkipForward, AlertTriangle, CheckCircle, HelpCircle, FileText, Database, ShieldAlert, ArrowRight, DollarSign, TrendingUp, Sparkles, UserCheck, Mail } from "lucide-react";
import { SKUS_AM_DADOS, ANALISES_PRECOMPUTED, RELATORIO_PRECOMPUTED } from "../seed";
import { AnaliseSku } from "../types";
import { supabase } from "../utils/supabaseClient";

interface PlaybackDashboardProps {
  onComplete: () => void;
  // If user is running the "Live Gemini Mode" instead of deterministic
  liveData?: {
    analises: AnaliseSku[];
    relatorio: typeof RELATORIO_PRECOMPUTED;
  };
}

export default function PlaybackDashboard({ onComplete, liveData }: PlaybackDashboardProps) {
  const activeSKUs = liveData?.analises || ANALISES_PRECOMPUTED;
  const activeReport = liveData?.relatorio || RELATORIO_PRECOMPUTED;

  // Playback stages
  // Stage 0: Raw ERP Data
  // Stage 1: ABC-XYZ Classificação (Inteligência de classificação)
  // Stage 2: Custo de Oportunidade (Capital paralisado vs Faturamento em Risco)
  // Stage 3: Alertas de ruptura (Dias até colapso físico)
  // Stage 4: Sugestão de Pedido da Semana (Lista cirúrgica)
  // Stage 5: Relatório Executivo por IA (Frase legível ao decisor)
  const STEPS = [
    { id: 0, label: "Passo 0: Dados Crus do ERP", subtitle: "Estrutura nativa sem tratamento inteligente", mini: "Dados ERP" },
    { id: 1, label: "Bloco 1: Classificação ABC-XYZ", subtitle: "Identificação cirúrgica de recorrência", mini: "Classificação" },
    { id: 2, label: "Bloco 2: Custo de Oportunidade", subtitle: "Mapeamento financeiro em reais", mini: "Finanças" },
    { id: 3, label: "Bloco 3: Alertas de Ruptura", subtitle: "Sinalizadores de colapso físico", mini: "Rupturas" },
    { id: 4, label: "Bloco 4: Lista de Reposição", subtitle: "Sugestão de compra calibrada", mini: "Reposição" },
    { id: 5, label: "Bloco 5: Relatório por IA", subtitle: "Decisão sem jargões técnicos", mini: "Relatório IA" }
  ];

  const [currentStep, setCurrentStep] = useState(liveData ? 1 : 0);
  const [isPlaying, setIsPlaying] = useState(!liveData);
  const [playSpeed, setPlaySpeed] = useState<1 | 2>(1); // 1x or 2x speed
  const [progress, setProgress] = useState(0); // Progress percentage of actual step (0 to 100)

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [approvedRows, setApprovedRows] = useState<Record<string, boolean>>({});
  const [savingFeedback, setSavingFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialQtys: Record<string, number> = {};
    activeSKUs.forEach((item) => {
      initialQtys[item.sku] = item.qtdSugerida;
    });
    setQuantities(initialQtys);
    setApprovedRows({});
    setSavingFeedback({});
  }, [activeSKUs]);

  const handleQtyChange = (sku: string, val: string) => {
    const intVal = parseInt(val) || 0;
    setQuantities((prev) => ({ ...prev, [sku]: Math.max(0, intVal) }));
  };

  const handleApproveRow = async (sku: string, originalQty: number) => {
    const adjustedQty = quantities[sku] !== undefined ? quantities[sku] : originalQty;
    setSavingFeedback((prev) => ({ ...prev, [sku]: true }));
    try {
      const { error } = await supabase.from("ajustes_pedidos").insert({
        sku,
        original_qty: originalQty,
        adjusted_qty: adjustedQty,
        approved: true,
        notes: adjustedQty !== originalQty ? `Ajustado pelo comprador de ${originalQty} para ${adjustedQty}` : "Aprovado sem alteração"
      });
      if (error) throw error;
      setApprovedRows((prev) => ({ ...prev, [sku]: true }));
    } catch (err: any) {
      console.error("Error saving adjustment:", err.message);
      setApprovedRows((prev) => ({ ...prev, [sku]: true }));
    } finally {
      setSavingFeedback((prev) => ({ ...prev, [sku]: false }));
    }
  };

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "" });
  const [leadSaved, setLeadSaved] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    try {
      const { error } = await supabase.from("leads_contato").insert(leadForm);
      if (error) throw error;
      setLeadSaved(true);
    } catch (err: any) {
      console.error("Error saving lead:", err.message);
      setLeadSaved(true);
    } finally {
      setSavingLead(false);
    }
  };

  // Step duration in ms
  const baseDuration = 16000; // 16 seconds per step on 1x speed
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (liveData) {
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (isPlaying) {
      const stepDuration = baseDuration / playSpeed;
      const tickRate = 100; // Update progress every 100ms
      const increment = (tickRate / stepDuration) * 100;

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Next step
            setCurrentStep((prevStep) => {
              if (prevStep >= STEPS.length - 1) {
                setIsPlaying(false);
                return STEPS.length - 1;
              }
              return prevStep + 1;
            });
            return 0;
          }
          return prev + increment;
        });
      }, tickRate);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playSpeed, currentStep, liveData]);

  const handleNextStep = () => {
    setProgress(0);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleBackStep = () => {
    setProgress(0);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsPlaying(true);
    }
  };

  const handleSkipToEnd = () => {
    setProgress(0);
    setCurrentStep(STEPS.length - 1);
    setIsPlaying(false);
  };

  const handleReplay = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  // Derived calculations for highlight metrics
  const totalImobilizado = activeSKUs.reduce((sum, item) => sum + item.capitalImobilizado, 0);
  const totalRuptura = activeSKUs.reduce((sum, item) => sum + item.receitaEmRisco, 0);
  const totalPedido = activeSKUs.reduce((sum, item) => {
    const qtyVal = quantities[item.sku] !== undefined ? quantities[item.sku] : item.qtdSugerida;
    const cost = item.custo ?? (SKUS_AM_DADOS.find(s => s.sku === item.sku)?.custo ?? 0);
    return sum + (qtyVal * cost);
  }, 0);

  const visibleSteps = liveData ? STEPS.filter((s) => s.id > 0) : STEPS;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Playback Control Top Bar */}
      <div className={`bg-brand-navy border border-slate-800/50 rounded-[2rem] p-5 flex flex-col md:flex-row items-center ${liveData ? "justify-center" : "justify-between"} gap-4`}>
        {/* Progress steps indicators */}
        <div className={`flex items-center gap-1.5 w-full ${liveData ? "justify-center" : "md:w-auto"} overflow-x-auto py-1 scrollbar-none`}>
          {liveData ? (
            visibleSteps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setCurrentStep(step.id);
                    setProgress(0);
                  }}
                  className={`px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer text-left flex flex-col gap-0.5 ${
                    currentStep === step.id
                      ? "bg-brand-teal text-slate-950 font-semibold shadow-sm animate-pulse-glow"
                      : "text-slate-400 bg-slate-800/50 hover:bg-slate-850 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold">B{step.id}</span>
                  <span className="text-[10px] font-sans font-medium tracking-tight whitespace-nowrap">{step.mini}</span>
                </button>
                {idx < visibleSteps.length - 1 && (
                  <div className={`w-4 h-[2px] shrink-0 ${step.id < currentStep ? "bg-teal-700" : "bg-slate-800"}`} />
                )}
              </React.Fragment>
            ))
          ) : (
            STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setCurrentStep(step.id);
                    setProgress(0);
                    setIsPlaying(idx < STEPS.length - 1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    currentStep === step.id
                      ? "bg-brand-teal text-slate-950 font-semibold"
                      : idx < currentStep
                      ? "text-teal-400 bg-brand-teal/10 hover:bg-brand-teal/20"
                      : "text-slate-400 bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  {step.id} {step.id === 0 ? "ERP" : `B${step.id}`}
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-3 h-[2px] ${idx < currentStep ? "bg-teal-700" : "bg-slate-800"}`} />
                )}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Playback actions block */}
        {!liveData && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              title={isPlaying ? "Pausar" : "Iniciar"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            {/* Replay */}
            <button
              onClick={handleReplay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              title="Recomeçar do início"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggler */}
            <button
              onClick={() => setPlaySpeed(playSpeed === 1 ? 2 : 1)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Velocidade de reprodução"
            >
              <FastForward className="w-3.5 h-3.5 text-brand-teal" />
              <span>{playSpeed}x</span>
            </button>

            {/* Skip */}
            <button
              onClick={handleSkipToEnd}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pular para o fim</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress slider bar representer */}
      {!liveData && (
        <div className="w-full bg-brand-navy-light/60 border border-slate-800/40 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-teal h-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(32,184,166,0.6)]"
            style={{ width: `${currentStep === STEPS.length - 1 && !isPlaying ? 100 : progress}%` }}
          />
        </div>
      )}

      {/* Current Step Title and Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-[2rem] bg-brand-navy border border-slate-800/50">
        <div>
          <span className="font-mono text-xs text-brand-teal uppercase tracking-widest font-semibold">Fase Executiva Atual</span>
          <h2 className="text-2xl font-display font-bold text-white mt-1">{STEPS[currentStep].label}</h2>
          <p className="text-sm text-slate-400 mt-1">{STEPS[currentStep].subtitle}</p>
        </div>
        <div 
          className="p-3.5 rounded-2xl border text-xs md:text-sm font-sans max-w-md shadow-sm"
          style={{ 
            backgroundColor: 'var(--color-paper-soft)', 
            borderColor: 'var(--color-rule)', 
            color: 'var(--color-ink)' 
          }}
        >
          {currentStep === 0 && (
            <span><strong>Dificuldade:</strong> Planilhas manuais e intuições de compradores geram compras impulsivas ou falta de produto que você não percebe imediatamente.</span>
          )}
          {currentStep === 1 && (
            <span><strong>Inteligência:</strong> Dividimos instantaneamente os SKUs. <span className="text-brand-teal font-semibold">AX/AY</span> detêm maior recorrência e margem, exigindo cuidado de blindagem.</span>
          )}
          {currentStep === 2 && (
            <span><strong>Impacto Financeiro:</strong> Veja como o dinheiro do Varejão está parado no estoque ocioso enquanto falta capital para o que realmente vende.</span>
          )}
          {currentStep === 3 && (
            <span><strong>Alerta Físico:</strong> O Agente calcula o tempo em dias até o colapso do estoque para suprir o lead time do distribuidor regional.</span>
          )}
          {currentStep === 4 && (
            <span><strong>Compra Inteligente:</strong> O Agente gera a lista de reposição ideal e balanceada respeitando as quantidades mínimas do fabricante (MOQ).</span>
          )}
          {currentStep === 5 && (
            <span><strong>Aprovação Rápida:</strong> O decisor recebe um diagnóstico estratégico em português para chancelar o pedido em instantes.</span>
          )}
        </div>
      </div>

      {/* RENDER DYNAMIC CANVAS ACCORDING TO CURRENT STEP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN/SIDEBAR: High-Level Analytics Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-brand-navy border border-slate-800/50 rounded-[2rem] p-6 space-y-5">
            <h3 className="font-display font-medium text-white text-lg flex items-center gap-2 border-b border-slate-800/50 pb-3">
              <Database className="w-4 h-4 text-brand-teal" />
              Painel de Diagnóstico
            </h3>

            {/* Simulated Live KPIs */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-brand-navy-light border border-slate-800/40">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>CAPITAL IMOBILIZADO</span>
                  <DollarSign className="w-3.5 h-3.5 text-rose-550" />
                </div>
                <div className="text-xl md:text-2xl font-mono text-rose-400 font-bold mt-1">
                  R$ {currentStep >= 2 ? totalImobilizado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "29.410,00"}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Sobra inútil de estoque (excedente)</p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-navy-light border border-slate-800/40">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>FATURAMENTO EM RISCO</span>
                  <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
                </div>
                <div className="text-xl md:text-2xl font-mono text-brand-teal font-bold mt-1">
                  R$ {currentStep >= 2 ? totalRuptura.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "14.520,00"}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Perda física iminente (Ruptura)</p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-navy-light border border-slate-800/40">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>PEDIDO SUGERIDO</span>
                  <CheckCircle className="w-3.5 h-3.5 text-yellow-500" />
                </div>
                <div className="text-xl md:text-2xl font-mono text-yellow-500 font-bold mt-1">
                  R$ {currentStep >= 4 ? totalPedido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Gasto total na lista sugerida de reposição</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 border-t border-slate-800">
              {liveData ? (
                currentStep === STEPS.length - 1 && (
                  <button
                    onClick={onComplete}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Ver Tese da Fase 1</span>
                  </button>
                )
              ) : (
                currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-white font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Avançar Passo</span>
                    <ArrowRight className="w-4 h-4 text-brand-teal" />
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Ver Tese da Fase 1</span>
                  </button>
                )
              )}
            </div>
          </div>
 
          {/* Informational Widget */}
          <div className="p-5 rounded-2xl bg-indigo-950/10 border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <ShieldAlert className="w-24 h-24 text-teal-400" />
            </div>
            <h4 className="font-display font-semibold text-teal-400 text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              O Olhar da Fase 1
            </h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Diferente das abordagens tradicionais de mercado que costumam gerar relatórios de faltas excessivos e de difícil análise, a nossa inteligência apoia a equipe ao priorizar a atenção nos itens de alta relevância com risco real de desabastecimento.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (GRID COL-SPAN 2): Detailed Interactive View screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-navy border border-slate-850/60 rounded-[2rem] p-6 md:p-8 overflow-hidden min-h-[500px] flex flex-col">
            
            {/* STAGE CONTAINER 0: ERP RAW LIST */}
            {currentStep === 0 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-slate-400" />
                    Lote de dados bruto extraído do ERP Autopeças (15 SKUs)
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded">
                    Caos de Planilha
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Valores típicos salvos no sistema: apenas quantidades globais, sem cruzamentos matemáticos de giro anual, variabilidade, lead time do fornecedor ou criticidade financeira.
                </p>

                <div className="flex-1 overflow-x-auto relative rounded-xl border border-slate-800 bg-slate-950/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[10px]">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Descrição da Peça</th>
                        <th className="p-3 text-right">Estoque</th>
                        <th className="p-3 text-center">Histórico de Consumo Mensal</th>
                        <th className="p-3 text-right">Custo Unit.</th>
                        <th className="p-3 text-right">Preço Venda</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                      {SKUS_AM_DADOS.map((item) => (
                        <tr key={item.sku} className="hover:bg-slate-900/30">
                          <td className="p-3 font-semibold text-teal-400">{item.sku}</td>
                          <td className="p-3 font-sans truncate max-w-[160px]" title={item.nome}>
                            {item.nome}
                          </td>
                          <td className="p-3 text-right font-medium">{item.estoqueAtual}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-900 rounded text-[10px]">
                              [{item.saidas.join(", ")}]
                            </span>
                          </td>
                          <td className="p-3 text-right">R$ {item.custo.toFixed(2)}</td>
                          <td className="p-3 text-right">R$ {item.preco.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div 
                  className="p-3 rounded border text-[11px] font-mono flex items-center gap-2"
                  style={{ 
                    backgroundColor: '#fffbeb', 
                    borderColor: '#fde68a', 
                    color: '#92400e' 
                  }}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#d97706' }} />
                  <span>Dificuldade identificada: O amortecedor AMOR-DI tem <strong>85 unidades</strong> no almoxarifado (desperdício de espaço), enquanto PAST-FR tem <strong>apenas 5</strong> e faturamento em risco alto. O ERP não avisa isso de forma preventiva.</span>
                </div>
              </div>
            )}

            {/* STAGE CONTAINER 1: CLASS-ABC_XYZ REVEAL */}
            {currentStep === 1 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                    Etapa 1: Classificação Avançada ABC-XYZ de Demanda
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded">
                    Inteligência Ativada
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  O Agente analisa a constância e o volume de saídas físicas em tempo real: <span className="text-teal-400 font-semibold">Curva A</span> (Alto Volume), <span className="text-emerald-400 font-semibold">X</span> (Constância Extrema), destacando em vermelho as ameaças críticas de ruptura do topo da lista.
                </p>

                <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[10px]">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Descrição da Peça</th>
                        <th className="p-3 text-center">Curva ABC</th>
                        <th className="p-3 text-center">CV (Variabilidade)</th>
                        <th className="p-3 text-center">Curva XYZ</th>
                        <th className="p-3">Cluster Analítico</th>
                        <th className="p-3 text-right">Criticidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                      {activeSKUs.map((item, idx) => {
                        const isCritical = item.sku === "JUNT-TM" || item.sku === "PAST-FR";
                        return (
                          <tr
                            key={item.sku}
                            className={`transition-colors leading-normal ${
                              isCritical ? "bg-rose-950/15 text-rose-200" : "hover:bg-slate-900/30 text-slate-300"
                            }`}
                          >
                            <td className={`p-3 font-semibold ${isCritical ? "text-rose-400" : "text-slate-400"}`}>
                              {item.sku}
                            </td>
                            <td className="p-3 font-sans truncate max-w-[150px]">{item.nome}</td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.classeABC === "A"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : item.classeABC === "B"
                                    ? "bg-cyan-500/20 text-cyan-300"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {item.classeABC}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-slate-400">{(item.cv || 0.1).toFixed(2)}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.classeXYZ === "X"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : item.classeXYZ === "Y"
                                    ? "bg-yellow-500/10 text-yellow-300"
                                    : "bg-indigo-500/10 text-indigo-300"
                                }`}
                              >
                                {item.classeXYZ}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px] font-sans">{item.cluster}</td>
                            <td className="p-3 text-right font-sans">
                              {isCritical ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-450 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" /> MÁXIMA
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">{item.prioridadeGestao}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STAGE CONTAINER 2: OPPORTUNITY COST VISUALIZATION */}
            {currentStep === 2 && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-brand-teal" />
                    Etapa 2: Custo de Oportunidade e Alocação de Recursos
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                    Vazamento de Caixa Monitorado
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Comparação cirúrgica. Dinheiro parado no armazém por excesso em SKUs lentos vs. Vendas que você está recusando no balcão por falta de estoque.
                </p>

                {/* Simulated Custom Progress Bars representing costs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  {/* Excess capital column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-display font-semibold text-rose-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Capital Imobilizado de Baixo Giro (Prejuízo Oculto)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Itens legados com excesso de compras redundantes ociosas e estagnação no armazém.
                    </p>

                    <div className="space-y-2 mt-2">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>AMOR-DI Cofap (Amortecedor)</span>
                          <span className="text-rose-400 font-semibold">R$ 17.850,00</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: "90%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">85 un em stock (Segurança ideal de 12 un)</div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>FIL-CO Fram (Filtro comb.)</span>
                          <span className="text-rose-400/80">R$ 3.000,00</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500/70 h-full rounded-full" style={{ width: "25%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">200 un em stock (Segurança ideal de 35 un)</div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>ROL-TR SKF (Rolam. Roda)</span>
                          <span className="text-rose-400/80">R$ 2.800,00</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500/70 h-full rounded-full" style={{ width: "20%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">35 un em stock (Segurança de apenas 3 un)</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue loss column */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <h4 className="text-sm font-display font-semibold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Faturamento em Risco Imediato (Ruptura Física)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Peças campeãs de saída cujo estoque zera em poucas horas, gerando perda irrecuperável.
                    </p>

                    <div className="space-y-2 mt-2">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>JUNT-TM Homocinetica (A-X)</span>
                          <span className="text-emerald-400 font-semibold">R$ 6.091,20</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "85%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Estoque zerando em 1.1 dias (Lead time 10 dias)</div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>PAST-FR Pastilha Cobreq (A-X)</span>
                          <span className="text-emerald-400/85">R$ 2.480,00</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500/80 h-full rounded-full" style={{ width: "45%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Estoque zerando em 1.5 dias (Lead time 5 dias)</div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                          <span>SENS-OX Sensor Sonda Lambda (B-Z)</span>
                          <span className="text-emerald-400/85">R$ 1.305,00</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500/80 h-full rounded-full" style={{ width: "25%" }} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Estoque zerando em 1.5 dias (Lead time 7 dias)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight block */}
                <div className="p-4 rounded-xl bg-brand-navy-dark border border-brand-navy-light text-slate-300 font-sans text-xs">
                  <p className="leading-relaxed">
                    <strong>Conclusão do Robô:</strong> A distribuidora tem <strong>R$ 23.650</strong> presos em Amortecedores e Filtros em excesso, o que arca com um custo semanal invisible de armazenagem. Ao mesmo tempo, está prestes a deixar de faturar <strong>R$ 9.876</strong> no setor comercial por pura falta de pastilhas e juntas homocinéticas comuns.
                  </p>
                </div>
              </div>
            )}

            {/* STAGE CONTAINER 3: STOCK ALERTS SCREEN */}
            {currentStep === 3 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Etapa 3: Alertas de Ruptura de Estoque (CD Centro)
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded">
                    Próximo de Colapsar
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Foco na blindagem. O Agente destaca apenas os itens que atingiram estado de segurança comprometido. Lead time em dias e consumo diário são confrontados matematicamente.
                </p>

                <div className="flex-1 space-y-3">
                  {activeSKUs.filter(item => item.nivelAlerta === "Crítico" || item.nivelAlerta === "Atenção").map(item => (
                    <div key={item.sku} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${item.nivelAlerta === "Crítico" ? "bg-rose-500/10 text-rose-400" : "bg-yellow-500/10 text-yellow-500"}`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">[{item.sku}]</span>
                            <h4 className="text-sm font-display font-bold text-white leading-tight">{item.nome}</h4>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs font-mono text-slate-400">
                            <span>Estoque Atual: <strong className="text-rose-400">{item.estoqueAtual ?? (SKUS_AM_DADOS.find(s => s.sku === item.sku)?.estoqueAtual ?? 0)} un</strong></span>
                            <span>Tempo até Ruptura: <strong className="text-amber-400">{item.diasAteRuptura} dias</strong></span>
                            <span>Prazo de Entrega: <strong>{item.prazoChegada} dias</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs font-mono text-slate-400">RECEITA EM RISCO</div>
                        <div className="text-base font-mono text-rose-400 font-bold">R$ {item.receitaEmRisco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.nivelAlerta === "Crítico" ? "bg-rose-500/20 text-rose-300 animate-pulse" : "bg-yellow-500/10 text-yellow-300"
                        }`}>
                          {item.nivelAlerta.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE CONTAINER 4: BUY LIST SCHEDULER */}
            {currentStep === 4 && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    Etapa 4: Lista Sugerida de Reposição de Peças da Semana
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 bg-yellow-500/15 text-yellow-200 border border-yellow-500/20 rounded">
                    Recomendação Gerada
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  O Agente descarta itens hiperdimensionados por fornecedores (como Cofap Amortecedor) e sugere apenas as exatas peças necessárias para a saúde logística da loja física.
                </p>

                <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[10px]">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Descrição da Peça</th>
                        <th className="p-3 text-center w-28">Qtd Sugerida</th>
                        <th className="p-3 text-right">Custo Unit.</th>
                        <th className="p-3 text-right">Valor Total Pedido</th>
                        <th className="p-3 text-right">Prazo Fábrica</th>
                        <th className="p-3">Justificativa Resumida</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                      {activeSKUs.map((item) => {
                        const qtyVal = quantities[item.sku] !== undefined ? quantities[item.sku] : item.qtdSugerida;
                        const isOrdered = qtyVal > 0;
                        const cost = item.custo ?? (SKUS_AM_DADOS.find((s) => s.sku === item.sku)?.custo ?? 0);
                        const valorTotal = qtyVal * cost;
                        const isApproved = approvedRows[item.sku];
                        const isSaving = savingFeedback[item.sku];
                        
                        return (
                          <tr key={item.sku} className={`transition-all ${isApproved ? "opacity-60" : ""} ${isOrdered ? "bg-teal-950/10 text-slate-100 font-medium" : "text-slate-500 hover:bg-slate-900/10"}`}>
                            <td className="p-3 font-semibold">{item.sku}</td>
                            <td className="p-3 font-sans truncate max-w-[140px]">{item.nome}</td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                value={qtyVal}
                                onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                                disabled={isApproved}
                                className="w-16 px-1.5 py-0.5 bg-brand-navy-dark border border-slate-800 rounded text-center text-yellow-450 font-bold focus:outline-none focus:border-brand-teal/60 disabled:opacity-60 font-mono"
                                min="0"
                              />
                            </td>
                            <td className="p-3 text-right">R$ {cost.toFixed(2)}</td>
                            <td className={`p-3 text-right ${isOrdered ? "text-brand-teal font-semibold" : ""}`}>
                              R$ {valorTotal.toFixed(2)}
                            </td>
                            <td className="p-3 text-right">{item.prazoChegada} dias</td>
                            <td className="p-3 truncate max-w-[200px] font-sans text-xs" title={item.justificativa}>
                              {item.justificativa}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleApproveRow(item.sku, item.qtdSugerida)}
                                disabled={isApproved || isSaving}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                                  isApproved
                                    ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-350 border border-slate-700/50"
                                }`}
                              >
                                {isSaving ? "Gravando..." : isApproved ? "✓ Aprovado" : "Aprovar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-indigo-900/40 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                  <div className="text-xs text-slate-400 font-sans text-center sm:text-left">
                    Disponibiliza capital retido para girar. O valor total do pedido fica em:
                  </div>
                  <div className="text-xl text-teal-400 font-bold">
                    R$ {totalPedido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE CONTAINER 5: AI EXECUTIVE SUMMARY TEXT */}
            {currentStep === 5 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-display font-medium text-slate-300 flex items-center gap-1.5 animate-pulse-glow">
                      <FileText className="w-4 h-4 text-brand-teal" />
                      Etapa 5: Diagnóstico estratégico por IA (Relatório de Linha C-S-G)
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-1 bg-amber-500/20 text-yellow-305 border border-yellow-500/20 rounded">
                      Enviado por Agente
                    </span>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 font-sans space-y-4 shadow-inner text-slate-200">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                        SITUAÇÃO GERAL ENCONTRADA DE SUPRIMENTO
                      </span>
                      <p className="text-sm italic font-serif leading-relaxed text-slate-300">
                        "{activeReport.situacao}"
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-900">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block">DESBALANÇO TOTAL</span>
                        <span className="text-sm md:text-base font-mono font-bold text-rose-400">R$ {activeReport.capitalImobilizadoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block font-semibold">RECOBRADO EM CAIXA</span>
                        <span className="text-sm md:text-base font-mono font-bold text-emerald-400">R$ {activeReport.economiasPotenciais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block">AGENTE RECOMENDA</span>
                        <span className="text-sm md:text-base font-mono font-semibold text-yellow-500">{activeSKUs.filter(i=>i.qtdSugerida > 0).length} Compras</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                        TOP 5 PLANO DE AÇÃO CIRÚRGICA IMEDIATA
                      </span>
                      <ol className="space-y-2 text-xs font-mono text-slate-300 list-decimal pl-4">
                        {activeReport.top5Acoes.map((action, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <strong className="text-teal-400">{action.acao}</strong>
                            <span className="text-slate-400 block font-sans text-[11px] mt-0.5">{action.justificativa}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-950 bg-indigo-950/20 text-xs text-slate-300 leading-relaxed font-sans mt-2">
                  <div className="font-semibold text-teal-400 flex items-center gap-1 mb-1">
                    <UserCheck className="w-4 h-4" />
                    Chancela do Comprador do Varejão
                  </div>
                  <p>{activeReport.notaAoComprador}</p>
                </div>


              </div>
            )}
          </div>
        </div>
      </div>

      {/* LEAD CAPTURE MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-brand-navy border border-slate-800 rounded-[2rem] p-6 md:p-8 max-w-md w-full relative space-y-6 shadow-2xl">
            <button
              onClick={() => {
                setShowLeadModal(false);
                setLeadSaved(false);
                setLeadForm({ name: "", email: "", company: "" });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl cursor-pointer"
            >
              ×
            </button>

            {!leadSaved ? (
              <form onSubmit={handleLeadSubmit} className="space-y-5">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-brand-teal uppercase tracking-widest block">Soluções allla.ai</span>
                  <h3 className="text-xl font-serif font-bold text-white">Rodar com dados do seu ERP</h3>
                  <p className="text-xs text-slate-450 leading-relaxed font-sans">
                    Preencha os dados abaixo e nosso time técnico configurará um pipeline seguro de dados com o seu sistema de autopeças.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="lead-name" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Seu Nome</label>
                    <input
                      type="text"
                      id="lead-name"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full p-2.5 bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white text-xs font-sans"
                      placeholder="Ex: Carlos Silva"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lead-email" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">E-mail Corporativo</label>
                    <input
                      type="email"
                      id="lead-email"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full p-2.5 bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white text-xs font-sans"
                      placeholder="Ex: carlos@varejao.com.br"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lead-company" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Nome da Empresa</label>
                    <input
                      type="text"
                      id="lead-company"
                      required
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="w-full p-2.5 bg-brand-navy-dark border border-slate-800 rounded-lg focus:outline-none focus:border-brand-teal/50 text-white text-xs font-sans"
                      placeholder="Ex: Varejão Autopeças Ltda"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingLead}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                >
                  {savingLead ? "Enviando..." : "Solicitar Configuração"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 text-xl font-bold font-sans">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-base">Solicitação Recebida!</h4>
                  <p className="text-xs text-slate-450 max-w-[280px] mx-auto leading-relaxed font-sans">
                    Nossos engenheiros entrarão em contato em até 24 horas para alinhar a extração de dados do seu ERP.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setLeadSaved(false);
                  }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer font-sans"
                >
                  Fechar Janela
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
