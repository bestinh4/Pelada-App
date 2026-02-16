
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

const sanitizeForAI = (players: Player[]) => {
  return players.map(p => ({
    id: p.id,
    nome: String(p.name || "Jogador"),
    posicao: String(p.position || "Linha"),
    ataque: Number(p.skills?.attack || 50),
    defesa: Number(p.skills?.defense || 50),
    resistencia: Number(p.skills?.stamina || 50)
  }));
};

export const balanceTeams = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const cleanData = sanitizeForAI(players);
  const numTeams = Math.ceil(players.length / 7);

  const promptText = `Aja como um treinador profissional de futebol. 
  Divida os jogadores confirmados em ${numTeams} times equilibrados.
  Cada time deve ter 7 jogadores (6 de linha e 1 goleiro).
  
  REGRAS CRÍTICAS:
  1. Use EXCLUSIVAMENTE os IDs fornecidos.
  2. Distribua os goleiros (posicao: "Goleiro") de forma que cada time tenha um, se possível.
  3. Mantenha o equilíbrio técnico baseado nos atributos de ataque e defesa.
  4. Retorne apenas o JSON.

  JOGADORES DISPONÍVEIS:
  ${JSON.stringify(cleanData)}

  Retorne um JSON no formato:
  {
    "teams": [
      { 
        "name": "Time 1", 
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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teams: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  fieldIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  goalkeeperId: { type: Type.STRING, nullable: true }
                },
                required: ["name", "fieldIds"]
              }
            }
          },
          required: ["teams"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("IA retornou resposta vazia");
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Erro no balanceamento IA:", error);
    // Fallback manual robusto baseado em IDs
    const teams = [];
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numTeams; i++) {
      const chunk = shuffled.slice(i * 7, (i + 1) * 7);
      const gk = chunk.find(p => p.position === 'Goleiro');
      const field = chunk.filter(p => p.id !== gk?.id).map(p => p.id).slice(0, 6);
      teams.push({
        name: `Time ${i + 1}`,
        fieldIds: field,
        goalkeeperId: gk?.id || null
      });
    }
    return { teams };
  }
};
