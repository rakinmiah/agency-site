import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {JOST} from '../fonts';
import {ACC} from '../theme';

/* ── THE SENTENCE ──────────────────────────────────────────────────────────
   Four cards carrying one sentence, which is how the reference does it — M3's
   five cards are one sentence, not five statements. Ours:

     a digital marketing agency
     that builds the websites
     that builds the campaigns
     to generate you LEADS

   THE RULES, measured off the reference rather than guessed:
     · every join is a HARD CUT — one frame, no fade anywhere in that clip
     · the SIZE changes at every cut: cap heights ran 46 → 57 → 75 → 37 → 46
     · the outgoing line is still MOVING when it cuts. A cut that interrupts
       motion reads as a decision; one that interrupts stillness reads as a jump
     · no two consecutive lines enter the same way

   And every card now LEAVES a particular way too, which the first pass did not
   do — it cut from a line that was merely sitting there. ── */

const OVER = Easing.bezier(0.16, 1.42, 0.34, 1);
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

const INK = '#0A0C0D';
const TRACK = '-0.018em';

const widthOf = (text: string, size: number) =>
  measureText({text, fontFamily: JOST, fontSize: size, fontWeight: '700', letterSpacing: TRACK}).width;

/* Every card creeps upward in scale for its whole life, so the cut that ends it
   always interrupts movement. 9% across the hold — invisible as an effect, and
   the entire reason the cuts land. */
const creep = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [1, 1.09], {easing: Easing.inOut(Easing.quad), ...clamp});

/* ── CARD 1 ────────────────────────────────────────────────────────────────
   IN: letters fall from the top, one at a time, which rhymes with the G — the
   only other thing in the film that arrives by falling.

   OUT: they keep going. Rather than cutting away from a line that has come to
   rest, the letters resume falling and drop out through the bottom of frame
   while the next line rises into the space they leave. What fell, falls; the
   entrance and the exit are one idea instead of two. ── */
