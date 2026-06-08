import React, { useState, useEffect } from "react";
import { Play, ShieldAlert, Sparkles, Database } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [countdown, setCountdown] = useState(12);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!autoStarted) {
            onStart();
            setAutoStarted(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onStart, autoStarted]);

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 md:py-24 select-none">
      {/* Background glowing orbs reflecting the original cosmic-teal design */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-3xl w-full text-center z-10 space-y-8">
        
        {/* allla branding & Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">allla.ai · Era 1 · Inteligência</span>
        </div>

        {/* Strategic Hook (0.1 Tese) */}
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white leading-normal md:leading-tight">
          De dados <span className="text-brand-teal italic font-serif font-light">crus de ERP</span> a
          <br className="hidden md:inline" /> decisões de compra explicadas em <span className="text-brand-teal">90 segundos</span>.
        </h1>

        <p className="max-w-xl mx-auto text-sm md:text-base text-slate-300 font-sans leading-relaxed">
          Prove a inteligência de suprimentos da Era 1 para o Varejão Autopeças. Veja como algoritmos e modelos explicativos eliminam a estocagem ociosa de amortecedores e evitam a falta crítica de cabos e velas.
        </p>

        {/* Interactive load indicator / countdown box */}
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-4 h-4 text-brand-teal" />
              Semente de Playback Determinístico
            </span>
            <span className="text-slate-500">15 SKUs de Autopeças</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900/50">
            <div 
              className="bg-brand-teal h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(20,184,166,0.5)] animate-pulse" 
              style={{ width: `${(countdown / 12) * 100}%` }} 
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {countdown > 0 ? (
              <span>Iniciando simulação automaticamente em <span className="text-brand-teal font-bold">{countdown} segundos</span> ou clique abaixo...</span>
            ) : (
              <span className="text-emerald-400 font-semibold animate-pulse">Lançando o Agente Operador...</span>
            )}
          </div>
        </div>

        {/* Play CTA Button with elegant teal-to-emerald gradient of original design */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStart}
            id="btn-start-playback"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <Play className="w-4 h-4 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-sm">Ver a Era 1 Operando</span>
          </button>
        </div>

        {/* Onboarding secondary items */}
        <div className="flex items-center justify-center gap-6 pt-6 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            Sem Integrações de TI Complexas
          </span>
          <span>•</span>
          <span>Visão Geral Estratégica</span>
          <span>•</span>
          <span>Foco Exclusivo no Decisor</span>
        </div>

      </div>
    </div>
  );
}
