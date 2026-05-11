// Genkit Travel Workshop — final state (m4)
//
// One growing flow, `planTripFlow`, that demonstrates four Genkit capabilities:
//   1. Inference with a Zod-typed output schema
//   2. Tool calling (model decides when to call your code)
//   3. Multimodal input (image part alongside text)
//   4. RAG: retrieve local docs, pass them as `docs` to ai.generate
//
// Run with:  npm run dev   (opens the Dev UI at http://localhost:4000)

import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { googleAI } from '@genkit-ai/google-genai';
import {
  devLocalIndexerRef,
  devLocalRetrieverRef,
  devLocalVectorstore,
} from '@genkit-ai/dev-local-vectorstore';
import { genkit, z } from 'genkit';
import { Document } from 'genkit/retriever';

// ─────────────────────────────────────────────────────────────────────────────
// Genkit setup
// ─────────────────────────────────────────────────────────────────────────────

export const ai = genkit({
  plugins: [
    googleAI(),
    devLocalVectorstore([
      {
        indexName: 'cityGuides',
        // Quota fallback: googleAI.embedder('text-embedding-004')
        embedder: googleAI.embedder('gemini-embedding-001'),
      },
    ]),
  ],
  // Global default model. `gemini-flash-latest` is an alias that always
  // resolves to the newest stable Flash with text + vision + tools +
  // structured output. NB: `gemini-3.1-flash-image-preview` is for image
  // *generation*, not for image *input* — different model family.
  model: googleAI.model('gemini-flash-latest'),
});

export const cityGuidesIndexer = devLocalIndexerRef('cityGuides');
export const cityGuidesRetriever = devLocalRetrieverRef('cityGuides');

// ─────────────────────────────────────────────────────────────────────────────
// Module 2 — tools
// ─────────────────────────────────────────────────────────────────────────────

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get current weather for a city.',
    inputSchema: z.object({ city: z.string() }),
    outputSchema: z.object({
      tempC: z.number(),
      condition: z.string(),
    }),
  },
  async ({ city }) => {
    const stub: Record<string, { tempC: number; condition: string }> = {
      Lisbon: { tempC: 22, condition: 'sunny' },
      Barcelona: { tempC: 19, condition: 'cloudy' },
      Berlin: { tempC: 11, condition: 'rainy' },
    };
    return stub[city] ?? { tempC: 15, condition: 'unknown' };
  },
);

const searchFlights = ai.defineTool(
  {
    name: 'searchFlights',
    description: 'Search mock flights between two cities on a date.',
    inputSchema: z.object({
      from: z.string(),
      to: z.string(),
      date: z.string().describe('YYYY-MM-DD'),
    }),
    outputSchema: z.array(
      z.object({
        airline: z.string(),
        priceEUR: z.number(),
        durationH: z.number(),
      }),
    ),
  },
  async () => [
    { airline: 'MockAir', priceEUR: 89, durationH: 2.5 },
    { airline: 'FauxFly', priceEUR: 142, durationH: 2.0 },
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// Module 1 — output schema
// ─────────────────────────────────────────────────────────────────────────────

const TripPlanSchema = z.object({
  destination: z.string(),
  durationDays: z.number(),
  highlights: z
    .array(
      z.object({
        name: z.string(),
        why: z.string(),
      }),
    )
    .min(3)
    .max(5)
    .describe('Top 3-5 highlights of the destination'),
  packingTips: z.array(z.string()).max(5),
});

// ─────────────────────────────────────────────────────────────────────────────
// Module 4 — indexing flow (run once per session)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Main flow — all four modules wired together
// ─────────────────────────────────────────────────────────────────────────────

export const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.object({
      destination: z.string(),
      days: z.number(),
      // Module 3: optional landmark photo as a data URL (Dev UI uploads
      // produce this format directly).
      landmarkPhoto: z
        .string()
        .optional()
        .describe('base64 data URL of a landmark photo'),
    }),
    outputSchema: TripPlanSchema,
  },
  async ({ destination, days, landmarkPhoto }) => {
    // Module 4: retrieve top-K chunks for this destination from the local
    // vector store. We do not filter by destination filename — vector
    // similarity does that for us.
    const retrievedDocs = await ai.retrieve({
      retriever: cityGuidesRetriever,
      query: `Things to do, food, and local tips for ${destination}`,
      options: { k: 4 },
    });

    // Module 3: build prompt parts. Google best practice for vision: put
    // the media part FIRST so the text instructions can refer back to it.
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

    // The single ai.generate call carries everything: tools, multimodal
    // prompt, RAG context (docs), structured output schema.
    // `constrained: true` asks Genkit/Gemini for schema-aware decoding,
    // which is what keeps the JSON from getting mangled when many
    // capabilities are combined in one call.
    const { output } = await ai.generate({
      prompt: promptParts,
      tools: [getWeather, searchFlights],
      docs: retrievedDocs,
      system:
        'Use the provided city guides as your primary source. ' +
        'Prefer specific facts from the guides over general knowledge. ' +
        'If something is not in the guides, say so instead of inventing.',
      output: {
        schema: TripPlanSchema,
        format: 'json',
        constrained: true,
      },
      maxTurns: 5,
    });

    if (!output) throw new Error('Model returned no structured output');
    return output;
  },
);
