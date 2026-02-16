
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

export const balanceTeams = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Envia apenas o essencial para a IA economizar tokens e ser precisa
  const playersData = players.map(p => ({
    id: p.id,
    n: p.name,
    p: p.position === 'Goleiro' ? 'GK' : 'Linha',
    sk: (p.skills?.attack || 50) + (p.skills?.defense || 50)
  }));

  const numTeams = Math.ceil(players.length / 7);

  const prompt = `Aja como técnico de futebol. Divida estes jogadores em ${numTeams} times equilibrados.
  Cada time deve ter 7 jogadores (máximo 1 GK por time).
  
  REGRAS:
  1. Use APENAS estes IDs: ${playersData.map(p => p.id).join(', ')}.
  2. Retorne APENAS um JSON no formato: {"teams": [{"name": "Time A", "fieldIds": ["id1", "..."], "goalkeeperId": "idGK"}]}.

  JOGADORES:
  ${JSON.stringify(playersData)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Erro na IA:", error);
    // Fallback robusto
    const teams = [];
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numTeams; i++) {
      const chunk = shuffled.slice(i * 7, (i + 1) * 7);
      const gk = chunk.find(p => p.position === 'Goleiro');
      const field = chunk.filter(p => p.id !== gk?.id).map(p => p.id);
      teams.push({
        name: `Equipe ${String.fromCharCode(65 + i)}`,
        fieldIds: field,
        goalkeeperId: gk?.id || null
      });
    }
    return { teams };
  }
};
