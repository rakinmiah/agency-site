import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ACC, BLACK, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX, WHITE} from '../theme';
import {JOST} from '../fonts';
import {Grain, Vignette, Drift} from '../ui';
import {beatF} from '../music';

/* One bar on the riser. The mark draws BIG while the track tightens, the
   wordmark stamps under it, and the last half-beat pushes into the cut —
   the drop lands on the first frame of "ONE TEAM". */

export const STING_DUR = beatF(4); // 96 @60fps

export const Sting: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [4, 78], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordIn = interpolate(frame, [44, 68], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // anticipation: the whole frame leans in over the last half-beat
  const push = interpolate(frame, [84, 96], [1, 1.045], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const W = 640;
  const H = (W * 100) / 220;

  return (
    <AbsoluteFill style={{background: BLACK}}>
      <Drift />
      <AbsoluteFill
        style={{transform: `scale(${push})`, alignItems: 'center', justifyContent: 'center'}}
      >
        <div style={{position: 'relative', width: W, height: H}}>
          <svg viewBox={LEM_VIEWBOX} width={W} height={H}>
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
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              transform: `translateX(-50%) translateY(${28 + (1 - wordIn) * 16}px)`,
              fontFamily: JOST,
              fontWeight: 400,
              fontSize: 46,
              letterSpacing: '0.42em',
              paddingLeft: '0.42em', // recentre: tracking adds a trailing gap
              color: WHITE,
              opacity: wordIn * 0.92,
              whiteSpace: 'nowrap',
            }}
          >
            LOOMWORK<span style={{fontSize: '0.5em', verticalAlign: '0.9em', letterSpacing: 0}}>®</span>
          </div>
        </div>
      </AbsoluteFill>
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
