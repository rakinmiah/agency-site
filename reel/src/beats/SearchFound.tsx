import React from 'react';
import {AbsoluteFill, Easing, Series, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ACC, FLOOD_BLUE, FLOOD_GOLD, FLOOD_SKY, INK, WHITE} from '../theme';
import {JOST} from '../fonts';
import {Burst, CardFX, Flood} from '../ui';
import {beatF} from '../music';

/* THE SEARCH, v2 — map compressed to 1.6s, then the verbs arrive as FLOODS:
   "found." on ultramarine (blob-grow), a burst, "chosen." on gold carrying the
   real 5.0★ proof chip. The hanging sentence pays off loud. */

const D_MAP = beatF(33) - beatF(29);        // 96
const D_FOUND = beatF(35) - beatF(33);      // 48
const D_BURST = beatF(36.5) - beatF(35);    // 36
const D_CHOSEN = beatF(39) - beatF(36.5);   // 60
export const SEARCH_D = D_MAP + D_FOUND + D_BURST + D_CHOSEN;

const PILLS: Array<{text: string; x: number; y: number; at: number}> = [
  {text: 'taxi to gatwick', x: 350, y: 250, at: 8},
  {text: 'airport taxi brighton', x: 1440, y: 230, at: 16},
  {text: 'taxi near me', x: 290, y: 780, at: 24},
  {text: 'brighton station taxi', x: 1480, y: 800, at: 32},
];
const CX = 960, CY = 505;

const MapFast: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pinUp = spring({frame: frame - 4, fps, config: {damping: 11, stiffness: 190}});
  return (
    <CardFX bg={WHITE} light>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {[240, 480, 720, 960, 1200, 1440, 1680].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={1080} stroke="#ECEDEF" strokeWidth={14} />
        ))}
        {[170, 400, 630, 860].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={1920} y2={y} stroke="#ECEDEF" strokeWidth={14} />
        ))}
        <line x1={0} y1={630} x2={1920} y2={630} stroke="#E3E5E8" strokeWidth={26} />
        <line x1={960} y1={0} x2={960} y2={1080} stroke="#E3E5E8" strokeWidth={26} />
        {PILLS.map((p, i) => {
          const draw = interpolate(frame, [p.at + 8, p.at + 26], [0, 1], {
            easing: Easing.inOut(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <line key={i} x1={p.x} y1={p.y} x2={p.x + (CX - p.x) * draw} y2={p.y + (CY - p.y) * draw}
              stroke={ACC} strokeWidth={7} strokeLinecap="round" opacity={draw > 0 ? 0.85 : 0} />
          );
        })}
        {[0, 1].map((k) => {
          const local = (frame - 12 - k * 48 + 96) % 48;
          const r = interpolate(local, [0, 40], [30, 290], {extrapolateRight: 'clamp'});
          const o = interpolate(local, [0, 40], [0.5, 0], {extrapolateRight: 'clamp'});
          return frame > 12 ? <circle key={k} cx={CX} cy={CY} r={r} fill="none" stroke={ACC} strokeWidth={5} opacity={o} /> : null;
        })}
      </svg>
      <div
        style={{
          position: 'absolute', left: CX - 39, top: CY - 96,
          transform: `translateY(${(1 - pinUp) * 120}px) scale(${0.4 + pinUp * 0.6})`,
          transformOrigin: '50% 100%', opacity: Math.min(1, pinUp * 1.5),
        }}
      >
        <svg width={78} height={104} viewBox="0 0 54 72">
          <path d="M27 0C12 0 0 12 0 27c0 20 27 45 27 45s27-25 27-45C54 12 42 0 27 0Z" fill={INK} />
          <circle cx={27} cy={26} r={10} fill={ACC} />
        </svg>
      </div>
      {PILLS.map((p, i) => {
        const s = spring({frame: frame - p.at, fps, config: {damping: 13, stiffness: 300}});
        return (
          <div key={i}
            style={{
              position: 'absolute', left: p.x - 150, top: p.y - 30, transform: `scale(${s})`,
              background: WHITE, border: '1px solid rgba(21,22,26,.16)', borderRadius: 999,
              padding: '13px 24px', boxShadow: '0 18px 50px -18px rgba(0,0,0,.3)',
              fontFamily: JOST, fontWeight: 500, fontSize: 26, color: INK, whiteSpace: 'nowrap',
            }}
          >
            {p.text}
          </div>
        );
      })}
    </CardFX>
  );
};

export const SearchFound: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={D_MAP}>
      <MapFast />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_FOUND}>
      <Flood color={FLOOD_BLUE} alt={FLOOD_SKY} verb="found." offsetX={-140} offsetY={-40} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_BURST}>
      <Burst
        dur={D_BURST}
        shots={[
          {src: 'stock/hands-phone-night.mp4', from: 3},
          {src: 'stock/city-night-intersection.mp4', from: 9},
          {src: 'stock/golden-hour-drive.mp4', from: 5},
        ]}
      />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_CHOSEN}>
      <Flood color={FLOOD_GOLD} alt="#E8C77D" verb="chosen." offsetX={90}>
        <div
          style={{
            margin: '30px auto 0', display: 'inline-flex', alignItems: 'center', gap: 12,
            background: WHITE, borderRadius: 999, padding: '14px 28px',
            boxShadow: '0 22px 60px -20px rgba(0,0,0,.35)',
            fontFamily: JOST, fontWeight: 500, fontSize: 30, color: INK,
          }}
        >
          5.0&nbsp;★&nbsp;&nbsp;from 80 reviews
        </div>
      </Flood>
    </Series.Sequence>
  </Series>
);
