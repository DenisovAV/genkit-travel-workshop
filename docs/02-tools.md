# Module 2 — Tool Calling

**Time:** ~25 min
**Goal:** let the model decide *when* to call your code. No `if/else` from you — the decision lives inside the model.

## 2.1 The mental model

Tool calling is the inverse of normal function calls:

- **Normal code:** *you* call a function with arguments.
- **Tool calling:** you *give the model a list of functions it can call*, ask it a question, and the model decides which (if any) to call, with what arguments, and what to do with the results.

Under the hood it is a loop:

```
generate → maybe a tool call → run your code → feed result back → generate → ... → final answer
```

Genkit runs this loop for you.

## 2.2 Define two tools

Add this above `planTripFlow`:

```typescript
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
```

The `description` and `inputSchema` are everything the model sees. Treat them as **API docs for the LLM** — vague descriptions produce wrong tool calls.

## 2.3 Wire tools into the flow

Update the `ai.generate` call:

```typescript
const { output } = await ai.generate({
  prompt:
    `Plan a ${days}-day trip to ${destination} starting from Berlin. ` +
    `Mention the current weather and suggest a flight option.`,
  tools: [getWeather, searchFlights],
  output: { schema: TripPlanSchema },
  maxTurns: 5,
});
```

**`maxTurns: 5`** caps the tool-call loop. Without it, a stuck model can blow your quota. Five is plenty for two tools.

## 2.4 What the Dev UI shows

Run the flow with `{"destination":"Lisbon","days":3}`. Open the trace:

```
planTripFlow
└─ generate
   ├─ tool: getWeather  ({ city: "Lisbon" })
   ├─ tool: searchFlights ({ from: "Berlin", to: "Lisbon", date: "..." })
   └─ final response
```

Three things to point out to participants:

1. The model **picked the arguments** — date format, city names, even guessed `from: "Berlin"` from the prompt.
2. There were **multiple `generate` calls under the hood** (one per tool round-trip). Each costs tokens.
3. You did not write any `if (intent === "weather")` routing logic.

## 2.5 Negative test (worth doing live)

Run with `{"destination":"Mars","days":3}`. The model should **not** call `getWeather` — it knows the tool is for cities on Earth (and our stub returns `unknown` anyway). This is the lesson: tool selection is a model decision, not deterministic dispatch.

## 2.6 Where tool calling fits the real world

- "Read these 50 unread emails and summarize them" → `listEmails` + `getEmail` tools.
- "Book a meeting room for the team" → `findRoom` + `bookRoom` tools.
- "Refund order #4711" → `lookupOrder` + `issueRefund` tools.

In every case, the model is the **decider**, your tools are the **doers**.

---

**Checkpoint — `src/index.ts` at the end of module 2:**

```typescript
import 'dotenv/config';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3.1-flash-image-preview'),
});

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get current weather for a city.',
    inputSchema: z.object({ city: z.string() }),
    outputSchema: z.object({ tempC: z.number(), condition: z.string() }),
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
      output: { schema: TripPlanSchema },
      maxTurns: 5,
    });
    if (!output) throw new Error('Model returned no structured output');
    return output;
  },
);
```

→ Next: [Module 3 — Multimodal input](03-multimodal.md)
