# Module 0 — Setup & Dev UI Tour

**Time:** ~15 min
**Goal:** every participant has a working Genkit project, a hello-flow running in the Dev UI, and knows where to look for traces.

## 0.1 Install

```bash
npm install                 # installs Genkit + the bundled CLI as a devDependency
cp .env.example .env        # then paste your GEMINI_API_KEY
```

Sanity check: `npx genkit --version` prints a version.

> If you prefer a global CLI for use outside this project: `npm install -g genkit-cli`.

## 0.2 The starter file

Open `src/index.ts`. At checkpoint **m0-setup** it looks like this:

```typescript
import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.1-flash-image-preview'),
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
```

Three things to notice:
1. **`genkit({...})`** — the new GA factory. Replaces the old `configureGenkit()` from beta.
2. **`ai.defineFlow`** — wraps a function so the Dev UI can call it, type-check inputs, and trace it.
3. **`ai.generate`** — the single inference primitive. Returns `{ text, output, messages, ... }`.

**About the model:** `gemini-3.1-flash-image-preview` is the newest Gemini Flash available through the Google AI plugin at the time of this workshop. It handles text, vision, tools, and structured output from a single endpoint — fast enough for live demos, cheap on free tier. The `-preview` suffix means it can change without notice — for production, pin a stable tag once 3.1 Flash reaches GA.

## 0.3 Start the Dev UI

```bash
npm run dev
# → genkit start -- tsx --watch src/index.ts
```

Open <http://localhost:4000>. You should see:

- **Flows** tab — `planTripFlow` listed
- **Models** tab — try the model directly without a flow
- **Traces** tab — empty for now

## 0.4 First run

In **Flows → planTripFlow**, paste:

```json
{ "destination": "Lisbon" }
```

Click **Run**. You get a string greeting back.

Now click the **Traces** tab. Open the trace. You will see one `generate` span with:
- the prompt that was sent
- the model that answered
- token counts
- latency

This trace view is the workshop's superpower — every new feature we add (tools, multimodal, RAG) shows up here as new spans.

## 0.5 What to expect from `tsx --watch`

Edit any file under `src/`, save — the Dev UI restarts the flow process automatically. No need to stop/start. Refresh the browser tab if a flow stops appearing.

---

**Checkpoint:** at the end of module 0, `src/index.ts` matches the snippet above.

→ Next: [Module 1 — Inference & structured output](01-inference.md)
