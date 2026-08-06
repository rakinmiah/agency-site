import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {JOST} from '../fonts';
import {CardGround} from './buildCard';
import {FLOOD_SKY} from '../theme';
import {Screen, type ScreenId} from './platformUI';

/* ── THE STATISTICS ────────────────────────────────────────────────────────
   1535 → 1823. Built off a frame-exact read of IMG_2735 rather than a
   description of it — every number below was measured, not eyeballed.

   ── THE CIRCLE ──────────────────────────────────────────────────────────
   Settled radius is 104px in an 888×379 element: a diameter of 55% of the
   element height. On 1920×1080 that is r=300, not the 420 I had been using.
   It sits dead centre, on top of everything, and does not move, resize or
   recolour while a burst is happening.

   ── THE OPEN, AS MEASURED ───────────────────────────────────────────────
     f1-33   r 40 → 116   grows, accelerating, stepping every ~3 frames
     f31                  the wordmark appears, near full size
     f34     r 116 → 64   THE SNAP — halves and flips colour in ONE frame
     f35-44  r 64 → 104   grows back and settles

   The snap is the whole move and I had missed it entirely: it grows, gets
   stamped down, and comes back up a different colour. Pre-snap size is 1.115×
   the settled size and the stamp takes it to 0.55× — both reproduced here.

   The badge grows in SKY and stamps to near-black. That direction is not
   arbitrary: sky sits at 153 against paper's ~178, so the big disc is nearly
   invisible in luminance while being loud in hue, and the stamp — which also
   shrinks it — measures about 4/255. Stamping the other way round measures 28.

   ── THE BURSTS, AS MEASURED ─────────────────────────────────────────────
     burst 1  f48 r111 → f56 full   8 frames, accelerating
     burst 2  f68 r104 → f71 full   4 frames

   So: badge rim to past the frame corner in 4-8 frames, with the badge
   untouched on top. One per beat here, nine of them.

     local  film   beat        event
        0   1535   64   .666   dot at centre, grows
       48   1583   66          £2,000,000+ appears inside
       60   1595   66.5 .780   THE SNAP
       72   1607   67          settled · burst · Google results
       96   1631   68   .723   burst · Google local pack
      120   1655   69          burst · Google, scrolled
      144   1679   70   .530   30+ · burst · Facebook feed
      168   1703   70.5        burst · Facebook stories + wide unit
      192   1727   72   .731   burst · Facebook reactions
      216   1751   73          50+ · burst · Instagram grid  ← the long one
      240   1775   74          burst · Instagram post
      264   1799   75          burst · Instagram reels
      288   1823   76   .783   out — the exit transition goes here next     */
export const STATS_DUR = 288;          // the exit bar (→1919) comes next
export const STATS_AT = 1535;          // beat 64

const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const BEAT = (60 / 150.1) * 60;        // 23.984
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.out(Easing.cubic);
const DARK = '#0A0C0D';

const R_BADGE = 300;                         // 55% of frame height as diameter
const R_PRE = Math.round(R_BADGE * 1.115);   // 334 — measured pre-snap size
const R_STAMP = Math.round(R_PRE * 0.55);    // 184 — measured stamp size
const R_OUT = 1180;                          // past the corner (1101) plus the scallop

const TEXT_AT = 12, SNAP = 18, SETTLE = 24;

