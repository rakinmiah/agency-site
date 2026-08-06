import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {JOST} from '../fonts';
import {CardGround} from './buildCard';
import {ACC, ACC_DARK, FLOOD_BLUE, FLOOD_CORAL, FLOOD_GREEN, FLOOD_ROSE, FLOOD_SKY, FLOOD_VIOLET} from '../theme';

/* ── "WE'LL HELP YOUR BUSINESS ___" ────────────────────────────────────────
   ── THE COLOUR CHANGES ARE FLAT CUTS ────────────────────────────────────
   Every version of this section painted the colour on — two bands, then one
   fat capsule, then a mask. All of it was wrong, and the reference says so on
   a single pair of frames: f198 is coral, f199 is yellow, and the mark lying
   across it does not move an inch. It just recolours.

   What I kept reading as "the colour painting itself on" was the MARK being
   drawn. The ground was cutting underneath it the whole time. So there is no
   paint here any more: one frame coral, next frame gold.

   That is also what fixes the pace. A 16-frame sweep against a 36-frame hold
   meant the frame was in transition half the time it was on a colour.

   ── EXCEPT THE FIRST, WHICH OPENS ───────────────────────────────────────
   The move from paper into black is the section's biggest structural beat, so
   it gets a circle out of the centre rather than a cut. One gesture, used once.

   ── THE GRID ────────────────────────────────────────────────────────────
     rel  36   beat 49.5   the circle opens, black, words start
     rel  84   beat 51.5   blue      ┐
     rel 120   beat 53.0   violet    │
     rel 144   beat 54.0   rose      │ flat cuts, accelerating
     rel 168   beat 55.0   coral     │ 48 / 36 / 24 / 24 / 12 / 12
     rel 180   beat 55.5   green     ┘
     rel 192   beat 56.0   PAPER + BOOM  low band .842
     rel 288   beat 60.0   words → two frames
     rel 336   beat 62.0   GROW
     rel 384   beat 64.0   out

   The paper used to land at rel 216, which measures .404 on the low band —
   one of the weakest beats in the passage, and no place at all to put an
   impact. 1343 is .842. It also takes the paper to 50% of the section.

   ── */

const FPS = 60;
const BEAT = (60 / 150.1) * FPS;
export const WORD_FLIP_DUR = 384;          // four bars

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const OVER = Easing.bezier(0.16, 1.42, 0.34, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

const W = 1920, H = 1080;
const TRACK = '-0.03em';
const PAPER = 'card';
const PREFIX = ["We'll", 'help', 'your', 'business'];
const ESTABLISH = 36;                      // 48 → 36: it was sitting there too long

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};
const inkOn = (g: string) => (g === PAPER || lum(g) > 148 ? 'rgba(18,20,22,.90)' : 'rgba(255,255,255,.92)');

/* ── AND THE COLOUR ACCELERATES WITH THE WORDS ────────────────────────────
   Holds of 48 / 36 / 24 / 24 / 12 / 12 — the ground speeds up into the boom
   the same way the text does, rather than ticking along at a fixed 36.

   Six states, not four, and the ORDER is doing work: the luminance climbs
   steadily, 11 → 78 → 93 → 107 → 122 → 139 → 190, so the late cuts — the fast
   ones — are 14, 15 and 17 apart. Under the 20/255 the flash guidance counts,
   which is what buys the acceleration. The changes you SEE are hue; the
   changes that get counted are brightness, and those stay at the slow end.
   Cut them in a careless order and six flat cuts in 156 frames is five a
   second of full-frame contrast. */
const GROUNDS: {at: number; c: string}[] = [
  {at: 0, c: PAPER},          // 190
  {at: 36, c: '#0A0C0D'},     //  11   the circle          hold 48
  {at: 84, c: FLOOD_BLUE},    //  78                       hold 36
  {at: 120, c: FLOOD_VIOLET}, //  93                       hold 24
  {at: 144, c: FLOOD_ROSE},   // 107                       hold 24
  {at: 168, c: FLOOD_CORAL},  // 122                       hold 12
  {at: 180, c: FLOOD_GREEN},  // 139                       hold 12
  {at: 192, c: PAPER},        // 190   the boom
];
const CIRCLE_GROUND = 1;
const BOOM_AT = 192;

