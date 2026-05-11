// Genkit Travel Workshop — step 02 (tools)
//
// Adds two callable tools (getWeather, searchFlights). The model decides
// when and how to call them.

import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-flash-latest'),
});

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

const TripPlanSchema = z.object({
  destination: z.string(),
  durationDays: z.number(),
  highlights: z
    .array(z.object({ name: z.string(), why: z.string() }))
    .min(3)
    .max(5),
  packingTips: z.array(z.string()).max(5),
});

export const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.object({ destination: z.string(), days: z.number() }),
    outputSchema: TripPlanSchema,
  },
  async ({ destination, days }) => {
    const { output } = await ai.generate({
      prompt:
        `Plan a ${days}-day trip to ${destination} starting from Berlin. ` +
        `Mention the current weather and suggest a flight option.`,
      tools: [getWeather, searchFlights],
      output: { schema: TripPlanSchema, format: 'json', constrained: true },
      maxTurns: 5,
    });
    if (!output) throw new Error('Model returned no structured output');
    return output;
  },
);
