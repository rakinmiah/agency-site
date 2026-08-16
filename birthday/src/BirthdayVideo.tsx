import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {OutroCard} from './Cards';
import {ClipFill} from './ClipFill';
import {OPENING_FADE, OUTRO_FRAMES} from './timing';
import {BirthdayProps} from './types';

// Soft fade in from black over the very first frames of the film.
const OpeningFade: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, OPENING_FADE], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity, zIndex: 10}} />
  );
};

export const BirthdayVideo: React.FC<BirthdayProps> = ({
  clips,
  transitions,
  title,
}) => {
  if (clips.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#1a0e22',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fdf3dc',
          fontSize: 40,
          fontFamily: 'sans-serif',
        }}
      >
        Waiting for clips…
      </AbsoluteFill>
    );
  }

  // TransitionSeries needs a flat array of Sequence/Transition children —
  // fragments would defeat its child inspection.
  const items: React.ReactNode[] = [];

  clips.forEach((clip, i) => {
    items.push(
      <TransitionSeries.Sequence
        key={`clip-${i}`}
        durationInFrames={clip.durationInFrames}
      >
        <ClipFill
          clip={clip}
          fadeIn={i === 0 ? OPENING_FADE : transitions[i - 1]}
          fadeOut={transitions[i]}
        />
      </TransitionSeries.Sequence>
    );
    items.push(
      <TransitionSeries.Transition
        key={`t-${i}`}
        presentation={fade()}
        timing={linearTiming({durationInFrames: transitions[i]})}
      />
    );
  });

  items.push(
    <TransitionSeries.Sequence key="outro" durationInFrames={OUTRO_FRAMES}>
      <OutroCard title={title} />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0710'}}>
      <TransitionSeries>{items}</TransitionSeries>
      <OpeningFade />
    </AbsoluteFill>
  );
};
