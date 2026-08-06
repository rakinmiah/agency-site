import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ARIAL} from './ui';
import {CAP_W} from './siteWindow';

/* ── THE SITE, BEING BUILT ─────────────────────────────────────────────────
   FIRST VERSION PLACED THINGS ON. Elements faded up on a timer with nothing
   causing them, and then the page scrolled its whole length — which proved the
   site was real but killed the pace stone dead, three seconds of travel with no
   event in it.

   SECOND VERSION USED A CURSOR. It darted to each element, pressed, and the
   thing landed with a selection box and snap guides. Legible, but methodical —
   one placement a beat for nine beats, and the cursor rested between every move,
   so the whole passage was dart, stop, dart, stop. The exact stop-start this
   film has been corrected for three times elsewhere.

   THIS VERSION THROWS THE PAGE TOGETHER. Fourteen elements land in under a
   second, three frames apart, each flying in from the side it belongs to and
   overshooting slightly as it arrives. Nothing rests until it is all there, and
   it stays on the hero throughout — watching one screen get made is faster and
   more legible than touring a page that is already finished.

   THE HONEST CONSTRAINT: this is a flat capture, so nothing can reflow. Every
   element can only move as a rectangle. That is a limit of the medium and not a
   compromise — page builders manipulate rectangles too, which is exactly why the
   device reads correctly rather than looking like a workaround.

   Coordinates are measured off the 2160-wide capture. They agree with the
   FIELD_CAP and PRICE_CAP values already in Open.tsx, which is the check that
   they are right rather than approximately right. ── */

