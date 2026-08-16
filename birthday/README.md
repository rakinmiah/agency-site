# Happy Birthday montage (Remotion)

Stitches a set of phone clips into one birthday film: title card → every clip
with soft crossfades between them → closing card. Mixed portrait/landscape
footage is letterboxed over a blurred copy of itself; clip audio is kept and
gently faded at each cut so nothing pops.

## How it works

- `src/manifest.ts` — ordered list of clips (the order they were attached).
  Files live in `public/clips/` (gitignored — personal footage stays out of
  the repo).
- `src/Root.tsx` — `calculateMetadata` probes every clip with
  `@remotion/media-parser` (duration + rotated dimensions), picks canvas
  orientation by majority, and sizes the composition automatically.
- `src/timing.ts` — crossfade length (max 20 frames ≈ 0.66s) is capped by the
  shorter neighbouring clip so very short clips still work.
- `src/BirthdayVideo.tsx` — `TransitionSeries` with `fade()` transitions.
- `src/ClipFill.tsx` — cover-fill when a clip roughly matches the canvas
  aspect; otherwise contain over a blurred, dimmed self-background.
- `src/Cards.tsx` + `Confetti.tsx` + `Balloons.tsx` — intro/outro cards.

## Commands

```bash
npm install
# point Remotion at a local Chromium (optional; otherwise it downloads one)
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell

npm run studio                 # preview
npm run render                 # renders out/happy-birthday.mp4
```

Title and closing line are props — edit `DEFAULT_PROPS` in `src/Root.tsx` or
pass `--props` to the render.
