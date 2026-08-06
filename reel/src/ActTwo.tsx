import React from 'react';
import {Audio, Series, staticFile} from 'remotion';
import {beatF} from './music';
import {SiteBuild, SITE_D} from './beats/SiteBuild';
import {SearchFound, SEARCH_D} from './beats/SearchFound';
import {AdsFlagship, ADS_D} from './beats/AdsFlagship';

/* Act Two: the site (3 bars) → the search (3 bars) → the ads (7 bars, the
   flagship on the track's sustained peak). Review comp — starts at beat 20,
   so the audio starts 8.0s into the pre-cut WAV. The final master plays the
   WAV continuously from 0; this startFrom exists only for act-review. */

export const ACT_TWO_DUR = SITE_D + SEARCH_D + ADS_D; // 1247

export const ActTwo: React.FC = () => (
  <>
    <Audio src={staticFile('music/edit-master.wav')} startFrom={beatF(20)} />
    <Series>
      <Series.Sequence durationInFrames={SITE_D}>
        <SiteBuild />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SEARCH_D}>
        <SearchFound />
      </Series.Sequence>
      <Series.Sequence durationInFrames={ADS_D}>
        <AdsFlagship />
      </Series.Sequence>
    </Series>
  </>
);
