import React from 'react';
import {Easing, interpolate} from 'remotion';
import {JOST} from '../fonts';

/* ── THE PLATFORM SCREENS ──────────────────────────────────────────────────
   Not pages, and not photographs.

   Three builds of this went out as literal webpage mockups — a Google results
   page, a Facebook feed, an Instagram grid — drawn at UI scale with 30px type
   in columns. That is a screenshot, just one I drew myself, and at twelve
   frames a screen it reads as a flat document rather than a frame of a film.

   The photo route is closed too: the only library is the Pexels pull, 96 of
   which are already the stock flip eight seconds earlier, and craft-and-trade
   stock says "small business" rather than "advertising" anyway.

   So the platform is carried by its OWN UI LANGUAGE BLOWN UP as graphics — a
   search field spanning the frame, reactions at 250px, story rings at 430 —
   on flat brand ground. Every element is sized to read in twelve frames, and
   the centre 600 belongs to the badge, so nothing critical sits under it.
   Invented copy throughout, same rule as the URL storm. */
export type ScreenId = 'g1' | 'g2' | 'g3' | 'f1' | 'f2' | 'f3' | 'i1' | 'i2' | 'i3';

const W = 1920, H = 1080;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.out(Easing.cubic);
const OVER = Easing.bezier(0.16, 1.5, 0.34, 1);

export const SURFACE: Record<ScreenId, string> = {
  g1: '#FFFFFF', g2: '#FFFFFF', g3: '#FFFFFF',
  f1: '#0866FF', f2: '#0866FF', f3: '#0866FF',
  i1: '#0A0C0D', i2: '#0A0C0D', i3: '#0A0C0D',
};

const rise = (t: number, at: number, d = 7) =>
  interpolate(t, [at, at + d], [0, 1], {easing: OUT, ...clamp});
const pop = (t: number, at: number, d = 9) =>
  interpolate(t, [at, at + d], [0, 1], {easing: OVER, ...clamp});

const HEART = 'M12 21s-7.5-4.7-9.4-9A5.4 5.4 0 0 1 12 6.4 5.4 5.4 0 0 1 21.4 12c-1.9 4.3-9.4 9-9.4 9z';
const THUMB = 'M2 21h4V9H2v12zM23 10a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L14.17 1 7.6 7.59A2 2 0 0 0 7 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z';

/* ── GOOGLE ────────────────────────────────────────────────────────────────
   The search field IS the platform. At 1740 wide and 74px it stops being a
   control and becomes a graphic object. */
const Field: React.FC<{t: number; q: string; y: number; type?: boolean}> = ({t, q, y, type}) => {
  const a = rise(t, 0, 6);
  const shown = type ? q.slice(0, Math.round(interpolate(t, [1, 13], [0, q.length], clamp))) : q;
  return (
    <div style={{
      position: 'absolute', left: 90, top: y, width: 1740, height: 146, borderRadius: 73,
      background: '#FFF', border: '3px solid #E3E5E8', boxShadow: '0 10px 40px rgba(32,33,36,.16)',
      display: 'flex', alignItems: 'center', padding: '0 56px', gap: 34,
      opacity: a, transform: `translateY(${(1 - a) * -30}px)`,
    }}>
      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2.4">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-4.2-4.2" strokeLinecap="round" />
      </svg>
      <span style={{fontFamily: JOST, fontSize: 74, color: '#202124', whiteSpace: 'nowrap'}}>
        {shown}{type && t < 16 ? '|' : ''}
      </span>
    </div>
  );
};

const BigG: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg viewBox="0 0 48 48" width={s} height={s} style={{position: 'absolute', left: x, top: y}}>
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const AdChip: React.FC<{x: number; y: number; a: number; label: string}> = ({x, y, a, label}) => (
  <div style={{
    position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 26,
    opacity: a, transform: `translateY(${(1 - a) * 28}px)`, fontFamily: JOST,
  }}>
    <span style={{
      background: '#1A73E8', color: '#FFF', fontWeight: 600, fontSize: 54,
      borderRadius: 18, padding: '8px 28px',
    }}>Ad</span>
    <span style={{fontSize: 62, color: '#5F6368', whiteSpace: 'nowrap'}}>{label}</span>
  </div>
);

const G1: React.FC<{t: number}> = ({t}) => (
  <>
    <Field t={t} q="emergency plumber near me" y={116} type />
    <AdChip x={90} y={356} a={rise(t, 6)} label="kestrelplumbing.co.uk" />
    <AdChip x={90} y={808} a={rise(t, 10)} label="marlowheating.co.uk" />
    <BigG x={1360} y={520} s={860} />
  </>
);

