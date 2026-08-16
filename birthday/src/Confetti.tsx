import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

const COLORS = ['#f6c453', '#ef767a', '#7bdff2', '#f4a5c2', '#b8a1e6', '#8fd694'];

type Props = {
  count?: number;
  seedOffset?: number;
};

// Deterministic confetti rain. Each particle falls with its own delay, drift
// and spin so the shower feels continuous for the whole sequence.
export const Confetti: React.FC<Props> = ({count = 70, seedOffset = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();

  const particles = new Array(count).fill(0).map((_, i) => {
    const seed = i + seedOffset * 1000;
    const x = random(`x-${seed}`) * width;
    const delay = random(`d-${seed}`) * durationInFrames * 0.8;
    const fallDuration = 140 + random(`f-${seed}`) * 120;
    const size = 10 + random(`s-${seed}`) * 14;
    const color = COLORS[Math.floor(random(`c-${seed}`) * COLORS.length)];
    const sway = 30 + random(`w-${seed}`) * 60;
    const spin = (random(`r-${seed}`) - 0.5) * 25;
    const isRect = random(`t-${seed}`) > 0.4;

    const t = frame - delay;
    if (t < 0) {
      return null;
    }
    const progress = t / fallDuration;
    const y = interpolate(progress, [0, 1], [-40, height + 40]);
    if (y > height + 40) {
      return null;
    }
    const dx = Math.sin(t / 18 + seed) * sway;
    const rotate = t * spin * 0.35;
    const opacity = interpolate(progress, [0, 0.08, 0.85, 1], [0, 1, 1, 0]);

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: isRect ? size * 0.55 : size,
          borderRadius: isRect ? 2 : '50%',
          backgroundColor: color,
          opacity,
          transform: `translate(${dx}px, ${y}px) rotate(${rotate}deg)`,
        }}
      />
    );
  });

  return <AbsoluteFill style={{pointerEvents: 'none'}}>{particles}</AbsoluteFill>;
};
