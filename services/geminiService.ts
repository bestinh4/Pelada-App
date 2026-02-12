
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

export const balanceTeams = async (players: Player[]) => {
  // Use gemini-3-pro-preview for complex reasoning tasks like balancing teams based on skills.
  // API key is obtained directly from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Based on the following list of soccer players, divide them into two balanced teams (Team Red and Team Blue). 
  Consider their positions and skill levels to ensure a fair match.
  Return only a JSON object with two arrays: teamRed and teamBlue, containing the player names.
  
  Players: ${JSON.stringify(players.map(p => ({ name: p.name, position: p.position, skills: p.skills })))}`;

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
              items: { type: Type.STRING },
              description: "Players in Team Red"
            },
            teamBlue: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Players in Team Blue"
            }
          },
          required: ["teamRed", "teamBlue"]
        }
      }
    });

    // Access text property directly from GenerateContentResponse as per guidelines.
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Balancing failed:", error);
    // Fallback: Simple shuffle if AI generation fails.
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    return {
      teamRed: shuffled.slice(0, mid).map(p => p.name),
      teamBlue: shuffled.slice(mid).map(p => p.name)
    };
  }
};
