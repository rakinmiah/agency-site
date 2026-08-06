import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ARIAL} from './ui';
import {JOST} from '../fonts';

/* ── THE HINGE, AS A TEST ──────────────────────────────────────────────────
   Pull back off the notifications, reveal they were on a phone, a thumb comes
   up and presses, and the screen becomes the first stock image — then the
   camera pushes into the screen until the image IS the frame.

   THIS IS A GRAPHIC AND IT IS NOT PRETENDING OTHERWISE. No skin tone, no
   fingernail, no soft-shadowed knuckle. A half-rendered hand made of gradients
   is clip art, and the uncanny middle is a worse place to land than either end.
   What makes a flat silhouette read as an OBJECT rather than a sticker is one
   thing only: a rim light down the edge facing the screen glow. That is the
   whole trick, and it is why the thumb is filled with a gradient that lifts at
   its left edge rather than with flat black.

   The press does two things a static shape cannot: the tip SQUASHES against the
   glass — contact you can see — and the phone takes a small recoil away from
   it. Without both, a hand simply overlaps a phone. */

const FPS = 60;
const BEAT = (60 / 150.1) * FPS;
export const THUMB_DUR = Math.round(BEAT * 8);      // 192 — two bars

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const OVER = Easing.bezier(0.34, 1.56, 0.64, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

const PRESS_AT = Math.round(BEAT * 3);              // 72 — the contact frame
const W = 1920, H = 1080;

/* the phone, in canvas units — the camera scales this, nothing else moves */
const PH_W = 520, PH_H = 1070, PH_R = 62;

const ROWS = [
  ['#25D366', 'Danny R.', 'are you taking on new work?'],
  ['#E1306C', 'sophie.makes', 'do you take bookings?'],
  ['#EA4335', 'New enquiry', 'someone asked for a callback'],
  ['#25D366', 'Priya N.', 'any availability this week?'],
  ['#1877F2', 'Marcus Hale', 'can you send me a quote?'],
];

const Screen: React.FC<{shot: number}> = ({shot}) => (
  <div style={{
    position: 'absolute', inset: 14, borderRadius: PH_R - 14, overflow: 'hidden',
    background: '#0B0F12',
  }}>
    {shot < 1 ? (
      <div style={{padding: '46px 20px 0'}}>
        {ROWS.map(([c, n, m], i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12,
            background: 'rgba(255,255,255,.07)', borderRadius: 16, padding: '14px 14px',
            boxShadow: `inset 3px 0 0 ${c}`,
          }}>
            <div style={{width: 40, height: 40, borderRadius: 12, background: c, flexShrink: 0}} />
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 17, color: '#fff'}}>{n}</div>
              <div style={{fontFamily: ARIAL, fontSize: 15, color: 'rgba(255,255,255,.55)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m}</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <Img src={staticFile('flip/000.jpg')}
        style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    )}
  </div>
);

/* ── THE THUMB ─────────────────────────────────────────────────────────────
   Drawn as one path in a 420x760 box, pad uppermost. The shape reads as a
   thumb rather than a finger because of proportion: broad tip, short taper,
   and the joint bulge on the outer edge. A finger is a parallel column; a thumb
   is a wedge. */
/* v1 of this path was a COLUMN — near-parallel sides, a domed top, and a rim
   light wide enough to read as a painted stripe. It came out as a tombstone.
   Three things were wrong and all three are proportion, not detail:

     a thumb is a WEDGE      the base is nearly twice the tip. Parallel sides
                             are a finger, and a rounded-off finger is a pill
     it enters at an ANGLE   straight up the middle of a phone is not how a
                             hand holds one; ~16 degrees off vertical is
     it runs OFF-FRAME       v1 ended inside the phone's own bounds, so it read
                             as an object resting on the screen rather than as
                             something reaching in from outside the picture

   The rim is also now a third of its old width. Light catching an edge is a
   sliver; anything thicker is a highlight painted on a flat shape. */
const Thumb: React.FC<{squash: number}> = ({squash}) => (
  <svg width={520} height={1240} viewBox="0 0 520 1240" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2E3841" />
        <stop offset="6%" stopColor="#141920" />
        <stop offset="55%" stopColor="#0A0D11" />
        <stop offset="100%" stopColor="#04060A" />
      </linearGradient>
      <filter id="ts" x="-40%" y="-30%" width="180%" height="170%">
        <feDropShadow dx="-6" dy="-20" stdDeviation="30" floodColor="#000" floodOpacity="0.8" />
      </filter>
    </defs>
    <g filter="url(#ts)"
      transform={`rotate(-16 260 900) translate(0 ${(squash * 30).toFixed(1)}) scale(1 ${(1 - squash * 0.05).toFixed(4)})`}>
      <path
        d={`M 34 1240
            C 22 1010, 58 760, 132 596
            C 178 494, 254 432, 330 456
            C 400 478, 428 556, 414 632
            C 398 716, 372 800, 366 900
            C 360 1010, 380 1130, 402 1240
            Z`}
        fill="url(#tg)"
      />
      <path
        d={`M 34 1240 C 22 1010, 58 760, 132 596 C 178 494, 254 432, 330 456
            C 288 466, 232 512, 194 604 C 148 716, 116 1000, 122 1240 Z`}
        fill="#93AABD" opacity={0.34}
      />
    </g>
  </svg>
);

export const ThumbTest: React.FC = () => {
  const f = useCurrentFrame();

  /* ── CAMERA ──────────────────────────────────────────────────────────────
     Three moves welded into one path: tight on the screen, back to see the
     whole phone, then in through the screen. It never stops — the pull-back
     eases out straight into the push-in, so there is no frame where the camera
     is parked and the shot goes dead. */
  const back = interpolate(f, [0, Math.round(BEAT * 2)], [0, 1], {easing: Easing.out(Easing.cubic), ...clamp});
  const into = interpolate(f, [PRESS_AT + 10, THUMB_DUR - 4], [0, 1],
    {easing: Easing.inOut(Easing.cubic), ...clamp});
  const camScale = lerp(back, 3.15, 0.92) * lerp(into, 1, 4.1);
  const camY = lerp(back, 250, 0) * (1 - into) + into * -40;

  /* ── THE THUMB'S ARRIVAL ────────────────────────────────────────────────
     Travel, so it may lead the beat: the press must be perceived ON frame 72,
     and an overshoot curve is read as arrived when it first reaches target,
     which is 37% into the move. Starting it 8 frames early puts contact on the
     beat rather than after it. */
  const rise = interpolate(f, [PRESS_AT - 22, PRESS_AT + 15], [0, 1], {easing: OVER, ...clamp});
  const thumbY = lerp(rise, 980, 250);

  /* contact: the tip flattens for six frames and releases */
  const squash = interpolate(f, [PRESS_AT - 1, PRESS_AT + 3, PRESS_AT + 12], [0, 1, 0],
    {easing: SNAP, ...clamp});
  /* and the phone gives — 9px away from the thumb, back over ten frames */
  const recoil = interpolate(f, [PRESS_AT, PRESS_AT + 3, PRESS_AT + 13], [0, -9, 0],
    {easing: SNAP, ...clamp});

  /* the tap ripple, from the contact point */
  const rip = interpolate(f, [PRESS_AT, PRESS_AT + 22], [0, 1], {easing: Easing.out(Easing.cubic), ...clamp});

  /* the screen turns over under the ripple's leading edge */
  const shot = f >= PRESS_AT + 5 ? 1 : 0;
  const withdraw = interpolate(f, [PRESS_AT + 14, PRESS_AT + 40], [0, 1], {easing: Easing.in(Easing.cubic), ...clamp});

  return (
    <AbsoluteFill style={{background: '#06070A', overflow: 'hidden'}}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          transform: `translateY(${camY.toFixed(1)}px) scale(${camScale.toFixed(4)})`,
          transformOrigin: '50% 42%',
        }}>
          <div style={{position: 'relative', width: PH_W, height: PH_H}}>
            {/* the phone */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: PH_R,
              background: 'linear-gradient(150deg,#23282E,#0D1013 46%,#191E24)',
              transform: `translateY(${recoil.toFixed(1)}px)`,
              boxShadow: '0 60px 120px -30px rgba(0,0,0,.9), inset 0 0 0 2px rgba(255,255,255,.09)',
            }}>
              <Screen shot={shot} />
              {rip > 0 && rip < 1 && (
                <div style={{
                  position: 'absolute', left: '50%', top: '62%',
                  width: rip * 1500, height: rip * 1500, marginLeft: rip * -750, marginTop: rip * -750,
                  borderRadius: '50%', border: `${(5 * (1 - rip)).toFixed(1)}px solid rgba(255,255,255,${(0.55 * (1 - rip)).toFixed(3)})`,
                  background: `rgba(255,255,255,${(0.10 * (1 - rip)).toFixed(3)})`,
                }} />
              )}
            </div>

            {/* the thumb, over everything, leaving after the press */}
            <div style={{
              position: 'absolute', left: '50%', top: 0,
              transform: `translateX(-30%) translateY(${(thumbY + withdraw * 1100).toFixed(1)}px)`,
              opacity: interpolate(f, [PRESS_AT - 24, PRESS_AT - 18], [0, 1], clamp),
            }}>
              <Thumb squash={squash} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
