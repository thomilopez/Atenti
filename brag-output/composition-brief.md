# Hyperframes Composition Brief: Atenti

## Objective

Create a 20-second portrait launch/promo video for **Atenti**, a collaborative, geolocated fraud-prevention app for Argentina.

## Output

- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: portrait — 1080x1920
- Duration: 20 seconds

## Source Material

- Project root: `D:\Facultad Pilar\2do año\APP moviles\Atenti`
- Primary files read: `README.md`, `src/screens/P1_HomeScreen.tsx`, `src/screens/P4_CreateReportScreen.tsx`, `src/screens/P5_OCRValidationScreen.tsx`, `src/services/credibility.ts`, `app.json`
- Product name: Atenti
- Tagline: "La comunidad que te avisa." (acortado desde "…antes del fraude" para cumplir el mínimo de lectura en pantalla)
- Key UI moment: the search + credibility card and the report/OCR flow.
- Copy that must appear verbatim:
  - "¿Te están por estafar?"
  - "Antes de transferir, chequeá."
  - "La comunidad que te avisa."
  - "Alias: ju.mp"
  - "Estafa Bancaria · 3 reportes"
  - "Reportá con evidencias"
  - "Subir comprobante"
  - "OCR validado"
  - "Historias de estafas de la comunidad"
  - "Antes de caer, Atenti."

## Creative Direction

- Tone preset: `app-store`
- Creative direction: calm, urgent public-safety product film
- Interpretation: clean cards, confident pace, high contrast; urgency from motion, not flashing.
- Angle: the scam is about to happen; Atenti warns you first.
- Hook: "¿Te están por estafar?"
- Outro: "Antes de caer, Atenti."
- Avoid: generic SaaS language, abstract filler, unrelated visual redesign.

## Visual Identity

- Background: `#0F172A`
- Text: `#F8FAFC`
- Accent: `#DC2626`
- Success: `#00E676`
- Muted: `#94A3B8`
- Display font: Inter / system-ui
- Body font: Inter / system-ui
- Visual references: dark navy background, red alert accent, white cards, green traffic light, shield logo.

## Storyboard

1. Hook — 3s — red alert ring, "¿Te están por estafar?" + "Antes de transferir, chequeá."
2. Brand — 3s — logo, "Atenti", tagline.
3. Search — 5s — chips, typed "ju.mp", result card 80% + green light.
4. Report — 5s — upload, OCR validado, credibility bar 80%, map pin.
5. Outro — 4s — "Historias de estafas de la comunidad", "Antes de caer, Atenti.", logo.

## Audio

- Audio role: warm, confident electronic bed.
- Audio arc: low at the hook, lifts at the brand, steady through the UI, resolves on the logo.
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3`
- Music treatment: 0.8 volume, normalized to −14 LUFS in post; ends under the final logo.
- Audio-reactive: subtle; logo/reveal glow only.
- Audio-coupled moments: typed search, result card reveal, score bar, OCR success, map pin, final logo.
- SFX: light app-store layer; hook hit, logo reveal, typing keypresses, result drop, score tick, OCR bell, map pin, final logo bell.
- Audio files: music in `brag-output/composition/assets/music/`; SFX in `brag-output/composition/assets/sfx/`.

## Hyperframes Instructions

Load the composition-building Hyperframes skills (`hyperframes`, `hyperframes-registry`, `media-use`, `hyperframes-cli`). /brag is its own workflow: skip the generic `hyperframes` storyline/SPEC/REVIEW steps; the brag plan and this brief replace them. Run `hyperframes check` before render; keep creation and rendering local.

Requirements:
- Show real UI/copy from the project.
- Keep text readable; 15-25 seconds.
- Include the planned music layer.
- Use local assets for audio and media.
