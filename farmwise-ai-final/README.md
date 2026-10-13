# Farmwise AI (Next.js)

Next.js 14 (App Router, TypeScript) recreation of the Farmwise AI home + listening screens.
The robot banner is cropped from the design and the farm landscape is a traced vector (`landscape.svg`);
layout is positioned on the original 245 x 555 artboard and scales with the screen width.

```bash
npm install
npm run dev
```

- `/` – interactive app. Tap the mic for the "Listening…" state (Web Speech API where supported). Tap the orb or press Esc to close.
- `/preview` – both screens side by side on the dark canvas, like the reference.

For crisper artwork, replace `public/images/banner.svg` and `landscape.svg` with the original artwork (same aspect ratios).