const SETTLE = Easing.out(Easing.cubic);
/* overshoots past 1 and settles back — a thing thrown, not a thing faded */
const OVER = Easing.bezier(0.22, 1.42, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

const CAP = 'captures/taxi-desktop.jpg';

type Rect = {x: number; y: number; w: number; h: number; r?: number};
export const BLOCKS: Rect[] = [
  {x: 150, y: 8, w: 260, h: 84, r: 8},          // 0  logo
  {x: 495, y: 14, w: 860, h: 62, r: 30},        // 1  nav links
  {x: 1480, y: 6, w: 530, h: 88, r: 30},        // 2  phone / sign in / book now
  {x: 160, y: 148, w: 1010, h: 180, r: 10},     // 3  hero heading
  {x: 160, y: 344, w: 730, h: 80, r: 8},        // 4  subtext
  {x: 160, y: 440, w: 435, h: 96, r: 48},       // 5  avatar row
  {x: 160, y: 530, w: 300, h: 44, r: 8},        // 6  5.0 on Google
  {x: 155, y: 572, w: 428, h: 44, r: 8},        // 7  trusted by 1,616+
  {x: 160, y: 640, w: 420, h: 58, r: 29},       // 8  £5 off pill
  {x: 160, y: 710, w: 1075, h: 130, r: 12},     // 9  pick-up address
  {x: 160, y: 836, w: 1075, h: 126, r: 12},     // 10 drop-off address
  {x: 160, y: 972, w: 1075, h: 86, r: 10},      // 11 get price
  {x: 1378, y: 205, w: 630, h: 862, r: 14},     // 12 illustration
  /* The 800px window reaches capture row 1350, and the hero's own content stops
     at 1067 — so without this the page ended in 150px of dead white, which reads
     as "the site finishes here" rather than "the fold cuts it off". This is the
     eyebrow and heading of the next section, exactly as much of it as a real
     viewport would show. */
  {x: 160, y: 1228, w: 1010, h: 122, r: 8},     // 13 next section, at the fold
];

/* ── THE CHOREOGRAPHY ──────────────────────────────────────────────────────
   `o` is the order it lands in, `dx`/`dy` where it comes from — in capture px,
   so the distances scale with the window.

   Every element enters from the side it belongs to: the nav falls from above the
   page, the headline and the proof come in off the left margin they are set
   against, the booking form rises from below the fold, and the illustration
   flies in from the right edge. Elements arriving from arbitrary directions read
   as effects; elements arriving from their own side read as the page pulling
   itself together.

   The illustration goes fourth rather than last so the right half of the frame
   is not empty for the whole run — with it at the end the composition sat lop-
   sided for the entire drop. */
export const ENTER: Array<{o: number; dx: number; dy: number}> = [
  {o: 0, dx: 0, dy: -110},      // 0  logo          ─┐
  {o: 1, dx: 0, dy: -110},      // 1  nav links      ├ from above the page
  {o: 2, dx: 0, dy: -110},      // 2  nav cta       ─┘
  {o: 3, dx: -150, dy: 0},      // 3  hero heading   ─ off the left margin
  {o: 5, dx: -110, dy: 0},      // 4  subtext        ─┐
  {o: 6, dx: -95, dy: 0},       // 5  avatars         │
  {o: 7, dx: -95, dy: 0},       // 6  rating          ├ the same margin, stacked
  {o: 8, dx: -95, dy: 0},       // 7  trusted by      │
  {o: 9, dx: -95, dy: 0},       // 8  £5 pill        ─┘
  {o: 10, dx: 0, dy: 150},      // 9  pick-up        ─┐
  {o: 11, dx: 0, dy: 150},      // 10 drop-off        ├ up from below the fold
  {o: 12, dx: 0, dy: 150},      // 11 get price      ─┘
  {o: 4, dx: 220, dy: 0},       // 12 illustration   ─ in off the right edge
  {o: 13, dx: 0, dy: 120},      // 13 fold teaser    ─ last, from below
];

/* An element arriving. OVER overshoots, which is what separates a thing being
   THROWN into place from a thing being faded in — the previous build eased
   everything to rest and that is most of why it read as placement rather than
   motion. */
const Slab: React.FC<{rect: Rect; p: number; s: number; winW: number; dx: number; dy: number}> = ({
  rect, p, s, winW, dx, dy,
}) => {
  if (p <= 0) return null;
  const bx = rect.x * s, by = rect.y * s, bw = rect.w * s, bh = rect.h * s;
  const t = interpolate(p, [0, 1], [0, 1], {easing: OVER, ...clamp});
  const fade = interpolate(p, [0, 0.34], [0, 1], {easing: SETTLE, ...clamp});
  const r = (rect.r ?? 10) * s;
  return (
    <div style={{
      position: 'absolute', left: bx, top: by, width: bw, height: bh,
      opacity: fade,
      transform: `translate(${lerp(t, dx * s, 0)}px, ${lerp(t, dy * s, 0)}px) scale(${lerp(t, 0.94, 1)})`,
    }}>
      <div style={{position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden'}}>
        <Img src={staticFile(CAP)} style={{position: 'absolute', left: -bx, top: -by, width: winW, display: 'block'}} />
      </div>
    </div>
  );
};

export const SiteBuild: React.FC<{
  x: number; y: number; w: number; h: number; radius: number;
  chrome: number;
  gridAt: number; gridOff: number;
  dropAt: number;          // the lyric — everything lands from here
  stagger: number;         // frames between elements
  dur: number;             // each element's own entrance
  chromeH: number;
}> = ({x, y, w, h, radius, chrome, gridAt, gridOff, dropAt, stagger, dur, chromeH}) => {
  const f = useCurrentFrame();
  const s = w / CAP_W;
  const winH = h - chromeH;
  const k = w / 1280;

  const grid = interpolate(f, [gridAt, gridAt + 4, gridOff, gridOff + 14], [0, 1, 1, 0],
    {easing: SETTLE, ...clamp});

  /* the site's own column, measured off the nav: 160 → 2010 in capture space */
  const COL_X = 160 * s, COL_W = 1850 * s, COLS = 12, GUT = 24 * s;
  const cw = (COL_W - GUT * (COLS - 1)) / COLS;

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: radius, overflow: 'hidden',
      border: `1px solid rgba(10,14,16,${0.16 * chrome})`,
      boxShadow: `0 ${Math.round(46 * chrome)}px ${Math.round(96 * chrome)}px -34px rgba(12,18,20,${0.5 * chrome})`,
      background: '#fff',
    }}>
      <div style={{
        height: chromeH, display: 'flex', alignItems: 'center', gap: 6 * k,
        padding: `0 ${14 * k}px`, borderBottom: `1px solid rgba(10,14,16,${0.10 * chrome})`,
        background: '#F1F3F4', opacity: chrome, boxSizing: 'border-box',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{width: 10 * k, height: 10 * k, borderRadius: '50%', background: 'rgba(10,14,16,.16)'}} />
        ))}
        <span style={{
          flex: 1, marginLeft: 10 * k, background: 'rgba(10,14,16,.06)',
          borderRadius: 7 * k, padding: `${5 * k}px ${12 * k}px`,
          fontFamily: ARIAL, fontSize: 12.5 * k, color: 'rgba(10,14,16,.55)',
        }}>
          nationaltaxi.co.uk
        </span>
      </div>

      <div style={{position: 'relative', height: winH, overflow: 'hidden', background: '#fff'}}>
        {grid > 0.01 && (
          <div style={{position: 'absolute', inset: 0, opacity: grid * 0.42, pointerEvents: 'none'}}>
            {Array.from({length: COLS}).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: COL_X + i * (cw + GUT), width: cw,
                background: 'rgba(26,115,232,.07)',
                borderLeft: `1px solid rgba(26,115,232,.34)`,
                borderRight: `1px solid rgba(26,115,232,.34)`,
              }} />
            ))}
          </div>
        )}

        {BLOCKS.map((rect, i) => {
          const e = ENTER[i];
          const a = dropAt + e.o * stagger;
          return (
            <Slab key={`b${i}`} rect={rect} s={s} winW={w} dx={e.dx} dy={e.dy}
              p={interpolate(f, [a, a + dur], [0, 1], clamp)} />
          );
        })}
      </div>
    </div>
  );
};
