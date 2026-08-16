import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

const BALLOON_COLORS = ['#ef767a', '#f6c453', '#7bdff2', '#b8a1e6', '#f4a5c2'];

const Balloon: React.FC<{color: string; size: number}> = ({color, size}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160">
    <path
      d="M50 118 C 20 118 8 88 8 62 C 8 30 26 8 50 8 C 74 8 92 30 92 62 C 92 88 80 118 50 118 Z"
      fill={color}
    />
    <ellipse cx="34" cy="42" rx="12" ry="18" fill="#ffffff" opacity={0.28} />
    <path d="M46 118 L54 118 L58 128 L42 128 Z" fill={color} />
    <path
      d="M50 128 C 46 140 56 146 50 158"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth={2.5}
      fill="none"
    />
  </svg>
);

// A handful of balloons drifting up gently behind the title.
export const Balloons: React.FC<{count?: number}> = ({count = 6}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const x = ((i + 0.5) / count) * width + (random(`bx-${i}`) - 0.5) * 90;
        const size = 90 + random(`bs-${i}`) * 70;
        const speed = 0.55 + random(`bv-${i}`) * 0.5;
        const start = height + 100 + random(`bo-${i}`) * 320;
        const y = start - frame * speed * 3.2;
        const sway = Math.sin(frame / 30 + i * 2.1) * 26;
        const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
        const opacity = interpolate(y, [-200, height * 0.12, height], [0.35, 0.85, 0.9]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translateX(${sway}px) rotate(${Math.sin(frame / 40 + i) * 5}deg)`,
              opacity,
            }}
          >
            <Balloon color={color} size={size} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
