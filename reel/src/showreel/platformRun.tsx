import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FRAMES} from './platformFrames';

/* ── THE LEADS BURST ───────────────────────────────────────────────────────
   Fifteen independently designed frames, each composed for 1920x1080 in its own
   right. There is no shared canvas and no camera travelling across a surface: a
   "camera move" here is a compositing effect that SELLS continuity between two
   setups that have none, exactly like a whip-pan cut in film.

   ── ONE SECTION, NOT FOUR ───────────────────────────────────────────────
   It used to be a TOUR: four WhatsApp frames, then four Instagram, then four
   email, then three call, two beats each, twelve and a half seconds. Every
   platform introduced, explored and handed over — which is how you present a
   feature list, not how you show a business being buried in enquiries.

   The frames are now INTERLEAVED. The first four cuts are one of each platform,
   so inside a second the claim is made and never has to be made again: they are
   arriving from everywhere, at the same time. No two consecutive frames are the
   same platform anywhere in the run.

   Which also kills three devices. The green flood, the gradient rule and the
   white slam existed to mark platform boundaries, and the icon strikes rode
   them. There are no platform boundaries left. You cannot announce a section
   boundary that does not exist.

   ── AND IT ACCELERATES ──────────────────────────────────────────────────
   768 frames → 288. Eight cuts at a beat, six at a half beat, the last held a
   beat to land it. That is the trade flip's own grammar — the film has already
   taught the audience that a rate step means this is running away — pointed at
   the answer instead of at the problem.

     run    0-192   8 frames   24   one a beat
     run  192-264   6 frames   12   the flood
     run  264-288   1 frame    24   CL_Missed, landing

   Every cut lands on a beat: absolute 959, 983, 1007 … 1151, 1163, 1175 …
   1223, out at 1247. The rate step at 192 is beat 48.

   ── EVERY FRAME STILL PLAYS ITS WHOLE BUILD ─────────────────────────────
   Each frame animates its own content — bubbles land, digits count, rows
   cascade, a missed-call counter climbs 1 to 6 — on a timeline written for a
   two-beat hold. Handing those 24 frames or 12 shows them half-built, which is
   the exact defect that made an earlier version of this section look broken:
   CL_Number's "mobile" label does not start until t = 24, WA_Typing's third dot
   until t = 30, CL_Missed only reaches two of its six calls.

   So a frame's build clock is SCALED TO ITS SLOT — 48 / hold, so 2x at a beat
   and 4x at a half beat. Every frame plays its complete animation exactly once
   no matter how long it is on screen, and at the fast rate that build lands as a
   slam, which is what the flood wants anyway.

   The one thing that must NOT scale is the cyclic pulses — t % 3, t % 4, t % 5
   and t % 26 on the badges, the counters and the ring. Those are heartbeats, and
   4x would put them at 40-50Hz, which is a strobe. Every frame therefore takes
   a second clock, `raw`, that is real frames, and the pulses run on that. ── */

const FPS = 60;
const BEAT = (60 / 150.1) * FPS;
const BAR = BEAT * 4;

/* WA_One, IG_One, CL_Ring, ML_Types | WA_Typing, IG_Accept, ML_Slam, CL_Number
   | WA_Stack, IG_Field, ML_Cascade, WA_Badge, IG_Count, ML_Count | CL_Missed */
const ORDER = [0, 4, 12, 8, 1, 5, 9, 13, 2, 6, 10, 3, 7, 11, 14];
const HOLDS = [24, 24, 24, 24, 24, 24, 24, 24, 12, 12, 12, 12, 12, 12, 24];
const STARTS = HOLDS.map((_, i) => HOLDS.slice(0, i).reduce((a, b) => a + b, 0));
export const PLATFORM_RUN_DUR = HOLDS.reduce((a, b) => a + b, 0);   // 288
const RATE_STEP = STARTS[8];                                        // 192
const LAST = HOLDS.length - 1;
/* the hold every frame's internal timeline was written against */
const REF_HOLD = 48;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const WHIP_E = Easing.bezier(0.7, 0, 0.16, 1);      // slow out, violent middle, hard land
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

/* which slot is on screen, and how long it has been there */
const slotAt = (f: number) => {
  let i = LAST;
  while (i > 0 && f < STARTS[i]) i--;
  return {i, t: f - STARTS[i]};
};

/* a 12-frame slot cannot carry an 11-frame move — the frame would be in transit
   for its entire life. Each join takes its length from the shorter of the two
   holds it sits between. */
const moveDur = (i: number) =>
  (Math.min(HOLDS[i - 1], HOLDS[i]) >= 24 ? {into: 4, out: 7} : {into: 2, out: 4});

/* ── THE MOVES ─────────────────────────────────────────────────────────────
   Each returns a transform pair for the outgoing and incoming frame plus the
   blur each should carry, placed so the incoming frame is READ as landing on
   the beat rather than starting on it. */
type Move = 'push' | 'pull' | 'whipL' | 'whipR' | 'whipU' | 'whipD' | 'punch';

/* fourteen joins, no two consecutive the same. A push repeated four times is a
   transition style; a push, a whip, a punch and a pull is an edit. */
const MOVES: Move[] = [
  'push', 'whipL', 'punch', 'pull', 'whipR', 'punch', 'whipD', 'push',
  'whipU', 'punch', 'whipR', 'push', 'punch', 'whipL',
];