/* ── LAYER 1 · TEXT ───────────────────────────────────────────────────────
   Every word is an INTRANSITIVE VERB, so "We'll help your business ___" is a
   complete sentence at every frame. The earlier set was full of participles
   and adjectives — "business chosen", "business bigger" — which need a linking
   verb the prefix does not supply. */
type Word = {w: string; hold: number};
const mk = (hold: number, list: string[]): Word[] => list.map((w) => ({w, hold}));
const RUN: Word[] = [
  /* 6 frames, on the colour */
  ...mk(6, ['flourish', 'accelerate', 'outperform', 'diversify', 'modernise',
    'specialise', 'innovate', 'dominate', 'strengthen', 'multiply', 'resonate',
    'prosper', 'succeed', 'compete', 'evolve', 'expand', 'convert', 'recover',
    'stabilise', 'escalate', 'skyrocket', 'snowball', 'compound', 'progress',
    'advance', 'develop']),
  /* 4 frames, on the paper */
  ...mk(4, ['thrive', 'scale', 'adapt', 'connect', 'engage', 'inspire',
    'deliver', 'perform', 'outgrow', 'outlast', 'outsell', 'improve',
    'mature', 'rebound', 'endure', 'persist', 'continue', 'profit',
    'spread', 'gather', 'mushroom', 'balloon', 'triple', 'rocket']),
  /* 2 frames — thirty a second, the stock flip's own rate */
  ...mk(2, ['win', 'lead', 'rise', 'climb', 'soar', 'boom', 'surge', 'shine',
    'sell', 'rank', 'peak', 'fly', 'race', 'sprint', 'rally', 'double',
    'jump', 'leap', 'spike', 'swell', 'bloom', 'blossom', 'last', 'build']),
  {w: 'grow', hold: 48},
];
const AT: number[] = [];
RUN.reduce((a, w, i) => { AT[i] = ESTABLISH + a; return a + w.hold; }, 0);
const LAST = RUN.length - 1;
const CIRCLE_A = AT[LAST] + 4, CIRCLE_B = AT[LAST] + 26;

/* ── LAYER 3 · TWO MARKS ─────────────────────────────────────────────────
Copied off f196 at full resolution, which is the frame where the reference's
   own mark is complete. It is a MEANDER, not a comb: one thick ribbon making
   big rounded U-turns, and the three things that make it read as drawn rather
   than generated are all things my versions did not have —

     · the passes are TILTED, not vertical
     · they are UNEVENLY spaced, not on a pitch
     · the turns happen at DIFFERENT HEIGHTS, so no two are level

   Both of these are that shape. The twist is in the second: instead of running
   at constant amplitude it WINDS IN, each pass shorter than the last, and it
   runs horizontally rather than vertically. Same hand, different sentence. */
type Mark = {a: number; life: number; draw: number; w: number; d: string};
const MARKS: Mark[] = [
  /* 1 · the meander. Four passes drifting right, spacing 520 / 400 / 480, and
        every turn at its own height. */
  {a: 46, life: 70, draw: 22, w: 240,
    d: 'M 400 1240 C 350 700, 470 210, 560 -140 C 710 -330, 900 -300, 940 -70 '
     + 'C 985 410, 850 900, 930 1250 C 1075 1430, 1290 1400, 1330 1150 '
     + 'C 1375 690, 1270 250, 1380 -130 C 1530 -320, 1745 -285, 1795 -30 '
     + 'C 1845 420, 1755 910, 1820 1250'},
  /* 2 · the same meander wound in — three passes of 2240, 1720 and 1120, laid
        horizontally and coiling toward the middle. */
  {a: 122, life: 70, draw: 18, w: 240,
    d: 'M 2080 230 C 1400 165, 500 200, -160 300 C -390 425, -365 625, -120 705 '
     + 'C 505 765, 1205 720, 1560 785 C 1770 865, 1745 1045, 1520 1095 '
     + 'C 1000 1145, 620 1120, 400 1080'},
];

