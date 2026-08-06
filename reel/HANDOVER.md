# Loomwork reel — handover

Written 2026-08-06, Windows laptop → MacBook. Everything needed to continue is in
this repo; renders and `node_modules` are not versioned and rebuild locally.

```
git clone https://github.com/rakinmiah/agency-site.git
cd agency-site/reel
npm install
npx remotion render Open out/preview.mp4 --concurrency=8
```

Mac prerequisites: Node 20+, ffmpeg (`brew install ffmpeg` — every measurement
script shells out to it). Fonts self-load via `@remotion/google-fonts` (Jost).
For the WebGL comps pass `--gl=angle` on renders (works on macOS too).

---

## 1 · What this is

A 1920×1080 · 60fps Remotion film for the Loomwork site, timed to
`public/music/showreel-2bar.wav` — **150.1 BPM**. The whole film sits on a beat
grid:

```
BEAT  = (60 / 150.1) * 60      // 23.984 frames
beatF(n) = Math.round(n * BEAT) // bar = 95.936 (4 beats)
```

Main composition: `Open` in `src/showreel/Open.tsx`, registered in
`src/Root.tsx`. Current length **1823 frames (30.4s)**, growing to a planned
**2303 (38.4s)** as the last sections land.

### Timeline as built

| frames      | section                                          | file |
|-------------|--------------------------------------------------|------|
| 0–240       | intro / "It's hard." scramble → search cut       | Open.tsx |
| 240–780     | the search, page repaints, URL storm, Google G   | Open.tsx, urlStorm.tsx |
| 780–959     | card section ("a digital marketing agency…"), LEADS | Open.tsx, lines.tsx |
| 936–959     | join: LEADS becomes a window into the flip       | Open.tsx (PORTAL_A) |
| 959–1151    | stock flip "WHATEVER / YOU DO", 96 shots @ 2f    | stockFlip.tsx |
| 1134–1151   | join: meander sweeps CardGround in               | Open.tsx (MEANDER_A) |
| 1151–1535   | word flip "We'll help your business ___" → grow  | wordFlip.tsx |
| 1535–1823   | **statistics (IN FLUX — see §3)**                | stats.tsx, platformUI.tsx |
| 1823–1919   | exit transition — **NOT BUILT** (design agreed, §4) |
| 1919–2303   | mark / endcard — **NOT BUILT**                   |

Planning constants live at the top of Open.tsx. Note: `MARK_AT_PLAN` currently
evaluates to 1823 because `STATS_DUR` went back to 288 — the mark actually
lands at 1919 after the exit bar. Fix when the exit is built.

Last full render was `loomwork-v19.mp4` (28→31MB H.264). `out/` is gitignored,
so render fresh — **current code has moved past v19** (poster screens, §3).

---

## 2 · The working method (this is the important part)

Three practices carried this project. Keep them.

**Measure, don't eyeball.** Every pacing claim gets verified numerically via
ffmpeg → raw pixels → node. The standard sweeps:

*Photosensitivity* (WCAG: ≤3 luminance changes >20/255 in any 1s window) —
run after every render:

```bash
node -e "
const {execSync}=require('child_process');
const b=execSync('ffmpeg -v error -i out/FILM.mp4 -vf \"scale=64:36\" -f rawvideo -pix_fmt gray -',{maxBuffer:1e9,encoding:'buffer'});
const N=64*36, lum=[];
for(let i=0;i+N<=b.length;i+=N){let s=0;for(let j=0;j<N;j++)s+=b[i+j];lum.push(s/N);}
let worst=0,at=0;
for(let i=0;i<lum.length-60;i++){let c=0;for(let j=i+1;j<=i+60;j++) if(Math.abs(lum[j]-lum[j-1])>20)c++; if(c>worst){worst=c;at=i;}}
console.log('worst 1s window:',worst,'at frame',at,'(threshold 3)');
for(let i=1;i<lum.length;i++){const d=Math.abs(lum[i]-lum[i-1]); if(d>20) console.log('  f'+i,'Δ'+d.toFixed(1));}"
```

Current whole-film status: **3 events in the worst window (at frame 899) — at
the limit, not under it.** The film's known events: f168, f192, f240, f781,
f911, f922, f959, f1055, f1057, f1139, f1343, f1535. Anything new that lands
inside a second of an existing event needs re-sweeping.

*Cut-rate* (how fast a section actually cuts, to compare against references):
same pipeline but per-frame mean-abs-diff on RGB, peaks >14 collapsed within
3 frames. M3's reference measures **median 14 frames between events**; the
current statistics section measures 12.

*Music* — `node tools/beats.mjs <firstBeat> <lastBeat>` prints per-half-beat
low/mid/high band peaks. This is how sections get their internal grids: the
low band marks the kicks. Known anchors: every bar line in 64–80 is a kick;
the biggest hits in that stretch are beat 66.5 (.780) and 76.5 (.839).