const G2: React.FC<{t: number}> = ({t}) => (
  <>
    <BigG x={-280} y={-200} s={1220} />
    <div style={{
      position: 'absolute', left: 96, top: 862, fontFamily: JOST, fontWeight: 500,
      fontSize: 150, color: '#202124', letterSpacing: '-0.035em', lineHeight: 0.92,
      opacity: rise(t, 2, 8), transform: `translateY(${(1 - rise(t, 2, 8)) * 44}px)`,
    }}>
      24/7 call out <span style={{color: '#1A73E8'}}>Brighton</span>
    </div>
  </>
);

const G3: React.FC<{t: number}> = ({t}) => (
  <>
    <Field t={t} q="boiler repair brighton" y={78} />
    {['gas safe engineers', 'same day call out', 'no fix, no fee'].map((s, i) => {
      const a = rise(t, 3 + i * 3, 8);
      return (
        <div key={s} style={{
          position: 'absolute', left: 96, top: 318 + i * 166, display: 'flex',
          alignItems: 'center', gap: 34, fontFamily: JOST,
          opacity: a, transform: `translateX(${(1 - a) * -48}px)`,
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2.4">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-4.2-4.2" strokeLinecap="round" />
          </svg>
          <span style={{fontSize: 66, color: '#202124', whiteSpace: 'nowrap'}}>{s}</span>
        </div>
      );
    })}
  </>
);

/* ── FACEBOOK ───────────────────────────────────────────────────────────── */
const Reaction: React.FC<{x: number; y: number; a: number; c: string; d: string; s?: number}> =
  ({x, y, a, c, d, s = 210}) => (
    <div style={{
      position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
      background: c, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 14px 40px rgba(0,0,0,.26)',
      opacity: Math.min(1, a * 1.4), transform: `scale(${a.toFixed(3)})`,
    }}>
      <svg viewBox="0 0 24 24" width={s * 0.54} height={s * 0.54} fill="#FFF"><path d={d} /></svg>
    </div>
  );

const F1: React.FC<{t: number}> = ({t}) => (
  <>
    <Reaction x={110} y={296} a={pop(t, 0)} c="#1877F2" d={THUMB} s={252} />
    <Reaction x={110} y={620} a={pop(t, 3)} c="#F3425F" d={HEART} s={252} />
    <div style={{
      position: 'absolute', left: 1332, top: 340, fontFamily: JOST, fontWeight: 600,
      fontSize: 300, color: '#FFF', letterSpacing: '-0.035em', lineHeight: 1,
      opacity: rise(t, 5, 8),
      transform: `scale(${(0.88 + rise(t, 5, 8) * 0.12).toFixed(3)})`, transformOrigin: 'left center',
    }}>+62</div>
    <div style={{
      position: 'absolute', left: 1340, top: 676, fontFamily: JOST, fontSize: 60,
      color: 'rgba(255,255,255,.78)', letterSpacing: '.07em', opacity: rise(t, 8, 8),
    }}>REACTIONS</div>
  </>
);

const F2: React.FC<{t: number}> = ({t}) => (
  <>
    <svg viewBox="0 0 48 48" width={1420} height={1420}
      style={{position: 'absolute', left: 1120, top: -200, opacity: 0.2}}>
      <path fill="#FFFFFF" d="M29.9 27.1h5.7l.9-7h-6.6v-4.5c0-2 .56-3.4 3.46-3.4h3.7V6c-.64-.09-2.85-.28-5.42-.28-5.36 0-9.04 3.27-9.04 9.28v5.1h-5.9v7h5.9V44h7.3z" />
    </svg>
    <div style={{
      position: 'absolute', left: 96, top: 166, fontFamily: JOST, fontSize: 54,
      letterSpacing: '.09em', color: 'rgba(255,255,255,.82)', opacity: rise(t, 0, 6),
    }}>SPONSORED</div>
    <div style={{
      position: 'absolute', left: 90, top: 256, width: 548, fontFamily: JOST, fontWeight: 600,
      fontSize: 114, color: '#FFF', letterSpacing: '-0.035em', lineHeight: 0.96,
      opacity: rise(t, 2, 9), transform: `translateY(${(1 - rise(t, 2, 9)) * 46}px)`,
    }}>Boiler playing up?</div>
    <div style={{
      position: 'absolute', left: 90, top: 806, background: '#FFF', color: '#0866FF',
      fontFamily: JOST, fontWeight: 600, fontSize: 84, borderRadius: 24, padding: '26px 64px',
      opacity: pop(t, 6, 10),
      transform: `scale(${pop(t, 6, 10).toFixed(3)})`, transformOrigin: 'left center',
    }}>Book now</div>
  </>
);

const F3: React.FC<{t: number}> = ({t}) => (
  <>
    {[[120, 116], [1430, 172], [176, 764], [1500, 740], [1176, 44]].map(([x, y], i) => (
      <Reaction key={i} x={x} y={y} a={pop(t, i * 2)} c={i % 2 ? '#F3425F' : '#1877F2'}
        d={i % 2 ? HEART : THUMB} s={i === 4 ? 152 : 202} />
    ))}
    <div style={{
      position: 'absolute', left: 0, top: 868, width: W, textAlign: 'center',
      fontFamily: JOST, fontWeight: 600, fontSize: 168, color: '#FFF',
      letterSpacing: '-0.035em', opacity: rise(t, 4, 8),
    }}>Same day</div>
  </>
);

/* ── INSTAGRAM ──────────────────────────────────────────────────────────── */
const Ring: React.FC<{x: number; y: number; s: number; a: number}> = ({x, y, s, a}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
    padding: s * 0.045, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B 45%,#6228D7)',
    opacity: Math.min(1, a * 1.4), transform: `scale(${a.toFixed(3)})`,
  }}>
    <div style={{
      width: '100%', height: '100%', borderRadius: '50%',
      background: '#0A0C0D', border: `${s * 0.03}px solid #0A0C0D`,
    }} />
  </div>
);

