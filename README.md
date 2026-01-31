# StockGen — AI Asset Manager

A small Vite + React demo that generates SEO-ready stock-photo metadata and image prompts using Google Gemini (via `@google/genai`). Designed for iterative asset generation and export.

View in AI Studio: https://ai.studio/apps/drive/1rZPtsyACkA9UZ5Kzi29yc-YA_N3Zm0_X

---

## 🚀 Quick start

Prerequisites:
- Node.js 18+ (recommended)
- npm (or your preferred package manager)

1. Install dependencies

```bash
npm install
```

2. Add your API key (local dev)

- Create a file named `.env.local` at the project root and add:

```env
# WARNING: do NOT commit this file
API_KEY=your_google_genai_api_key_here
```

> Important: the repository's runtime reads `API_KEY`. For production, keep keys server-side or use a secret manager — do NOT expose keys in client bundles.

3. Run development server (Windows PowerShell example)

```powershell
# PowerShell (same session)
$env:API_KEY = "your_key_here"
npm run dev
```

Or simply:

```bash
npm run dev
```

4. Build / Preview

```bash
npm run build
npm run preview
```

---

## 🧭 What this project contains

- `services/geminiService.ts` — Gemini integration & generator function (`generateStockAssets`).
- `components/CopyBlock.tsx` — small UI helper for copying output
- `types.ts` — shared TS types for assets/config
- `App.tsx` — main UI
- `index.tsx`, `vite.config.ts` — app bootstrap

---

## ✨ Features

- Generate multiple SEO-optimized titles, descriptions, 40 keywords, and detailed image prompts
- Configurable temperature/quantity
- JSON-schema-backed parsing to ensure structured output

---

## 🔧 Usage / examples

Programmatic example (already used by the UI):

```ts
import { generateStockAssets } from './services/geminiService';

const assets = await generateStockAssets({
  niche: 'outdoor fitness',
  temperature: 0.8,
  quantity: 6,
  assets: { title: true, description: true, keywords: true, prompt: true }
});
```

Expected: an array of objects with `title`, `description`, `keywords` (exactly 40 tags), and `imagePrompt`.

---

## ⚠️ Environment & security notes

- The code currently expects an environment variable named `API_KEY`. If you intend to expose a key to client-side code, use `VITE_` prefix and `import.meta.env.VITE_...` — but avoid exposing production keys in the browser.
- Recommended: run the GenAI call on a serverless function or backend and keep the key secret.

---

## 🐞 Troubleshooting

Problem: "API Key is missing. Please ensure API_KEY is set in your environment variables."
- Ensure `.env.local` contains `API_KEY=...` or set the env var in your shell before `npm run dev`.
- Confirm the key has GenAI access and is not rate-limited.

Problem: invalid JSON from the model
- Check `services/geminiService.ts` systemInstruction and responseSchema; increase temperature conservatively or reduce `quantity`.

---

## 📁 Project structure (key files)

| Path | Purpose |
|---|---|
| `services/geminiService.ts` | Gemini generation + JSON parsing |
| `components/CopyBlock.tsx` | UI: copy-to-clipboard for generated text |
| `types.ts` | Type definitions for generated assets |
| `App.tsx` | Main app UI and demo flows |

---

## ✅ Development tips

- To switch models or tweak responses, edit `model` and `systemInstruction` in `services/geminiService.ts`.
- Prefer a backend proxy for the API call; I can open a PR with an example serverless route.

---

## Contributing

Contributions welcome — open an issue or submit a PR. If you plan to publish, add a `LICENSE` file and rotate any committed test keys.

---

## License

No license specified. Add a `LICENSE` file (MIT recommended) if you want to open-source this repo.

---

If you'd like, I can:
1. Create a `.env.example` and `.gitignore` entry ✅
2. Open a PR that moves the GenAI call to a serverless endpoint and exposes a safe client API ✅

Would you like me to make either of those changes now?