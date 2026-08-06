import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ACC, BLACK, FLOOD_BLUE, FLOOD_GOLD, FLOOD_SKY, INK, OFF, SILVER_GRAD, WHITE} from '../theme';
import {ANTON, JOST} from '../fonts';
import {Burst, Flood, Footage, Grain, SlamText, Vignette} from '../ui';

/* THE PILOT v2 — the open now moves at the track's actual pace: story cards
   slam every 1-2 beats, footage flashes between them, the thread zips through
   each card and SNAPS violently on "someone else." — then the drop inverts the
   world at 6.0s. Audio enters the track at kick-beat 10 (4.0513s), so frame 0
   is on the grid and the drop lands at video beat 15 exactly. */

const DROP = 360; // 15 beats × 23.984f
export const PILOT_DUR = 757; // 12.6s

/* a story card: slam text, alternating grounds, the thread zipping behind */
const FastLine: React.FC<{
  bg: string;
  fg: string;
  text: string;
  size?: number;
  light?: boolean;
  gradient?: boolean;
}> = ({bg, fg, text, size = 96, light, gradient}) => {
  const frame = useCurrentFrame();
  const zip = interpolate(frame, [0, 13], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flash = interpolate(frame, [0, 2, 6], [0.16, 0.07, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wob = Math.sin(frame / 9) * 6;
  return (
    <AbsoluteFill style={{background: gradient ? undefined : bg, backgroundImage: gradient ? SILVER_GRAD : undefined}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <path
          d={`M -40 ${640 + wob} C 480 ${600 - wob}, 960 ${680 + wob}, 1960 ${610 - wob}`}
          pathLength={1000}
          fill="none"
          stroke={ACC}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={light ? 0.5 : 0.4}
          strokeDasharray={1000}
          strokeDashoffset={1000 - zip * 1000}
        />
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <span
          style={{
            fontFamily: JOST,
            fontWeight: 300,
            fontSize: size,
            color: fg,
            whiteSpace: 'pre',
            textAlign: 'center',
            lineHeight: 1.24,
            transform: `scale(${1.06 - Math.min(1, frame / 4) * 0.06})`,
          }}
        >
          {text}
        </span>
      </AbsoluteFill>
      <Grain opacity={light ? 0.26 : 0.42} />
      <Vignette light={light} />
      <AbsoluteFill style={{background: light ? INK : '#FFF', opacity: flash * (light ? 0.4 : 1)}} />
    </AbsoluteFill>
  );
};

/* one-beat footage hit */
const Hit: React.FC<{src: string; from: number}> = ({src, from}) => {
  const frame = useCurrentFrame();
  const flash = frame < 2 ? 0.18 : 0;
  return (
    <AbsoluteFill style={{transform: `scale(${1.05 - Math.min(1, frame / 5) * 0.05})`}}>
      <Footage src={src} from={from} brightness={0.8} />
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* "someone else." — the thread pulls TAUT, vibrates, and SNAPS with recoil */
const SnapCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const SNAP = 46;
  const tension = interpolate(frame, [0, SNAP], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vib = Math.sin(frame * 2.4) * tension * 7;
  const recoil = spring({frame: frame - SNAP, fps, config: {damping: 9, stiffness: 240}});
  const snapped = frame >= SNAP;
  const shake = snapped && frame < SNAP + 5 ? Math.sin(frame * 3.2) * (SNAP + 5 - frame) : 0;
  const flash = snapped && frame < SNAP + 2 ? 0.3 : 0;
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        {!snapped ? (
          <path
            d={`M -40 ${620 + vib} C 480 ${600 - vib}, 1440 ${640 + vib}, 1960 ${600 - vib}`}
            fill="none"
            stroke={ACC}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.75}
          />
        ) : (
          <>
            <path
              d={`M -40 620 C 300 610, 700 ${628 + recoil * 60}, ${940 - recoil * 130} ${640 + recoil * 110}`}
              fill="none" stroke={ACC} strokeWidth={6} strokeLinecap="round" opacity={0.75}
            />
            <path
              d={`M ${980 + recoil * 130} ${600 - recoil * 100} C 1250 ${618 - recoil * 50}, 1500 608, 1960 600`}
              fill="none" stroke={ACC} strokeWidth={6} strokeLinecap="round" opacity={0.75}
            />
          </>
        )}
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
        <div style={{textAlign: 'center'}}>
          <span style={{fontFamily: JOST, fontWeight: 300, fontSize: 118, color: WHITE, whiteSpace: 'pre'}}>
            someone else.
          </span>
          <div
            style={{
              height: 7,
              width: snapped ? '0%' : `${tension * 62}%`,
              background: ACC,
              margin: '12px auto 0',
              borderRadius: 4,
            }}
          />
        </div>
      </AbsoluteFill>
      <Grain opacity={0.45} />
      <Vignette />
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* THE DROP — the world inverts: ink slab on white */
const Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame < 5 ? Math.sin(frame * 3.1) * (5 - frame) : 0;
  const settle = interpolate(frame, [0, 5], [1.09, 1], {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tick = interpolate(frame, [4, 11], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const settle2 = interpolate(frame, [30, 52], [100, 58], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: WHITE, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${settle}) translateX(${shake}px)`, position: 'relative', textAlign: 'center'}}>
        {frame < 3 && (
          <>
            <span style={{position: 'absolute', left: -7, top: 5, fontFamily: ANTON, fontSize: 205, color: '#FF3B30', opacity: 0.65, whiteSpace: 'pre', textTransform: 'uppercase'}}>
              Let&apos;s fix that.
            </span>
            <span style={{position: 'absolute', left: 7, top: -5, fontFamily: ANTON, fontSize: 205, color: ACC, opacity: 0.65, whiteSpace: 'pre', textTransform: 'uppercase'}}>
              Let&apos;s fix that.
            </span>
          </>
        )}
        <span style={{fontFamily: ANTON, fontSize: 205, color: INK, whiteSpace: 'pre', textTransform: 'uppercase', position: 'relative'}}>
          Let&apos;s fix that.
        </span>
        <div style={{height: 12, width: `${Math.min(tick, settle2)}%`, background: ACC, margin: '20px auto 0', borderRadius: 6}} />
      </div>
      <Grain opacity={0.26} />
      <Vignette light />
    </AbsoluteFill>
  );
};

const LadderLine: React.FC = () => {
  const frame = useCurrentFrame();
  const caretOn = Math.floor(frame / 11) % 2 === 0;
  return (
    <Footage src="stock/laptop-typing.mp4" from={6} brightness={0.34}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <SlamText text="We build sites" size={158} color={WHITE} />
          <div style={{height: 8}} />
          {frame >= 8 && (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <SlamText text="that get you" size={158} color={WHITE} />
              <span style={{display: 'inline-block', width: '0.14em', height: '0.78em', fontSize: 158, background: caretOn ? ACC : 'transparent', marginLeft: '0.06em'}} />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </Footage>
  );
};

const AVALANCHE: Array<{w: string; bg: string; fg: string}> = [
  {w: 'found.', bg: INK, fg: WHITE},
  {w: 'seen.', bg: WHITE, fg: INK},
  {w: 'clicked.', bg: FLOOD_SKY, fg: WHITE},
  {w: 'called.', bg: INK, fg: WHITE},
  {w: 'quoted.', bg: WHITE, fg: INK},
  {w: 'chosen.', bg: FLOOD_BLUE, fg: WHITE},
  {w: 'trusted.', bg: INK, fg: WHITE},
  {w: 'rated.', bg: WHITE, fg: INK},
  {w: 'booked.', bg: '#2FBF71', fg: WHITE},
  {w: 'busy.', bg: INK, fg: WHITE},
];

const AvalancheWord: React.FC<{w: string; bg: string; fg: string}> = ({w, bg, fg}) => {
  const frame = useCurrentFrame();
  const punch = 1.08 - Math.min(1, frame / 4) * 0.08;
  const flash = frame < 1 ? 0.18 : 0;
  return (
    <AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontFamily: ANTON, fontSize: 185, color: fg, lineHeight: 1, transform: `scale(${punch})`}}>
        {w}
      </span>
      <Grain opacity={0.3} />
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </AbsoluteFill>
  );
};

export const PilotOpen: React.FC = () => (
  <>
    <Audio
      src={staticFile('music/pilot-intro.wav')}
      volume={(f) => interpolate(f, [717, 757], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    <Series>
      {/* THE FAST OPEN — 15 beats, story at the music's pace */}
      <Series.Sequence durationInFrames={48}>
        <FastLine bg={INK} fg={WHITE} text="right now" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={24}>
        <Hit src="stock/city-night-intersection.mp4" from={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={48}>
        <FastLine bg="" gradient light fg={INK} text="someone in your town" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={24}>
        <Hit src="stock/hands-phone-night.mp4" from={2} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={72}>
        <FastLine bg={OFF} fg={WHITE} text={'is searching\nfor what you do'} size={88} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={24}>
        <Hit src="stock/golden-hour-drive.mp4" from={4} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={48}>
        <FastLine bg={INK} fg={WHITE} text="and they’re finding" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={72}>
        <SnapCard />
      </Series.Sequence>
      {/* THE DROP */}
      <Series.Sequence durationInFrames={96}>
        <Fix />
      </Series.Sequence>
      <Series.Sequence durationInFrames={48}>
        <Burst
          dur={48}
          shots={[
            {src: 'stock/night-tunnel-drive.mp4', from: 4},
            {src: 'stock/golden-hour-drive.mp4', from: 6},
          ]}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={72}>
        <LadderLine />
      </Series.Sequence>
      {AVALANCHE.map((a, i) => (
        <Series.Sequence key={i} durationInFrames={12}>
          <AvalancheWord {...a} />
        </Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={61}>
        <Flood color={FLOOD_GOLD} alt="#F7CE72" verb="paid." />
      </Series.Sequence>
    </Series>
  </>
);
