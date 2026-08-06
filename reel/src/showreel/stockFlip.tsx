import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {JOST} from '../fonts';
import {ACC} from '../theme';

/* ── THE STOCK FLIP ────────────────────────────────────────────────────────
   A hundred and ninety-two businesses in six seconds, too fast to examine,
   with the line flickering over the top.

   ── TWO RATES AT ONCE, WHICH IS THE WHOLE IDEA ───────────────────────────
   Measured, this track's 16ths are dead — .043-.058 against .068-.101 for the
   8ths and beats — so nothing under 12 frames lands on anything. That only
   matters for things meant to read as EVENTS, and the images are not events.
   They are a carrier: texture below the threshold of examination, which is
   exactly the brief. The TYPE holds the grid.

     image swap    2 frames    30 a second, DEAD FLAT — no exceptions
     text SIZE    12 frames    every 8th
     text COLOUR  12 frames    every 8th, offset 6 from the size
     the WORD     96 frames    every bar
     frame PUNCH  96 frames    every bar

   ── THE CATCH IS GONE ────────────────────────────────────────────────────
   Every beat used to open with one image held for 8 frames — a deliberate
   accent, four times the length of its neighbours, so the image layer had a
   pulse. Watched back it does not read as an accent, it reads as the film
   STOPPING four times a second, which is the opposite of the brief. Consistent
   means consistent: 192 shots, every one exactly 2 frames.

   The shot list is also no longer built per beat. Beat boundaries land on
   whole frames at 24, 24, 24, 23, 24… so a pattern packed into each beat left a
   1-frame remainder on every fourth one — a single-frame shot between 2-frame
   shots, which is a stutter you can see. Cutting straight through on a fixed
   2-frame stride has no boundary to round against.

   TWO FRAMES IS 33ms, which is the edge of conscious recognition — you get the
   impression of a hundred different trades without identifying any of them,
   which is the brief. It is only survivable because the grade is two-pass: the
   set holds luminance 103-109, sd 1.2, so thirty cuts a second produce almost
   no frame-to-frame luminance change at all. Ungraded it would be a strobe in
   the clinical sense, not the stylistic one.

   Every rate is an exact subdivision of the one above it. Nothing is random,
   and that is the difference between overstimulating and broken: rhythmic
   flicker reads as an edit, random flicker reads as a fault.

   ── THE GRADE IS A BUILD STEP ────────────────────────────────────────────
   See tools/grade-flip.mjs. Ungraded this set runs luminance 44 → 204, sd
   36.7. Two-pass exposure matching brings it to 103 → 109, sd 1.2 — a
   thirty-fold tightening. The second pass is what makes this rate possible: one
   pass left sd 4.7, because the look itself moves the luminance after the
   correction was computed, and at 22 cuts a second that residual error is the
   difference between a montage and a clinical strobe. */

const FPS = 60;
const BEAT = (60 / 150.1) * FPS;      // 23.984
const BAR = BEAT * 4;
/* ── FOUR BARS → TWO ──────────────────────────────────────────────────────
   Six and a half seconds of images cutting thirty times a second is past the
   point where more of it says more; it stopped being overwhelming and started
   being long. Half the run at the same rate makes the same argument and gets
   out. 96 images rather than 192 — the back half of the graded set is simply
   unused here, and is still there if the section ever grows again. */
export const FLIP_DUR = Math.round(BAR * 2);   // 192 — two bars

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);

const W = 1920, H = 1080;
const N_IMG = 192;
const TRACK = '-0.02em';

/* ── THE COPY ──────────────────────────────────────────────────────────────
   The dark section is about YOU; the white section that follows is about US.
   No "we" appears here at all — the images are 192 different businesses
   and the type names what they have in common, so that the cut to white is the
   exact moment the film turns from them to us.

   Four fragments in parallel construction, one per bar. It lands on DO, and
   "We help your business grow" completes the sentence across the cut. */
