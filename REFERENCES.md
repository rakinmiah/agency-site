# Design reference library — captured 2026-07-24

Brief: move AWAY from minimalist-SaaS, KEEP the case-study scroll structure (sticky pans +
counted stats), hero is good but tweakable. 33 live sites captured at 1440×900 (hero + two
scroll positions each). Contact sheets in `refs/`.

## What the sweep proved
- **Nobody premium uses colourless black.** Every dark site tints its ground (Impression navy,
  NoGood warm charcoal, Darkroom red-black). Our #0B0B0D void is the SaaS tell.
- **Heavy WebGL sites are a trap.** Lusion / Resn / Active Theory / Obys all still showed
  LOADING SCREENS after 3s+ on a fast connection. Owner already rejected this genre — confirmed.
- **The back half stays alive through WORK RECURRING + STATEMENTS**, never through more
  components. Every strong site re-shows the work after the case section.
- **SaaS-clean CAN carry colour** (Monzo, Stripe, Focus Lab, Superside) — the difference is
  colour in the GROUND and in the TYPE, not colour in little accent dots.

## The five directions (each keeps our case-study engine)

### A — PRINT ARCHIVE (dense editorial)
Refs: Anagrama, Pentagram, Basic/Dept, Studio Nari, Collins
Paper ground, tiny functional type, dense grids, work tiles, archive numbering, near-zero
chrome. Anti-SaaS through DENSITY. Steal: Anagrama's tile grid + micro-caption type;
Pentagram's "work is the design"; Collins' centered serif statement + bracketed award list.

### B — COLOUR-BLOCK CASE CARDS  ← strongest fit
Refs: Impression (mid-page), Fhoke, Monzo, Superside
Each case study owns a saturated colour panel; services list rendered IN colour (Monzo lists
Credit/Travel/Mortgages in coral); metric-led case headlines ("achieves 600% increase in
sales"). We already have three client colours (taxi gold C9A961, JDH blue 4C79F0, Deen green
4CA24F) — this direction promotes them from stat-colour to full panels.

### C — TERMINAL / TECHNICAL
Refs: Darkroom.engineering, Instrument, NoGood
Monospace, red/amber on black, grid rules, system-status register. Suits the counting/proof
story. Risk: cold for local trades.

### D — WARM CRAFT EDITORIAL
Refs: Focus Lab, Collins, Mercury, Hallam, Work & Co
Serif display, warm paper, hand-drawn annotation (Focus Lab circles a word in its headline),
real photography, human presence. Suits "a person, not a factory" positioning.

### E — POSTER / IMAGE-IN-TYPE
Refs: Nice and Serious, Instrument, Ragged Edge, Mother Design
Giant type with imagery embedded INSIDE the words; wordmark as the page. Our Anton hero
already sets this up — the case-study photos could live inside the letterforms.

## Full capture list
Raw/experimental: basicagency.com · darkroom.engineering · lusion.co · exoape.com ·
unseen.co · activetheory.net · resn.co.nz · obys.agency
Editorial/brand: pentagram.com · wearecollins.com · anagrama.com · bond-agency.com ·
heystudio.es · wolffolins.com · studionari.com · motherdesign.com
Colourful SaaS: linear.app · stripe.com · framer.com · ramp.com · mercury.com ·
raycast.com · monzo.com · focuslab.agency · superside.com
UK comps / case-study-strong: 93x.agency (Clarity) · hallam.agency · impression.co.uk ·
fhoke.com · rawnet.com · niceandserious.com · work.co · instrument.com
Earlier sweep: metalab.com · clay.global · koto.studio · raggededge.com · dixonbaxi.com ·
nogood.io · klientboost.com · madebyshape.co.uk · bluefrontier.co.uk
Failed/timeouts: locomotive.ca · mucho.global

Re-capture rig: `/tmp/capref.js` pattern (puppeteer-core, 1440×900, cookie-decline, 3 scroll
positions).
