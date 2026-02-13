
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

export const balanceTeams = async (players: Player[]) => {
  // Always initialize with named parameter and process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sanitizedPlayers = players.map(p => {
    return {
      name: p.name ? String(p.name) : "Jogador",
      position: p.position ? String(p.position) : "N/A",
      // Include skills in the data sent to the model for better reasoning
      skills: p.skills || { attack: 50, defense: 50, stamina: 50 }
    };
  });

  let playersJsonString: string;
  try {
    playersJsonString = JSON.stringify(sanitizedPlayers);
  } catch (e) {
    console.error("Critical: Failed to stringify player data for IA balancing", e);
    playersJsonString = "[]";
  }

  // System instruction and prompt updated to request skill-based balancing
  const prompt = `Baseado na lista de jogadores abaixo, divida-os em dois times equilibrados (Time Vermelho e Time Azul). 
  Considere as POSIÇÕES e os níveis de SKILLS (attack, defense, stamina) para garantir que cada time tenha goleiros e jogadores de linha de forma justa e competitiva.
  Retorne apenas um objeto JSON com dois arrays: teamRed e teamBlue, contendo os nomes dos jogadores.
  
  Jogadores: ${playersJsonString}`;

  try {
    // Using gemini-3-pro-preview for complex reasoning task (team balancing)
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

    // Access .text property directly (not a method) as per SDK guidelines
    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro no balanceamento IA:", error);
    // Graceful fallback: shuffle and split
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    return {
      teamRed: shuffled.slice(0, mid).map(p => p.name),
      teamBlue: shuffled.slice(mid).map(p => p.name)
    };
  }
};