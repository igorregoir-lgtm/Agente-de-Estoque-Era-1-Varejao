import React, { useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import PlaybackDashboard from "./components/PlaybackDashboard";
import TeseEstrategica from "./components/TeseEstrategica";
import ModoVivoController from "./components/ModoVivoController";
import { Sparkles, Library, Zap, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { SkuAmostra, AnaliseSku, RelatorioExecutivo } from "./types";

type AppStage = "welcome" | "playback" | "tese" | "live-playground";

export default function App() {
  const [stage, setStage] = useState<AppStage>("welcome");

  // State to hold and accumulate live data items so they persist across navigation
  const [liveItems, setLiveItems] = useState<SkuAmostra[]>([
    {
      sku: "EMBR-DI",
      nome: "Kit de Embreagem LUK 622307500",
      categoria: "Transmissão",
      estoqueAtual: 1,
      saidas: [18, 16, 20],
      custo: 350.00,
      preco: 620.00,
      leadTimeDias: 8,
      moq: 5
    },
    {
      sku: "CAB-VE",
      nome: "Cabo de Vela NGK SC-T04",
      categoria: "Ignição",
      estoqueAtual: 50,
      saidas: [35, 38, 36],
      custo: 42.00,
      preco: 85.00,
      leadTimeDias: 4,
      moq: 10
    }
  ]);

  // Custom data generated from the Live Playground
  const [customResult, setCustomResult] = useState<{
    analises: AnaliseSku[];
    relatorio: RelatorioExecutivo;
  } | null>(null);

  // Functions to handle navigation
  const handleStartPlayback = () => {
    setCustomResult(null); // Reset custom analyses back to deterministic seed on normal start
    setStage("playback");
  };

  const handleFinishPlayback = () => {
    setStage("tese");
  };

  const handleOpenLivePlayground = () => {
    setStage("live-playground");
  };

  // Callback when a dynamic analysis is successfully completed in the Live Playground
  const handleLiveAnalysisCompleted = (data: { analises: AnaliseSku[]; relatorio: RelatorioExecutivo }) => {
    setCustomResult(data);
    setStage("playback"); // Redirect instantly to run the playback with the newly analyzed SKUs!
  };

  return (
    <div className="min-h-screen bg-brand-navy-dark text-[#e2e8f0] flex flex-col justify-between font-sans selection:bg-brand-teal selection:text-slate-950">
      
      {/* Top Header Navigation bar */}
      <header className="border-b border-slate-800/50 bg-brand-navy/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* logo + brand name */}
          <div 
            onClick={() => setStage("welcome")} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            {/* Elegant SVG visual representing allla + Fase 1 logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-teal to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-teal/20 group-hover:scale-105 transition-transform">
              <span className="font-serif italic font-bold text-slate-950 text-lg">a</span>
            </div>
            <div>
              <span className="font-display font-bold text-white text-base tracking-tight block">
                allla<span className="text-brand-teal">.ai</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block -mt-1 font-semibold">
                Fase 1 · Suprimentos
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => {
                setCustomResult(null);
                setStage("playback");
              }}
              className={`transition-colors cursor-pointer ${stage === "playback" && !customResult ? "text-brand-teal font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Demonstração
            </button>
            <button
              onClick={() => setStage("tese")}
              className={`transition-colors cursor-pointer ${stage === "tese" ? "text-brand-teal font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Tese Estratégica
            </button>
            <button
              onClick={() => setStage("live-playground")}
              className={`transition-colors cursor-pointer ${stage === "live-playground" || customResult ? "text-brand-teal font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Modo ao Vivo
            </button>
          </div>

          {/* Intelligence applied by allla - enlarged and clean */}
          <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/40 select-none">
            <span className="text-sm font-medium text-brand-teal tracking-tight font-mono">
              Intelligence applied by
            </span>
            <img 
              src="/logo_allla.jpeg" 
              alt="allla logo" 
              className="h-18 w-auto rounded opacity-95 object-contain border border-slate-700/20"
            />
          </div>
        </div>
      </header>

      {/* Main Container screen slots */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {stage === "welcome" && (
          <WelcomeScreen onStart={handleStartPlayback} />
        )}

        {stage === "playback" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStage("welcome")}
                className="text-xs text-slate-450 hover:text-white flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-brand-teal" />
                <span>Voltar ao Onboarding</span>
              </button>
              {customResult ? (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    Modo ao Vivo Ativo
                  </span>
                  <button
                    onClick={() => {
                      setCustomResult(null);
                      setStage("live-playground");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-amber-500/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resetar & Inserir mais dados</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                  Reprodução Linear Determinística
                </span>
              )}
            </div>

            <PlaybackDashboard
              onComplete={handleFinishPlayback}
              liveData={customResult || undefined}
            />
          </div>
        )}

        {stage === "tese" && (
          <TeseEstrategica
            onBackToDemo={handleStartPlayback}
            onOpenLivePlayground={handleOpenLivePlayground}
          />
        )}

        {stage === "live-playground" && (
          <ModoVivoController
            items={liveItems}
            setItems={setLiveItems}
            onBackToTese={() => setStage("tese")}
            onAnalysisResult={handleLiveAnalysisCompleted}
          />
        )}

      </main>


    </div>
  );
}
