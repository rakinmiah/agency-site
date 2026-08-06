import React from 'react';
import {AbsoluteFill, Series, interpolate, useCurrentFrame} from 'remotion';
import {ACC, BLACK, INK, SILVER_GRAD, WHITE} from '../theme';
import {ANTON} from '../fonts';
import {Burst, CardFX, Footage, Grain, SlamText, Vignette} from '../ui';
import {beatF} from '../music';

/* Manifesto v3 — burst grammar. The sentence still cuts on the kick, but now:
   "One team" slams OVER footage (type-over-footage composite), a 4-shot
   stutter-burst detonates after it, the fragments rotate composition and
   ground treatment (silver-gradient card, off-card, black), and held type
   sits at 150-200px — confident, not enormous. */

const D_ONETEAM = beatF(7) - beatF(4);      // 72
const D_BURST = beatF(9) - beatF(7);        // 48
const D_ONSITE = beatF(10.5) - beatF(9);    // 36
const D_SEARCH = beatF(12) - beatF(10.5);   // 36
const D_TYPED = beatF(16) - beatF(12);      // 96

export const MANIFESTO_DUR = D_ONETEAM + D_BURST + D_ONSITE + D_SEARCH + D_TYPED; // 288

/* "One team" — the thesis, over the night tunnel at 40% brightness */
const OneTeam: React.FC = () => {
  const frame = useCurrentFrame();
  const tick = interpolate(frame, [3, 9], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const settle = interpolate(frame, [26, 44], [100, 62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = interpolate(frame, [0, 2, 8], [0, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Footage src="stock/night-tunnel-drive.mp4" from={3} brightness={0.42}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div>
          <SlamText text="One team" size={200} color={WHITE} />
          <div style={{height: 10, width: `${Math.min(tick, settle)}%`, background: ACC, marginTop: 20, borderRadius: 5}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </Footage>
  );
};

/* "on the site" — silver-gradient card, ink type, UPPER-LEFT third */
const OnSite: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 2, 7], [0.2, 0.08, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: SILVER_GRAD}}>
      <div style={{position: 'absolute', top: '20%', left: '7%'}}>
        <SlamText text="on the site" size={172} color={INK} blend="multiply" />
      </div>
      <Grain opacity={0.28} />
      <Vignette light />
      <AbsoluteFill style={{background: INK, opacity: flash * 0.4}} />
    </AbsoluteFill>
  );
};

/* "the search" — off ground, CENTRE-RIGHT */
const Search: React.FC = () => (
  <CardFX bg="#101114">
    <div style={{position: 'absolute', top: '42%', right: '7%'}}>
      <SlamText text="the search" size={182} color={WHITE} />
    </div>
  </CardFX>
);

/* "and the ads." — typed on black; the track's second-stage drop lands mid-type */
const Typed: React.FC = () => {
  const frame = useCurrentFrame();
  const text = 'and the ads';
  const shown = Math.min(text.length, Math.floor(frame / 5));
  const done = shown >= text.length;
  const caretOn = Math.floor(frame / 11) % 2 === 0;
  return (
    <CardFX bg={BLACK}>
      <span
        style={{
          fontFamily: ANTON,
          fontWeight: 400,
          fontSize: 190,
          color: WHITE,
          lineHeight: 1,
          whiteSpace: 'pre',
          textTransform: 'uppercase',
        }}
      >
        {text.slice(0, shown)}
        {done && <span style={{color: ACC}}>.</span>}
        <span
          style={{
            display: 'inline-block',
            width: '0.14em',
            height: '0.82em',
            background: caretOn ? ACC : 'transparent',
            transform: 'translateY(0.06em)',
            marginLeft: '0.05em',
          }}
        />
      </span>
    </CardFX>
  );
};

export const Manifesto: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={D_ONETEAM}>
      <OneTeam />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_BURST}>
      <Burst
        dur={D_BURST}
        shots={[
          {src: 'stock/city-night-intersection.mp4', from: 5},
          {src: 'stock/golden-hour-drive.mp4', from: 2},
          {src: 'stock/hands-phone-night.mp4', from: 1.5},
          {src: 'stock/uk-bristol-aerial.mp4', from: 5},
        ]}
      />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_ONSITE}>
      <OnSite />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_SEARCH}>
      <Search />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_TYPED}>
      <Typed />
    </Series.Sequence>
  </Series>
);
