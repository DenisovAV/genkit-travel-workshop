# Module 4 — RAG with a Local Vector Store

**Time:** ~30 min
**Goal:** give the model *local* knowledge it does not have — facts from our own city guides — and watch it cite them.

## 4.1 Why RAG?

The model knows a lot about Lisbon. It does not know:

- Which neighbourhood your team likes for dinner.
- Internal policy documents.
- Anything that did not exist before its training cutoff.

RAG (Retrieval-Augmented Generation) is the simplest fix:

```
question → embed → vector search → top-K chunks → feed to LLM as context
```

Genkit ships everything we need locally: an embedder (`gemini-embedding-001`), a dev-only on-disk vector store (`@genkit-ai/dev-local-vectorstore`), and a `docs` parameter on `ai.generate` that handles prompt augmentation.

## 4.2 Add the vector store plugin

```typescript
import {
  devLocalIndexerRef,
  devLocalRetrieverRef,
  devLocalVectorstore,
} from '@genkit-ai/dev-local-vectorstore';

export const ai = genkit({
  plugins: [
    googleAI(),
    devLocalVectorstore([
      {
        indexName: 'cityGuides',
        embedder: googleAI.embedder('gemini-embedding-001'),
      },
    ]),
  ],
  model: googleAI.model('gemini-3.1-flash-image-preview'),
});

export const cityGuidesIndexer = devLocalIndexerRef('cityGuides');
export const cityGuidesRetriever = devLocalRetrieverRef('cityGuides');
```

The index lives in `.genkit/` — already in `.gitignore`. Wiping that folder resets everything.

> **Quota note:** if you hit `embedding quota exceeded`, swap to
> `googleAI.embedder('text-embedding-004')`. It is older but more generous on free tier.

## 4.3 An indexing flow

Add a second flow next to `planTripFlow`. Run it once at the start of module 4.

```typescript
import { Document } from 'genkit/retriever';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const indexCityGuides = ai.defineFlow(
  {
    name: 'indexCityGuides',
    inputSchema: z.void(),
    outputSchema: z.object({ count: z.number() }),
  },
  async () => {
    const dir = 'src/data';
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));

    const docs: Document[] = [];
    for (const f of files) {
      const text = await readFile(join(dir, f), 'utf8');
      const chunks = text.split(/\n\n+/).filter((c) => c.trim().length > 0);
      for (const chunk of chunks) {
        docs.push(Document.fromText(chunk, { source: f }));
      }
    }

    await ai.index({ indexer: cityGuidesIndexer, documents: docs });
    return { count: docs.length };
  },
);
```

Notes:

- Splitting by blank line is the dumbest chunker that still works for these short guides. Real apps use `llm-chunk` or similar.
- `Document.fromText(chunk, metadata)` keeps the source filename so we could cite it later.

Run `indexCityGuides` in the Dev UI with input `null`. Expect `{ "count": 15..20 }`. Open the trace — you will see one `embed` call per chunk.

## 4.4 Retrieve, then augment

Update `planTripFlow`. Before `ai.generate`, retrieve the top-4 chunks for the destination:

```typescript
const retrievedDocs = await ai.retrieve({
  retriever: cityGuidesRetriever,
  query: `Things to do, food, and local tips for ${destination}`,
  options: { k: 4 },
});
```

Then pass them to `generate`:

```typescript
const { output } = await ai.generate({
  prompt: promptParts,
  tools: [getWeather, searchFlights],
  docs: retrievedDocs,
  system:
    'Use the provided city guides as your primary source. ' +
    'Prefer specific facts from the guides over general knowledge. ' +
    'If something is not in the guides, say so instead of inventing.',
  output: { schema: TripPlanSchema },
  maxTurns: 5,
});
```

The `docs` parameter is the whole point — Genkit injects the retrieved chunks into the prompt with the right framing automatically.

## 4.5 Demo: before vs after

Run with `{"destination":"Lisbon","days":3}`.

The trace now shows:

```
planTripFlow
├─ retrieve (cityGuides)        ← NEW
│   └─ 4 documents, with similarity scores
└─ generate
    ├─ tool: getWeather
    └─ tool: searchFlights
```

Click on the `retrieve` span — you see which chunks won, with similarity scores. This is the "aha" moment: vector search is visible, not a black box.

Compare two runs:

| Question | Without RAG | With RAG |
|----------|-------------|----------|
| "Where do locals get pastéis de nata?" | Generic answer naming famous tourist spots | Names the specific bakery from `lisbon.md` |
| "Tell me about Time Out Market" | Vague description | Picks up the exact phrasing and tips from the guide |

## 4.6 Negative test (worth doing live)

Ask about something **not** in the guides — `"What is the Wi-Fi password at Pensão Amor?"`. The system prompt told the model to admit ignorance. It should say it does not know, instead of inventing a plausible-looking string. That refusal is RAG doing its job.

## 4.7 What "production" RAG adds on top

We did not cover, but you will want eventually:

- A smarter chunker (sentence- or token-aware, with overlap).
- A persistent vector DB (LanceDB, Pinecone, Vertex AI Vector Search — all have Genkit plugins).
- Re-ranking the top-K before sending to the model.
- A separate "retrieve-then-rewrite-the-query" step for fuzzy questions.

`@genkit-ai/dev-local-vectorstore` is on-disk only and labelled "dev" for a reason — do not ship it.

---

**Checkpoint — `src/index.ts` is now the final m4 version (see `src/index.ts` in the repo).**

→ Back to [README](../README.md) for wrap-up and what to read next.
