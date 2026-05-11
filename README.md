# Genkit Travel Workshop — Step 00: Starter

You are on branch **`step-00-starter`**. This is the empty starting point for the 2-hour workshop. Verify your setup here, then we move to module 1.

## Branch map

| Branch | After module |
|--------|--------------|
| **`step-00-starter`** ← you are here | (setup only) |
| `step-01-inference` | 1 — Zod structured output |
| `step-02-tools` | 2 — tool calling |
| `step-03-multimodal` | 3 — image input |
| `step-04-rag` / `main` | 4 — RAG (final state) |

`git checkout step-NN-<name>` to jump to any checkpoint.

## Setup checklist

```bash
# 1. Install deps (Genkit CLI is bundled as a devDependency)
npm install

# 2. API key
cp .env.example .env
# paste your GEMINI_API_KEY  — get one at https://aistudio.google.com/apikey

# 3. Start Dev UI
npm run dev
# → http://localhost:4000
```

## Verify it works

In the Dev UI, open `planTripFlow` and run with:

```json
{ "destination": "Lisbon" }
```

You should get a greeting string back, and a single `generate` span in **Traces**. If both work, you are ready for module 1.

## What is in `src/index.ts` right now

Three things, no more:

1. `genkit({...})` — the factory that wires the Google AI plugin and sets `gemini-flash-latest` as the default model.
2. `ai.defineFlow` — wraps a function so the Dev UI can call it.
3. `ai.generate` — the single inference primitive.

## Full step-by-step docs

Each module also has a long-form write-up under [`docs/`](./docs/):

1. [00 — Setup & Dev UI tour](docs/00-setup.md) ← read this now
2. [01 — Inference](docs/01-inference.md)
3. [02 — Tool calling](docs/02-tools.md)
4. [03 — Multimodal input](docs/03-multimodal.md)
5. [04 — RAG](docs/04-rag.md)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Dev UI does not open at `:4000` | Port in use — `lsof -i :4000`; or open the URL manually |
| `API key not valid` | `.env` not loaded — restart `npm run dev`; double-check `GEMINI_API_KEY` |
| `npx genkit: command not found` | `npm install` did not finish — re-run it |
