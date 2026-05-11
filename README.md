# Genkit Travel Workshop — Step 01: Inference

You are on branch **`step-01-inference`**. Module 1 is done — `planTripFlow` now returns a typed `TripPlan` object validated by a Zod schema.

## Branch map

| Branch | After module |
|--------|--------------|
| `step-00-starter` | (setup only) |
| **`step-01-inference`** ← you are here | 1 — Zod structured output |
| `step-02-tools` | 2 — tool calling |
| `step-03-multimodal` | 3 — image input |
| `step-04-rag` / `main` | 4 — RAG (final state) |

## What changed since step 00

1. **`TripPlanSchema`** declared with Zod — destination, durationDays, 3–5 highlights, ≤5 packingTips.
2. `planTripFlow` `inputSchema` now takes **two fields** instead of one: `{ destination, days }`. The Dev UI form auto-updates.
3. `planTripFlow` `outputSchema` is `TripPlanSchema` itself, so the flow returns a typed object instead of a free-form string.
4. The prompt is now `Plan a ${days}-day trip to ${destination}.`
5. `ai.generate({ ..., output: { schema } })` makes Genkit append schema instructions to the prompt and validate the response. If validation fails, `output` is `undefined` — we throw explicitly.

Tolerant constraint: we use `.min(3).max(5)` instead of `.length(3)` — rigid lengths cause occasional validation failures.

## Try it now

```bash
npm run dev
# Dev UI → planTripFlow → run
```

Input:

```json
{ "destination": "Lisbon", "days": 3 }
```

You get a JSON object with the right shape. Open the trace — the `generate` span has an **Output Schema** view showing the JSON Schema Genkit sent to the model.

## Experiment

Add `config: { temperature: 0.9 }` to `ai.generate` and run twice. The highlights change dramatically. Drop it to `0.2` and they stabilize. That is the cheapest "LLMs are non-deterministic" demo.

## Full docs for this module

[docs/01-inference.md](docs/01-inference.md) — read this if you want the long version.

## Next

```bash
git checkout step-02-tools   # tool calling
```
