
import { StockAssetVariation, GeneratorConfig } from "../types";

// AI থেকে আসা ডাটা পার্স করার পর এই অংশটি যোগ করুন
let variations = Array.isArray(parsedData) 
  ? parsedData 
  : (parsedData.variations || parsedData.data || Object.values(parsedData)[0]);

if (!Array.isArray(variations)) {
  throw new Error("Unexpected JSON structure: AI did not return a valid list.");
}

  // System instructions for Stock SEO Expert
  const systemPrompt = `You are a Stock Photography SEO Expert. 
Generate high-quality titles, descriptions, exactly 40 keywords, and highly detailed AI image prompts. 
You MUST return a JSON object with a key named "variations" containing an array of objects.
Each object in the array MUST have these keys: "variationIndex", "title", "description", "keywords", and "imagePrompt".`;

  const userPrompt = `Generate ${quantity} unique variations for the niche: "${niche}". Diversity is key.`;

  try {
    // Use server-side proxy so the API key stays secret
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      // try to surface provider error message when possible
      const errText = await response.text().catch(() => '');
      let errMsg = 'OpenAI API request failed';
      try {
        const json = JSON.parse(errText);
        errMsg = json.error?.message || JSON.stringify(json);
      } catch {
        if (errText) errMsg = errText.slice(0, 1000);
      }
      throw new Error(errMsg);
    }

    const raw = await response.text();

    const truncate = (s: string, n = 800) => (s && s.length > n ? s.slice(0, n) + '…' : s);

    // Normalize several possible response shapes from the API/proxy
    let contentCandidate: any = undefined;
    try {
      // 1) Full OpenAI envelope: { choices: [{ message: { content: ... } }] }
      const envelope = JSON.parse(raw);
      contentCandidate = envelope?.choices?.[0]?.message?.content ?? envelope;
    } catch {
      // not a full JSON envelope — treat raw as the candidate (might be JSON string or plain text)
      contentCandidate = raw;
    }

    let parsedData: any;
    if (typeof contentCandidate === 'object') {
      parsedData = contentCandidate;
    } else if (typeof contentCandidate === 'string') {
      // try direct parse
      try {
        parsedData = JSON.parse(contentCandidate);
      } catch {
        // try to extract a JSON substring (handles assistant adding exposition)
        const m = contentCandidate.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m);
        if (m) {
          try {
            parsedData = JSON.parse(m[0]);
          } catch (e) {
            throw new Error(`Failed to parse JSON substring from model output — preview: ${truncate(contentCandidate)}`);
          }
        } else {
          throw new Error(`Model returned non-JSON content — preview: ${truncate(contentCandidate)}`);
        }
      }
    } else {
      throw new Error(`Unexpected content type from model: ${typeof contentCandidate}`);
    }

    // locate the array (support common wrapper shapes)
    const variations = Array.isArray(parsedData)
      ? parsedData
      : parsedData?.variations || parsedData?.data || parsedData?.output || Object.values(parsedData)[0];

    if (!Array.isArray(variations)) {
      throw new Error(
        `Unexpected JSON structure from AI — couldn't locate array. Preview: ${truncate(JSON.stringify(parsedData))}. Tip: enforce a strict JSON-only assistant response or use a schema.`
      );
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
