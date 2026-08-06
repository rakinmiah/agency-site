import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {ACC, BLACK, FLOOD_SKY, INK, SILVER_GRAD, WHITE, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX} from '../theme';
import {ANTON, JOST} from '../fonts';
import {Footage, Grain, Vignette} from '../ui';

/* THE TRANSPLANT — their edit, our blood.
   Every slot below carries the EXACT frame count of the corresponding shot in
   the M3 reel (measured from the cut list), and the audio bed enters the track
   at their measured entry offset (27.726s). Their editor's musical timing is
   inherited wholesale; our content pours into the slots. */

export const TRANS_ONE_DUR = 932; // slots 1-26, their exact total

/* slot 1 — the sting card (their M3.AGENCY) */
const Sting: React.FC = () => {
  const frame = useCurrentFrame();
  const inO = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: inO, textAlign: 'center'}}>
        <svg viewBox={LEM_VIEWBOX} width={132} height={60} style={{display: 'block', margin: '0 auto 18px'}}>
          <path d={LEM_PATH} fill="none" stroke={ACC} strokeWidth={LEM_STROKE_WIDTH} strokeLinecap="round" />
        </svg>
        <span style={{fontFamily: JOST, fontWeight: 400, fontSize: 54, letterSpacing: '0.42em', paddingLeft: '0.42em', color: WHITE}}>
          LOOMWORK<span style={{fontSize: '0.5em', verticalAlign: '0.9em', letterSpacing: 0}}>®</span>
        </span>
      </div>
      <Grain opacity={0.4} />
      <Vignette />
    </AbsoluteFill>
  );
};

/* micro footage shot — no flash overlay at 2f, the strobe IS the effect */
const Micro: React.FC<{src: string; from: number; bright?: number}> = ({src, from, bright = 0.8}) => (
  <Footage src={src} from={from} brightness={bright} />
);

/* the collage grammar: STILLS cut hard with aggressive zooms/pans and layers —
   speed and overlap hide the stockness, motion never stops */
const StillHit: React.FC<{
  img: string;
  mode?: 'in' | 'out' | 'panL' | 'panR';
  children?: React.ReactNode;
}> = ({img, mode = 'in', children}) => {
  const frame = useCurrentFrame();
  const e = 1 - Math.pow(1 - Math.min(1, frame / 14), 3);
  const t =
    mode === 'in' ? `scale(${1.18 - 0.14 * e})`
    : mode === 'out' ? `scale(${1.02 + 0.14 * e})`
    : mode === 'panL' ? `scale(1.14) translateX(${(0.5 - e) * 70}px)`
    : `scale(1.14) translateX(${(e - 0.5) * 70}px)`;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url("${staticFile(img)}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: t,
          filter: 'grayscale(0.55) contrast(1.14) brightness(0.78) saturate(1.05)',
        }}
      />
      <AbsoluteFill style={{background: INK, opacity: 0.18}} />
      <AbsoluteFill style={{background: ACC, mixBlendMode: 'soft-light', opacity: 0.15}} />
      {children}
      <Grain opacity={0.4} />
      <Vignette />
      {frame < 1 && <AbsoluteFill style={{background: '#FFF', opacity: 0.16}} />}
    </AbsoluteFill>
  );
};

/* overlay: a live search pill — the story riding ON the imagery */
const SearchChip: React.FC<{text: string; x: number; y: number}> = ({text, x, y}) => {
  const frame = useCurrentFrame();
  const s = 1 - Math.pow(1 - Math.min(1, frame / 8), 3);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 50%',
        background: WHITE, borderRadius: 999, padding: '14px 26px',
        boxShadow: '0 20px 55px -18px rgba(0,0,0,.5)',
        fontFamily: JOST, fontWeight: 500, fontSize: 30, color: INK,
        display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap',
      }}
    >
      <svg width={22} height={22} viewBox="0 0 24 24" style={{opacity: 0.55}}>
        <circle cx={10} cy={10} r={7} fill="none" stroke={INK} strokeWidth={2.6} />
        <line x1={15.5} y1={15.5} x2={21} y2={21} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      </svg>
      {text}
    </div>
  );
};

/* overlay: an accent ring drawing itself around a subject */
const Ring: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const frame = useCurrentFrame();
  const draw = Math.min(1, frame / 12);
  const C = 2 * Math.PI * r;
  return (
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <circle
        cx={x} cy={y} r={r} fill="none" stroke={ACC} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - draw)} transform={`rotate(-90 ${x} ${y})`}
        opacity={0.9}
      />
    </svg>
  );
};

/* overlay: giant ghost type sliding behind the image */
const GhostWord: React.FC<{word: string}> = ({word}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: 0, top: '50%', transform: `translateY(-50%) translateX(${-140 + frame * 3.2}px)`,
        fontFamily: ANTON, fontSize: 430, color: WHITE, opacity: 0.1,
        whiteSpace: 'nowrap', textTransform: 'uppercase',
      }}
    >
      {word}
    </div>
  );
};

