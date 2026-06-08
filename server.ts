import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client to avoid crashing if GEMINI_API_KEY is not defined yet
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API do Gemini no painel de Configurações > Secrets do AI Studio para usar o Modo ao Vivo com IA real.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Costura A - API Endpoint for dynamic Gemini-powered Era 1 analysis (Modo Ao Vivo)
app.post("/api/genai-analise", async (req, res) => {
  try {
    const { skus } = req.body;
    if (!skus || !Array.isArray(skus) || skus.length === 0) {
      return res.status(400).json({ error: "Parâmetros inválidos. 'skus' deve ser um array não vazio." });
    }

    const ai = getAiClient();
    
    const prompt = `
      Você é o Agente de Estoque Era 1 do Varejão Autopeças. Sua missão é ler esta lista de peças de reposição de autopeças e gerar uma análise cirúrgica combinada de controle de estoque obedecendo ao protocolo de 6 passos (ABC-XYZ, custo de oportunidade, alertas de estoque e lista de pedidos).
      
      Lista de SKUs fornecida:
      ${JSON.stringify(skus, null, 2)}
      
      Utilize as seguintes definições de negócios de autopeças:
      - Classe ABC: baseada em preço * saída semanal média. ITENS A detêm ~70% do faturamento, B ~20%, C ~10%.
      - Classe XYZ (Variabilidade): X é estável, Y é moderadamente instável, Z é altamente errático/variável.
      - Estoque de Segurança = (Lead Time em semanas * consumo_medio_semanal * 1.5) ou com folga adequada para Z.
      - Ponto de Reposição = Estoque de Segurança + (Lead Time em semanas * consumo_medio_semanal).
      - Dias até ruptura = estoqueAtual % consumo_diario.
      - Alerta: "Crítico" se dias até ruptura < leadTimeDias; "Atenção" se está próximo do ponto de reposição; "Normal" caso contrário.
      - Capital Imobilizado = estoque excessivo (acima da cobertura de 2 semanas) * custo.
      - Qtd Sugerida para pedir: se houver alerta crítico ou atenção, sugerir quantidade para recompor para pelo menos 3 semanas de estoque respeitando o MCQ / MOQ (Quantidade mínima de pedido). Se estiver normal ou com excesso, sugerir 0.
      
      Gere uma resposta JSON estruturada que contenha exatamente duas chaves:
      1. "analises": Um array de objetos, onde cada objeto representa a análise de um SKU e atende fielmente à interface "AnaliseSku" do TypeScript.
      2. "relatorio": Um Sumário Executivo que atende fielmente à interface "RelatorioExecutivo" do TypeScript.

      Campos exigidos para cada objeto em "analises":
      - sku: string
      - nome: string
      - categoria: string
      - receitaPotencial: number (estimativa anual em faturamento: preco * media_semanal * 52)
      - classeABC: "A" | "B" | "C"
      - cv: number (coeficiente de variação das saídas, ex: 0.15)
      - classeXYZ: "X" | "Y" | "Z"
      - cluster: string (ex: "AX (Consumo Alto e Estável)")
      - prioridadeGestao: "Máxima" | "Alta" | "Média" | "Baixa"
      - capitalImobilizado: number (valor acumulado acima de 2 semanas em reais)
      - custoManutencaoSemana: number (0.5% do capital imobilizado)
      - custoRupturaEstimado: number
      - indicePrioridade: number (0 a 100)
      - estoqueSeguranca: number (peças)
      - pontoReposicao: number (peças)
      - diasAteRuptura: number (dias com estoque atual)
      - nivelAlerta: "Normal" | "Atenção" | "Crítico"
      - receitaEmRisco: number (preco * media_semanal * lead_time_semanas)
      - qtdSugerida: number (pedido recomendado, múltiplo de MOQ)
      - valorPedido: number (qtdSugerida * custo)
      - prazoChegada: number (leadTimeDias do SKU inicial)
      - justificativa: sua análise explicativa escrita em linguagem clara, empática e legível, sem jargão pesado de IA, mostrando ao decisor por que comprar ou não, e o impacto operacional dessa decisão em reais.

      Campos exigidos para "relatorio":
      - situacao: string (Resumo diagnóstico do estoque total enviado em português simples)
      - capitalImobilizadoTotal: number (soma de todos os capitais imobilizados na amostra em reais)
      - receitaEmRiscoTotal: number (soma das receitas em risco imediatas da amostra em reais)
      - economiasPotenciais: number (quanto capital pode ser liberado estancando compras redundantes)
      - top5Acoes: lista de até 5 ações imediatas contendo { acao: string, justificativa: string }
      - notaAoComprador: considerações finais estratégicas provando o método da Era 1.

      Retorne APENAS um JSON válido de acordo com o esquema abaixo de forma direta, sem tags markdown do tipo \`\`\`json no início ou fim.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const textOutput = response.text || "{}";
    const cleanedText = textOutput.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const resultJson = JSON.parse(cleanedText);

    res.json(resultJson);
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    res.status(500).json({
      error: error.message || "Erro interno de processamento de IA.",
      isKeyMissing: error.message.includes("GEMINI_API_KEY") || error.message.includes("não configurada")
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist folder in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-stack Server] Servidor ativo e rodando na porta ${PORT}`);
  });
}

startServer();
