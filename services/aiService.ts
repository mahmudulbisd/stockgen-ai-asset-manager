
import { StockAssetVariation, GeneratorConfig } from "../types";

const getApiKey = (): string => {
  try {
    return (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
  } catch (e) {
    return '';
  }
};

export const generateStockAssets = async (config: GeneratorConfig): Promise<StockAssetVariation[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please set API_KEY in environment variables.");
  }

  const { niche, temperature, quantity, assets } = config;

  // System instructions for Stock SEO Expert
  const systemPrompt = `You are a Stock Photography SEO Expert. Generate high-quality titles, descriptions, exactly 40 keywords, and highly detailed AI image prompts (cinema style, 8k, detailed). 
  You MUST return the response in a valid JSON array format. Each object in the array should have: 
  "variationIndex" (number), "title" (string), "description" (string), "keywords" (comma-separated string), and "imagePrompt" (string).`;

  const userPrompt = `Generate ${quantity} unique variations for the niche: "${niche}". Diversity is key.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // OpenAI with json_object format often wraps the array in a root key
    let parsedData = JSON.parse(content);
    const variations = Array.isArray(parsedData) ? parsedData : (parsedData.variations || Object.values(parsedData)[0]);

    if (!Array.isArray(variations)) {
      throw new Error("Unexpected JSON structure from AI");
    }

    return variations.map((item: any, idx: number) => ({
      id: crypto.randomUUID(),
      variationIndex: item.variationIndex || (idx + 1),
      title: assets.title ? item.title : undefined,
      description: assets.description ? item.description : undefined,
      keywords: assets.keywords ? item.keywords : undefined,
      imagePrompt: assets.prompt ? item.imagePrompt : undefined,
    }));
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    throw err;
  }
};
