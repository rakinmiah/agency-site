import React from 'react';
import {Audio, Series, staticFile} from 'remotion';
import {Sting, STING_DUR} from './beats/Sting';
import {Manifesto, MANIFESTO_DUR} from './beats/Manifesto';
import {LadderIntro, LADDER_INTRO_DUR} from './beats/LadderIntro';

/* Act One, v2: sting (riser bar) → manifesto (3 bars) → ladder intro (1 bar).
   Audio is the pre-cut WAV — frame 0 is a downbeat by construction, the drop
   hits at frame 96 with "ONE TEAM". No startFrom, nothing left to drift. */

export const ACT_ONE_DUR = STING_DUR + MANIFESTO_DUR + LADDER_INTRO_DUR; // 480

export const ActOne: React.FC = () => (
  <>
    <Audio src={staticFile('music/edit-master.wav')} />
    <Series>
      <Series.Sequence durationInFrames={STING_DUR}>
        <Sting />
      </Series.Sequence>
      <Series.Sequence durationInFrames={MANIFESTO_DUR}>
        <Manifesto />
      </Series.Sequence>
      <Series.Sequence durationInFrames={LADDER_INTRO_DUR}>
        <LadderIntro />
      </Series.Sequence>
    </Series>
  </>
);