export const DropLine: React.FC<{
  text: string; startAt: number; landAt: number;
  exitAt: number; exitEnd: number; size: number;
}> = ({text, startAt, landAt, exitAt, exitEnd, size}) => {
  const f = useCurrentFrame();
  const chars = [...text];
  const n = Math.max(1, chars.length - 1);
  const per = (landAt - startAt) / n;
  const outPer = (exitEnd - exitAt) / n * 0.45;   // the exit is a tighter cascade
  const FALL = 9;

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{
        display: 'flex', whiteSpace: 'pre',
        fontFamily: JOST, fontWeight: 700, fontSize: size,
        letterSpacing: TRACK, color: INK,
        transform: `scale(${creep(f, startAt, exitAt).toFixed(4)})`,
      }}>
        {chars.map((ch, i) => {
          const t0 = startAt + i * per;
          const inP = interpolate(f, [t0, t0 + FALL], [0, 1], {easing: OVER, ...clamp});
          const o0 = exitAt + i * outPer;
          const outP = interpolate(f, [o0, o0 + 11], [0, 1], {easing: Easing.in(Easing.cubic), ...clamp});
          if (inP <= 0) return <span key={i} style={{opacity: 0}}>{ch}</span>;

          /* IT HAS TO CLEAR THE FRAME. This was size * 2.6 — 239px at 92pt —
             from a line sitting at the vertical centre of a 1080 frame. The
             letters dropped a quarter of the way down and stopped, which is
             exactly the "doesn't come off, it just stops" read. The distance
             has to be measured against the FRAME, not the type: 760px puts the
             cap height below the bottom edge with room to spare. */
          const OUT_TRAVEL = 760;
          const dy = lerp(inP, -size * 1.25, 0) + outP * OUT_TRAVEL;
          const prev = lerp(
            interpolate(f - 1, [t0, t0 + FALL], [0, 1], {easing: OVER, ...clamp}), -size * 1.25, 0)
            + interpolate(f - 1, [o0, o0 + 11], [0, 1], {easing: Easing.in(Easing.cubic), ...clamp}) * OUT_TRAVEL;
          const speed = Math.abs(dy - prev);

          return (
            <span key={i} style={{
              display: 'inline-block',
              transform: `translateY(${dy.toFixed(2)}px)`,
              opacity: interpolate(f, [t0, t0 + 2], [0, 1], clamp),
              filter: speed > 1.5 ? `blur(${Math.min(16, speed * 0.2).toFixed(2)}px)` : undefined,
            }}>
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ── CARDS 2 AND 3 ─────────────────────────────────────────────────────────
   IN: rises from below, into the hole card 1's letters left going down. Two
   halves of one vertical push rather than a cut between two static states.

   THE SWAP: the stroke is a SQUEEGEE. The first version substituted the word
   behind the stroke, which is why the change was easy to miss — nothing left,
   something just became something else. Now the stroke's leading edge is a wipe
   boundary: everything right of it is still "websites", and it is being SHOVED
   right as the edge advances; everything left of it is already "campaigns". You
   watch the old word get pushed out and the new one arrive behind it, and the
   stroke stays as the underline it was always going to be. One gesture, three
   jobs.

   OUT: falls away as card 4 melts in over it. ── */
export const SwapLine: React.FC<{
  prefix: string; wordA: string; wordB: string;
  inAt: number; swapAt: number; exitAt: number; exitEnd: number; size: number;
}> = ({prefix, wordA, wordB, inAt, swapAt, exitAt, exitEnd, size}) => {
  const f = useCurrentFrame();

  const preW = widthOf(prefix, size);
  const wordW = Math.max(widthOf(wordA, size), widthOf(wordB, size));
  const totalW = preW + wordW;

  const arrive = interpolate(f, [inAt, inAt + 8], [0, 1], {easing: OVER, ...clamp});
  /* ── THE EXIT WAS TOO LAZY TO BE OVERLAPPED ──────────────────────────────
     in(cubic) spends its first half going almost nowhere: 12 frames into a
     24-frame exit the card has travelled 78 of its 620px. That was survivable
     when card 4 arrived into a long hold, but the section runs a beat a card
     now — and on the frame card 4 lands, this one had moved 23px. Two legible
     lines at the same y, one of them mid-melt on top of the other.

     in(quad) still accelerates out, which is what an exit should do, but it
     commits from the first frame: 349px down by the time card 4 is read as
     arriving, which is three line-heights and reads as a hand-off. */
  const leave = interpolate(f, [exitAt, exitEnd], [0, 1], {easing: Easing.in(Easing.quad), ...clamp});

  /* 14 → 9. The card holds one beat now, and a squeegee taking 14 of those 24
     frames is the move occupying more of the card than the card spends being
     read. Nine puts the wipe boundary across the word in a beat's third, which
     is where the eye reads a shove rather than a dissolve. */
  const SWEEP = 9;
  const s = interpolate(f, [swapAt, swapAt + SWEEP], [0, 1], {easing: SNAP, ...clamp});
  const edge = s * wordW;                       // the wipe boundary, in px

  const strokeX = -totalW / 2 + preW - size * 0.14;
  const strokeW = wordW + size * 0.28;
  const strokeY = size * 0.34;
  /* BACK TO A STROKE, AND MUCH THICKER. I tried building this as a filled
     tapered shape to get variable weight, and twice it came out as a thin lens:
     a cubic never reaches its control points, so the two edges converge far more
     than the numbers suggest and most of the intended thickness evaporates.

     Looking at M3's mark again, it is not tapered at all — it is a UNIFORM
     stroke with round caps. Which is also the only construction here where the
     thickness is guaranteed rather than emergent. 0.185 → 0.32, so 35px at this
     size: heavy enough to sit under the descenders like a highlighter. */
  const thick = size * 0.32;

  /* rises from further down so it reads as the other half of card 1's fall
     rather than a small nudge into place */
  const dy = lerp(arrive, 400, 0) + leave * 620;

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{
        position: 'relative',
        transform: `translateY(${dy.toFixed(2)}px) scale(${creep(f, inAt, exitAt).toFixed(4)})`,
        opacity: interpolate(f, [inAt, inAt + 4], [0, 1], clamp) * (1 - leave * 0.3),
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', whiteSpace: 'pre',
          fontFamily: JOST, fontWeight: 700, fontSize: size,
          letterSpacing: TRACK, color: INK,
        }}>
          <span>{prefix}</span>
          {/* one slot, two words, split by the stroke's leading edge */}
          <span style={{position: 'relative', display: 'inline-block', width: wordW}}>
            {/* A HIDDEN SPACER IN NORMAL FLOW. Both words are absolutely
                positioned so neither contributes height, which collapsed this
                inline-block to zero and dropped both of them a full line below
                the baseline of "that builds the". The spacer gives the box its
                height and its baseline; the two real words sit on top of it. */}
            <span style={{visibility: 'hidden', whiteSpace: 'pre'}}>{wordB}</span>
            <span style={{
              position: 'absolute', left: 0, top: 0, whiteSpace: 'pre',
              clipPath: `inset(-40% ${Math.max(0, wordW - edge)}px -40% 0)`,
            }}>
              {wordB}
            </span>
            <span style={{
              position: 'absolute', left: 0, top: 0, whiteSpace: 'pre',
              transform: `translateX(${(s * size * 0.7).toFixed(2)}px)`,
              clipPath: `inset(-40% -60% -40% ${edge.toFixed(1)}px)`,
            }}>
              {wordA}
            </span>
          </span>
        </div>

        {/* Thick, uniform, round-capped, with a slight arc through it so it does
            not sit as a ruled line — the same construction as the mark in the
            reference. Revealed by dash offset, which a stroke supports and a
            fill does not. */}
        {s > 0.001 && (
          <svg
            width={strokeW} height={thick * 2}
            viewBox={`0 0 ${strokeW} ${thick * 2}`}
            style={{position: 'absolute', left: `calc(50% + ${strokeX}px)`, top: `calc(50% + ${strokeY}px)`}}
          >
            <path
              d={`M ${thick * 0.55} ${thick * 1.18}
                  C ${strokeW * 0.30} ${thick * 0.72}, ${strokeW * 0.64} ${thick * 1.26}, ${strokeW - thick * 0.55} ${thick * 0.80}`}
              fill="none" stroke={ACC} strokeWidth={thick} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - s}
            />
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ── CARD 4, PART ONE: the melt run backwards ──────────────────────────────
   The Google transition wound up and tore its image apart. This is that in
   reverse — the line arrives already in pieces and assembles: channel
   separation closing, rotation unwinding, blur clearing. The two halves of the
   film bracket each other, one ending by coming apart and one arriving by
   pulling itself together. ── */
export const UnwindLine: React.FC<{
  text: string; inAt: number; settleAt: number; holdTo: number; size: number; id: string;
}> = ({text, inAt, settleAt, holdTo, size, id}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [inAt, settleAt], [0, 1], {easing: Easing.out(Easing.cubic), ...clamp});
  const q = 1 - p;
  const sep = q * q * 30;
  const blur = q * q * 16;
  const on = q > 0.02;

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {on && (
        <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
          <defs>
            <filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
              <feOffset in="SourceGraphic" dx={(-sep).toFixed(1)} dy="0" result="ro" />
              <feOffset in="SourceGraphic" dx={sep.toFixed(1)} dy="0" result="bo" />
              <feColorMatrix in="ro" type="matrix" result="rc"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feColorMatrix in="SourceGraphic" type="matrix" result="gc"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feColorMatrix in="bo" type="matrix" result="bc"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              <feBlend in="rc" in2="gc" mode="screen" result="rg" />
              <feBlend in="rg" in2="bc" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}
      <div style={{
        whiteSpace: 'pre',
        fontFamily: JOST, fontWeight: 700, fontSize: size,
        letterSpacing: TRACK, color: INK,
        opacity: interpolate(f, [inAt, inAt + 4], [0, 1], clamp),
        transform: `rotate(${(q * -26).toFixed(2)}deg) scale(${(lerp(p, 1.42, 1) * creep(f, settleAt, holdTo)).toFixed(4)})`,
        filter: `${on ? `url(#${id}) ` : ''}${blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : ''}`.trim() || undefined,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

/* ── CARD 4, PART TWO: the NOISE move ──────────────────────────────────────
   Measured off the reference, f172-182 — ten frames:

     f172  the word arrives ENORMOUS, overflowing the frame, dark on the light
           ground. You can only read three of its letters
     f178  it shrinks violently, heavily motion-blurred
     f180  the ground has flipped dark and the word has flipped to white
     f182  settled, small, sitting over the next scene

   The word is the vehicle: huge on the old ground, shrinks, lands on the new
   one, and the colour inverts on the way through. It is the last word of the
   sentence AND the first thing in the section it opens. ── */
export const NoiseWord: React.FC<{
  word: string; inAt: number; landAt: number; goneAt: number; size: number;
}> = ({word, inAt, landAt, goneAt, size}) => {
  const f = useCurrentFrame();
  if (f < inAt || f >= goneAt) return null;

  const p = interpolate(f, [inAt, landAt], [0, 1], {easing: Easing.in(Easing.cubic), ...clamp});
  const prev = interpolate(f - 1, [inAt, landAt], [0, 1], {easing: Easing.in(Easing.cubic), ...clamp});
  /* ── IT USED TO SHRINK AWAY. NOW IT BLOWS THROUGH ────────────────────────
     The reference parks NOISE over the next scene as a title. There was no
     scene here to sit on, so it kept doing the one thing it was already doing —
     shrinking, past 1, down into the middle and out — because the leads cards
     needed the frame.

     Nothing needs the frame now. What follows is 192 photographs already
     cutting at thirty a second, and handing that a thirty-seven frame shrink
     means the film's energy dips to nothing on the exact frame its fastest
     passage starts. So the word HOLDS, and then in the last eleven frames it
     scales up and past the camera: the film goes THROUGH the word into what it
     means, which is also the only reading that makes the join causal — leads,
     and here is who they come from.

     It fades on a cube rather than a square so it is still legible at four
     times its size and only disappears in the last two or three frames, right
     as the images take over. */
  const BLOW = 11;
  const outAt = (fr: number) => interpolate(fr, [goneAt - BLOW, goneAt], [0, 1],
    {easing: Easing.in(Easing.cubic), ...clamp});
  const out = outAt(f);
  const sc = lerp(p, 7.2, 1) * lerp(out, 1, 6.8);
  const speed = Math.abs(sc - lerp(prev, 7.2, 1) * lerp(outAt(f - 1), 1, 6.8)) * size;
  /* the invert happens late and fast, so the word is already small when it
     changes colour — the reference flips between f178 and f180 */
  const inv = interpolate(f, [landAt - 4, landAt], [0, 1], clamp);

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{
        whiteSpace: 'pre',
        fontFamily: JOST, fontWeight: 700, fontSize: size,
        letterSpacing: '0.01em',
        color: inv > 0.5 ? '#FFFFFF' : INK,
        opacity: 1 - out * out * out,
        transform: `scale(${sc.toFixed(3)})`,
        filter: speed > 3 ? `blur(${Math.min(26, speed * 0.05).toFixed(2)}px)` : undefined,
      }}>
        {word}
      </div>
    </AbsoluteFill>
  );
};