const move = (m: Move, p: number) => {
  /* p is 0 at the start of the move, 1 when it has landed */
  const out: React.CSSProperties = {};
  const inc: React.CSSProperties = {};
  const blur = (k: number) => Math.min(30, k * Math.sin(p * Math.PI) * 30);

  switch (m) {
    case 'push':
      out.transform = `scale(${lerp(p, 1, 1.85).toFixed(3)})`;
      out.opacity = 1 - p;
      out.filter = `blur(${blur(0.6).toFixed(1)}px)`;
      inc.transform = `scale(${lerp(p, 0.62, 1).toFixed(3)})`;
      inc.filter = `blur(${blur(0.5).toFixed(1)}px)`;
      break;
    case 'pull':
      out.transform = `scale(${lerp(p, 1, 0.5).toFixed(3)})`;
      out.opacity = 1 - p;
      out.filter = `blur(${blur(0.5).toFixed(1)}px)`;
      inc.transform = `scale(${lerp(p, 2.1, 1).toFixed(3)})`;
      inc.filter = `blur(${blur(0.6).toFixed(1)}px)`;
      break;
    case 'whipL':
    case 'whipR': {
      const d = m === 'whipL' ? -1 : 1;
      out.transform = `translateX(${(p * 2100 * d).toFixed(0)}px)`;
      inc.transform = `translateX(${((1 - p) * -2100 * d).toFixed(0)}px)`;
      out.filter = inc.filter = `blur(${blur(1).toFixed(1)}px)`;
      break;
    }
    case 'whipU':
    case 'whipD': {
      const d = m === 'whipU' ? -1 : 1;
      out.transform = `translateY(${(p * 1300 * d).toFixed(0)}px)`;
      inc.transform = `translateY(${((1 - p) * -1300 * d).toFixed(0)}px)`;
      out.filter = inc.filter = `blur(${blur(0.9).toFixed(1)}px)`;
      break;
    }
    case 'punch':
      /* a hard cut with a scale kick on the incoming — no travel at all, which
         is what makes it read as a cut among all the moves */
      out.opacity = p < 0.5 ? 1 : 0;
      inc.opacity = p < 0.5 ? 0 : 1;
      inc.transform = `scale(${(1 + 0.09 * Math.max(0, 1 - (p - 0.5) * 6)).toFixed(3)})`;
      break;
  }
  return {out, inc};
};

/* ── THE ONE DEVICE LEFT ───────────────────────────────────────────────────
   Three section joins became one rate step. Two white frames on the frame the
   cuts halve — the same job the trade flip's rate steps do, which is to make an
   acceleration something you SEE happen rather than something you work out
   afterwards. */
const RateHit: React.FC<{f: number}> = ({f}) => {
  const d = f - RATE_STEP;
  if (d < 0 || d >= 3) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: d < 2 ? 1 : 0.35, pointerEvents: 'none'}} />;
};

export const PlatformRun: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame();
  const {i, t} = slotAt(f);

  /* build clock, scaled to the slot; `raw` stays in real frames for the pulses */
  const tOf = (slot: number, local: number) => local * (REF_HOLD / HOLDS[slot]);

  const dIn = i > 0 ? moveDur(i) : null;
  const dNext = i < LAST ? moveDur(i + 1) : null;
  const inMove = dIn !== null && t < dIn.out;
  const nextMove = dNext !== null && t >= HOLDS[i] - dNext.into;

  const Cur = FRAMES[ORDER[i]];
  const Prev = FRAMES[ORDER[Math.max(0, i - 1)]];
  const Next = FRAMES[ORDER[Math.min(LAST, i + 1)]];

  let body: React.ReactNode;
  if (inMove && dIn) {
    const D = dIn.into + dIn.out;
    const p = interpolate(t + dIn.into, [0, D], [0, 1],
      {easing: MOVES[i - 1] === 'punch' ? SNAP : WHIP_E, ...clamp});
    const m = move(MOVES[i - 1], p);
    body = (
      <>
        <AbsoluteFill style={m.out}><Prev t={tOf(i - 1, HOLDS[i - 1] + t)} raw={HOLDS[i - 1] + t} /></AbsoluteFill>
        <AbsoluteFill style={m.inc}><Cur t={tOf(i, t)} raw={t} /></AbsoluteFill>
      </>
    );
  } else if (nextMove && dNext) {
    const D = dNext.into + dNext.out;
    const p = interpolate(t - (HOLDS[i] - dNext.into), [0, D], [0, 1],
      {easing: MOVES[i] === 'punch' ? SNAP : WHIP_E, ...clamp});
    const m = move(MOVES[i], p);
    body = (
      <>
        <AbsoluteFill style={m.out}><Cur t={tOf(i, t)} raw={t} /></AbsoluteFill>
        <AbsoluteFill style={m.inc}><Next t={tOf(i + 1, t - HOLDS[i])} raw={t - HOLDS[i]} /></AbsoluteFill>
      </>
    );
  } else {
    body = <AbsoluteFill><Cur t={tOf(i, t)} raw={t} /></AbsoluteFill>;
  }

  /* the frame takes each bar — 2.4% and a small kick, decaying over seven
     frames. Felt rather than seen. The rate step is felt properly. */
  const sinceBar = f - Math.round(Math.floor(f / BAR) * BAR);
  const kick = Math.max(0, 1 - sinceBar / 7) ** 2;
  const hit = f >= RATE_STEP && f < RATE_STEP + 9
    ? Math.max(0, 1 - (f - RATE_STEP) / 9) ** 2 : 0;

  return (
    <AbsoluteFill style={{background: '#04060A', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${(1 + kick * 0.024 + hit * 0.05).toFixed(4)})`}}>
        {body}
      </AbsoluteFill>
      <RateHit f={f} />
      {music && <Audio src={staticFile('music/showreel-2bar.wav')} startFrom={959} volume={0.88} />}
    </AbsoluteFill>
  );
};