/* ── AND A SHORTER PHRASE ────────────────────────────────────────────────
   Four fragments needed four bars. Two need two, and the claim survives the
   cut intact because the half that was doing the work is the second one: at a
   hundred and ninety-two DIFFERENT TRADES, "whatever you do" is the line the
   images are actually illustrating. "Whoever you are" was about the person,
   and nothing on screen is a person.

     Whatever you do — we help your business grow. */
const FRAGS = ['WHATEVER', 'YOU DO'];

/* ── THE SHOT LIST ─────────────────────────────────────────────────────────
   A fixed stride, deliberately NOT aligned to beats. Anything that packs shots
   into a beat has to round against a boundary that is 24 frames three times out
   of four and 23 the fourth, and the leftover frame becomes a visible stutter. */
const CUT = 2;
const N_SHOT = Math.floor(FLIP_DUR / CUT);          // 96 — one image each, no repeats

/* deterministic per-shot variation — a hash, not Math.random, which would boil
   across frames because every frame is rendered independently */
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ── SIZE FLICKER ──────────────────────────────────────────────────────────
   Eight multipliers on the 8th grid, rotated by the bar so no two bars run the
   same sequence. The base size is per FRAGMENT, measured, so every word fills
   the same share of frame at multiplier 1 — otherwise "YOU DO" at the same
   point size as "WHATEVER" would read as a size change that was never intended.
   Clamped at 94% of frame width so the biggest states never crop. */
const SIZES = [1.00, 1.62, 0.70, 1.34, 0.86, 1.85, 1.12, 0.64];

const baseSize = (text: string) => {
  const probe = measureText({text, fontFamily: JOST, fontSize: 100, fontWeight: '700', letterSpacing: TRACK}).width;
  return (W * 0.60) / (probe / 100);
};
const maxSize = (text: string) => {
  const probe = measureText({text, fontFamily: JOST, fontSize: 100, fontWeight: '700', letterSpacing: TRACK}).width;
  return (W * 0.94) / (probe / 100);
};

/* ── COLOUR FLICKER ────────────────────────────────────────────────────────
   Twelve states across the spectrum, changing every 8th and offset six frames
   from the size changes — so something about the type changes every SIX frames
   without both axes moving at once.

   This was three states and the brand blue, which is not what "colourful"
   means. The images are graded cool and desaturated to sd 1.2, so saturated
   type of any hue is the only colour on screen and all of it sings.

   `diff` is a difference blend — the type inverts
   against whatever is behind it, so it is always legible and its colour is
   driven by the footage itself. It is the only state that cannot be predicted
   from the type alone, which is why it is in the cycle. */
const COLS: {c: string; blend?: React.CSSProperties['mixBlendMode']}[] = [
  {c: '#FFFFFF'},
  {c: '#2743F0'},                        // electric blue
  {c: '#F0AE2E'},                        // amber
  {c: '#FF2E63'},                        // hot pink
  {c: '#2FBF71'},                        // green
  {c: '#F5FF3D'},                        // acid yellow
  {c: '#B44BFF'},                        // violet
  {c: '#FFFFFF', blend: 'difference'},
  {c: '#00E5D0'},                        // cyan
  {c: '#FF6B1A'},                        // orange
  {c: ACC},                              // the brand's own blue, once per cycle
  {c: '#0A0C0D'},                        // black
];
/* stride 5 through a list of 12 — coprime, so it visits every colour before
   repeating any, and consecutive states are far apart in hue instead of
   sweeping the spectrum in order. A sweep reads as a gradient; jumps read as
   flicker. */
const colAt = (f: number) => COLS[(Math.floor((f + 6) / 12) * 5) % COLS.length];

