# Slide Image Prompts — Nano Banana / Imagen

A copy-paste prompt deck for generating presentation visuals with Google's image
models (Nano Banana via Gemini, or Imagen). Each step in the workshop gets three
images:

1. **Title** — hero image for the section opener
2. **Concept diagram** — explains the moving parts visually
3. **Accent** — small illustration for sidebars, transitions, or wrap-up slides

All prompts share one visual identity so the deck looks coherent.

## Global style header

Prepend (or include literally) this to every prompt below. Tweak once, applies
to all 18 images.

```
Visual style: flat vector illustration, minimal modern geometric shapes, soft
pastel palette (teal #2dd4bf, coral #fb7185, warm sand #fde68a) on a deep navy
background (#0f172a), subtle grain, clean line-art accents, NO TEXT, NO LETTERS,
NO NUMBERS, NO LOGOS. Aspect ratio 16:9, cinematic composition, generous
negative space on the right for slide titles. Friendly, professional, conference-
keynote feeling, not corporate-stock.
```

Tips for getting clean results:

- **Add `NO TEXT, NO LETTERS, NO NUMBERS, NO LOGOS`** every single time — image
  models love to hallucinate broken signage. You add real text yourself in
  Keynote / Google Slides.
- Use `--aspect 16:9` flag in Imagen Studio, or the `aspectRatio: '16:9'` config
  param when calling through Genkit.
- Generate 4 variants per prompt and pick the cleanest — Nano Banana is fast
  enough that this is essentially free.

---

## Intro slide — "Build a travel planner with Genkit"

### Intro · Title
```
A vintage brown leather suitcase covered in colorful travel stickers sits open
on a wooden table. Inside, floating above it, semi-transparent holographic
icons hover in a soft cyan glow: a small compass, a paper plane, a chat bubble,
a tiny camera, a magnifying glass over a document. Soft golden hour light from
the left. Cinematic depth of field. Negative space on the right half for a
slide title.
```

### Intro · Concept diagram (workshop roadmap)
```
Five connected geometric icons on a horizontal line, evenly spaced, left to
right: (1) a glowing speech bubble, (2) a Swiss army knife with three open
tools, (3) a polaroid photo, (4) a stack of three documents with a search loupe,
(5) a finished trophy. Soft animated motion lines connecting them. Dark navy
background with subtle constellation dots.
```

### Intro · Accent
```
A pastel-coloured rubber duck wearing tiny pixel sunglasses, sitting next to a
laptop with a Genkit-style sparkle icon floating above it. Sticker-art look,
clean shadows, single subject centered.
```

---

## Module 0 — Setup & Dev UI tour

### M0 · Title
```
A clean developer desk top-down view: an open laptop displays an abstract dev-
tool dashboard with floating panels (timelines, traces, model cards) — NO
readable text on the screen, just geometric shapes representing UI. A small
plant, a cup of espresso, a paper map of Europe folded on the side. Sand-and-
teal palette. Negative space top-right for title.
```

### M0 · Concept diagram (Dev UI tour)
```
A stylized browser window split into three panels: left panel shows a vertical
list of flow icons (small triangles), middle panel shows a horizontal timeline
of nested spans like a flame graph, right panel shows a JSON-shaped object made
of stacked colored bars. Soft glow connecting them. No real text.
```

### M0 · Accent
```
A tiny rocket made of geometric shapes lifting off from a laptop screen,
trailing a stream of pastel sparkles. Single subject, centered, sticker style.
```

---

## Module 1 — Inference & structured output

### M1 · Title
```
A glowing transparent crystal cube floating above an open notebook. Inside the
cube, abstract shapes representing structured fields are arranged in a neat
grid (a circle, a square, a triangle stack). A swirl of soft particles enters
the cube from the left as raw text-like ribbons (no readable letters), and
exits the right side as orderly, color-coded blocks. Cinematic studio lighting,
dark navy background.
```

### M1 · Concept diagram (string → schema → typed object)
```
Three rounded rectangles connected by arrows, left to right. Left: a wavy,
unstructured ribbon of pastel paint splashes. Middle: a transparent funnel
shaped like a Zod-style shield (geometric, not literal). Right: a perfectly
aligned grid of color-coded blocks of varying heights, like a small bar chart.
No text. Background dark navy.
```

### M1 · Accent
```
A small origami crane folded from a sheet of paper that has faint coloured
grid lines on it, sitting on a clean surface. Soft side lighting. Symbol of
structure emerging from raw input.
```

---

## Module 2 — Tool calling

### M2 · Title
```
A robotic hand reaching out from the right, picking up one of three floating
holographic tools arranged in a fan: a tiny weather cloud with a sun peeking
out, a small paper airplane, a calculator-style icon. The hand glows softly
with a cyan inner light. Dark navy backdrop, soft volumetric beams from the
upper-left. Cinematic.
```

### M2 · Concept diagram (LLM picks a tool)
```
A central glowing orb (the model) with three dotted arrows fanning out to
three tool icons: a weather cloud, a small flight ticket, a magnifying glass.
Only ONE arrow is solid and bright (selected); the others are faded. Below
the chosen tool, a small spinning gear icon. Dark navy background, soft glow.
No text.
```

### M2 · Accent
```
A Swiss army knife in pastel coral with three tools popped open, casting a
long thin shadow. Single subject, sticker style, centered.
```

---

## Module 3 — Multimodal (vision)

