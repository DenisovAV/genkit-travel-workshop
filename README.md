# Genkit Travel Workshop

Build a Travel Planner with [Firebase Genkit](https://genkit.dev) in 2 hours.
One growing flow — `planTripFlow` — picks up a new Genkit capability every module:

| Module | Capability | Added to `planTripFlow` |
|-------:|------------|-------------------------|
| 0 | Setup | Hello-flow + Dev UI tour |
| 1 | Inference | `ai.generate` with a Zod output schema |
| 2 | Tool calling | `getWeather`, `searchFlights` (mocked) |
| 3 | Multimodal | Photo of a landmark → highlight |
| 4 | RAG | Index local Markdown guides, augment with `docs` |

Total: ~120 min, including ~10 min Q&A.

## How to use this repo during the workshop

`main` holds the **finished** version. To follow along, start from the empty starter and switch branches as we go:

```bash
git checkout step-00-starter   # before we begin
git checkout step-01-inference # after module 1
git checkout step-02-tools     # after module 2
git checkout step-03-multimodal # after module 3
git checkout step-04-rag       # = main (final)
```

Every branch carries a step-specific `README.md` that tells you exactly what to do, paste, and run for that module. If you fall behind at any point, just `git checkout step-NN-<name>` and you are caught up.

## Prerequisites

- **Node.js 20+**
- A **free** Gemini API key — get one at <https://aistudio.google.com/apikey>
- An editor with TypeScript support

## Setup

```bash
# 1. Project deps (Genkit CLI is bundled as a devDependency)
npm install

# 2. API key
cp .env.example .env
# then paste your GEMINI_API_KEY into .env

# 3. Start the dev server + Dev UI
npm run dev
```

> Optional: `npm install -g genkit-cli` to get the `genkit` command available everywhere — handy outside this project.

The Developer UI opens at **<http://localhost:4000>**. The flow auto-reloads on file changes (`tsx --watch`).

## Walkthrough

Each module has a self-contained doc in [`docs/`](./docs/). Follow them in order:

1. [00 — Setup & Dev UI tour](docs/00-setup.md)
2. [01 — Inference & structured output](docs/01-inference.md)
3. [02 — Tool calling](docs/02-tools.md)
4. [03 — Multimodal input](docs/03-multimodal.md)
5. [04 — RAG with local vector store](docs/04-rag.md)

If you fall behind, every module doc ends with the **full file state** at that checkpoint — copy it into `src/index.ts` and you are back on track.

## Repo layout

```
.
├── README.md                  ← you are here
├── package.json               ← all Genkit deps on "latest"
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts               ← the only source file we touch
│   └── data/
│       ├── lisbon.md          ← guides for RAG (module 4)
│       ├── barcelona.md
│       └── sagrada-familia.jpg← landmark photo for multimodal (module 3)
└── docs/                      ← step-by-step module instructions
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `genkit: command not found` | `npm install -g genkit-cli`, then restart your shell |
| Dev UI does not open at `:4000` | Port already in use — `lsof -i :4000`; or open it manually in the browser |
| `GoogleGenerativeAIFetchError: API key not valid` | `.env` not loaded — restart `npm run dev`; verify `GEMINI_API_KEY` value |
| Module 4: `embedding quota exceeded` | Swap the embedder to `googleAI.embedder('text-embedding-004')` |
| Module 4: stale index after editing guides | Stop the server, `rm -rf .genkit`, restart and re-run `indexCityGuides` |
| Tool loop never terminates | Already guarded by `maxTurns: 5`; if you remove it, expect 10+ tool calls in pathological prompts |

## What we are NOT covering (links to read later)

- Deployment (`startFlowServer`, Cloud Run, Firebase Functions)
- `.prompt` files for promptfile-based prompt management
- Evaluation framework (`ai.evaluate`)
- Multi-agent orchestration

Full docs: <https://genkit.dev/docs/js>
