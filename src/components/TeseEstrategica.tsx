import React, { useState } from "react";
import { FASES_TESE } from "../seed";
import { TrendingUp, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Compass, Layers, Zap } from "lucide-react";

interface TeseEstrategicaProps {
  onBackToDemo: () => void;
  onOpenLivePlayground: () => void;
}

export default function TeseEstrategica({ onBackToDemo, onOpenLivePlayground }: TeseEstrategicaProps) {
  const [selectedPhase, setSelectedPhase] = useState("fase1");

  const activePhase = FASES_TESE.find((f) => f.id === selectedPhase) || FASES_TESE[0];

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Strategic Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-teal-400">
          <Compass className="w-3.5 h-3.5" />
          <span>TESE ESTRATÉGICA · VAREJÃO AUTOPEÇAS</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-semibold text-white tracking-tight">
          A Jornada das <span className="text-brand-teal italic">Três Fases</span> de Suprimentos
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Como apoiamos o departamento de compras do Varejão a evoluir de uma postura tradicional e reativa para uma gestão estratégica e inteligente, focada na saúde financeira do estoque e no atendimento impecável dos clientes.
        </p>
      </div>

      {/* Value Curve Comparison Section */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[2rem] p-6 md:p-8 space-y-6">
        <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-teal" />
          Curva de Valor: Abordagem de Mercado vs. Fase 1 da allla
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Os processos de abastecimento tradicionais costumam focar em compras por volume. A nossa abordagem inteligente prioriza a proteção do caixa e a disponibilidade das peças certas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Traditional System */}
          <div className="p-5 rounded-2xl bg-[#030303] border border-rose-950/50 space-y-4">
            <span className="font-mono text-rose-500 font-bold text-xs uppercase tracking-widest block">
              COMO É HOJE: Abordagem Tradicional no Mercado
            </span>
            <ul className="space-y-2 text-xs md:text-sm text-slate-300">
              <li className="flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Geração de Excedente:</strong> Compras genéricas baseadas na abordagem tradicional encontrada no mercado para conseguir desconto de volume, mantendo capital parado sem necessidade.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Ruptura de Estoque:</strong> Indisponibilidade silenciosa de itens importantes para o dia a dia, gerando perda de vendas e insatisfação no balcão.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Sobrecarga Operacional:</strong> Equipes de compras sobrecarregadas com planilhas manuais complexas, sobrando pouco tempo para análises estratégicas.</span>
              </li>
            </ul>
          </div>

          {/* Era 1 Systems */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-blue-500/20 space-y-4">
            <span className="font-mono text-blue-400 font-bold text-xs uppercase tracking-widest block">
              COMO PROPOMOS: A Fase 1 por allla
            </span>
            <ul className="space-y-2 text-xs md:text-sm text-slate-300">
              <li className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Saneamento de Portfólio:</strong> Realocação consciente do capital, reduzindo o excesso em itens de baixo giro para investir em peças essenciais.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Blindagem de Recorrência:</strong> Proteção contínua contra falta de estoque, baseada no tempo de entrega real do Centro de Distribuição regional.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Decisões Justificadas:</strong> Pedidos recomendados com diagnósticos estratégicos claros e concisos que facilitam o dia a dia.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3-Phases Interactive Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Navigation Phase Buttons */}
        <div className="lg:col-span-1 space-y-3">
          <span className="font-mono text-[10px] text-slate-550 block font-semibold uppercase tracking-widest pl-1">
            SELECIONE UMA FASE DA EVOLUÇÃO
          </span>
          {FASES_TESE.map((f, idx) => {
            const isSelected = selectedPhase === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedPhase(f.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer block ${
                  isSelected
                    ? "bg-[#111111] border-blue-500/30 text-white shadow-lg"
                    : "bg-[#0c0c0c] border-[#1a1a1a] text-slate-400 hover:bg-[#111111] hover:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected ? "bg-brand-teal text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm leading-tight">{f.nome}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{f.periodo}</span>
                  </div>
                </div>
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#1a1a1a] space-y-4">
            <button
              onClick={onOpenLivePlayground}
              className="w-full py-3.5 px-4 rounded-xl bg-[#111111] hover:bg-[#1c1c1c] text-sm text-white font-medium flex items-center justify-center gap-2 border border-[#1a1a1a] transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-blue-450 animate-pulse" />
              <span>Experimentar Modo ao Vivo (IA)</span>
            </button>
          </div>
        </div>

        {/* Selected Phase Detail Showcase */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-[2rem] bg-[#0c0c0c] border border-[#1a1a1a] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
              <div>
                <span className="font-mono text-xs text-blue-400 uppercase tracking-widest block">
                  META ESTRATÉGICA ATIVA
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-0.5">{activePhase.nome}</h3>
              </div>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                {activePhase.periodo}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-widest">
                OBJETIVO PRINCIPAL
              </span>
              <p className="text-slate-200 font-sans text-sm mt-1 leading-relaxed">
                {activePhase.objetivo}
              </p>
            </div>

            <div className="space-y-3 bg-[#111111] p-4 rounded-xl border border-[#1a1a1a]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-widest">
                INICIATIVAS LOGÍSTICAS DA FASE
              </span>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {activePhase.iniciativas.map((initiative, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{initiative}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#1a1a1a] text-xs font-sans">
            <span className="text-[10px] font-mono text-blue-400 block uppercase tracking-widest font-semibold">
              ENTREGA DE VALOR FINANCEIRO ESTIMADO
            </span>
            <p className="text-slate-300 font-medium mt-1">
              {activePhase.entregaDeValor}
            </p>
          </div>
        </div>
      </div>

      {/* footer action triggers */}
      <div className="p-8 rounded-[2rem] bg-[#0c0c0c] border border-[#1a1a1a] text-center space-y-6">
        <h4 className="text-xl md:text-2xl font-serif font-semibold text-white">
          Saneando dados de compras do Varejão hoje mesmo.
        </h4>
        <p className="max-w-xl mx-auto text-xs md:text-sm text-slate-450 font-sans">
          Nenhuma mudança radical e cara de software é exigida. Comece exportando um simples lote do seu ERP existente e assista o Agente diagnosticar as falhas comerciais e reter dinheiro de sobra.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onBackToDemo}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#1c1c1c] text-slate-200 text-sm font-medium border border-[#1a1a1a] cursor-pointer transition-colors"
          >
            Replay da Demonstração
          </button>
          <a
            href="mailto:igor.rego.IR@gmail.com?subject=Varejao%20Era%201%20-%20allla%20Consultoria"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
          >
            Fale com a Consultoria allla
          </a>
        </div>
      </div>
    </div>
  );
}
