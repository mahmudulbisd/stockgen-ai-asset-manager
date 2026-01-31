
import { GoogleGenAI, Type } from "@google/genai";
import { StockAssetVariation, GeneratorConfig } from "../types";

// Safer API key extraction for various deployment environments
const getApiKey = (): string => {
  try {
    // Priority: window.process > global process (Vite/Webpack) > Empty string
    const key = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
    return key;
  } catch (e) {
    return '';
  }
};

export const generateStockAssets = async (config: GeneratorConfig): Promise<StockAssetVariation[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure API_KEY is set in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { niche, temperature, quantity, assets } = config;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${quantity} unique variations of stock photo metadata for the niche: "${niche}". 
    Focus on creating diverse concepts within this theme.`,
    config: {
      temperature: temperature,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            variationIndex: { type: Type.INTEGER },
            title: { type: Type.STRING, description: "SEO Title (Agency optimized)" },
            description: { type: Type.STRING, description: "Detailed description (50+ words)" },
            keywords: { type: Type.STRING, description: "Exactly 40 tags, comma-separated" },
            imagePrompt: { type: Type.STRING, description: "High-quality AI generation prompt" },
          },
          required: ["variationIndex"],
        },
      },
      systemInstruction: "You are a Stock Photography SEO Expert. Generate high-quality titles, descriptions, exactly 40 keywords, and highly detailed AI image prompts (cinema style, 8k, detailed). Ensure output is valid JSON.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini API");
  
  const parsed: any[] = JSON.parse(text);
  
  return parsed.map((item, idx) => ({
    id: crypto.randomUUID(),
    variationIndex: idx + 1,
    title: assets.title ? item.title : undefined,
    description: assets.description ? item.description : undefined,
    keywords: assets.keywords ? item.keywords : undefined,
    imagePrompt: assets.prompt ? item.imagePrompt : undefined,
  }));
};
