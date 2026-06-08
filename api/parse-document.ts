import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API do Gemini no painel de Configurações do Vercel.");
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
    const { fileBase64, mimeType, fileName } = req.body;
    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: "Parâmetros inválidos. 'fileBase64' e 'mimeType' são obrigatórios." });
    }

    const ai = getAiClient();

    const prompt = `
      Você é um assistente especialista em extração de dados e OCR para o Varejão Autopeças.
      Sua tarefa é analisar o arquivo fornecido (que pode ser um relatório de estoque, tabela de vendas em PDF ou CSV) e extrair uma lista de SKUs estruturada.
      
      Por favor, extraia os seguintes campos para cada SKU e mapeie para a estrutura de dados correta:
      - sku: código do produto (Ex: 'JUNT-TM', 'PAST-FR-01'). Deve ser curto, sem espaços. Se não houver, crie um código único com base no nome do produto.
      - nome: descrição ou nome da peça de reposição (Ex: 'Pastilha Freio Diant. Cobreq').
      - categoria: categoria da peça (Ex: 'Suspensão', 'Freios', 'Filtros', 'Transmissão', ou 'Geral' se não puder ser identificada).
      - estoqueAtual: saldo físico ou quantidade em estoque atual (inteiro). Se não for mencionado, assuma 0.
      - saidas: histórico de saídas mensais (consumo histórico). Deve ser um array de números inteiros representando as vendas mensais. Se o arquivo contiver consumo semanal, multiplique por 4.33 para obter o consumo mensal equivalente. Se houver apenas uma média mensal ou consumo anual, divida e repita ou use como um array de 3 elementos semelhantes (Ex: [45, 45, 45]). Se não for mencionado, use [10, 10, 10].
      - custo: custo unitário de compra (número decimal). Se não for mencionado, assuma 50.00.
      - preco: preço unitário de venda ao consumidor (número decimal). Se não for mencionado, assuma custo * 1.8.
      - leadTimeDias: tempo de entrega do fornecedor em dias úteis (inteiro). Se não for mencionado, assuma 5.
      - moq: lote mínimo de compra ou quantidade mínima de pedido (inteiro). Se não for mencionado, assuma 10.
      - nivelServicoAlvo: nível de serviço alvo desejado em porcentagem (Ex: 95 ou 98). Se não for mencionado ou não estiver visível no documento, assuma nulo (null).
      - custoArmazenagemPercentual: custo anual de carregamento/armazenagem do estoque em porcentagem (Ex: 25 ou 30). Se não for mencionado ou não estiver visível, assuma nulo (null).
      - desvioPrazoEntrega: desvio padrão ou variabilidade do prazo de entrega do fornecedor em dias (Ex: 1.5 ou 2.0). Se não for mencionado ou não estiver visível, assuma nulo (null).

      Retorne APENAS um JSON válido contendo uma única chave "skus" que aponta para o array de objetos extraídos, conforme exemplo:
      {
        "skus": [
          {
            "sku": "PAST-FR",
            "nome": "Pastilha de Freio Cobreq",
            "categoria": "Freios",
            "estoqueAtual": 12,
            "saidas": [30, 28, 32],
            "custo": 45.00,
            "preco": 85.00,
            "leadTimeDias": 5,
            "moq": 10,
            "nivelServicoAlvo": 95,
            "custoArmazenagemPercentual": 25,
            "desvioPrazoEntrega": 1.5
          }
        ]
      }

      Evite adicionar explicações ou formatação markdown do tipo \`\`\`json no retorno. Retorne diretamente o objeto JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const textOutput = response.text || "{}";
    const cleanedText = textOutput.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const resultJson = JSON.parse(cleanedText);

    return res.status(200).json(resultJson);
  } catch (error: any) {
    console.error("Erro no processamento do documento pelo Gemini:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao ler e processar o documento via IA.",
      isKeyMissing: error.message.includes("GEMINI_API_KEY") || error.message.includes("não configurada")
    });
  }
}
