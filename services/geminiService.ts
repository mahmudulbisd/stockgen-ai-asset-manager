
import { GoogleGenAI, Type } from "@google/genai";
import { StockAssetVariation, GeneratorConfig } from "../types";

export const generateStockAssets = async (config: GeneratorConfig): Promise<StockAssetVariation[]> => {
  const { niche, temperature, quantity, assets } = config;

  // Server-side proxy call — GEMINI_API_KEY stays on the server
  const resp = await fetch('/api/generate-gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gemini-3-flash-preview', niche, temperature, quantity })
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || 'Gemini proxy request failed');
  }

  const text = await resp.text();
  if (!text) throw new Error('Empty response from Gemini proxy');

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
