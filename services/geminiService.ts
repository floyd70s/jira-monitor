import { GoogleGenAI, Type } from "@google/genai";
import { JiraUser } from '../types';
import { GEMINI_MODEL, MOCK_DATA_PROMPT } from '../constants';

export const generateMockUsers = async (): Promise<JiraUser[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key no encontrada");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: MOCK_DATA_PROMPT,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              role: { type: Type.STRING },
              department: { type: Type.STRING },
              lastLogin: { type: Type.STRING, nullable: true },
            },
            required: ["id", "fullName", "email", "role", "department"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se generó contenido");
    }

    const users: JiraUser[] = JSON.parse(text);
    return users;
  } catch (error) {
    console.error("Error generating users:", error);
    throw error;
  }
};
