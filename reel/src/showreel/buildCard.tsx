import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {JOST} from '../fonts';
import {GRAIN_URL} from '../theme';

/* ── THE CARD ──────────────────────────────────────────────────────────────
   Built against the M3 reference frame by frame rather than by impression.

   THE GROUND IS NOT WHITE. Sampled off the reference at f112, it runs #747A7C
   at top-left to #DFEDF0 at mid-right — a lit grey surface with the light coming
   from the right and a slight cool cast (U +2, V -6 against neutral). Reading it
   as "white" and building flat white would have thrown away the whole reason it
   looks photographed instead of rendered.

   THE TYPE MOVE. The reference gives each line a different entrance — the first
   types on character by character at ~40 chars/sec, the second scales up, and
   the third arrives massively tracked out and light, holds about 12 frames, then
   collapses to tight and heavy in roughly 3. That third one is the strongest and
   it is the one worth taking.

   Our card already had a letter-spacing animation and it ran BACKWARDS: 0.02em
   spreading to 0.10em across 48 frames. Spreading is a dissipating gesture and
   it is most of why the card read as plumped-on. This collapses inward instead,
   and gains weight doing it, which needs both ends of Jost's axis — Anton could
   never have done the move at all, being a single weight.

   The words arrive one per beat in the wide state, then the WHOLE LINE resolves
   on the next downbeat. Building the tension across four beats and releasing it
   on the bar is what the reference does not have and what this film is for.

   The ground stays up through the site build that follows, so the website
   assembles on the same surface rather than cutting to black. ── */

const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const SETTLE = Easing.out(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

export const CARD_WORDS = ['We', 'build', 'the', 'website'];

/* The lit surface. A gradient this wide WILL band on a 4K flat panel, so the
   grain is structural here, not a texture flourish. */
export const CardGround: React.FC<{grain?: number}> = ({grain = 0.05}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{
        background:
          'radial-gradient(118% 88% at 74% 67%, #E8F1F3 0%, #CDD7D9 32%, #A8B2B4 62%, #7C8486 100%)',
      }} />
      {/* the raking falloff into the top-left corner, measured at #747A7C */}
      <AbsoluteFill style={{
        background: 'linear-gradient(128deg, rgba(24,30,32,.30) 0%, rgba(24,30,32,0) 46%)',
      }} />
      <AbsoluteFill style={{
        backgroundImage: `url("${GRAIN_URL}")`, backgroundRepeat: 'repeat',
        backgroundPosition: `${(f * 37) % 240}px ${(f * 61) % 240}px`,
        opacity: grain, pointerEvents: 'none',
      }} />
    </>
  );
};

export const CARD_TEXT = CARD_WORDS.join(' ');   // 'We build the website'

/* Per-character times with a little jitter, so it reads as typed rather than
   as a progress bar. The jitter stays under half the gap so the order can never
   invert. */
const charTimes = (a: number, b: number) => {
  const per = (b - a) / (CARD_TEXT.length - 1);
  return [...CARD_TEXT].map((ch, i) =>
    a + i * per + (((ch.charCodeAt(0) * 37) % 9) / 9 - 0.5) * Math.min(1.6, per * 0.5));
};

export const CardLine: React.FC<{
  typeA: number;          // first character
  typeB: number;          // last character — put this on a beat
  exitAt?: number;        // when the line clears for the build
}> = ({typeA, typeB, exitAt}) => {
  const f = useCurrentFrame();

  /* ── TYPED, IN ONE WEIGHT ────────────────────────────────────────────────
     Two versions preceded this. The words arrived whole, one per beat, which was
     four blocks being placed rather than a sentence being written. Then it typed
     in a thin face and collapsed to heavy on the downbeat — a good move borrowed
     from the reference, but it made the card a two-part performance when the line
     only has one thing to say, and it left the finished line sitting for two
     seconds waiting for its own punchline.

     So: one weight, typed, and the typing occupies the card instead of preceding
     a hold. It also puts this in the same voice as the opening hook, which is
     also typed — the film states the problem and the answer the same way. */
  const times = charTimes(typeA, typeB);
  const shown = times.filter((t) => t <= f).length;
  const text = CARD_TEXT.slice(0, shown);

  const exit = exitAt === undefined
    ? 0
    : interpolate(f, [exitAt - 8, exitAt + 4], [0, 1], {easing: SETTLE, ...clamp});

  /* No caret. It was drawing attention to the mechanism rather than the line,
     and it forced the type to move at a speed a cursor makes sense at. Gone
     here and in the opening, and not coming back in later typed sections. */
  return (
    <AbsoluteFill style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 1 - exit,
      transform: `scale(${lerp(exit, 1, 1.04)})`,
    }}>
      <div style={{
        whiteSpace: 'pre',
        fontFamily: JOST, fontWeight: 700, fontSize: 96,
        letterSpacing: '-0.018em', color: '#0A0C0D',
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
