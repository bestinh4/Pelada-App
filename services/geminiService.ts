
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

export const balanceTeams = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Saneamento dos dados antes da serialização
  const sanitizedPlayers = players.map(p => ({
    name: String(p.name),
    position: String(p.position),
    skills: {
      attack: Number(p.skills?.attack || 50),
      defense: Number(p.skills?.defense || 50),
      stamina: Number(p.skills?.stamina || 50)
    }
  }));

  const prompt = `Based on the following list of soccer players, divide them into two balanced teams (Team Red and Team Blue). 
  Consider their positions and skill levels to ensure a fair match.
  Return only a JSON object with two arrays: teamRed and teamBlue, containing the player names.
  
  Players: ${JSON.stringify(sanitizedPlayers)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
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

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro no balanceamento IA:", error);
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    return {
      teamRed: shuffled.slice(0, mid).map(p => p.name),
      teamBlue: shuffled.slice(mid).map(p => p.name)
    };
  }
};