**Read references at full rate.** When Rakin sends a reference clip, extract
EVERY frame, crop to the element that matters, and page through tiles —
sampling has produced three wrong rebuilds. Also measure it: per-frame badge
radii, cut frames via mean-RGB deltas. The M3 reference
(`IMG_2735 (2).mov`, phone screen recording) was measured as: element at
`crop=888:379:0:983`; badge settles at r=104 (55% of element height →
**r=300** at 1080p); the open **grows → snaps to 0.55× in ONE frame while
flipping colour → regrows**; bursts run rim-to-full-frame in 4–8 frames with
the badge untouched on top.

**Verify by looking at frames.** After every render: extract stills, tile
them, look. The Read-a-contact-sheet habit caught every layout collision this
project has had.

### The luminance ladder (flat-cut safety)

Fast flat colour cuts are safe when consecutive colours are close in
LUMINANCE even if far apart in hue — "the changes you see are hue; the
changes that get counted are brightness." The word flip's grounds are ordered
11 → 78 → 93 → 107 → 122 → 139 → 190 for exactly this reason. Reorder them
carelessly and the section strobes.

### Circle/iris transitions

Ease radius and the area explodes (r²). For a circle growing INSIDE a shape,
`Math.sqrt(p)` linearises area. For a circle crossing a full FRAME, even
area-linear is wrong (most late growth is off-screen) — pace on **frame
coverage**: see `burstR()` in stats.tsx, which inverts a sampled
distance-distribution so each frame adds equal visible share.

---

## 3 · The statistics section — where it stands

The most-iterated section (seven rebuilds). Current build, per the measured
M3 spec Rakin approved:

- **Open** (1535–1607): dot grows in FLOOD_SKY (sky is luminance-invisible
  against paper — the stamp measures ~4/255; reversed it would be 28),
  `£2,000,000+` appears inside at 1583, **the snap** at 1595 (halves + flips
  to near-black in one frame, on the .780 kick), settles r=300 by 1607.
- **21 bursts, one per half-beat (12f)**: full-screen platform surfaces fire
  out of the badge rim past the frame corner in 6 frames (10 across the two
  big contrast steps). Coverage-linear. Badge never moves during a burst.
- **Figures**: £2,000,000+ / 30+ / 50+ swap inside the badge on the bar
  lines at 1535/1631/1727 (locals 24/96/192 relative to STATS_AT).
- **Screens** (`platformUI.tsx`): 9 of them, 3 per platform —
  **UI language blown up as posters** (1740px search field, 250px reactions,
  430px story rings on brand-colour grounds), NOT page mockups. Three earlier
  builds failed as "amateur" precisely because they were drawn at real UI
  scale — that's a screenshot, not a frame of film.

**Verified**: section flash events = 0; cut-rate median 12f vs M3's 14.

**Open items on this section — Rakin's explicit feedback:**

