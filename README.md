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

1. Input schema now has an **optional `landmarkPhoto`** — a base64 data URL string (format `data:image/jpeg;base64,…`). The Dev UI's file-upload widget produces exactly this format, so no manual encoding is needed.
2. The prompt is built as an **array of parts** instead of a single string, so we can mix text and media. There are two branches:
   - **With photo:** `[{ media: { url } }, { text: "The image above is a landmark…" }]`
   - **Without photo:** `[{ text: "Plan a {days}-day trip…" }]`
3. **Media part goes first.** Google's own samples do it that way — the text instructions then "refer back" to the image ("the image above"). Reversing the order weakens grounding on the image.
4. `format: 'json', constrained: true` (carried over from step 02) becomes even more important here — vision + tools + schema in one call is a JSON-stability stress test for Flash models. Constrained decoding keeps the output parseable.

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
