export interface SkuAmostra {
  sku: string;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  saidas: number[]; // últimas 8 semanas
  custo: number;
  preco: number;
  leadTimeDias: number;
  moq: number;
  nivelServicoAlvo?: number;
  custoArmazenagemPercentual?: number;
  desvioPrazoEntrega?: number;
}

export interface AnaliseSku {
  sku: string;
  nome: string;
  categoria: string;
  receitaPotencial: number;
  classeABC: "A" | "B" | "C";
  cv: number; // Coeficiente de Variação
  classeXYZ: "X" | "Y" | "Z";
  cluster: string; // ex: "AX (Consumo Alto e Estável)", "CY (Pouco Giro, Variável)"
  prioridadeGestao: "Máxima" | "Alta" | "Média" | "Baixa";
  capitalImobilizado: number;
  custoManutencaoSemana: number;
  custoRupturaEstimado: number;
  indicePrioridade: number;
  estoqueSeguranca: number;
  pontoReposicao: number;
  diasAteRuptura: number;
  nivelAlerta: "Normal" | "Atenção" | "Crítico";
  receitaEmRisco: number;
  qtdSugerida: number;
  valorPedido: number;
  prazoChegada: number; // Dias úteis simulados
  justificativa: string;
  estoqueAtual?: number;
  custo?: number;
  moq?: number;
}

export interface RelatorioExecutivo {
  situacao: string;
  capitalImobilizadoTotal: number;
  receitaEmRiscoTotal: number;
  economiasPotenciais: number;
  top5Acoes: {
    acao: string;
    justificativa: string;
  }[];
  notaAoComprador: string;
}

export interface FaseTese {
  id: string;
  nome: string;
  periodo: string;
  objetivo: string;
  iniciativas: string[];
  entregaDeValor: string;
}
