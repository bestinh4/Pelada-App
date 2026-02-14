
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types.ts";

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
  const numTeams = Math.ceil(players.length / 7);

  const promptText = `Aja como um treinador profissional. 
  Divida os jogadores confirmados em ${numTeams} times de 7 jogadores cada (6 de linha e 1 goleiro).
  
  REGRAS CRÍTICAS:
  1. Cada time deve ter exatamente 1 Goleiro se disponível.
  2. NUNCA coloque um jogador de linha (Atacante, Meia, etc) como Goleiro. Se não houver goleiros suficientes, deixe o campo de goleiro vazio ou nulo no JSON.
  3. Preencha os times em sequência (Time 1, Time 2...). Se o último time não tiver 7 jogadores, deixe as vagas restantes vazias.
  4. Use as habilidades para equilibrar tecnicamente os times.

  JOGADORES DISPONÍVEIS:
  ${JSON.stringify(cleanData)}

  Retorne um JSON no formato:
  {
    "teams": [
      { "name": "Time 1", "field": ["Nome1", "Nome2", "Nome3", "Nome4", "Nome5", "Nome6"], "goalkeeper": "NomeGK" },
      ...
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
                  field: { type: Type.ARRAY, items: { type: Type.STRING } },
                  goalkeeper: { type: Type.STRING, nullable: true }
                },
                required: ["name", "field"]
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
    // Fallback básico em caso de erro da API
    const teams = [];
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numTeams; i++) {
      const chunk = shuffled.slice(i * 7, (i + 1) * 7);
      const gk = chunk.find(p => p.position === 'Goleiro');
      const field = chunk.filter(p => p.id !== gk?.id).map(p => p.name).slice(0, 6);
      teams.push({
        name: `Time ${i + 1}`,
        field: field,
        goalkeeper: gk?.name || null
      });
    }
    return { teams };
  }
};
