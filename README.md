# Genkit Travel Workshop — Step 03: Multimodal

You are on branch **`step-03-multimodal`**. Module 3 is done — the flow now accepts a photo of a landmark and uses it as the first highlight.

## Branch map

| Branch | After module |
|--------|--------------|
| `step-00-starter` | (setup only) |
| `step-01-inference` | 1 — Zod structured output |
| `step-02-tools` | 2 — tool calling |
| **`step-03-multimodal`** ← you are here | 3 — image input |
| `step-04-rag` / `main` | 4 — RAG (final state) |

## What changed since step 02

1. Input schema now has an **optional `landmarkPhoto`** — a base64 data URL.
2. The prompt is built as **parts** instead of a single string. When a photo is present:
   ```ts
   [{ media: { url: dataUrl } }, { text: "The image above is a landmark..." }]
   ```
   **Media part goes first.** Google's own samples do it that way — the text instructions then "refer back" to the image. Reversing the order weakens grounding on the image.
3. `output: { ..., format: 'json', constrained: true }` — schema-aware decoding stays stable when vision is combined with tools. Without `constrained: true`, Flash sometimes returns malformed JSON.

## Try it now

```bash
npm run dev
```

In the Dev UI, open `planTripFlow`. The input form now has a `landmarkPhoto` field with a **file-upload** widget. Drop `src/data/sagrada-familia.jpg` on it.

Input the rest:

```json
{ "destination": "Barcelona", "days": 2, "landmarkPhoto": "<auto-filled by upload>" }
```

Run it. Expected:

- `highlights[0].name` is "Sagrada Família" — proof the model looked at the image.
- The trace's `generate` span has a **media part** with a thumbnail.

## Stress-test

Upload the Sagrada Familia photo but set `destination: "Lisbon"`. Either the model sticks with what it sees in the photo, or it admits the photo does not match Lisbon. Both are interesting — that is "conflicting context" in one demo.

## Full docs for this module

[docs/03-multimodal.md](docs/03-multimodal.md)

## Next

```bash
git checkout step-04-rag   # local vector store, retrieve before generate
```
