import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Balloons} from './Balloons';
import {Confetti} from './Confetti';

const FONT_STACK =
  "'Palatino Linotype', 'Palatino', Georgia, 'Liberation Serif', 'DejaVu Serif', serif";

const CardBackground: React.FC<{children: React.ReactNode}> = ({children}) => (
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
    {children}
  </AbsoluteFill>
);

export const IntroCard: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const pop = spring({frame: frame - 8, fps, config: {damping: 14, mass: 0.9}});
  const subFade = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isPortrait = width < 1200;
  const titleSize = isPortrait ? 118 : 138;

  return (
    <CardBackground>
      <Balloons />
      <Confetti seedOffset={1} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: 60,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: titleSize,
            lineHeight: 1.08,
            color: '#fdf3dc',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.01em',
            textShadow: '0 6px 40px rgba(0,0,0,0.55)',
            transform: `scale(${0.7 + pop * 0.3})`,
            opacity: pop,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 42,
            fontFamily: FONT_STACK,
            fontStyle: 'italic',
            fontSize: isPortrait ? 40 : 46,
            color: '#e9c6a8',
            opacity: subFade,
            textAlign: 'center',
          }}
        >
          a few words from the people who love you
        </div>
      </AbsoluteFill>
    </CardBackground>
  );
};

export const OutroCard: React.FC<{title: string; outroLine: string}> = ({
  title,
  outroLine,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, durationInFrames} = useVideoConfig();

  const pop = spring({frame: frame - 4, fps, config: {damping: 16}});
  const lineFade = interpolate(frame, [26, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Gentle fade to black at the very end of the film.
  const endFade = interpolate(
    frame,
    [durationInFrames - 24, durationInFrames - 4],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const isPortrait = width < 1200;

  return (
    <CardBackground>
      <Confetti seedOffset={2} count={50} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: 60,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: isPortrait ? 96 : 116,
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
        <div
          style={{
            marginTop: 38,
            fontFamily: FONT_STACK,
            fontStyle: 'italic',
            fontSize: isPortrait ? 44 : 50,
            color: '#e9c6a8',
            opacity: lineFade,
            textAlign: 'center',
          }}
        >
          {outroLine}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: endFade}} />
    </CardBackground>
  );
};
