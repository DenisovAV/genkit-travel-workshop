// Genkit Travel Workshop — step 00 (starter)
//
// Hello-flow only. Verify your setup before we add inference, tools, multimodal, and RAG.

import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-flash-latest'),
});

export const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.object({ destination: z.string() }),
    outputSchema: z.string(),
  },
  async ({ destination }) => {
    const { text } = await ai.generate(`Say hi to a tourist visiting ${destination}.`);
    return text;
  },
);
