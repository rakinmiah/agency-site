import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ACC, GRAIN_URL, OFF} from './theme';
import {ANTON} from './fonts';
import {BEAT_SEC} from './music';

/* Shared energy kit. The first Act One pass failed on flatness — light type
   floating in dead space. Everything here exists to keep every frame alive:
   grain that crawls, light that drifts, grounds that pulse on the kick, cuts
   that flash and slam. */

/* film grain, animated — the tile walks a deterministic path so it never sits still */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.5}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN_URL}")`,
        backgroundRepeat: 'repeat',
        backgroundPosition: `${(frame * 37) % 240}px ${(frame * 61) % 240}px`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{light?: boolean}> = ({light}) => (
  <AbsoluteFill
    style={{
      background: light
        ? 'radial-gradient(ellipse at center, transparent 58%, rgba(21,22,26,.16) 100%)'
        : 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,.5) 100%)',
      pointerEvents: 'none',
    }}
  />
);

/* a slow light-field wander — the site hero's light drift, reduced to one blob */
export const Drift: React.FC = () => {
  const frame = useCurrentFrame();
  const x = Math.sin(frame / 97) * 260;
  const y = Math.cos(frame / 113) * 140;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '42%',
          width: 1400,
          height: 900,
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,.065), transparent 62%)',
        }}
      />
    </AbsoluteFill>
  );
};

/* the card wrapper: ground + drift + kick-pulse + cut-flash + grain + vignette */
export const CardFX: React.FC<{
  bg: string;
  light?: boolean;
  flash?: boolean;
  children: React.ReactNode;
}> = ({bg, light, flash = true, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bf = BEAT_SEC * fps;
  const phase = (frame % bf) / bf;
  const pulse = 1 + Math.exp(-phase * 5) * 0.011;   // breathes ON the kick
  const flashO = flash
    ? interpolate(frame, [0, 2, 8], [0, 0.13, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  return (
    <AbsoluteFill style={{background: bg}}>
      {!light && <Drift />}
      <AbsoluteFill
        style={{transform: `scale(${pulse})`, alignItems: 'center', justifyContent: 'center'}}
      >
        {children}
      </AbsoluteFill>
      <Grain opacity={light ? 0.3 : 0.5} />
      <Vignette light={light} />
      <AbsoluteFill
        style={{background: light ? '#101114' : '#FFFFFF', opacity: light ? flashO * 0.5 : flashO}}
      />
    </AbsoluteFill>
  );
};

/* graded footage: every stock clip passes through the same duotone-dark grade
   so eight different sources read as one world. Children composite on top —
   M3's type-over-footage device. */
export const Footage: React.FC<{
  src: string;
  from?: number;               // seconds into the clip
  brightness?: number;
  tint?: number;
  children?: React.ReactNode;
}> = ({src, from = 0, brightness = 0.72, tint = 0.16, children}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        startFrom={Math.round(from * fps)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: `grayscale(0.6) contrast(1.14) brightness(${brightness}) saturate(1.05)`,
        }}
      />
      <AbsoluteFill style={{background: OFF, opacity: 0.22}} />
      <AbsoluteFill style={{background: ACC, mixBlendMode: 'soft-light', opacity: tint}} />
      {children}
      <Grain opacity={0.4} />
      <Vignette />
    </AbsoluteFill>
  );
};

/* one micro-shot of a burst: footage + white impact flash + scale punch */
const BurstShot: React.FC<{src: string; from: number}> = ({src, from}) => {
  const frame = useCurrentFrame();
  const punch = 1.05 - Math.min(1, frame / 5) * 0.05;
  const flash = interpolate(frame, [0, 2, 5], [0.22, 0.1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{transform: `scale(${punch})`}}>
      <Footage src={src} from={from} brightness={0.8} />
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* the stutter-burst: 3-6 near-subliminal footage hits — M3's signature device */
export const Burst: React.FC<{shots: Array<{src: string; from: number}>; dur: number}> = ({
  shots,
  dur,
}) => {
  const per = Math.floor(dur / shots.length);
  return (
    <Series>
      {shots.map((s, i) => (
        <Series.Sequence
          key={i}
          durationInFrames={i === shots.length - 1 ? dur - per * (shots.length - 1) : per}
        >
          <BurstShot src={s.src} from={s.from} />
        </Series.Sequence>
      ))}
    </Series>
  );
};

/* the flood: a saturated ground GROWS in as an organic blob from behind the verb
   (M3's "connect" mechanic), a soft secondary blob keeps drifting through the hold */
export const Flood: React.FC<{
  color: string;
  alt: string;
  verb: string;
  offsetX?: number;            // composition rotation: nudge the verb off-centre
  offsetY?: number;
  children?: React.ReactNode;
}> = ({color, alt, verb, offsetX = 0, offsetY = 0, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grow = spring({frame, fps, config: {damping: 16, stiffness: 150}});
  const drift = Math.sin(frame / 21);
  return (
    <AbsoluteFill style={{background: OFF, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: grow * 3000,
          height: grow * 3000,
          borderRadius: '50%',
          background: color,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${62 + drift * 6}%`,
          top: `${68 - drift * 4}%`,
          width: 760,
          height: 560,
          borderRadius: '48% 52% 55% 45%',
          background: alt,
          opacity: grow * 0.55,
          filter: 'blur(26px)',
          transform: `translate(-50%, -50%) rotate(${drift * 9}deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${offsetX}px, ${offsetY}px)`,
        }}
      >
        <div style={{textAlign: 'center'}}>
          <span
            style={{
              fontFamily: ANTON,
              fontWeight: 400,
              fontSize: 150,
              lineHeight: 1,
              color: 'rgba(255,255,255,.93)',
              opacity: Math.min(1, grow * 1.6),
            }}
          >
            {verb}
          </span>
          {children}
        </div>
      </AbsoluteFill>
      <Grain opacity={0.35} />
      <Vignette light />
    </AbsoluteFill>
  );
};

/* the slab: Anton caps slamming to rest, two frames of RGB-split on arrival —
   M3's glitch gesture, spent only on impact */
export const SlamText: React.FC<{
  text: string;
  size: number;
  color: string;
  blend?: 'screen' | 'multiply';
  style?: React.CSSProperties;
}> = ({text, size, color, blend = 'screen', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 520}});
  const scale = 1.14 - 0.14 * s;
  const glitch = frame < 4;
  const st: React.CSSProperties = {
    fontFamily: ANTON,
    fontWeight: 400,
    fontSize: size,
    color,
    letterSpacing: '0.005em',
    lineHeight: 1,
    whiteSpace: 'pre',
    textTransform: 'uppercase',
    ...style,
  };
  return (
    <div style={{position: 'relative', transform: `scale(${scale})`}}>
      {glitch && (
        <span style={{...st, position: 'absolute', left: -6, top: 4, color: '#FF3B30', opacity: 0.8, mixBlendMode: blend}}>
          {text}
        </span>
      )}
      {glitch && (
        <span style={{...st, position: 'absolute', left: 6, top: -4, color: ACC, opacity: 0.8, mixBlendMode: blend}}>
          {text}
        </span>
      )}
      <span style={{...st, position: 'relative'}}>{text}</span>
    </div>
  );
};