const scallop = (cx: number, cy: number, R: number, N = 20, depth = 0.045, pts = 220) => {
  const p: string[] = [];
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const r = R * (1 + depth * Math.cos(a * N));
    p.push(`${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `${p.join(' ')} Z`;
};

/* ── THE NINE BURSTS ───────────────────────────────────────────────────────
   Eight frames each, which is the reference's own rate — except the one into
   Instagram. That crosses about 165/255 off Facebook's grey, and area-linear
   at eight frames steps 29 a frame. Twenty gets it under the limit and still
   reads as fast. */
type Burst = {at: number; id: ScreenId; dur: number; y?: number};
const BURSTS: Burst[] = [
  /* Google — six */
  {at: 24, id: 'g1', dur: 6},
  {at: 36, id: 'g1', dur: 6, y: -292},
  {at: 48, id: 'g2', dur: 6},
  {at: 60, id: 'g2', dur: 6, y: -246},
  {at: 72, id: 'g3', dur: 6},
  {at: 84, id: 'g3', dur: 6, y: -318},
  /* Facebook — eight */
  {at: 96, id: 'f1', dur: 10},
  {at: 108, id: 'f1', dur: 6, y: -286},
  {at: 120, id: 'f2', dur: 6},
  {at: 132, id: 'f2', dur: 6, y: -344},
  {at: 144, id: 'f3', dur: 6},
  {at: 156, id: 'f3', dur: 6, y: -262},
  {at: 168, id: 'f1', dur: 6, y: -150},
  {at: 180, id: 'f2', dur: 6, y: -300},
  /* Instagram — seven. The first crosses 165/255 off Facebook's grey, so it
     takes 24 frames and gives up its neighbour's slot; the rest are 6. */
  {at: 192, id: 'i1', dur: 10},
  {at: 216, id: 'i1', dur: 8, y: -334},
  {at: 228, id: 'i2', dur: 8},
  {at: 240, id: 'i2', dur: 8, y: -168},
  {at: 252, id: 'i3', dur: 10},
  {at: 264, id: 'i3', dur: 8, y: -300},
  {at: 276, id: 'i1', dur: 8, y: -168},
];

type Fig = {at: number; v: string; label: string};
const FIGS: Fig[] = [
  {at: TEXT_AT, v: '£2,000,000+', label: 'ad spend managed'},
  {at: 96, v: '30+', label: 'industries worked in'},
  {at: 192, v: '50+', label: 'clients managed'},
];

const NUM = 170, LS = '-0.02em';
const INNER = R_BADGE * 2 * 0.78;
const fitOf = (text: string) => {
  const w = measureText({text, fontFamily: JOST, fontWeight: 500, fontSize: NUM, letterSpacing: LS}).width;
  return w > INNER ? INNER / w : 1;
};

/* Sampled once: the sorted distance of every point on a 120×68 grid from
   centre, which turns "what fraction of the frame is inside radius r" into a
   binary search, and inverting it gives the radius for a wanted coverage. */
const DIST = (() => {
  const d: number[] = [];
  for (let i = 0; i < 120; i++) {
    for (let j = 0; j < 68; j++) {
      d.push(Math.hypot((i + 0.5) / 120 * W - CX, (j + 0.5) / 68 * H - CY));
    }
  }
  return d.sort((a, b) => a - b);
})();
const covOf = (r: number) => {
  let lo = 0, hi = DIST.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (DIST[m] < r) lo = m + 1; else hi = m; }
  return lo / DIST.length;
};
const COV0 = covOf(R_BADGE);
const burstR = (p: number) => {
  const want = COV0 + p * (1 - COV0);
  let lo = R_BADGE, hi = R_OUT;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (covOf(m) < want) lo = m; else hi = m; }
  return (lo + hi) / 2;
};

export const Stats: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame();
  const dBeat = Math.max(0, 1 - (f % BEAT) / 6) ** 2;

  /* the badge's radius through the open, then held */
  const rBadge = f < SNAP
    ? interpolate(f, [0, 16], [0, R_PRE], {easing: Easing.in(Easing.quad), ...clamp})
    : interpolate(f, [SNAP, SETTLE], [R_STAMP, R_BADGE], {easing: OUT, ...clamp});
  const badgeFill = f < SNAP ? FLOOD_SKY : DARK;

  const bi = BURSTS.reduce((a, b, i) => (f >= b.at ? i : a), -1);
  const cur = bi >= 0 ? BURSTS[bi] : null;
  const prev = bi > 0 ? BURSTS[bi - 1] : null;
  const bp = cur ? interpolate(f - cur.at, [0, cur.dur], [0, 1], {easing: Easing.linear, ...clamp}) : 0;
  const rPay = burstR(bp);
  const bursting = cur !== null && f - cur.at < cur.dur + 1;

  const gi = FIGS.reduce((a, g, i) => (f >= g.at ? i : a), -1);
  const fig = gi >= 0 ? FIGS[gi] : null;
  const ft = fig ? f - fig.at : 0;
  const figIn = fig ? interpolate(ft, [0, 6], [0, 1], {easing: OUT, ...clamp}) : 0;
  const fit = fig ? fitOf(fig.v) : 1;
  /* the figure lands with a slam and a blur — the film's own NoiseWord move */
  const fv = Math.max(0, 1 - ft / 5) ** 2;

  const pulse = 1 + dBeat * 0.007;
  const rk = Math.min(1, rBadge / R_BADGE);

  return (
    <AbsoluteFill style={{background: DARK}}>
      {/* what the last burst left behind — paper until the first one fires */}
      <AbsoluteFill style={prev?.y ? {transform: `translateY(${prev.y}px)`} : undefined}>
        {prev ? <Screen id={prev.id} t={f - prev.at} /> : <CardGround grain={0.05} />}
      </AbsoluteFill>

      {/* and the one on its way out of the circle */}
      {cur && (
        <AbsoluteFill style={bursting
          ? {clipPath: `path('${scallop(CX, CY, Math.max(1, rPay))}')`}
          : undefined}>
          <AbsoluteFill style={cur.y ? {transform: `translateY(${cur.y}px)`} : undefined}>
            <Screen id={cur.id} t={f - cur.at} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* ── THE CIRCLE, ON TOP, UNTOUCHED ── */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d={scallop(CX, CY, Math.max(1, rBadge * pulse))} fill={badgeFill} />
          {fig && rBadge > R_STAMP * 0.9 && (
            <g opacity={figIn} style={{
              filter: fv > 0.05 ? `blur(${(fv * 16).toFixed(1)}px)` : undefined,
            }}>
              <text x={CX} y={CY - 14 * rk} textAnchor="middle" dominantBaseline="central"
                fontFamily={JOST} fontWeight={500} fontSize={NUM * fit * rk * (1 + fv * 0.22)}
                letterSpacing={LS} fill="#FFFFFF"
                style={{fontVariantNumeric: 'tabular-nums'}}>{fig.v}</text>
              <text x={CX} y={CY + (46 + 30 * fit) * rk} textAnchor="middle" dominantBaseline="central"
                fontFamily={JOST} fontWeight={500} fontSize={(26 + 8 * fit) * rk}
                letterSpacing="0.06em" fill="rgba(255,255,255,.70)">
                {fig.label.toUpperCase()}
              </text>
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {music && <Audio src={staticFile('music/showreel-2bar.wav')} startFrom={STATS_AT} volume={0.88} />}
    </AbsoluteFill>
  );
};
