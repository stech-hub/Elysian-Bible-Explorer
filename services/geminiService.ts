
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDeepInsight = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a deep, historical, and spiritual insight about the biblical topic or book: "${topic}". Include historical context, cultural background, and why it's significant today. Also mention if there are any related "hidden stories" or excluded texts that shed more light on this.`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    }
  });
  return response.text;
};

export const getDailyDevotional = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, inspiring daily devotional for today. Include a focus verse, a brief reflection, and a short prayer. Make it encouraging and spiritually profound.`,
    config: {
      temperature: 0.8,
      maxOutputTokens: 800,
    }
  });
  return response.text;
};

export const getVerseCommentary = async (verse: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the deep theological meaning and historical context of the verse: "${verse}". Break down the original Greek/Hebrew meanings where relevant.`,
    config: {
      temperature: 0.4,
      maxOutputTokens: 1000,
    }
  });
  return response.text;
};

export const generateVerseAudio = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this biblical passage with a solemn, wise, and comforting tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const getBiblicalLocations = async (location: string, userCoords?: { latitude: number, longitude: number }) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Tell me about the biblical significance of ${location}. Show me its importance in the Bible and its modern-day location.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: userCoords ? {
          latLng: {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude
          }
        } : undefined
      }
    },
  });
  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};
