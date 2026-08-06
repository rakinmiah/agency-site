import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ACC, WHITE} from '../theme';
import {ANTON} from '../fonts';
import {Footage, SlamText} from '../ui';
import {beatF} from '../music';

/* One bar — the pivot line, now composited over working hands (dark), the
   hanging accent caret still the cliffhanger into Act II. */

export const LADDER_INTRO_DUR = beatF(20) - beatF(16); // 96

export const LadderIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const caretIn = interpolate(frame, [56, 68], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caretOn = Math.floor(frame / 11) % 2 === 0;
  return (
    <Footage src="stock/laptop-typing.mp4" from={6} brightness={0.34}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <SlamText text="We build sites" size={168} color={WHITE} />
          <div style={{height: 8}} />
          {frame >= 9 && (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <SlamText text="that get you" size={168} color={WHITE} />
              <span
                style={{
                  display: 'inline-block',
                  width: '0.14em',
                  height: '0.78em',
                  fontSize: 168,
                  fontFamily: ANTON,
                  background: caretOn ? ACC : 'transparent',
                  opacity: caretIn,
                  marginLeft: '0.06em',
                }}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </Footage>
  );
};
