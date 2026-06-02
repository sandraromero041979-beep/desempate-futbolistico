import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazily initialize Gemini Client to avoid startup failures on deployment when a key isn't provided yet
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada. Por favor, añádela en la sección Secrets de Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Search and analyze soccer matches, scores, key events, and lineups
app.post("/api/analyze-soccer", async (req, res) => {
  try {
    const { queryTeamOrLeague, queryDetail } = req.body;

    if (!queryTeamOrLeague) {
      return res.status(400).json({ error: "El nombre de la liga, equipo o competición es requerido." });
    }

    const ai = getAiClient();
    const detail = queryDetail?.trim() || "Partidos de la última semana";

    const systemInstruction = 
      "Eres un experto analista táctico de fútbol y periodista deportivo de nivel super profesional. Tu objetivo es buscar, compilar y sintetizar resultados reales de fútbol, alineaciones tácticas oficiales, convocatorias, goleadores, incidencias y estadísticas detalladas para la liga o equipo solicitado. Utiliza rigurosamente Google Search para consultar y cruzar información de múltiples fuentes oficiales (LaLiga, Premier League, UEFA, RFEF), prensa especializada (Marca, AS, Mundo Deportivo, L'Equipe, Sky Sports), portales locales específicos (El Progreso para CD Lugo, etc.) y bases de datos analíticas (WhoScored, SofaScore, Transfermarkt, Besoccer, BeSoccer Pro). No inventes datos falsos. Si un partido no se ha jugado aún, pon el status como 'Por jugar' con goles null.";

    const prompt = `Busca información en las fuentes más prestigiosas y actualizadas sobre la competición o equipo: "${queryTeamOrLeague}" centrándote en: "${detail}".
Debes encontrar los partidos jugados recientemente (o por jugar esta semana), sus resultados, goleadores, incidencias relevantes, datos de posesión de balón y remates, además de las alineaciones titulares de ambos conjuntos (nombre de jugador, dorsal, posición POR/DEF/MC/DEL), calificación real o estimada de rendimiento (1.0 a 10.0), y coordenadas tácticas para colocarlos en un campo orientado verticalmente de abajo hacia arriba.
También debes obtener los jugadores convocados en el banquillo de suplentes (substitutes) para cada equipo, indicando su nombre, número/dorsal, posición (POR/DEF/MC/DEL) y calificación de rendimiento si jugaron o la estimada relevante.

Reglas de coordenadas (x, y) de cada jugador (de 5 a 95):
- POR (Portero): y = 10, x = 50.
- DEF (Defensores): y de 25 a 42. Para 4 defensas: lateral izquierdo (x=18, y=30), central izquierdo (x=40, y=28), central derecho (x=60, y=28), lateral derecho (x=82, y=30).
- MC (Mediocampistas): y de 50 a 68. Para 3 mediocampistas: izquierdo (x=30, y=55), pivote (x=50, y=50), derecho (x=70, y=55).
- DEL (Delanteros): y de 75 a 90. Para 3 delanteros: extremo izquierdo (x=18, y=80), delantero centro (x=50, y=85), extremo derecho (x=82, y=80).

Finalmente, enumera detalladamente todas las fuentes consultadas (sitios oficiales de ligas, prensa nacional o local, portales de estadísticas, etc.) en el array de 'sources' con sus respectivos detalles sobre qué dato se extrajo de cada portal.

Formatea la respuesta estrictamente según el esquema JSON definido.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        competition: { type: Type.STRING, description: "Nombre formal de la liga o equipo consultado" },
        period: { type: Type.STRING, description: "Periodo o jornada evaluada" },
        matches: {
          type: Type.ARRAY,
          description: "Lista de partidos encontrados, mínimo 1 y máximo 8 partidos relevantes recientes",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "ID único autogenerado, ej: match_1" },
              homeTeam: { type: Type.STRING },
              awayTeam: { type: Type.STRING },
              homeScore: { type: Type.INTEGER, description: "Goles local (null si no se ha jugado)" },
              awayScore: { type: Type.INTEGER, description: "Goles visitante (null si no se ha jugado)" },
              status: { type: Type.STRING, description: "'Finalizado', 'Por jugar', o 'En juego'" },
              date: { type: Type.STRING, description: "Fecha del partido, ej: 31 de Mayo, 2026" },
              stadium: { type: Type.STRING },
              summary: { type: Type.STRING, description: "Crónica ejecutiva de 2 frases describiendo la narrativa táctica" },
              keyEvents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    minute: { type: Type.INTEGER },
                    type: { type: Type.STRING, description: "Tipo de evento: 'Gol', 'Tarjeta Roja', 'Tarjeta Amarilla', 'Lesión', 'Penalti' o 'Cambio'" },
                    team: { type: Type.STRING, description: "Nombre del equipo" },
                    player: { type: Type.STRING, description: "Nombre del jugador" },
                    detail: { type: Type.STRING, description: "Descripción opcional, ej 'Asistencia: Pedri'" }
                  },
                  required: ["minute", "type", "team", "player"]
                }
              },
              stats: {
                type: Type.OBJECT,
                properties: {
                  possessionHome: { type: Type.INTEGER, description: "Porcentaje de posesión local, ej: 54" },
                  possessionAway: { type: Type.INTEGER, description: "Porcentaje de posesión visitante, ej: 46" },
                  shotsHome: { type: Type.INTEGER },
                  shotsAway: { type: Type.INTEGER },
                  foulsHome: { type: Type.INTEGER },
                  foulsAway: { type: Type.INTEGER }
                },
                required: ["possessionHome", "possessionAway"]
              },
              homeLineup: {
                type: Type.OBJECT,
                properties: {
                  formation: { type: Type.STRING, description: "Formación, ej: '4-3-3'" },
                  players: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        number: { type: Type.INTEGER },
                        position: { type: Type.STRING, description: "'POR', 'DEF', 'MC', o 'DEL'" },
                        coordinates: {
                          type: Type.OBJECT,
                          properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                          },
                          required: ["x", "y"]
                        },
                        rating: { type: Type.NUMBER }
                      },
                      required: ["name", "position", "coordinates"]
                    }
                  },
                  substitutes: {
                    type: Type.ARRAY,
                    description: "Lista opcional de jugadores de reserva/suplentes en el banquillo",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        number: { type: Type.INTEGER },
                        position: { type: Type.STRING, description: "'POR', 'DEF', 'MC', o 'DEL'" },
                        rating: { type: Type.NUMBER }
                      },
                      required: ["name", "position"]
                    }
                  }
                },
                required: ["formation", "players"]
              },
              awayLineup: {
                type: Type.OBJECT,
                properties: {
                  formation: { type: Type.STRING, description: "Formación, ej: '4-4-2'" },
                  players: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        number: { type: Type.INTEGER },
                        position: { type: Type.STRING, description: "'POR', 'DEF', 'MC', o 'DEL'" },
                        coordinates: {
                          type: Type.OBJECT,
                          properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                          },
                          required: ["x", "y"]
                        },
                        rating: { type: Type.NUMBER }
                      },
                      required: ["name", "position", "coordinates"]
                    }
                  },
                  substitutes: {
                    type: Type.ARRAY,
                    description: "Lista opcional de jugadores de reserva/suplentes en el banquillo",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        number: { type: Type.INTEGER },
                        position: { type: Type.STRING, description: "'POR', 'DEF', 'MC', o 'DEL'" },
                        rating: { type: Type.NUMBER }
                      },
                      required: ["name", "position"]
                    }
                  }
                },
                required: ["formation", "players"]
              }
            },
            required: ["id", "homeTeam", "awayTeam", "status", "date", "summary", "homeLineup", "awayLineup"]
          }
        },
        sources: {
          type: Type.ARRAY,
          description: "Fuentes de información verificadas recopiladas para realizar el análisis táctico",
          items: {
            type: Type.OBJECT,
            properties: {
              url: { type: Type.STRING, description: "URL de la fuente consultada (ej: Marca, AS, Whoscored, SofaScore, CD Lugo, etc.)" },
              name: { type: Type.STRING, description: "Nombre legible del portal de información" },
              category: { type: Type.STRING, description: "Tipo de fuente: 'Portal Oficial', 'Prensa Deportiva', 'Estadísticas e Inteligencia', 'Base de Datos' o 'Prensa Local'" },
              snippet: { type: Type.STRING, description: "Breve fragmento de 1 frase del titular o dato extraído de esta fuente" },
              credibility: { type: Type.STRING, description: "Calificación del nivel de confianza: 'Oficial', 'Verificado' o 'Alta Precisión'" }
            },
            required: ["url", "name", "category"]
          }
        }
      },
      required: ["competition", "period", "matches"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Extract search source links if available to present them transparently as grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
      const links = groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: any) => typeof uri === "string");
      
      if (links.length > 0) {
        const existingUrls = new Set<string>();
        const currentSources = parsedData.sources || [];
        
        currentSources.forEach((s: any) => {
          if (typeof s === "object" && s && s.url) {
            existingUrls.add(s.url);
          } else if (typeof s === "string") {
            existingUrls.add(s);
          }
        });

        const newSources = [...currentSources];
        links.forEach((link: string) => {
          if (!existingUrls.has(link)) {
            existingUrls.add(link);
            let name = "Enlace Web";
            try {
              const host = new URL(link).hostname.replace("www.", "");
              name = host.charAt(0).toUpperCase() + host.slice(1);
            } catch {}
            
            newSources.push({
              url: link,
              name: name,
              category: "Estadísticas e Inteligencia",
              snippet: "Referencia directa obtenida a través de la compilación de datos de Google Search.",
              credibility: "Verificado"
            });
          }
        });
        parsedData.sources = newSources;
      }
    }

    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error retrieving soccer data with Google Search Grounding:", error);
    return res.status(500).json({
      error: error.message || "Error al obtener los datos de la jornada de fútbol con Google Search Grounding."
    });
  }
});

// Setup development and production asset delivery
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