/* slot 13 — the mark performs (their squiggle-morph, 2.8s on white) */
const MorphCard: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [4, 96], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ghost = interpolate(frame, [4, 96, 130], [10, 7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rot = Math.sin(frame / 26) * interpolate(frame, [96, 168], [0, 3.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = 1 + interpolate(frame, [96, 168], [0, 0.07], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const W = 780, H = (W * 100) / 220;
  const dash = {
    pathLength: 1000,
    fill: 'none',
    strokeWidth: LEM_STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeDasharray: 1000,
    strokeDashoffset: 1000 - draw * 1000,
  };
  return (
    <AbsoluteFill style={{background: WHITE, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `rotate(${rot}deg) scale(${scale})`}}>
        <svg viewBox={LEM_VIEWBOX} width={W} height={H}>
          <path d={LEM_PATH} {...dash} stroke="#FF3B30" opacity={0.5} transform={`translate(${-ghost} ${ghost * 0.6})`} />
          <path d={LEM_PATH} {...dash} stroke={FLOOD_SKY} opacity={0.5} transform={`translate(${ghost} ${-ghost * 0.6})`} />
          <path d={LEM_PATH} {...dash} stroke={INK} />
        </svg>
      </div>
      <Grain opacity={0.24} />
      <Vignette light />
    </AbsoluteFill>
  );
};

/* slot 21 — the colour campaign card (their Feel good) */
const ColourCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 10], [1.05, 1], {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drift = Math.sin(frame / 23);
  return (
    <AbsoluteFill style={{background: FLOOD_SKY, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', left: `${64 + drift * 5}%`, top: '70%', width: 700, height: 520,
          borderRadius: '46% 54% 52% 48%', background: '#7FD0FF', opacity: 0.6,
          filter: 'blur(28px)', transform: 'translate(-50%, -50%)',
        }}
      />
      <div style={{transform: `scale(${s})`, textAlign: 'center', position: 'relative'}}>
        <div style={{fontFamily: JOST, fontWeight: 300, fontSize: 108, color: WHITE, lineHeight: 1.15}}>
          More work from
          <br />
          your <span style={{fontWeight: 500}}>website.</span>
        </div>
      </div>
      <Grain opacity={0.3} />
    </AbsoluteFill>
  );
};

/* slot 22 — the silver type-cycler: lines swap INSIDE one shot, their device */
/* the cycler runs the setup; its hanging last line is completed by the giant
   word that follows — their "break through the → NOISE" mechanic exactly */
const LINES = ['right now', 'your next customer', 'is searching', 'and you’re'];
const SilverCycler: React.FC = () => {
  const frame = useCurrentFrame();
  const per = 52;
  const idx = Math.min(LINES.length - 1, Math.floor(frame / per));
  const local = frame - idx * per;
  // their cycler TYPES each line (frame archive shows mid-word states), then swaps
  const chars = Math.min(LINES[idx].length, Math.ceil(local / 1.6));
  return (
    <AbsoluteFill style={{backgroundImage: SILVER_GRAD, alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontFamily: JOST, fontWeight: 300, fontSize: 104, color: INK, whiteSpace: 'pre'}}>
        {LINES[idx].slice(0, chars)}
      </span>
      <Grain opacity={0.24} />
      <Vignette light />
    </AbsoluteFill>
  );
};

/* slots 23-24 — the giant word mid-slide, heavy blur (their NOISE fragments) */
const BlurFrag: React.FC<{offset: number; blur: number; dark?: boolean}> = ({offset, blur, dark}) => (
  <AbsoluteFill style={{background: dark ? BLACK : undefined, backgroundImage: dark ? undefined : SILVER_GRAD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
    <span
      style={{
        fontFamily: ANTON, fontSize: 360, color: dark ? WHITE : INK, whiteSpace: 'nowrap',
        textTransform: 'uppercase', transform: `translateX(${offset}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      invisible.
    </span>
  </AbsoluteFill>
);

/* slot 25 — the word LANDS over dark footage (their NOISE-over-car) */
const HeldWord: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 7], [1.05, 1], {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = frame < 2 ? 0.2 : 0;
  return (
    <Footage src="stock/city-night-intersection.mp4" from={10} brightness={0.32}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <span
          style={{
            fontFamily: ANTON, fontSize: 230, color: WHITE, textTransform: 'uppercase',
            transform: `scale(${settle})`, whiteSpace: 'nowrap',
          }}
        >
          invisible.
        </span>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
    </Footage>
  );
};

/* the EDL — their frame counts as the skeleton; long slots subdivided into
   still-collage cut-throughs with overlays. Speed hides stock; layers add design. */
const SLOTS: Array<{f: number; el: React.ReactNode}> = [
  {f: 41, el: <Sting />},                                                          // 1
  {f: 10, el: <StillHit img="stills/city-1.jpg" mode="in" />},                     // 2
  {f: 10, el: <StillHit img="stills/phone-1.jpg" mode="panR" />},                  // 3
  {f: 2, el: <Micro src="stock/card-payment.mp4" from={2.0} />},                   // 4  the stutter —
  {f: 2, el: <Micro src="stock/card-payment.mp4" from={2.12} />},                  // 5  same subject,
  {f: 2, el: <Micro src="stock/card-payment.mp4" from={2.24} />},                  // 6  jittering
  {f: 2, el: <Micro src="stock/card-payment.mp4" from={2.36} />},                  // 7
  {f: 2, el: <Micro src="stock/card-payment.mp4" from={2.48} />},                  // 8
  {f: 10, el: <StillHit img="stills/golden-1.jpg" mode="out" />},                  // 9
  {f: 9, el: <StillHit img="stills/laptop-2.jpg" mode="panL" />},                  // 10
  {f: 10, el: <StillHit img="stills/tunnel-1.jpg" mode="in" />},                   // 11
  {f: 10, el: <StillHit img="stills/bristol-1.jpg" mode="out" />},                 // 12
  {f: 168, el: <MorphCard />},                                                     // 13
  {f: 38, el: (                                                                    // 14 — ringed handshake, then push
    <Series>
      <Series.Sequence durationInFrames={20}>
        <StillHit img="stills/hand-1.jpg" mode="in"><Ring x={960} y={560} r={250} /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={18}>
        <StillHit img="stills/hand-2.jpg" mode="out" />
      </Series.Sequence>
    </Series>
  )},
  {f: 40, el: (                                                                    // 15 — the money texture
    <Series>
      <Series.Sequence durationInFrames={22}>
        <StillHit img="stills/card-1.jpg" mode="panR"><GhostWord word="paid" /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={18}>
        <StillHit img="stills/card-2.jpg" mode="in" />
      </Series.Sequence>
    </Series>
  )},
  {f: 4, el: <StillHit img="stills/laptop-3.jpg" mode="in" />},                    // 16
  {f: 2, el: <StillHit img="stills/tunnel-2.jpg" mode="in" />},                    // 17
  {f: 48, el: (                                                                    // 18 — the town searching, ON the imagery
    <Series>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/city-2.jpg" mode="panL"><SearchChip text="taxi to gatwick" x={190} y={210} /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/golden-2.jpg" mode="in"><SearchChip text="emergency electrician" x={1050} y={260} /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/city-3.jpg" mode="panR"><SearchChip text="roofer near me" x={230} y={780} /></StillHit>
      </Series.Sequence>
    </Series>
  )},
  {f: 28, el: (                                                                    // 19 — the phone that isn't ringing for you
    <Series>
      <Series.Sequence durationInFrames={14}>
        <StillHit img="stills/phone-2.jpg" mode="in"><Ring x={1050} y={520} r={220} /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={14}>
        <StillHit img="stills/phone-3.jpg" mode="out" />
      </Series.Sequence>
    </Series>
  )},
  {f: 62, el: (                                                                    // 20 — searching, everywhere
    <Series>
      <Series.Sequence durationInFrames={22}>
        <StillHit img="stills/tunnel-3.jpg" mode="panR"><GhostWord word="searching" /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={20}>
        <StillHit img="stills/bristol-2.jpg" mode="in"><SearchChip text="best taxi brighton" x={1150} y={170} /></StillHit>
      </Series.Sequence>
      <Series.Sequence durationInFrames={20}>
        <StillHit img="stills/golden-3.jpg" mode="out" />
      </Series.Sequence>
    </Series>
  )},
  {f: 80, el: <ColourCard />},                                                     // 21
  {f: 210, el: <SilverCycler />},                                                  // 22
  {f: 4, el: <BlurFrag offset={430} blur={34} />},                                 // 23
  {f: 6, el: <BlurFrag offset={110} blur={15} />},                                 // 24 — light stays; dark arrives only at landing
  {f: 84, el: <HeldWord />},                                                       // 25
  {f: 48, el: (                                                                    // 26 — fade down and out
    <Series>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/city-1.jpg" mode="in" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/tunnel-2.jpg" mode="panL" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={16}>
        <StillHit img="stills/laptop-4.jpg" mode="out" />
      </Series.Sequence>
    </Series>
  )},
];

export const TransplantOne: React.FC = () => (
  <>
    <Audio
      src={staticFile('music/transplant-a.wav')}
      volume={(f) => interpolate(f, [892, 932], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    <Series>
      {SLOTS.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={s.f}>
          {s.el}
        </Series.Sequence>
      ))}
    </Series>
  </>
);
