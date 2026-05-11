// Genkit Travel Workshop — step 01 (inference)
//
// Adds a Zod-typed output schema so planTripFlow returns a typed TripPlan
// object instead of a free-form string.

import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-flash-latest'),
});

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