### M3 · Title
```
A polaroid photo of a famous architectural landmark (intricate spires reaching
upward, generic European basilica silhouette, NOT a specific real building)
floating slightly above an open notebook. From the polaroid, glowing tendrils
of soft light flow into a transparent crystal shape representing the LLM, and
out the other side into a tidy itinerary card made of stacked pastel blocks.
Cinematic, dark navy background, warm fill light.
```

### M3 · Concept diagram (image + text → enriched plan)
```
Three rounded rectangles connected by arrows. Left: a square polaroid frame
containing abstract architectural shapes (towers, arches). Middle: a glowing
orb labelled with a small sparkle. Right: a stacked itinerary card with five
colored rows. A small camera-aperture icon sits above the left rectangle.
Dark navy background, no readable text.
```

### M3 · Accent
```
A vintage 35mm camera in pastel teal with a tiny chat-bubble icon floating
from its lens. Sticker style, centered, soft drop shadow.
```

---

## Module 4 — RAG

### M4 · Title
```
A glass librarian's archive: rows of floating, semi-transparent documents
arranged in a 3D grid stretch into soft focus. A bright cyan beam of light
scans across them, illuminating four selected documents that float forward and
spin gently. To the right, those four documents feed into a glowing orb. Dark
navy background, dust motes, dramatic shafts of light.
```

### M4 · Concept diagram (embed → vector search → retrieve → generate)
```
Four stages in a horizontal row, connected by glowing arrows. (1) A stack of
small documents with a magnifying glass. (2) A point cloud in 3D space with
some points highlighted in coral. (3) Four selected documents floating in
formation. (4) A glowing orb that emits a stacked itinerary card on the right.
Dark navy background, soft cyan accents. No readable text.
```

### M4 · Accent
```
A pastel-coloured book opens upward, releasing a small swarm of geometric
particles in cyan and coral that swirl out and form a tiny constellation
above it. Sticker style, single subject.
```

---

## Outro / wrap-up — Where to go next

### Outro · Title
```
The same vintage brown leather suitcase from the intro, now closed and
standing upright with a fresh "boarding pass" tag dangling from its handle.
Behind it, a wide pastel runway leads into the horizon under a soft golden
sunset. Five small geometric icons (speech bubble, Swiss army knife, polaroid,
documents, trophy) float in a gentle arc above the suitcase. Cinematic, warm
tones, dark navy at the top fading to peach at the horizon. Negative space
top-left for a closing title.
```

### Outro · Concept diagram (what to read next)
```
A central glowing book opens upward and emits five soft beams of light, each
leading to a small floating icon: a cloud (deployment), a document with a
sparkle (prompt files), a clipboard with checkmarks (evaluation), three
connected circles (multi-agent), a stack of databases (production RAG). Dark
navy background, soft cyan rim light. No text.
```

### Outro · Accent
```
A pastel "thank you" gesture: two abstract hands cupped together holding a
small glowing geometric sparkle. Minimal, sticker style, centered, single
subject. Warm fill light.
```

---

## How to actually run these prompts

### Option A — Google AI Studio (fastest, no code)

1. Open <https://aistudio.google.com>.
2. Pick model `gemini-3.1-flash-image-preview` (or "Nano Banana" if surfaced).
3. Paste the **global style header** followed by one prompt at a time.
4. Set aspect ratio 16:9 in the right-hand panel.
5. Generate, download the best of the variants.

### Option B — Via Genkit (programmatic, batch)

Add this throwaway script next to your workshop project (DO NOT commit — already
in `.gitignore` if you keep it under `scripts/`):

```typescript
// scripts/gen-slides.ts
import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { ai } from '../src/index.js';
import { googleAI } from '@genkit-ai/google-genai';

const STYLE = `Visual style: flat vector illustration, minimal modern geometric
shapes, soft pastel palette (teal #2dd4bf, coral #fb7185, warm sand #fde68a) on
a deep navy background (#0f172a), subtle grain, clean line-art accents, NO TEXT,
NO LETTERS, NO NUMBERS, NO LOGOS. Aspect ratio 16:9, cinematic composition,
generous negative space on the right for slide titles.`;

const prompts: Record<string, string> = {
  'intro-title': '...paste prompt from this file...',
  'm0-title': '...',
  // etc
};

for (const [name, prompt] of Object.entries(prompts)) {
  const { media } = await ai.generate({
    model: googleAI.model('gemini-3.1-flash-image-preview'),
    prompt: [{ text: `${STYLE}\n\n${prompt}` }],
    config: { responseModalities: ['IMAGE'], aspectRatio: '16:9' },
  });
  if (media?.url) {
    const b64 = media.url.split(',')[1];
    await writeFile(`slides/${name}.png`, Buffer.from(b64, 'base64'));
    console.log(`✓ slides/${name}.png`);
  }
}
```

Run with `npx tsx scripts/gen-slides.ts`. Takes ~30 seconds per image on Flash.

### Option C — Imagen 3 (highest quality, slower)

If you want production-grade fidelity for the title slides, swap the model in
the script above to `googleAI.model('imagen-3.0-generate-002')`. Same prompts
work, the renders are sharper but each call costs more.

---

## A note on iteration

The first generation rarely matches what you imagined. Best practice:

1. Generate **all 18 images** with the default prompts.
2. Identify the 2–3 that miss (composition wrong, colors off, weird artifact).
3. For those, **edit the prompt** with one specific fix per turn ("move the
   suitcase to the left third", "remove the smaller subject in the background",
   "use cooler lighting"). Do NOT rewrite the whole prompt.
4. Re-generate just those.

Image models reward small surgical edits, not full rewrites.
