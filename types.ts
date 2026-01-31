
export interface StockAssetVariation {
  id: string;
  variationIndex: number;
  title?: string;
  description?: string;
  keywords?: string;
  imagePrompt?: string;
}

export interface GeneratorConfig {
  niche: string;
  temperature: number;
  quantity: number;
  assets: {
    title: boolean;
    description: boolean;
    keywords: boolean;
    prompt: boolean;
  };
}