1. **The ad copy register is wrong.** He does not want the
   plumber/boiler/"24/7 call out" emergency-trade messaging anywhere in the
   showreel. All copy in platformUI.tsx (Kestrel Plumbing, Marlow Heating,
   queries, headlines) is my invented placeholder and needs replacing with
   whatever register he chooses. **Do not reuse real firms' names** — same
   rule as the URL storm (all its businesses/domains/reviews are deliberately
   fictional; phone numbers use Ofcom's 07700 900000–900999 fiction block).
2. **The poster screens were only ever seen as stills.** Never approved in
   motion. Render 1530–1822 and judge before building further.
3. He was mid-search for **his own reference clips** for this section when
   the AE/tooling conversation started. Expect new references; read them at
   full rate before building.

---

## 4 · Agreed-but-unbuilt

**Exit transition (1823–1919)** — design agreed from the M3 clip's own exit
(measured at its f200–214): a cream/paper circle expands from centre clearing
the frame, then the next scene opens from a dot inside a circular window over
~4 frames. Ends on the endcard. Build only after §3 is signed off.

**Endcard (1919–2303)** — nothing designed. The film's audio needs a hard cut
+ short fade at the out point (the track never resolves — RMS sits flat
0.24–0.38 to 41.5s then stops).

**Word-flip gap**: "We'll help your business" is NOT on screen during the
word run — it establishes over the first ~50 frames of the section then
flies out (`wordFlip.tsx`, `hand`), and the words play alone. Rakin asked for
it to stay "like the M3 clip". Keeping it means re-laying-out the section
(prefix + word can't share the centre), which he was going to art-direct.

---

## 5 · WebGL — installed, proven, three hard-won gotchas

`three@0.171`, `@remotion/three@4.0.500`, fiber 9.7 are in package.json.
Two comps registered in Root.tsx:

- **ShaderDemo** (`src/showreel/shaderDemo.tsx`) — the capability proof on
  this film's own material: noise-warped SDF burst edge with chromatic
  aberration + bloom ring, live fbm flow-field grounds, badge as lit extruded
  geometry, per-pixel grain. Render with `--gl=angle`. Rakin has seen and
  liked it; the intent is to fold these techniques into the statistics
  section once its design settles (tuned well down — the demo is
  deliberately loud).
- **GlDebug** (`src/showreel/gldebug.tsx`) — 3-plane GL smoke test. Keep it;
  it answers "is the GL pipeline broken or is it my shader" in one still.

The gotchas (all cost real time; all documented in-file):

1. **`pow(x, 2.0)` with negative x is UNDEFINED in GLSL** → NaN on ANGLE →
   NaN poisons every pixel it touches (`NaN*0` is still NaN) → black frames.
   Square by multiplication. Same class: inverted-edge `smoothstep(hi, lo, x)`
   is spec-undefined — write `1.0 - smoothstep(lo, hi, x)`.
2. **r3f clones a JSX-prop `uniforms` object at material construction.**
   Post-mount mutations of your source object never reach the GPU. Construct
   the `THREE.ShaderMaterial` yourself in `useMemo` and mutate
   `mat.uniforms.*.value` — then it's genuinely live.
3. **`remotion still` mounts AT the target frame**, so mount-time-captured
   values look "animated" across two stills and mask bug #2 completely.
   Test animation with a rendered RANGE, never two stills.

Also: `useCurrentFrame()` works INSIDE ThreeCanvas (Remotion bridges its
contexts); sin-based hash functions band at screen-scale coords on ANGLE —
use the sinless `fract`/`dot` hash already in shaderDemo.tsx.

### Tooling verdicts from the AE detour

- **After Effects 2020 on the Windows laptop is an orphaned install** —
  2.7GB on disk, runs from the raw exe, but no Start-menu/uninstall/licence
  registration and `amtlib.dll` missing because **the Adobe subscription is
  dead**. ExtendScript pipeline was proven (script built a comp with 3D text,
  motion blur, Bulge, trim-path expression, saved an .aep) but aerender can't
  licence-check. Decision: **not worth re-subscribing for this project** —
  the bottleneck was never the tool. If he ever wants to art-direct in AE
  himself, that's the reason to buy it, and driving it by script from Claude
  works.
- **Cinema 4D R21 + R22 are installed AND licensed on the Windows laptop**
  (R21 = last perpetual licence; Commandline.exe boots clean). Fully
  scriptable in Python, headless. Windows-only asset — check what exists on
  the Mac before counting on it.

---

## 6 · Compliance / safety register (standing decisions)

- **Photosensitivity**: threshold 3 changes >20/255 per any 1s window. Film
  is AT 3 (frame-899 window). Sweep after every change; never ship over.
- **All business names, domains, reviews, ad copy are invented** — putting
  real firms' names into mock ads/results "would be saying something about
  real firms." Phone numbers: Ofcom fiction block only.
- **Real platform trademarks** (Google, Meta/Facebook, Instagram, WhatsApp,
  Gmail) are used knowingly — Rakin's call on a client-facing piece. The
  ad-platform logos next to a spend figure lean toward implying partner
  status; flagged, his call.
- **Statistics shown are the site's own** (£2,000,000+ / 50+ / 30+, captions
  verbatim from index.html's proof rail). No invented performance figures;
  engagement counts in mock UI stay small and decorative.
- **`public/flip/` (193 imgs) is uncurated Pexels stock**: known issues —
  identifiable faces (e.g. 104, 142), a legible taxi number plate (130), a
  real record sleeve with artist name (122), branded hi-vis. Indices 108,
  138, 100, 112, 134 were eyeballed clean. Human pass required before
  client-facing use. `tools/refetch-flip.mjs` re-fetches (w=3840 for the 4K
  master — not yet done).
- **The Pexels key is NOT in the repo** (`reel/.env.local`, gitignored).
  It was used from source during fetching with Rakin's "use it, I'll rotate
  after" — **rotation is still owed**. Recreate `.env.local` on the Mac only
  if refetching.
- **Higgsfield commercial rights** for generated assets were never verified
  for his plan — open terms question if that route is ever used.

---

## 7 · Site workstream (untouched this session, still open)

- Contact form has a `⚠ LAUNCH BLOCKER` comment — no submit handler.
- `About` nav link is `href="#"`.
- Reel integration targets: `out/web/` pattern from v13 era (H.264 CRF 23
  ~28MB + 720p + AV1 + poster.webp). File-size/SEO question was answered:
  lazy-load below the fold, poster first, no autoplay audio.

## 8 · Continuing with Claude on the Mac

Open Claude Code in `agency-site/` (or `agency-site/reel/`). `reel/CLAUDE.md`
points here and carries the hard rules. The render→measure→look loop is:

```bash
npx remotion render Open out/check.mp4 --frames=START-END --concurrency=8
# flash sweep (§2), then extract + tile stills and LOOK before iterating
```

Session memory (Windows machine) also holds: read reference clips at full
rate; heatmap-first selection lessons. Those learnings are duplicated here so
nothing depends on that machine.
