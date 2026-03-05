import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

let ai: GoogleGenAI | null = null;

function getAiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function getFinancialInsights(transactions: Transaction[]) {
  if (transactions.length === 0) return "Adicione algumas transações para receber insights personalizados.";

  const summary = transactions.map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description
  }));

  try {
    const client = getAiClient();
    if (!client) {
      return "Insights da IA estão temporariamente indisponíveis (Chave de API não configurada).";
    }

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analise estas transações financeiras e forneça 3 dicas curtas e práticas em português para melhorar a saúde financeira do usuário. Seja direto e use um tom encorajador.
      
      IMPORTANTE: Sempre que citar valores monetários, formate-os estritamente como "R$ X,XX" (Real Brasileiro).
      
      Transações: ${JSON.stringify(summary)}`,
      config: {
        systemInstruction: "Você é um consultor financeiro pessoal experiente e amigável.",
      }
    });

    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Error fetching insights:", error);

    // Tratamento amigável para erro de cota
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('exceeded your current quota'))) {
      return "O limite de uso gratuito da Inteligência Artificial foi atingido. Por favor, tente novamente mais tarde ou verifique seu plano no Google AI Studio.";
    }

    return "Erro ao conectar com a IA para gerar insights. Tente novamente mais tarde.";
  }
}
