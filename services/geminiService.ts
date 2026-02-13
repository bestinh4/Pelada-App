
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

export const balanceTeams = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Ensure we only have plain objects with primitive data to avoid circular structure issues
  const sanitizedPlayers = players.map(p => {
    // Explicitly reconstruct to remove any non-enumerable properties or hidden symbols from Firestore
    return {
      name: p.name ? String(p.name) : "Jogador",
      position: p.position ? String(p.position) : "N/A",
      skills: {
        attack: typeof p.skills?.attack === 'number' ? p.skills.attack : 50,
        defense: typeof p.skills?.defense === 'number' ? p.skills.defense : 50,
        stamina: typeof p.skills?.stamina === 'number' ? p.skills.stamina : 50
      }
    };
  });

  let playersJsonString: string;
  try {
    playersJsonString = JSON.stringify(sanitizedPlayers);
  } catch (e) {
    console.error("Critical: Failed to stringify player data for IA balancing", e);
    // Fallback if somehow circularity still exists
    playersJsonString = "[]";
  }

  const prompt = `Based on the following list of soccer players, divide them into two balanced teams (Team Red and Team Blue). 
  Consider their positions and skill levels to ensure a fair match.
  Return only a JSON object with two arrays: teamRed and teamBlue, containing the player names.
  
  Players: ${playersJsonString}`;

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
    // Simple shuffle fallback
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    return {
      teamRed: shuffled.slice(0, mid).map(p => p.name),
      teamBlue: shuffled.slice(mid).map(p => p.name)
    };
  }
};
