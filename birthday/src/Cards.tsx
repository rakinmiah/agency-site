import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Confetti} from './Confetti';

const FONT_STACK =
  "'Palatino Linotype', 'Palatino', Georgia, 'Liberation Serif', 'DejaVu Serif', serif";

// Closing card: just the birthday line, confetti, then a gentle fade to black.
export const OutroCard: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps, width, durationInFrames} = useVideoConfig();

  const pop = spring({frame: frame - 4, fps, config: {damping: 16}});
  const endFade = interpolate(
    frame,
    [durationInFrames - 24, durationInFrames - 4],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const isPortrait = width < 1200;

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(120% 90% at 50% 20%, #4a2a52 0%, #2d1836 55%, #1a0e22 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(60% 45% at 50% 42%, rgba(246,196,83,0.16) 0%, rgba(246,196,83,0) 70%)',
        }}
      />
      <Confetti seedOffset={2} count={60} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: isPortrait ? 104 : 124,
            lineHeight: 1.12,
            color: '#fdf3dc',
            fontWeight: 700,
            textAlign: 'center',
            textShadow: '0 6px 40px rgba(0,0,0,0.55)',
            transform: `scale(${0.75 + pop * 0.25})`,
            opacity: pop,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};
