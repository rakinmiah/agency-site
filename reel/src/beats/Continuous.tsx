import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {JOST} from '../fonts';

/* THE CONTINUOUS FILM v2 — Uber-clean.
   v1 failed on two counts: motion energy 0.32 (refs sit at 5.6–8.0) and an
   aurora/glassmorphism look that reads as AI-generated. Both gone.
   Now: flat standard surfaces, one functional blue, black type, seven beats
   in fifteen seconds — still zero hard cuts, but things ARRIVE. */

export const CONT_DUR = 900; // 15s @60

const GROUND = '#0B0C0E';   // neutral near-black, no tint, no gradient
const SURFACE = '#FFFFFF';
const INK = '#111316';
const MUTED = '#6E7378';
const LINE = '#E4E6E9';
const BLUE = '#2F6BF6';     // functional UI blue, flat
const GREEN = '#34A853';

/* helper: a beat's local progress with in/out ramps — overlapping, never cutting */
const useBeat = (start: number, end: number, ramp = 14) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [start, start + ramp, end - ramp, end], [0, 1, 1, 0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {f, local: f - start, o};
};

/* ── 1 · the line (0–2.1s) ── */
const Line: React.FC = () => {
  const {local, o} = useBeat(0, 126);
  const rise = interpolate(local, [0, 26], [12, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <span
        style={{
          fontFamily: JOST,
          fontWeight: 300,
          fontSize: 104,
          color: '#fff',
          letterSpacing: '-0.02em',
          transform: `translateY(${rise}px)`,
        }}
      >
        Getting found is hard.
      </span>
    </AbsoluteFill>
  );
};

/* ── 2 · the search + results (2.0–8.4s) — one surface, things landing on it ── */
const QUERY = 'roofer near me';
const RESULTS = [
  {n: 'Coastal Roofing Services', u: 'coastalroofing.co.uk', m: 'Roofing contractor · Brighton'},
  {n: 'A1 Roofline & Guttering', u: 'a1roofline.co.uk', m: 'Roofer · Hove'},
  {n: 'Sussex Roof Repairs', u: 'sussexroofrepairs.co.uk', m: 'Roofing contractor · Worthing'},
  {n: 'The Roofing Company', u: 'theroofingco.co.uk', m: 'Roofer · Brighton'},
];

const Search: React.FC = () => {
  const {f, local, o} = useBeat(120, 504, 16);
  const typed = Math.max(0, Math.min(QUERY.length, Math.floor((local - 18) / 4.5)));
  const caretOn = typed < QUERY.length || Math.floor(f / 18) % 2 === 0;

  // each row lands with a short overshoot — an arrival, not a fade
  const row = (i: number) => {
    const t = interpolate(f, [232 + i * 26, 268 + i * 26], [0, 1], {
      easing: Easing.out(Easing.back(1.6)),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return t;
  };

  // "you're not here" gap opens after the four results
  const gap = interpolate(f, [372, 404], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{width: 1220}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            padding: '24px 32px',
            boxShadow: '0 18px 40px -22px rgba(0,0,0,.55)',
          }}
        >
          <svg width={30} height={30} viewBox="0 0 24 24" style={{flex: 'none'}}>
            <circle cx={10.5} cy={10.5} r={7} fill="none" stroke={MUTED} strokeWidth={2.2} />
            <line x1={15.8} y1={15.8} x2={21} y2={21} stroke={MUTED} strokeWidth={2.2} strokeLinecap="round" />
          </svg>
          <span style={{fontFamily: JOST, fontWeight: 400, fontSize: 40, color: INK, whiteSpace: 'pre'}}>
            {QUERY.slice(0, typed)}
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.05em',
                background: caretOn ? INK : 'transparent',
                transform: 'translateY(0.16em)',
                marginLeft: 2,
              }}
            />
          </span>
        </div>

        <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
          {RESULTS.map((r, i) => {
            const t = row(i);
            return (
              <div
                key={r.u}
                style={{
                  opacity: Math.min(1, t * 1.4),
                  transform: `translateY(${(1 - t) * 34}px)`,
                  background: SURFACE,
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  padding: '22px 30px',
                }}
              >
                <div style={{fontFamily: JOST, fontWeight: 400, fontSize: 30, color: INK}}>{r.n}</div>
                <div style={{fontFamily: JOST, fontWeight: 300, fontSize: 21, color: MUTED, marginTop: 6}}>
                  {r.u} &nbsp;·&nbsp; {r.m}
                </div>
              </div>
            );
          })}

          {/* the absence — a dashed slot where you should be */}
          <div
            style={{
              height: gap * 96,
              opacity: gap,
              border: `2px dashed ${gap > 0.5 ? '#D0454B' : LINE}`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: JOST,
              fontWeight: 400,
              fontSize: 26,
              color: '#D0454B',
              overflow: 'hidden',
            }}
          >
            you’re not here
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 3 · the site builds (8.3–10.6s) ── */
const SiteBuild: React.FC = () => {
  const {f, o} = useBeat(498, 636, 15);
  const blk = (i: number) =>
    interpolate(f, [512 + i * 13, 544 + i * 13], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          width: 1180,
          height: 660,
          background: SURFACE,
          borderRadius: 14,
          border: `1px solid ${LINE}`,
          overflow: 'hidden',
          boxShadow: '0 26px 60px -30px rgba(0,0,0,.6)',
        }}
      >
        <div style={{height: 56, borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 11, height: 11, borderRadius: 6, background: LINE}} />
          ))}
        </div>
        <div style={{padding: '44px 54px'}}>
          <div style={{height: 52 * blk(0), width: '58%', background: INK, borderRadius: 6, opacity: blk(0)}} />
          <div style={{height: 20 * blk(1), width: '76%', background: LINE, borderRadius: 5, marginTop: 22, opacity: blk(1)}} />
          <div style={{height: 20 * blk(2), width: '64%', background: LINE, borderRadius: 5, marginTop: 12, opacity: blk(2)}} />
          <div
            style={{
              height: 62 * blk(3),
              width: 260,
              background: BLUE,
              borderRadius: 8,
              marginTop: 34,
              opacity: blk(3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: JOST,
              fontWeight: 500,
              fontSize: 24 * blk(3),
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            Get a quote
          </div>
          <div style={{display: 'flex', gap: 18, marginTop: 40}}>
            {[4, 5, 6].map((i) => (
              <div key={i} style={{flex: 1, height: 150 * blk(i), background: '#F2F3F5', borderRadius: 10, opacity: blk(i)}} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 4 · the map, pin lands (10.5–12.9s) ── */
const Map: React.FC = () => {
  const {f, o} = useBeat(630, 774, 15);
  const drop = interpolate(f, [660, 700], [0, 1], {
    easing: Easing.out(Easing.back(2.2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ring = ((f - 700) % 42) / 42;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{width: 1220, height: 660, borderRadius: 14, overflow: 'hidden', border: `1px solid ${LINE}`, background: '#F3F4F6'}}>
        <svg width="100%" height="100%" viewBox="0 0 1220 660">
          <rect width="1220" height="660" fill="#F3F4F6" />
          <rect x={760} y={60} width={330} height={210} rx={10} fill="#E3EFE4" />
          <rect x={90} y={400} width={280} height={180} rx={10} fill="#E3EFE4" />
          {[150, 380, 610, 840, 1070].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={660} stroke="#FFFFFF" strokeWidth={16} />
          ))}
          {[140, 330, 520].map((y) => (
            <line key={y} x1={0} y1={y} x2={1220} y2={y} stroke="#FFFFFF" strokeWidth={16} />
          ))}
          <line x1={0} y1={330} x2={1220} y2={330} stroke="#FFFFFF" strokeWidth={26} />
          {f > 700 && (
            <circle cx={610} cy={330} r={40 + ring * 150} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.5 * (1 - ring)} />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 330,
            transform: `translate(-50%, ${-100 + (1 - drop) * -180}px) scale(${0.6 + drop * 0.4})`,
            transformOrigin: '50% 100%',
            opacity: Math.min(1, drop * 2),
          }}
        >
          <svg width={64} height={86} viewBox="0 0 54 72">
            <path d="M27 0C12 0 0 12 0 27c0 20 27 45 27 45s27-25 27-45C54 12 42 0 27 0Z" fill={BLUE} />
            <circle cx={27} cy={26} r={10} fill="#fff" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 5 · the enquiries land (12.8–15s) ── */
const NOTES = [
  {t: 'New enquiry', b: 'Flat roof — can you quote this week?'},
  {t: 'Missed call', b: '07…  ·  Brighton'},
  {t: 'New enquiry', b: 'Gutter replacement, BN1'},
];

const Enquiries: React.FC = () => {
  const {f, o} = useBeat(768, 900, 14);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{width: 820, display: 'flex', flexDirection: 'column', gap: 14}}>
        {NOTES.map((n, i) => {
          const t = interpolate(f, [790 + i * 30, 826 + i * 30], [0, 1], {
            easing: Easing.out(Easing.back(1.9)),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                opacity: Math.min(1, t * 1.5),
                transform: `translateY(${(1 - t) * -40}px)`,
                background: SURFACE,
                borderRadius: 16,
                padding: '20px 26px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                boxShadow: '0 16px 36px -20px rgba(0,0,0,.55)',
              }}
            >
              <span style={{width: 42, height: 42, borderRadius: 10, background: GREEN, flex: 'none'}} />
              <div>
                <div style={{fontFamily: JOST, fontWeight: 500, fontSize: 26, color: INK}}>{n.t}</div>
                <div style={{fontFamily: JOST, fontWeight: 300, fontSize: 22, color: MUTED, marginTop: 3}}>{n.b}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Continuous: React.FC = () => {
  const f = useCurrentFrame();
  // gentle continuous push — motion without drama
  const drift = 1 + interpolate(f, [0, CONT_DUR], [0, 0.03], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: GROUND}}>
      <AbsoluteFill style={{transform: `scale(${drift})`}}>
        <Line />
        <Search />
        <SiteBuild />
        <Map />
        <Enquiries />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
