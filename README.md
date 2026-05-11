# Genkit Travel Workshop — Step 04: RAG (final)

You are on branch **`step-04-rag`** — identical to `main`. Module 4 is done; this is the complete travel planner.

## Branch map

| Branch | After module |
|--------|--------------|
| `step-00-starter` | (setup only) |
| `step-01-inference` | 1 — Zod structured output |
| `step-02-tools` | 2 — tool calling |
| `step-03-multimodal` | 3 — image input |
| **`step-04-rag`** ← you are here | 4 — RAG (final state) |

## What changed since step 03

1. **`devLocalVectorstore`** plugin registered with `gemini-embedding-001` as the embedder. Stores embeddings in a local file (`__db_cityGuides.json`, gitignored).
2. **`indexCityGuides`** — a separate flow that chunks `src/data/*.md` by blank lines and writes them to the local index. Run it once per session.
3. `planTripFlow` now does `ai.retrieve` before `ai.generate` and passes the retrieved chunks as the `docs` parameter — Genkit injects them into the prompt with the right framing.
4. The system prompt tells the model to **prefer the guides** over its general knowledge and to admit ignorance when something is not in them.

## Try it now

```bash
npm run dev
```

**Step 1 — populate the index** (one time per session):

In the Dev UI, open `indexCityGuides`, run with input `null`. Expect `{ "count": 38 }` or so.

**Step 2 — run the full planner:**

```json
{ "destination": "Lisbon", "days": 3 }
```

In the trace you should now see:

```
planTripFlow
├─ retrieve (cityGuides) — 4 chunks with similarity scores
└─ generate
   ├─ tool: getWeather
   ├─ tool: searchFlights
   └─ final response
```

The plan will reference **specific facts from `lisbon.md`** that the model could not have known on its own (street numbers, voucher codes, tram numbers). That is RAG working.

**Step 3 — combine everything:**

Run with a `landmarkPhoto` *and* a destination. The model will identify the landmark from the image, retrieve city guides for the destination, call the tools for weather and flights, and return a typed `TripPlan`.

## Negative test

Ask about something not in the guides (e.g. *"What is the Wi-Fi password at Pensão Amor?"*) — the model should say it does not know, instead of inventing.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `embedding quota exceeded` | Swap to `googleAI.embedder('text-embedding-004')` in `src/index.ts` |
| Stale results after editing guides | Stop the server, delete `__db_cityGuides.json`, restart, re-run `indexCityGuides` |
| `Skipping <hash> since it is already present` on re-index | This is normal — `dev-local-vectorstore` deduplicates by content hash |
| JSON parse error under heavy load | Already mitigated by `format: 'json', constrained: true`; if still happening, try `gemini-pro-latest` |

## Full docs for this module

[docs/04-rag.md](docs/04-rag.md)

## What we did NOT cover (read later)

- Deployment (`startFlowServer`, Cloud Run, Firebase Functions)
- `.prompt` files for promptfile-based prompt management
- Evaluation framework (`ai.evaluate`)
- Multi-agent orchestration
- Production-grade RAG: smarter chunking, persistent vector DBs (LanceDB, Pinecone, Vertex AI Vector Search), re-ranking

Full docs: <https://genkit.dev/docs/js>

## Going back to the start

```bash
git checkout step-00-starter
```