const I1: React.FC<{t: number}> = ({t}) => (
  <>
    <Ring x={112} y={262} s={396} a={pop(t, 0)} />
    <Ring x={1412} y={262} s={396} a={pop(t, 2)} />
    <Ring x={112} y={676} s={396} a={pop(t, 4)} />
    <Ring x={1412} y={676} s={396} a={pop(t, 6)} />
    <div style={{
      position: 'absolute', left: 0, top: 100, width: W, textAlign: 'center',
      fontFamily: JOST, fontSize: 62, letterSpacing: '.15em',
      color: 'rgba(255,255,255,.8)', opacity: rise(t, 8, 8),
    }}>SPONSORED</div>
  </>
);

const I2: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(122deg,#F9CE34 0%,#EE2A7B 46%,#6228D7 100%)',
      opacity: rise(t, 0, 5),
    }} />
    <svg viewBox="0 0 24 24" width={700} height={700} style={{
      position: 'absolute', left: 104, top: 186,
      opacity: pop(t, 2, 10), transform: `scale(${pop(t, 2, 10).toFixed(3)})`,
      filter: 'drop-shadow(0 16px 44px rgba(0,0,0,.30))',
    }}>
      <path fill="#FFF" d={HEART} />
    </svg>
    <div style={{
      position: 'absolute', right: 88, top: 330, textAlign: 'right', fontFamily: JOST,
      fontWeight: 600, fontSize: 222, color: '#FFF', letterSpacing: '-0.035em', lineHeight: 1,
      opacity: rise(t, 5, 8),
    }}>
      12.4k
      <div style={{fontSize: 58, fontWeight: 500, letterSpacing: '.09em', opacity: 0.84}}>LIKES</div>
    </div>
  </>
);

const I3: React.FC<{t: number}> = ({t}) => (
  <>
    <svg viewBox="0 0 48 48" width={1520} height={1520}
      style={{position: 'absolute', left: -340, top: -270}}>
      <defs>
        <linearGradient id="igg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F9CE34" />
          <stop offset="45%" stopColor="#EE2A7B" />
          <stop offset="100%" stopColor="#6228D7" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#igg)" strokeWidth={2.4} strokeLinecap="round">
        <rect x="5.2" y="5.2" width="37.6" height="37.6" rx="11.4" />
        <circle cx="24" cy="24" r="9.1" />
      </g>
      <circle cx="34.9" cy="13.4" r="2.4" fill="url(#igg)" />
    </svg>
    <div style={{
      position: 'absolute', right: 96, top: 292, textAlign: 'right', width: 640,
      fontFamily: JOST, fontWeight: 600, fontSize: 138, color: '#FFF',
      letterSpacing: '-0.035em', lineHeight: 1.0,
      opacity: rise(t, 2, 9), transform: `translateX(${(1 - rise(t, 2, 9)) * 48}px)`,
    }}>Book today</div>
    <div style={{
      position: 'absolute', right: 100, top: 636, fontFamily: JOST, fontSize: 54,
      letterSpacing: '.1em', color: 'rgba(255,255,255,.78)', opacity: rise(t, 6, 8),
    }}>@KESTRELPLUMBING</div>
  </>
);

export const Screen: React.FC<{id: ScreenId; t: number}> = ({id, t}) => (
  <div style={{
    position: 'absolute', left: 0, top: 0, width: W, height: H + 700,
    background: SURFACE[id], overflow: 'hidden',
  }}>
    {id === 'g1' ? <G1 t={t} /> : id === 'g2' ? <G2 t={t} /> : id === 'g3' ? <G3 t={t} />
      : id === 'f1' ? <F1 t={t} /> : id === 'f2' ? <F2 t={t} /> : id === 'f3' ? <F3 t={t} />
        : id === 'i1' ? <I1 t={t} /> : id === 'i2' ? <I2 t={t} /> : <I3 t={t} />}
  </div>
);
