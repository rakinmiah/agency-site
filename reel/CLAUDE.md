# Loomwork reel — working rules

Read `HANDOVER.md` first — full state, timeline map, section status, and the
measurement scripts live there. The non-negotiables:

- **Beat grid**: 150.1 BPM · `BEAT = (60/150.1)*60 = 23.984` frames · content
  cuts on the beat; only travel gets eased. `node tools/beats.mjs A B` prints
  the kick map.
- **Measure, don't eyeball**: after every render run the flash sweep
  (HANDOVER §2). Hard ceiling: 3 luminance changes >20/255 in any 1s window —
  the film is AT 3 already. Verify pacing claims with the cut-rate sweep.
- **Look at frames**: extract and tile stills after every render; judge from
  pixels, not from code.
- **Reference clips**: extract EVERY frame (crop first), page through tiles,
  measure timings numerically. Never sample.
- **Never real firms**: all businesses, domains, reviews, and ad copy in mock
  UI are invented. Phone numbers only from Ofcom's 07700 900000–900999 block.
- **Secrets**: the Pexels key lives in `.env.local` (gitignored). Never in
  source, never committed.
- **WebGL comps** render with `--gl=angle`. GLSL: no `pow` on possibly
  negative bases, no inverted smoothstep edges; own ShaderMaterials
  imperatively (r3f clones JSX-prop uniforms); test animation with rendered
  ranges, never two stills.