export const StockFlip: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame();

  const si = Math.min(N_SHOT - 1, Math.floor(f / CUT));
  const img = si % N_IMG;
  const nextImg = (si + 1) % N_IMG;

  /* ── FRAMING IS FIXED PER SHOT, NEVER ANIMATED ────────────────────────
     A zoom sampled across two frames is not a move, it is two slightly
     different stills, and at this rate that is judder rather than motion. Each
     shot gets ONE framing, hashed from its index, so consecutive images differ
     in scale and position and the variety comes from the cutting.

     The scale range is 1.04-1.13 and it is now genuinely sharp: the source is
     2560 wide, so at the deepest crop the frame is still showing 2265 source
     pixels in 1920 — a downscale. It used to be a 525px file blown up to 1920
     BEFORE any zoom, which is what made these look soft. The zoom exposed that;
     it never caused it. */
  const zoom = 1.04 + rnd(img, 3) * 0.09;
  const ox = (rnd(img, 5) - 0.5) * 54;
  const oy = (rnd(img, 7) - 0.5) * 38;

  /* the frame takes the bar line — 3.5% and 9px, decaying over eight frames.
     Small enough to feel rather than see, which is the point. */
  const bar = Math.floor(f / BAR);
  const sinceBar = f - Math.round(bar * BAR);
  const kick = Math.max(0, 1 - sinceBar / 8) ** 2;

  /* ── THE TYPE ──────────────────────────────────────────────────────────── */
  const frag = FRAGS[Math.min(FRAGS.length - 1, bar)];
  const eighth = Math.floor(f / (BEAT / 2));
  const size = Math.min(
    maxSize(frag),
    baseSize(frag) * SIZES[(eighth + bar * 3) % SIZES.length]
  );
  const col = colAt(f);

  /* the word ARRIVES on the bar — a content change, so it is a cut landing on
     the exact frame, with a fast overshoot behind it as a settle rather than as
     the arrival */
  const wordIn = interpolate(f, [Math.round(bar * BAR), Math.round(bar * BAR) + 7],
    [1.14, 1], {easing: SNAP, ...clamp});

  /* one accent frame on each bar line. Four in six seconds is 0.6/sec, well
     under the three-a-second the flash guidance is built around — which is the
     reason it is on bars only and not on beats. */
  const flash = sinceBar < 2 && bar > 0 ? 0.5 : 0;

  /* the swipe to white — a placeholder for the join into the M3 section, so
     this run resolves instead of stopping dead */

  return (
    <AbsoluteFill style={{background: '#08090B', overflow: 'hidden'}}>
      <AbsoluteFill style={{
        transform: `scale(${(1 + kick * 0.035).toFixed(4)}) translate(${(kick * 9).toFixed(1)}px, ${(kick * -6).toFixed(1)}px)`,
      }}>
        <AbsoluteFill style={{
          transform: `scale(${zoom.toFixed(4)}) translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`,
        }}>
          <Img src={staticFile(`flip/${String(img).padStart(3, '0')}.jpg`)}
            style={{width: W, height: H, objectFit: 'cover'}} />
        </AbsoluteFill>
        {/* the next frame's image, held at zero opacity purely so the browser
            has it decoded before it is needed */}
        <Img src={staticFile(`flip/${String(nextImg).padStart(3, '0')}.jpg`)}
          style={{position: 'absolute', width: 2, height: 2, opacity: 0}} />

        {flash > 0 && <AbsoluteFill style={{background: ACC, opacity: flash}} />}

        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{
            fontFamily: JOST, fontWeight: 700, fontSize: size,
            letterSpacing: TRACK, lineHeight: 1,
            color: col.c, mixBlendMode: col.blend,
            transform: `scale(${wordIn.toFixed(3)})`,
            whiteSpace: 'pre',
            filter: col.blend ? undefined : 'drop-shadow(0 0 34px rgba(0,0,0,.55))',
          }}>{frag}</div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* the swipe to white is gone — the join is now the meander sweeping
          CardGround in, driven from Open.tsx so it can reveal the real ground
          rather than a flat colour approximating it */}


      {music && <Audio src={staticFile('music/showreel-2bar.wav')} startFrom={959} volume={0.88} />}
    </AbsoluteFill>
  );
};
