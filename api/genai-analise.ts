import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API do Gemini no painel de Configurações > Environment Variables do Vercel.");
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

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
      
      Utilize as seguintes definições de negócios de autopeças baseadas em demanda MENSAL:
      - Consumo Mensal Médio (avgMonthlyDemand): Média dos valores do array 'saidas' (que agora representam consumo mensal).
      - Consumo Diário Médio (avgDailyDemand): avgMonthlyDemand / 30.
      - Consumo Semanal Médio (avgWeeklyDemand): avgMonthlyDemand / 4.33.
      - Classe ABC: baseada em preço * avgWeeklyDemand * 8. ITENS A detêm ~70% do faturamento, B ~20%, C ~10%.
      - Classe XYZ (Variabilidade): X é estável, Y é moderadamente instável, Z é altamente errático/variável.
      - Fator Z (Nível de Serviço): Se 'nivelServicoAlvo' estiver preenchido no SKU (ex: 95 ou 98), use o Fator Z correspondente (90% -> Z=1.28, 95% -> Z=1.65, 98% -> Z=2.05, 99% -> Z=2.33). Se não estiver preenchido, use Z=1.65 (95%).
      - Estoque de Segurança (SS): 
        Calcule a variabilidade diária da demanda: sigma_d = desvio_padrao_mensal / 5.48. Se o desvio padrão mensal for 0 ou houver menos de 2 valores de saídas, assuma sigma_d = avgDailyDemand * 0.2.
        Se 'desvioPrazoEntrega' (sigma_LT) estiver preenchido e maior que 0:
          SS = Z * sqrt(leadTimeDias * (sigma_d^2) + (avgDailyDemand^2) * (desvioPrazoEntrega^2))
        Caso contrário (não preenchido ou 0):
          SS = Z * sigma_d * sqrt(leadTimeDias)
        Arredonde o Estoque de Segurança para cima.
      - Ponto de Reposição (ROP): (avgDailyDemand * leadTimeDias) + Estoque de Segurança.
      - Dias até ruptura: estoqueAtual / avgDailyDemand.
      - Alerta: "Crítico" se dias até ruptura <= leadTimeDias; "Atenção" se estoqueAtual <= ROP; "Normal" caso contrário.
      - Capital Imobilizado: se estoqueAtual > ROP + avgMonthlyDemand, calcule (estoqueAtual - (ROP + avgMonthlyDemand)) * custo. Caso contrário, 0.
      - Custo de Manutenção por Semana (custoManutencaoSemana):
        Se 'custoArmazenagemPercentual' estiver preenchido e maior que 0, use: (Capital Imobilizado * (custoArmazenagemPercentual / 100)) / 52.
        Se não estiver preenchido, use o padrão: Capital Imobilizado * 0.005 (0.5% por semana, equivalente a 26% ao ano).
      - Receita em Risco: se nivelAlerta for "Crítico", calcule ((avgDailyDemand * leadTimeDias) - estoqueAtual) * preco. Caso contrário, 0.
      - Qtd Sugerida para pedir: se houver alerta crítico ou atenção, sugerir quantidade para recompor o estoque até (ROP + avgMonthlyDemand) respeitando o MOQ (arredonde para cima para o próximo múltiplo inteiro de MOQ). Se estiver normal ou com excesso, sugerir 0.
      
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

      Retorne APENAS um JSON válido de acordo com o esquema acima de forma direta, sem tags markdown do tipo \`\`\`json no início ou fim.
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

    return res.status(200).json(resultJson);
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    return res.status(500).json({
      error: error.message || "Erro interno de processamento de IA.",
      isKeyMissing: error.message.includes("GEMINI_API_KEY") || error.message.includes("não configurada")
    });
  }
}
