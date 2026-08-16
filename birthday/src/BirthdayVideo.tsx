import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IntroCard, OutroCard} from './Cards';
import {ClipFill} from './ClipFill';
import {INTRO_FRAMES, OUTRO_FRAMES} from './timing';
import {BirthdayProps} from './types';

export const BirthdayVideo: React.FC<BirthdayProps> = ({
  clips,
  transitions,
  title,
  outroLine,
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

  items.push(
    <TransitionSeries.Sequence key="intro" durationInFrames={INTRO_FRAMES}>
      <IntroCard title={title} />
    </TransitionSeries.Sequence>
  );

  clips.forEach((clip, i) => {
    items.push(
      <TransitionSeries.Transition
        key={`t-${i}`}
        presentation={fade()}
        timing={linearTiming({durationInFrames: transitions[i]})}
      />
    );
    items.push(
      <TransitionSeries.Sequence
        key={`clip-${i}`}
        durationInFrames={clip.durationInFrames}
      >
        <ClipFill
          clip={clip}
          fadeIn={transitions[i]}
          fadeOut={transitions[i + 1]}
        />
      </TransitionSeries.Sequence>
    );
  });

  items.push(
    <TransitionSeries.Transition
      key="t-outro"
      presentation={fade()}
      timing={linearTiming({durationInFrames: transitions[clips.length]})}
    />
  );
  items.push(
    <TransitionSeries.Sequence key="outro" durationInFrames={OUTRO_FRAMES}>
      <OutroCard title={title} outroLine={outroLine} />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0710'}}>
      <TransitionSeries>{items}</TransitionSeries>
    </AbsoluteFill>
  );
};
