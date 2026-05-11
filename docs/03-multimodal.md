# Module 3 — Multimodal Input

**Time:** ~20 min
**Goal:** show that a prompt is not just text. We send a photo of a landmark and the model uses it to enrich the plan.

## 3.1 How Gemini receives images

`ai.generate` accepts either a string prompt **or** an array of *parts*. Parts can be:

```typescript
{ text: 'some text' }
{ media: { url: 'https://example.com/img.jpg' } }
{ media: { url: 'data:image/jpeg;base64,...' } } // inline
```

Gemini Flash supports image + text natively. The same code path works for PDFs and (with the Files API) video.

> **Best practice (from Google's own examples):** put the `media` part **first**, then text instructions that refer back to it ("The image above is..."). It improves attention/grounding on the image.

## 3.2 Extend the flow input

Add an optional `landmarkPhoto` to the input schema:

```typescript
inputSchema: z.object({
  destination: z.string(),
  days: z.number(),
  landmarkPhoto: z
    .string()
    .optional()
    .describe('base64 data URL of a landmark photo'),
}),
```

Why a data URL? Because the Dev UI's file-upload widget produces exactly that format — no detour through `fs`.

## 3.3 Build prompt parts dynamically

Replace the existing `ai.generate` call. Two changes to notice:

1. The `media` part goes **first**, the text instruction refers back to it.
2. We pass `format: 'json', constrained: true` — schema-aware decoding stays stable when vision, tools, RAG, and structured output are all in one call.

```typescript
const promptParts: Array<{ text: string } | { media: { url: string } }> = [];

if (landmarkPhoto) {
  promptParts.push({ media: { url: landmarkPhoto } });
  promptParts.push({
    text:
      `The image above is a landmark. Identify it and use it as the first ` +
      `highlight when planning a ${days}-day trip to ${destination} starting from Berlin. ` +
      `Mention the current weather and suggest a flight option.`,
  });
} else {
  promptParts.push({
    text:
      `Plan a ${days}-day trip to ${destination} starting from Berlin. ` +
      `Mention the current weather and suggest a flight option.`,
  });
}

const { output } = await ai.generate({
  prompt: promptParts,
  tools: [getWeather, searchFlights],
  output: {
    schema: TripPlanSchema,
    format: 'json',
    constrained: true,
  },
  maxTurns: 5,
});
```

The `if (landmarkPhoto)` block is the only conditional. Everything else (tools, schema) is unchanged.

## 3.4 Demo in the Dev UI

1. Open `planTripFlow`. The input form now has a field for `landmarkPhoto`.
2. The Dev UI provides a **file upload** — drop `src/data/sagrada-familia.jpg` on it. Genkit converts the file into a base64 data URL for you.
3. Set `destination: "Barcelona"`, `days: 3` and run.

Expected output:

- `highlights[0].name` is "Sagrada Família".
- `highlights[0].why` mentions a visual detail (towers, façades) — proof the model *looked* at the image, not just guessed from the city name.

Open the trace: the `generate` span now has a **media part** in its input. Click on it; the UI shows a thumbnail of the image you sent.

## 3.5 Stress-test: pick a different city in the photo

Set `destination: "Lisbon"` but still upload the Sagrada Família photo. Two things can happen:

- The model trusts the photo, includes Sagrada Família, ignores Lisbon entirely — funny but wrong.
- The model trusts the destination, mentions the photo "did not match Lisbon and was therefore ignored".

Either response is interesting. It is the cleanest demo of "conflicting context → model has to choose" in 30 seconds.

## 3.6 Helper for CLI tests (optional)

If a participant wants to run the flow from a script instead of the UI, here is a one-liner to load a file as a data URL:

```typescript
import { readFile } from 'node:fs/promises';

async function fileToDataUrl(path: string, mime: string) {
  const bytes = await readFile(path);
  return `data:${mime};base64,${bytes.toString('base64')}`;
}
```

Not needed for the workshop itself — the Dev UI handles uploads.

---

**Checkpoint — `src/index.ts` at the end of module 3:** identical to module 2 plus:

1. `landmarkPhoto?: string` in `inputSchema`.
2. Prompt is built as `promptParts: Array<...>`.
3. Image part appended when `landmarkPhoto` is present.

→ Next: [Module 4 — RAG with a local vector store](04-rag.md)