const brushPath = (rx: number, ry: number) => {
  const pts: string[] = [];
  const START = -2.42, TURNS = 1.13, N = 64;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = START + t * Math.PI * 2 * TURNS;
    const wob = 1 + 0.035 * Math.sin(a * 2.1 + 1.3) + 0.02 * Math.sin(a * 3.7) + t * 0.045;
    pts.push(`${i === 0 ? 'M' : 'L'}${(Math.cos(a) * rx * wob).toFixed(1)} ${(Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return pts.join(' ');
};

const WORD_SIZE = 230, PREFIX_SIZE = 116;
const mw = (t: string, size: number) =>
  measureText({text: t, fontFamily: JOST, fontSize: size, fontWeight: '700', letterSpacing: TRACK}).width;
const fitted = (text: string, size: number) => {
  const w = mw(text, size);
  const max = W * 0.86;
  return w > max ? size * (max / w) : size;
};
const PFROM = [[-380, -190], [300, 210], [-260, 230], [360, -170]];

export const WordFlip: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame();

  const wi = RUN.reduce((n, _, i) => (f >= AT[i] ? i : n), -1);
  const gi = GROUNDS.reduce((n, g, i) => (f >= g.at ? i : n), 0);
  const ground = GROUNDS[gi].c;

  /* ── THE CIRCLE ──────────────────────────────────────────────────────────
     14 frames on a SNAP curve put three 26-52/255 steps into three frames: a
     circle's area goes as the square of its radius, so easing the RADIUS out
     makes the area explode through the middle of the move. 22 frames with the
     radius on a square root instead — area then advances linearly in time, and
     a 179-point paper→black swing comes out at 8 a frame. */
  const openRaw = gi === CIRCLE_GROUND
    ? interpolate(f, [GROUNDS[gi].at, GROUNDS[gi].at + 22], [0, 1], {easing: Easing.linear, ...clamp})
    : 1;
  const opening = openRaw >= 1 ? 1 : Math.sqrt(openRaw);

  const drawnInFor = (gIdx: number) => {
    const prev = gIdx > 0 ? GROUNDS[gIdx - 1].c : null;
    return prev && prev !== PAPER ? prev : ACC_DARK;
  };

  /* ── THE BOOM ────────────────────────────────────────────────────────────
     Frame punch plus two frames of white lift on the frame the paper arrives.
     The lift is held at .26 rather than a blowout: at full strength it stacked
     on top of the coral→paper cut and put three 20/255 changes inside three
     frames, which is the flash limit in one gulp. */
  const boom = f >= BOOM_AT && f < BOOM_AT + 12
    ? Math.max(0, 1 - (f - BOOM_AT) / 12) ** 2 : 0;
  const dBeat = Math.max(0, 1 - (f % BEAT) / 6) ** 2;
  const kick = dBeat * 0.014 + boom * 0.042;
  const hand = interpolate(f, [ESTABLISH - 2, ESTABLISH + 14], [0, 1], {easing: SNAP, ...clamp});

  const isLast = wi === LAST;
  const word = wi >= 0 ? RUN[wi].w : '';
  const size = fitted(word, isLast ? WORD_SIZE * 1.5 : WORD_SIZE);
  const slam = isLast
    ? interpolate(f, [AT[LAST], AT[LAST] + 10], [1.4, 1], {easing: OVER, ...clamp}) : 1;

  const circleP = interpolate(f, [CIRCLE_A, CIRCLE_B], [0, 1], {easing: Easing.bezier(0.4, 0, 0.3, 1), ...clamp});
  const growW = mw(RUN[LAST].w, fitted(RUN[LAST].w, WORD_SIZE * 1.5));

  const Body: React.FC<{g: string; gIdx: number}> = ({g, gIdx}) => (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {g === PAPER
        ? <AbsoluteFill><CardGround grain={0.05} /></AbsoluteFill>
        : <AbsoluteFill style={{background: g}} />}
      {g !== PAPER && (
        <AbsoluteFill style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.16) 0%, transparent 68%)',
        }} />
      )}
      {/* the marks live only while there is colour for them to be drawn in */}
      {g !== PAPER && MARKS.map((m, i) => {
        if (f < m.a || f >= m.a + m.life) return null;
        const p = interpolate(f, [m.a, m.a + m.draw], [0, 1], {easing: Easing.linear, ...clamp});
        /* six frames out. Cut off dead, a 290px mark leaving measured 45/255 in
           one frame, and it landed inside the same second as a colour cut. */
        const out = interpolate(f, [m.a + m.life - 6, m.a + m.life], [1, 0], {easing: Easing.linear, ...clamp});
        return (
          <svg key={i} width={W} height={H} opacity={out} viewBox={`0 0 ${W} ${H}`}
            style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <path d={m.d} fill="none" stroke={drawnInFor(gIdx)}
              strokeWidth={m.w} strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
          </svg>
        );
      })}
      {wi >= 0 && (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{
            fontFamily: JOST, fontWeight: 700, fontSize: size,
            letterSpacing: wi === 0 ? `${lerp(hand, 0.62, -0.03).toFixed(3)}em` : TRACK,
            color: inkOn(g), whiteSpace: 'pre', lineHeight: 1.05,
            transform: `scale(${(wi === 0 ? lerp(hand, 1.18, 1) : slam).toFixed(4)})`,
          }}>{word}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${(1 + kick).toFixed(4)})`}}>
        {/* the outgoing paper is only ever needed under the opening circle */}
        {opening < 1 && <Body g={PAPER} gIdx={0} />}
        <AbsoluteFill style={opening < 1
          ? {clipPath: `circle(${(opening * 1250).toFixed(0)}px at 50% 50%)`}
          : undefined}>
          <Body g={ground} gIdx={gi} />
        </AbsoluteFill>

        {hand < 1 && (
          <AbsoluteFill style={{opacity: 1 - hand * hand}}>
            <AbsoluteFill><CardGround grain={0.05} /></AbsoluteFill>
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{
                fontFamily: JOST, fontWeight: 700, fontSize: PREFIX_SIZE, letterSpacing: TRACK,
                color: 'rgba(18,20,22,.92)', whiteSpace: 'pre', lineHeight: 1.1,
                transform: `scale(${lerp(hand, 1, 1.1).toFixed(3)})`,
              }}>
                {PREFIX.map((pw, i) => {
                  const a = i * 4;
                  const p = interpolate(f, [a, a + 13], [0, 1], {easing: SNAP, ...clamp});
                  const pPrev = interpolate(f - 1, [a, a + 13], [0, 1], {easing: SNAP, ...clamp});
                  const dx = lerp(p, PFROM[i][0], 0), dy = lerp(p, PFROM[i][1], 0);
                  const speed = Math.hypot(dx - lerp(pPrev, PFROM[i][0], 0), dy - lerp(pPrev, PFROM[i][1], 0));
                  const out = lerp(hand, 0, (i - 1.5) * 300);
                  return (
                    <span key={i} style={{
                      display: 'inline-block',
                      transform: `translate(${(dx + out).toFixed(1)}px, ${dy.toFixed(1)}px)`,
                      opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
                      filter: speed > 2 ? `blur(${Math.min(18, speed * 0.34).toFixed(1)}px)` : undefined,
                    }}>{pw}{i < PREFIX.length - 1 ? ' ' : ''}</span>
                  );
                })}
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        )}

        {circleP > 0.001 && (
          <AbsoluteFill style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <svg width={growW * 1.9} height={560} viewBox={`${-growW * 0.95} -280 ${growW * 1.9} 560`}
              style={{overflow: 'visible', transform: 'rotate(-2.4deg)'}}>
              <defs>
                <linearGradient id="lwbrush" x1="0" y1="0" x2="1" y2="0.35">
                  <stop offset="0%" stopColor={ACC_DARK} />
                  <stop offset="58%" stopColor={ACC} />
                  <stop offset="100%" stopColor={FLOOD_SKY} />
                </linearGradient>
              </defs>
              <path d={brushPath(growW * 0.72, 190)} fill="none" stroke="url(#lwbrush)"
                strokeWidth={44} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circleP} />
            </svg>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {boom > 0 && (
        <AbsoluteFill style={{background: '#FFFFFF', opacity: boom * 0.22, pointerEvents: 'none'}} />
      )}

      {music && <Audio src={staticFile('music/showreel-2bar.wav')} startFrom={1151} volume={0.88} />}
    </AbsoluteFill>
  );
};
