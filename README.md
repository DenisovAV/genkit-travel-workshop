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

1. **`devLocalVectorstore`** plugin added to `genkit({ plugins: [...] })` with `googleAI.embedder('gemini-embedding-001')` as the embedder. Embeddings are persisted to **`__db_cityGuides.json`** in the repo root (gitignored). That file *is* the local vector store — delete it to reset.
2. Two refs exported: `cityGuidesIndexer` and `cityGuidesRetriever`, both pointing to the same `'cityGuides'` index.
3. **`indexCityGuides`** — a *separate* flow that reads every `*.md` file under `src/data/`, splits on blank lines, wraps chunks as `Document.fromText(chunk, { source: filename })`, and calls `ai.index({ indexer, documents })`. **Run it once before running `planTripFlow`**, otherwise the retriever returns nothing and the trip plan loses RAG context.
4. `planTripFlow` now calls **`ai.retrieve({ retriever: cityGuidesRetriever, query, options: { k: 4 } })`** before `ai.generate`, and passes the result as the **`docs:`** parameter of `ai.generate`. Genkit injects those docs into the prompt with the right framing automatically — you do not concatenate them by hand.
5. A new **`system:`** prompt tells the model to prefer the guides over its general knowledge and admit ignorance when a fact is not in them. Without this, the model often defaults to its training data.

## Try it now

```bash
npm run dev
```

**Step 1 — populate the index** (REQUIRED before step 2):

In the Dev UI, open `indexCityGuides`, run it with input `{}` (the schema is `z.void()`, the Dev UI accepts empty object). Expect `{ "count": 38 }` or so. If you skip this step, the retriever finds nothing and the trip plan reverts to step-03 behaviour.

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
