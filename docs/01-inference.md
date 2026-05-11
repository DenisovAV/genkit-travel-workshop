# Module 1 — Inference & Structured Output

**Time:** ~20 min
**Goal:** stop treating LLMs as "string in → string out" and start treating them as **typed functions** with a Zod-defined return shape.

## 1.1 Why a schema?

A plain `ai.generate('plan a trip')` returns a free-form string. You then have to parse it, hope the model used the bullet points you asked for, and pray it does not invent a new format next call.

Genkit lets you pass `output: { schema }`. Genkit:

1. Appends instructions to the prompt that describe the schema.
2. Validates the model's response against Zod.
3. Returns `output` already parsed and typed as `z.infer<typeof schema>`.

If the model fails the schema, you get an exception, not silent garbage.

## 1.2 Add the schema

Replace `planTripFlow` with this:

```typescript
const TripPlanSchema = z.object({
  destination: z.string(),
  durationDays: z.number(),
  highlights: z
    .array(z.object({ name: z.string(), why: z.string() }))
    .min(3)
    .max(5)
    .describe('Top 3-5 highlights of the destination'),
  packingTips: z.array(z.string()).max(5),
});

export const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.object({
      destination: z.string(),
      days: z.number(),
    }),
    outputSchema: TripPlanSchema,
  },
  async ({ destination, days }) => {
    const { output } = await ai.generate({
      prompt: `Plan a ${days}-day trip to ${destination}.`,
      output: { schema: TripPlanSchema },
    });
    if (!output) throw new Error('Model returned no structured output');
    return output;
  },
);
```

Three details worth highlighting:

- **`.min(3).max(5)` instead of `.length(3)`.** Tolerant schemas survive model variability. A rigid `.length(3)` will occasionally throw because the model returns 2 or 4 items.
- **`.describe(...)`** ends up in the prompt that Genkit synthesizes for the model. Treat it as documentation for both your teammates *and* the model.
- The Zod schema is the **single source of truth** — TypeScript, Dev UI input form, and the model's instructions are all derived from it.

## 1.3 Run it in the Dev UI

Input:

```json
{ "destination": "Lisbon", "days": 3 }
```

You get back a typed `TripPlan` object. In the trace, expand the `generate` span:

- **Output Schema** — Genkit shows the JSON-Schema it sent.
- **Messages** — see the system-style instruction Genkit added to force JSON output.

## 1.4 Play with `temperature`

Add `config` to `ai.generate`:

```typescript
const { output } = await ai.generate({
  prompt: `Plan a ${days}-day trip to ${destination}.`,
  output: { schema: TripPlanSchema },
  config: { temperature: 0.2 }, // try 0.2 vs 0.9
});
```

- `0.2` → almost the same plan every call.
- `0.9` → wildly different highlights, more creative phrasing.

This is the cheapest "huh, so LLMs are non-deterministic" demo you can give.

## 1.5 Optional: break it on purpose

Change `.min(3).max(5)` to `.length(7)` and run a few times. Eventually the model returns 6 items and Genkit throws on schema validation. That is the lesson: **schema validation is a real backstop**, not a formality.

---

**Checkpoint — `src/index.ts` at the end of module 1:**

```typescript
import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.1-flash-image-preview'),
});

const TripPlanSchema = z.object({
  destination: z.string(),
  durationDays: z.number(),
  highlights: z
    .array(z.object({ name: z.string(), why: z.string() }))
    .min(3)
    .max(5)
    .describe('Top 3-5 highlights of the destination'),
  packingTips: z.array(z.string()).max(5),
});

export const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.object({
      destination: z.string(),
      days: z.number(),
    }),
    outputSchema: TripPlanSchema,
  },
  async ({ destination, days }) => {
    const { output } = await ai.generate({
      prompt: `Plan a ${days}-day trip to ${destination}.`,
      output: { schema: TripPlanSchema },
    });
    if (!output) throw new Error('Model returned no structured output');
    return output;
  },
);
```

→ Next: [Module 2 — Tool calling](02-tools.md)
