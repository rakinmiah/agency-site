import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {ACC, BLACK, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX, WHITE} from '../theme';
import {JOST} from '../fonts';

/* The endcard. M3's squiggle assembles from strands; ours has a reason to —
   the INTERLACE mark IS one thread passing over and under itself. So the thread
   draws the production path (verbatim from the site's --lemI10 mask), then the
   mark settles into the wordmark as L and MWORK close in around it. */

export const END_DUR = 136;

export const Endcard: React.FC = () => {
  const frame = useCurrentFrame();

  // the thread draws the mark
  const draw = interpolate(frame, [6, 58], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // then the mark settles to wordmark scale: 1.65em at font-size 150 = 247.5px
  const settle = interpolate(frame, [58, 86], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const W = interpolate(settle, [0, 1], [690, 247.5]);
  const H = (W * 100) / 220;

  // letters close in around the settling mark
  const lettersIn = interpolate(frame, [64, 90], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = (1 - lettersIn) * 30;

  const regIn = interpolate(frame, [96, 108], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const letter: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    fontFamily: JOST,
    fontWeight: 400,
    fontSize: 150,
    letterSpacing: '-0.01em',
    color: WHITE,
    opacity: lettersIn,
    whiteSpace: 'pre',
  };

  return (
    <AbsoluteFill style={{background: BLACK}}>
      {/* the mark, dead centre, drawn then settled */}
      <svg
        viewBox={LEM_VIEWBOX}
        width={W}
        height={H}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <path
          d={LEM_PATH}
          pathLength={1000}
          fill="none"
          stroke={ACC}
          strokeWidth={LEM_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={1000}
          strokeDashoffset={1000 - draw * 1000}
        />
      </svg>

      {/* L closes in from the left of the mark */}
      <span
        style={{
          ...letter,
          right: `calc(50% + ${W / 2 + 8}px)`,
          transform: `translateY(-54%) translateX(${-drift}px)`,
        }}
      >
        L
      </span>

      {/* MWORK closes in from the right; ® rides it */}
      <span
        style={{
          ...letter,
          left: `calc(50% + ${W / 2 + 8}px)`,
          transform: `translateY(-54%) translateX(${drift}px)`,
        }}
      >
        MWORK
        <span
          style={{
            fontSize: '0.32em',
            verticalAlign: '1.05em',
            opacity: regIn,
            marginLeft: '0.12em',
          }}
        >
          ®
        </span>
      </span>
    </AbsoluteFill>
  );
};
