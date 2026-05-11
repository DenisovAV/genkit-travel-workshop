# Genkit Travel Workshop — Step 02: Tool Calling

You are on branch **`step-02-tools`**. Module 2 is done — the model can now call `getWeather` and `searchFlights` on its own.

## Branch map

| Branch | After module |
|--------|--------------|
| `step-00-starter` | (setup only) |
| `step-01-inference` | 1 — Zod structured output |
| **`step-02-tools`** ← you are here | 2 — tool calling |
| `step-03-multimodal` | 3 — image input |
| `step-04-rag` / `main` | 4 — RAG (final state) |

## What changed since step 01

1. **`ai.defineTool`** — `getWeather` and `searchFlights` are typed callable tools with Zod input/output schemas. Their `description` is the only thing the model sees about them — treat it as API documentation for an LLM. Bodies are mocked: weather has a hand-written city stub, flight search always returns the same two carriers.
2. The flow's `ai.generate` now passes `tools: [getWeather, searchFlights]` and `maxTurns: 5` (cap on the tool-call loop — prevents runaway calls).
3. Prompt updated to invite the model to actually use them: it now mentions the trip starts "from Berlin" and asks the model to "mention the weather and suggest a flight option". Without that prompt nudge the model has no reason to call tools.
4. **`output: { format: 'json', constrained: true }`** — schema-aware decoding. Combining `tools` with `output.schema` makes Flash models occasionally produce malformed JSON; `constrained: true` asks Gemini for structured decoding and prevents parse errors.

## Try it now

```bash
npm run dev
```

Input:

```json
{ "destination": "Lisbon", "days": 3 }
```

In **Traces**, expand the run:

```
planTripFlow
└─ generate
   ├─ tool: getWeather  ({ city: "Lisbon" })
   ├─ tool: searchFlights ({ from: "Berlin", to: "Lisbon", date: "..." })
   └─ final response
```

The model picked the arguments (including a date format) on its own. Three back-and-forth `generate` calls happened under the hood — each costs tokens.

## Negative test

Try `{ "destination": "Mars", "days": 3 }`. The model should **not** call `getWeather` — tools are a decision, not deterministic dispatch.

## Full docs for this module

[docs/02-tools.md](docs/02-tools.md)

## Next

```bash
git checkout step-03-multimodal   # image input
```
