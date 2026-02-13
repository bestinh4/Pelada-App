
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

/**
 * Higieniza a lista de jogadores garantindo que apenas tipos primitivos
 * (string/number) sejam incluídos, evitando erros de estrutura circular
 * comuns em objetos vindos de SDKs como Firestore.
 */
const sanitizeForAI = (players: Player[]) => {
  return players.map(p => ({
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
  let playersJsonString: string;
  
  try {
    playersJsonString = JSON.stringify(cleanData);
  } catch (e) {
    console.error("Erro ao serializar dados para IA:", e);
    playersJsonString = "[]";
  }

  const promptText = `Aja como um treinador profissional. Divida estes jogadores em dois times (Vermelho e Azul) extremamente equilibrados. 
  Use as habilidades (ataque, defesa, resistencia) e as posições para garantir que não haja vantagem técnica de um lado.
  
  LISTA DE JOGADORES:
  ${playersJsonString}

  Retorne APENAS um JSON com dois arrays: "teamRed" e "teamBlue" contendo os nomes originais.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teamRed: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            teamBlue: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["teamRed", "teamBlue"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("IA retornou resposta vazia");
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Erro no balanceamento IA:", error);
    // Fallback seguro: embaralhar e dividir
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    return {
      teamRed: shuffled.slice(0, mid).map(p => p.name),
      teamBlue: shuffled.slice(mid).map(p => p.name)
    };
  }
};
