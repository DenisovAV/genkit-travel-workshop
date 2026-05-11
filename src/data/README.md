# `src/data/`

Static assets used by the workshop.

| File | Used by |
|------|---------|
| `lisbon.md` | Module 4 (RAG) |
| `barcelona.md` | Module 4 (RAG) |
| `sagrada-familia.jpg` | Module 3 (multimodal) — **add before the workshop** |

## Adding the landmark photo

The repo does not ship a binary image. Before the workshop:

1. Pick a clear, daytime photo of the Sagrada Família façade (200 KB – 1 MB, JPEG).
2. Save it as `src/data/sagrada-familia.jpg`.
3. Test it in Module 3 — the Dev UI's file-upload widget will base64-encode it for you.

Any landmark works — adjust the trace narrative in `docs/03-multimodal.md` accordingly.

## Why the guides read "fictional"

The guides intentionally contain made-up, very specific details (street numbers, voucher codes, opening hours) that the LLM cannot know on its own. This makes the before/after RAG comparison in Module 4 unambiguous: when the model cites them, you know retrieval worked.
