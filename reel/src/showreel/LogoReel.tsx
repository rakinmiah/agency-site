import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {ACC, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX} from '../theme';
import {JOST} from '../fonts';
import {loadReelFonts} from './reelFonts';
import FRAMES from './reelFrames.json';
import LEM from './lemMask.json';

/* THE OPENING — 2 bars, bar-locked.
   18 treatments at 5 frames (83ms) = 90f, 6f hold = 96f = exactly one bar, so
   the logo SNAPS on the downbeat of bar 2. No draw-on: the mark arrives whole,
   with a punch and a flash. The lockup is a flex row — L, mark and MWORK are
   wildly asymmetric, so centring the mark left the lockup off-centre. */

const PER = 5;
const FLIPS = FRAMES.length * PER;   // 90
const SNAP = 96;                     // downbeat of bar 2
export const LOGO_REEL_DUR = 192;    // 2 bars · 3.2s

const INK = '#0B0B0D';
const SIZE = 148;

export const LogoReel: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  const f = useCurrentFrame();
  const [handle] = React.useState(() => delayRender('reel display faces'));
  React.useEffect(() => {
    /* the fetch STARTS here now — building the promise at import time meant every
       render of every composition paid for 17 display faces it never drew */
    loadReelFonts().then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  const idx = Math.min(FRAMES.length - 1, Math.floor(f / PER));
  const flipping = f < SNAP;

  // the snap: whole, immediate, with a punch
  const l = f - SNAP;
  const punch = interpolate(l, [0, 6], [1.07, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // and a fast wipe out of the opening, into whatever cuts next
  const wipe = interpolate(f, [176, 192], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const markW = SIZE * 1.65;
  const markH = (markW * 100) / 220;

  return (
    <AbsoluteFill
      style={{
        background: INK,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ['--lemI10' as string]: LEM.lemI10,
      }}
    >
      {flipping ? (
        <div
          style={{transform: 'scale(1.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          dangerouslySetInnerHTML={{__html: FRAMES[idx]}}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            transform: `scale(${punch})`,
          }}
        >
          <span style={{fontFamily: JOST, fontWeight: 400, fontSize: SIZE, color: '#fff', letterSpacing: '-.01em', lineHeight: 1}}>
            L
          </span>
          <svg viewBox={LEM_VIEWBOX} width={markW} height={markH} style={{display: 'block', marginTop: -SIZE * 0.055}}>
            <path d={LEM_PATH} fill="none" stroke={ACC} strokeWidth={LEM_STROKE_WIDTH} strokeLinecap="round" />
          </svg>
          <span style={{fontFamily: JOST, fontWeight: 400, fontSize: SIZE, color: '#fff', letterSpacing: '-.01em', lineHeight: 1}}>
            MWORK
            <span style={{fontSize: '.3em', verticalAlign: '1.15em', opacity: 0.6}}>®</span>
          </span>
        </div>
      )}

      {/* the snap's flash */}
      {l >= 0 && l < 2 && <AbsoluteFill style={{background: '#fff', opacity: 0.22}} />}

      {/* fast wipe into the next section */}
      {wipe > 0 && (
        <AbsoluteFill style={{background: '#fff', transform: `translateX(${(1 - wipe) * -100}%)`}} />
      )}

      {withAudio && <Audio src={staticFile('music/showreel.wav')} />}
    </AbsoluteFill>
  );
};
