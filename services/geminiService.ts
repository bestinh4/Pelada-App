
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

const sanitizeForAI = (players: Player[]) => {
  return players.map(p => ({
    id: p.id,
    nome: String(p.name || "Jogador"),
    posicao: String(p.position || "Linha"),
    skills: {
      ataque: Number(p.skills?.attack || 50),
      defesa: Number(p.skills?.defense || 50)
    }
  }));
};

export const balanceTeams = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanData = sanitizeForAI(players);
  const numTeams = Math.ceil(players.length / 7);

  const promptText = `Aja como um treinador de elite. 
  Divida estes jogadores em ${numTeams} times equilibrados de 7 pessoas.
  
  REGRAS OBRIGATÓRIAS:
  1. Use APENAS os IDs que eu te enviei: ${cleanData.map(p => p.id).join(', ')}.
  2. Não crie IDs novos. Não altere os nomes.
  3. Cada time deve ter 1 Goleiro (se disponível) e o restante Linha.
  4. Retorne APENAS o JSON puro.

  DADOS DOS ATLETAS:
  ${JSON.stringify(cleanData)}

  FORMATO DO RETORNO:
  {
    "teams": [
      { 
        "name": "Time A", 
        "fieldIds": ["id1", "id2", "id3", "id4", "id5", "id6"], 
        "goalkeeperId": "idGK" 
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Erro IA:", error);
    // Fallback manual para não travar o app
    const teams = [];
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numTeams; i++) {
      const chunk = shuffled.slice(i * 7, (i + 1) * 7);
      const gk = chunk.find(p => p.position === 'Goleiro');
      const field = chunk.filter(p => p.id !== gk?.id).map(p => p.id);
      teams.push({
        name: `Time ${String.fromCharCode(65 + i)}`,
        fieldIds: field,
        goalkeeperId: gk?.id || null
      });
    }
    return { teams };
  }
};
