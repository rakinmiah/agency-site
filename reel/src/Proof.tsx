import React from 'react';
import {Series} from 'remotion';
import {Manifesto, MANIFESTO_DUR} from './beats/Manifesto';
import {MapRide, MAP_DUR} from './beats/MapRide';
import {Endcard, END_DUR} from './beats/Endcard';

/* Proof-of-grammar: three beats only — the manifesto voice, the ride beat,
   the endcard. Hard cuts, M3-style. Judge the register here before the
   full reel gets built. */

export const PROOF_DUR = MANIFESTO_DUR + MAP_DUR + END_DUR;

export const Proof: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={MANIFESTO_DUR}>
      <Manifesto />
    </Series.Sequence>
    <Series.Sequence durationInFrames={MAP_DUR}>
      <MapRide />
    </Series.Sequence>
    <Series.Sequence durationInFrames={END_DUR}>
      <Endcard />
    </Series.Sequence>
  </Series>
);
