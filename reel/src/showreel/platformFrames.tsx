import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {siWhatsapp, siInstagram, siGmail} from 'simple-icons';
import {JOST} from '../fonts';
import {ARIAL} from './ui';

/* ── THE PLATFORM FRAMES ───────────────────────────────────────────────────
   Fifteen independently designed frames, each composed for 1920x1080 in its
   own right. NOT crops of a phone screen — that was the mistake in every
   previous version, and it is why nothing was ever framed like a designed
   frame: the composition was whatever the crop happened to catch.

   The camera moves between them later. Those moves are TRANSITIONS, not travel
   across a shared surface — the frames have no spatial relationship to each
   other, and none of them needs one.

   ── EACH PLATFORM GETS ITS OWN GRAMMAR, NOT ITS OWN COLOUR ──────────────
     WhatsApp   speech      rounded bubbles, ticks, timestamps
     Instagram  faces       circles and gradient rings, nothing rectangular
     Email      typography  black type on white, no avatars, no chrome
     Call       light       glow and expanding rings, almost no interface

   Four different shapes. Recolouring one grammar four times is what made the
   last three attempts read as the same thing over and over.

   ── COLOUR AND MARKS ARE REAL NOW ───────────────────────────────────────
   Every hex below is the app's actual value rather than my eye: WhatsApp dark
   runs #0B141A ground / #202C33 incoming / #005C4B outgoing with #00A884 as the
   accent — which is NOT the #25D366 of the logo, and using the logo green for
   UI is one of the tells that something is a mock-up. The brand marks come from
   simple-icons rather than my memory of them; the ones I hand-wrote before were
   approximations and looked it. ── */

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BOUNCE = Easing.bezier(0.18, 1.62, 0.36, 1);
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;
const BEAT = (60 / 150.1) * 60;

const lands = (at: number, d: number, k: number): [number, number] => [at - k * d, at + (1 - k) * d];
const pop = (f: number, at: number, d = 12) =>
  interpolate(f, lands(at, d, 0.37), [0, 1], {easing: BOUNCE, ...clamp});

/* ── REAL VALUES ─────────────────────────────────────────────────────────── */
const WA = {
  bg: '#0B141A', panel: '#111B21', inbub: '#202C33', outbub: '#005C4B',
  accent: '#00A884', tick: '#53BDEB', ink: '#E9EDEF', dim: '#8696A0',
};
const IG = {
  bg: '#000000', ink: '#FFFFFF', dim: '#A8A8A8', blue: '#0095F6', line: '#262626',
  ring: 'linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)',
};
const ML = {bg: '#FFFFFF', ink: '#202124', dim: '#5F6368', blue: '#1A73E8', red: '#EA4335', line: '#E8EAED'};
const CL = {green: '#34C759', red: '#FF3B30', ink: '#FFFFFF', dim: 'rgba(255,255,255,.6)'};

const Mark: React.FC<{icon: {path: string}; size: number; fill: string}> = ({icon, size, fill}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d={icon.path} fill={fill} /></svg>
);

const Frame: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

/* ══════════════ 1 · WHATSAPP — SPEECH ══════════════════════════════════════
   The grammar is the bubble. Every frame here is made of them, and nothing in
   this section is a rectangle with square corners. */

/* F1 — one message. The quietest frame in the whole section: a single lead
   arriving, with three quarters of the frame left empty above it. Everything
   after this gets louder. */
export const WA_One: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const p = pop(t, 10, 14);
  return (
    <Frame bg={WA.bg}>
      <div style={{position: 'absolute', left: 150, top: 300, display: 'flex', alignItems: 'center', gap: 26,
        opacity: interpolate(t, [0, 8], [0, 1], clamp)}}>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: '#7E57C2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ARIAL, fontWeight: 700, fontSize: 34, color: '#fff'}}>DR</div>
        <span style={{fontFamily: ARIAL, fontWeight: 600, fontSize: 44, color: WA.dim}}>Danny R.</span>
      </div>
      {/* MUCH bigger than the first pass, which put a modest bubble in the
          top-left third and left two thirds of the frame doing nothing. At 0.8s
          a frame has to commit: the type is 124px and the bubble runs to within
          90px of the right edge. */}
      <div style={{
        position: 'absolute', left: 150, top: 430, width: 1680,
        background: WA.inbub, borderRadius: '6px 44px 44px 44px', padding: '64px 76px 52px',
        boxSizing: 'border-box',
        boxShadow: '0 50px 120px -34px rgba(0,0,0,.9)',
        transform: `scale(${lerp(p, 0.88, 1).toFixed(3)}) translateY(${((1 - p) * 54).toFixed(1)}px)`,
        transformOrigin: '0% 100%',
        opacity: interpolate(t, [4, 12], [0, 1], clamp),
      }}>
        <div style={{fontFamily: ARIAL, fontSize: 124, color: WA.ink, lineHeight: 1.22}}>
          Hi — are you taking on new work?
        </div>
        <div style={{marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18}}>
          <span style={{fontFamily: ARIAL, fontSize: 42, color: WA.dim}}>09:41</span>
          <svg width={56} height={38} viewBox="0 0 22 15"><path d="M1 8l3.5 3.5L11 3M8 11.5L11.5 15 21 3" fill="none" stroke={WA.tick} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </Frame>
  );
};

/* F2 — typing. The first pass floated three small circles in a lot of black and
   read as three green dots, not as a typing indicator. It is IN A BUBBLE now,
   which is what makes it legible as the thing it is, and the bubble breathes
   with the dots so the whole frame moves rather than three elements in it.
   Three names are stacked behind it, all typing at once — one person typing is
   a conversation, three is a business. */
export const WA_Typing: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const breathe = 1 + 0.035 * Math.max(0, Math.sin(((raw ?? t) % 26) / 26 * Math.PI * 2));
  return (
    <Frame bg={WA.bg}>
      {['Marcus H.', 'Danny R.'].map((n, i) => (
        <div key={i} style={{
          position: 'absolute', left: 170 + i * 40, top: 210 + i * 132,
          display: 'flex', alignItems: 'center', gap: 22,
          opacity: interpolate(t, [10 + i * 6, 18 + i * 6], [0, 0.42], clamp),
        }}>
          <div style={{display: 'flex', gap: 14}}>
            {[0, 1, 2].map((k) => {
              const u = Math.max(0, Math.sin(((t - k * 4 - i * 7) % 24) / 24 * Math.PI * 2));
              return <div key={k} style={{width: 22, height: 22, borderRadius: 11, background: WA.accent,
                transform: `translateY(${(-u * 14).toFixed(1)}px)`}} />;
            })}
          </div>
          <span style={{fontFamily: ARIAL, fontSize: 46, color: WA.dim}}>{n} is typing</span>
        </div>
      ))}

      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: ARIAL, fontWeight: 600, fontSize: 64, color: WA.accent,
          marginBottom: 44, letterSpacing: '.01em'}}>Priya N.</div>
        <div style={{
          background: WA.inbub, borderRadius: '10px 90px 90px 90px',
          padding: '86px 130px', display: 'flex', gap: 78,
          transform: `scale(${(lerp(pop(t, 6, 14), 0.7, 1) * breathe).toFixed(3)})`,
          boxShadow: '0 60px 150px -40px rgba(0,0,0,.95)',
        }}>
          {[0, 1, 2].map((i) => {
            const up = Math.max(0, Math.sin(((t - i * 5) % 26) / 26 * Math.PI * 2)) ** 1.35;
            return <div key={i} style={{
              width: 130, height: 130, borderRadius: '50%', background: WA.accent,
              transform: `translateY(${(-up * 62).toFixed(1)}px) scale(${(0.86 + up * 0.2).toFixed(3)})`,
              opacity: 0.45 + up * 0.55,
              boxShadow: `0 ${(24 + up * 40).toFixed(0)}px ${(46 + up * 54).toFixed(0)}px -26px rgba(0,168,132,.85)`,
            }} />;
          })}
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

/* F3 — all of them. Five bubbles at deliberately uneven widths, bleeding off
   the top and bottom edges so the frame reads as a slice of something much
   longer. Volume, without a single number on screen. */
/* wider, and they alternate sides. The first pass ran five narrow bubbles all
   down the left, which left the right half of the frame empty for the whole
   hold — the exact fault the section was called weak for. */
const WA_MSGS = [
  ['Do you have any availability?', 1320, 0],
  ['Can you send me a quote?', 1080, 1],
  ['saw your page — free this week?', 1450, 0],
  ['Hi! Do you cover emergencies?', 1240, 1],
  ['are you taking on new work?', 1180, 0],
] as const;

export const WA_Stack: React.FC<{t: number; raw?: number}> = ({t, raw}) => (
  <Frame bg={WA.bg}>
    {WA_MSGS.map(([msg, w, right], i) => {
      const p = pop(t, 3 + i * 5, 11);
      const R = right === 1;
      return (
        <div key={i} style={{
          position: 'absolute', top: -70 + i * 262,
          ...(R ? {right: 90} : {left: 90}),
          width: w as number, boxSizing: 'border-box',
          background: R ? WA.outbub : WA.inbub,
          borderRadius: R ? '44px 6px 44px 44px' : '6px 44px 44px 44px',
          padding: '46px 62px',
          boxShadow: '0 40px 100px -30px rgba(0,0,0,.95)',
          transform: `translateX(${((1 - p) * (R ? 340 : -340)).toFixed(1)}px) scale(${lerp(p, 0.9, 1).toFixed(3)})`,
          opacity: interpolate(t, [i * 5, i * 5 + 5], [0, 1], clamp),
        }}>
          <span style={{fontFamily: ARIAL, fontSize: 76, color: WA.ink, lineHeight: 1.2}}>{msg}</span>
        </div>
      );
    })}
  </Frame>
);

/* F4 — unread. One element. The badge is 420px across and sits off-centre with
   the count climbing, because a number that is moving is the argument. */
export const WA_Badge: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const n = 3 + Math.floor(t / 5);
  const k = 1 + 0.13 * (1 - interpolate((raw ?? t) % 5, [0, 4], [0, 1], {easing: SNAP, ...clamp}));
  return (
    <Frame bg={WA.bg}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70}}>
        <div style={{
          minWidth: 420, height: 420, borderRadius: 210, background: WA.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 70px',
          fontFamily: JOST, fontWeight: 700, fontSize: 230, color: '#0B141A', letterSpacing: '-0.04em',
          transform: `scale(${k.toFixed(3)})`,
          boxShadow: '0 50px 140px -40px rgba(0,168,132,.7)',
        }}>{n}</div>
        <div style={{fontFamily: JOST, fontWeight: 700, fontSize: 96, color: WA.dim, letterSpacing: '-0.02em'}}>
          unread
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 130, top: 120, opacity: 0.9}}>
        <Mark icon={siWhatsapp} size={92} fill={WA.accent} />
      </div>
    </Frame>
  );
};

/* ══════════════ 2 · INSTAGRAM — FACES ══════════════════════════════════════
   Circles only. Nothing in this section has a square corner except the one
   button, which is the point of contrast. */

const Ring: React.FC<{d: number; children: React.ReactNode; w?: number}> = ({d, children, w = 9}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: IG.ring, padding: w,
    boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: '100%', height: '100%', borderRadius: '50%', background: IG.bg, padding: w * 0.7,
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {children}
    </div>
  </div>
);

const Face: React.FC<{c: string; label: string; d: number}> = ({c, label, d}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: c,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: ARIAL, fontWeight: 700, fontSize: d * 0.34, color: '#fff'}}>{label}</div>
);

/* F1 — one request. A portrait, essentially. The ring is the loudest colour in
   the film and it gets a whole frame to itself. */
export const IG_One: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const p = pop(t, 8, 15);
  return (
    <Frame bg={IG.bg}>
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${lerp(p, 0.7, 1).toFixed(3)}) rotate(${lerp(p, -14, 0).toFixed(1)}deg)`}}>
          <Ring d={520} w={16}><Face c="#EC407A" label="SM" d={452} /></Ring>
        </div>
        <div style={{marginTop: 54, fontFamily: ARIAL, fontWeight: 700, fontSize: 76, color: IG.ink,
          opacity: interpolate(t, [12, 20], [0, 1], clamp)}}>sophie.makes</div>
        <div style={{marginTop: 18, fontFamily: ARIAL, fontSize: 50, color: IG.dim,
          opacity: interpolate(t, [16, 24], [0, 1], clamp)}}>wants to send you a message</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 130, top: 120, opacity: 0.9}}>
        <Mark icon={siInstagram} size={92} fill={IG.ink} />
      </div>
    </Frame>
  );
};

/* F2 — accept. The one rectangle in the section, and it is being pressed. */
export const IG_Accept: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const press = interpolate(t, [14, 18, 26], [1, 0.9, 1], {easing: SNAP, ...clamp});
  const done = t >= 20;
  return (
    <Frame bg={IG.bg}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          padding: '58px 128px', borderRadius: 34,
          background: done ? '#262626' : IG.blue,
          fontFamily: ARIAL, fontWeight: 700, fontSize: 104, color: '#fff',
          transform: `scale(${press.toFixed(3)})`,
          boxShadow: done ? 'none' : '0 40px 120px -30px rgba(0,149,246,.75)',
        }}>{done ? 'Accepted' : 'Accept'}</div>
      </AbsoluteFill>
      {/* the ripple the press throws off */}
      {t >= 16 && t < 40 && (() => {
        const r = interpolate(t, [16, 40], [0, 1], {easing: Easing.out(Easing.cubic), ...clamp});
        const d = 400 + r * 1500;
        return <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: d, height: d, borderRadius: '50%',
            border: `${(6 * (1 - r)).toFixed(1)}px solid rgba(0,149,246,${(0.5 * (1 - r)).toFixed(3)})`}} />
        </AbsoluteFill>;
      })()}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center',
        fontFamily: ARIAL, fontSize: 54, color: IG.dim}}>sophie.makes</div>
    </Frame>
  );
};

/* F3 — they keep coming. Faces at wildly different sizes, bleeding off every
   edge. No counter, no label — the volume IS the frame. */
const FIELD = [
  {x: 120, y: 120, d: 300, c: '#EC407A', l: 'SM'}, {x: 560, y: -60, d: 220, c: '#43A047', l: 'TB'},
  {x: 840, y: 210, d: 380, c: '#7E57C2', l: 'JD'}, {x: 1340, y: 60, d: 260, c: '#26A69A', l: 'KW'},
  {x: 1660, y: 380, d: 320, c: '#EF6C00', l: 'RM'}, {x: 250, y: 520, d: 260, c: '#5C6BC0', l: 'AL'},
  {x: 620, y: 640, d: 340, c: '#EC407A', l: 'DN'}, {x: 1080, y: 700, d: 240, c: '#43A047', l: 'PS'},
  {x: 1420, y: 780, d: 300, c: '#7E57C2', l: 'CJ'}, {x: -60, y: 760, d: 280, c: '#26A69A', l: 'MO'},
];

export const IG_Field: React.FC<{t: number; raw?: number}> = ({t, raw}) => (
  <Frame bg={IG.bg}>
    {FIELD.map((f, i) => {
      const p = pop(t, 2 + i * 3, 13);
      return (
        <div key={i} style={{position: 'absolute', left: f.x, top: f.y,
          transform: `scale(${lerp(p, 0.4, 1).toFixed(3)})`,
          opacity: interpolate(t, [i * 3, i * 3 + 5], [0, 1], clamp)}}>
          <Ring d={f.d} w={Math.round(f.d * 0.032)}><Face c={f.c} label={f.l} d={f.d * 0.86} /></Ring>
        </div>
      );
    })}
  </Frame>
);

/* F4 — the count, over the wall thrown out of focus. The only frame in the
   section with a number in it, so it lands. */
export const IG_Count: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const n = 4 + Math.floor(t / 4);
  return (
    <Frame bg={IG.bg}>
      <AbsoluteFill style={{filter: 'blur(26px)', opacity: 0.5, transform: 'scale(1.1)'}}>
        <IG_Field t={40} />
      </AbsoluteFill>
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          fontFamily: JOST, fontWeight: 700, fontSize: 340, letterSpacing: '-0.04em', lineHeight: 1,
          background: IG.ring, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          transform: `scale(${(1 + 0.06 * (1 - interpolate((raw ?? t) % 4, [0, 3], [0, 1], {easing: SNAP, ...clamp}))).toFixed(3)})`,
        }}>{n}</div>
        <div style={{marginTop: 10, fontFamily: JOST, fontWeight: 700, fontSize: 84, color: IG.ink,
          letterSpacing: '-0.02em'}}>message requests</div>
      </AbsoluteFill>
    </Frame>
  );
};

/* ══════════════ 3 · EMAIL — TYPOGRAPHY THAT MOVES ══════════════════════════
   The first pass of this section was four static typographic layouts. They
   looked good and they were wrong: a poster is calm, and at 0.6s in a cut this
   fast, calm reads as a slide. The test is not "is it well composed", it is
   "what is MOVING at the centre of this frame".

   So the type still carries the section, but every frame now has motion as its
   subject: it types itself, it slams in, it cascades, it counts. White and
   black is still the register break — that part was right. */

/* F1 — it types itself. The subject arrives character by character with a
   block cursor, which puts the motion in the words rather than around them. */
export const ML_Types: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const full = 'New enquiry from your website';
  const n = Math.max(0, Math.min(full.length, Math.round((t - 4) * 1.35)));
  const done = n >= full.length;
  return (
    <Frame bg={ML.bg}>
      <div style={{position: 'absolute', left: 120, top: 250, width: 1700}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <Mark icon={siGmail} size={50} fill={ML.red} />
          <span style={{fontFamily: ARIAL, fontSize: 40, color: ML.dim, letterSpacing: '.05em'}}>
            your website · now
          </span>
        </div>
        <div style={{marginTop: 30, fontFamily: JOST, fontWeight: 700, fontSize: 180, lineHeight: 1.02,
          color: ML.ink, letterSpacing: '-0.038em', minHeight: 380}}>
          {full.slice(0, n)}
          <span style={{
            display: 'inline-block', width: 22, height: 150, marginLeft: 14, verticalAlign: '-22px',
            background: done ? (Math.floor(t / 6) % 2 ? ML.blue : 'transparent') : ML.blue,
          }} />
        </div>
      </div>
      {/* the send bar filling, so the bottom of the frame is alive too */}
      <div style={{position: 'absolute', left: 120, bottom: 190, width: 1680, height: 10, background: ML.line}}>
        <div style={{height: '100%', background: ML.blue,
          width: `${(Math.min(1, Math.max(0, (t - 4) / 42)) * 100).toFixed(1)}%`}} />
      </div>
    </Frame>
  );
};

/* F2 — they slam in. Rows arrive from the right at 8ths and stop dead, each
   pushing the stack down. Motion blur off the frame delta, because a 700px
   slide at this rate strobes without it. */
const ML_ROWS = [
  ['New enquiry from your website', "Someone's asked for a callback", '09:41'],
  ['Quote request', 'Could you give me a price for —', '09:39'],
  ['Contact form submission', "Hi, I'd like to book something in", '09:34'],
] as const;

export const ML_Slam: React.FC<{t: number; raw?: number}> = ({t, raw}) => (
  <Frame bg={ML.bg}>
    {ML_ROWS.map(([subj, snip, time], i) => {
      const at = 6 + i * 9;
      const p = pop(t, at, 11);
      const prev = pop(t - 1, at, 11);
      const speed = Math.abs(p - prev) * 700;
      return (
        <div key={i} style={{
          position: 'absolute', left: 110, top: 210 + i * 262, width: 1700,
          borderBottom: `2px solid ${ML.line}`, paddingBottom: 34,
          transform: `translateX(${((1 - p) * 700).toFixed(1)}px)`,
          filter: speed > 3 ? `blur(${Math.min(14, speed * 0.05).toFixed(1)}px)` : undefined,
          opacity: interpolate(t, [at - 6, at - 2], [0, 1], clamp),
        }}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
            <div style={{width: 22, height: 22, borderRadius: 11, background: ML.blue, flexShrink: 0}} />
            <span style={{fontFamily: JOST, fontWeight: 700, fontSize: 92, color: ML.ink, letterSpacing: '-0.03em'}}>{subj}</span>
            <span style={{marginLeft: 'auto', fontFamily: ARIAL, fontWeight: 700, fontSize: 42, color: ML.blue}}>{time}</span>
          </div>
          <div style={{marginTop: 14, marginLeft: 48, fontFamily: ARIAL, fontSize: 48, color: ML.dim}}>{snip}</div>
        </div>
      );
    })}
  </Frame>
);

/* F3 — the cascade. Notification banners falling from the top edge and piling
   up, overlapping, at 6-frame intervals. The one frame in this section that is
   pure volume rather than words. */
export const ML_Cascade: React.FC<{t: number; raw?: number}> = ({t, raw}) => (
  <Frame bg={ML.bg}>
    {Array.from({length: 7}, (_, i) => {
      const at = i * 6;
      const p = pop(t, at, 13);
      const x = 130 + (i % 3) * 120;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: 90 + i * 128, width: 1500,
          padding: '30px 40px', borderRadius: 22, boxSizing: 'border-box',
          background: '#fff', border: `2px solid ${ML.line}`,
          boxShadow: '0 26px 60px -24px rgba(32,33,36,.28)',
          display: 'flex', alignItems: 'center', gap: 26,
          transform: `translateY(${((1 - p) * -260).toFixed(1)}px) scale(${lerp(p, 0.94, 1).toFixed(3)})`,
          opacity: interpolate(t, [at - 5, at - 1], [0, 1], clamp),
        }}>
          <Mark icon={siGmail} size={44} fill={ML.red} />
          <span style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 46, color: ML.ink}}>New enquiry</span>
          <span style={{fontFamily: ARIAL, fontSize: 42, color: ML.dim}}>from your website</span>
          <span style={{marginLeft: 'auto', fontFamily: ARIAL, fontSize: 38, color: ML.blue}}>now</span>
        </div>
      );
    })}
  </Frame>
);

/* F4 — the count, rolling. Digits change every four frames and each one pops,
   so the number is never a label. */
export const ML_Count: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const n = 6 + Math.floor(t / 3);
  const k = 1 + 0.07 * (1 - interpolate((raw ?? t) % 3, [0, 2], [0, 1], {easing: SNAP, ...clamp}));
  return (
    <Frame bg={ML.bg}>
      <div style={{position: 'absolute', left: 130, top: 120, display: 'flex', alignItems: 'center', gap: 20}}>
        <Mark icon={siGmail} size={64} fill={ML.red} />
        <span style={{fontFamily: ARIAL, fontSize: 44, color: ML.dim, letterSpacing: '.05em'}}>INBOX</span>
      </div>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 44}}>
          <span style={{fontFamily: JOST, fontWeight: 700, fontSize: 460, color: ML.ink,
            letterSpacing: '-0.055em', lineHeight: 1, transform: `scale(${k.toFixed(3)})`,
            display: 'inline-block'}}>{n}</span>
          <span style={{fontFamily: JOST, fontWeight: 700, fontSize: 96, color: ML.dim,
            letterSpacing: '-0.02em'}}>unread</span>
        </div>
      </AbsoluteFill>
      {/* a tick per email along the bottom — the count made visible as quantity */}
      <div style={{position: 'absolute', left: 130, bottom: 170, display: 'flex', gap: 14}}>
        {Array.from({length: n }, (_, i) => (
          <div key={i} style={{width: 26, height: 76, borderRadius: 6, background: i > n - 3 ? ML.blue : ML.line,
            transform: `scaleY(${(0.4 + 0.6 * Math.min(1, Math.max(0, (t - i * 3) / 6))).toFixed(2)})`,
            transformOrigin: '50% 100%'}} />
        ))}
      </div>
    </Frame>
  );
};

/* ══════════════ 4 · CALL — LIGHT AND VIOLENCE ══════════════════════════════
   Almost no interface. What moves here is the whole frame: it rings, so it
   shakes. The number is a real Ofcom drama-range number (07700 900xxx, the
   block reserved for fiction) rather than a masked one — the dots read as a
   redaction, which is a strange thing to put in an advert. */
const FAKE_NUMBER = '07700 900118';

/* SIX DIFFERENT CALLERS, not one number repeated six times. The first pass
   stacked the same digits over and over, which reads as one persistent caller
   — a nuisance, not a business. Mixed known contacts and unknown numbers is
   what a real missed-call list looks like, and it says six people wanted you.
   Every number is inside Ofcom's 07700 900xxx fiction block. */
const MISSED: [string, string, string][] = [
  ['Danny R.', 'mobile', 'now'],
  ['07700 900118', 'unknown', '1m'],
  ['Priya N.', 'mobile', '3m'],
  ['07700 900461', 'unknown', '4m'],
  ['Marcus H.', 'mobile', '6m'],
  ['07700 900237', 'unknown', '9m'],
];

/* the frame vibrates on the beat, decaying — a phone ringing on a table */
const shake = (t: number, amp = 1) => {
  const b = Math.floor(t / (BEAT / 2));
  const since = t - b * (BEAT / 2);
  const d = Math.max(0, 1 - since / 7) ** 2 * amp;
  return {x: Math.sin(t * 2.3) * 16 * d, y: Math.cos(t * 3.1) * 11 * d, r: Math.sin(t * 1.7) * 0.5 * d};
};

export const CL_Ring: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const s = shake(t);
  const R = ({o}: {o: number}) => {
    const p = interpolate(t - o, [0, 46], [0, 1], clamp);
    if (p <= 0 || p >= 1) return null;
    const d = 520 + p * 2400;      // rings run past the frame edge
    return <div style={{position: 'absolute', width: d, height: d, left: '50%', top: '50%',
      marginLeft: -d / 2, marginTop: -d / 2, borderRadius: '50%',
      border: `${(14 * (1 - p)).toFixed(1)}px solid rgba(52,199,89,${(0.6 * (1 - p) ** 1.4).toFixed(3)})`}} />;
  };
  return (
    <Frame bg="#04060A">
      <AbsoluteFill style={{transform: `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.r.toFixed(2)}deg)`}}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(52,199,89,.26) 0%, transparent 55%)'}} />
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <R o={0} /><R o={BEAT / 2} /><R o={BEAT} /><R o={BEAT * 1.5} />
          <div style={{width: 520, height: 520, borderRadius: '50%', background: CL.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 240px 50px rgba(52,199,89,.5)',
            transform: `scale(${(1 + 0.06 * Math.max(0, Math.sin(t / (BEAT / 2) * Math.PI * 2))).toFixed(3)})`}}>
            <svg width={240} height={240} viewBox="0 0 24 24"><path fill="#fff" d="M6.6 11.8c1.9 3.7 5 6.7 8.6 8.6l2.9-2.9c.4-.4.9-.5 1.3-.3 1.4.5 3 .7 4.6.7.7 0 1.3.6 1.3 1.3V24c0 .7-.6 1.3-1.3 1.3C10.9 25.3 0 14.4 0 1c0-.7.6-1.3 1.3-1.3H5c.7 0 1.3.6 1.3 1.3 0 1.6.3 3.2.7 4.6.1.5 0 1-.3 1.3l-3.1 2.9z" /></svg>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Frame>
  );
};

/* F2 — the number lands digit by digit, one per 8th, each with an overshoot.
   Static type became a sequence of eleven separate hits. */
export const CL_Number: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const s = shake(t, 0.55);
  const chars = [...FAKE_NUMBER];
  return (
    <Frame bg="#04060A">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 58%, rgba(52,199,89,.18) 0%, transparent 60%)'}} />
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`,
      }}>
        <div style={{fontFamily: ARIAL, fontSize: 48, letterSpacing: '.3em', color: CL.dim,
          opacity: interpolate(t, [0, 6], [0, 1], clamp)}}>INCOMING CALL</div>
        <div style={{marginTop: 40, display: 'flex', alignItems: 'baseline'}}>
          {chars.map((c, i) => {
            const at = 2 + i * 1.6;
            const p = pop(t, at, 10);
            return <span key={i} style={{
              fontFamily: JOST, fontWeight: 700, fontSize: c === ' ' ? 120 : 236, color: CL.ink,
              letterSpacing: '-0.02em', lineHeight: 1, display: 'inline-block',
              transform: `translateY(${((1 - p) * -70).toFixed(1)}px) scale(${lerp(p, 0.5, 1).toFixed(3)})`,
              opacity: interpolate(t, [at - 4, at - 1], [0, 1], clamp),
            }}>{c === ' ' ? ' ' : c}</span>;
          })}
        </div>
        <div style={{marginTop: 26, fontFamily: ARIAL, fontSize: 50, color: CL.dim,
          opacity: interpolate(t, [24, 32], [0, 1], clamp)}}>mobile</div>
      </AbsoluteFill>
    </Frame>
  );
};

/* F3 — the pile. Banners slam in from alternating sides every five frames with
   the counter climbing, so it reads as calls stacking up faster than anyone
   could answer them. */
export const CL_Missed: React.FC<{t: number; raw?: number}> = ({t, raw}) => {
  const n = Math.min(6, 1 + Math.floor(t / 5));
  return (
    <Frame bg="#04060A">
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,59,48,.13) 0%, transparent 62%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
        <span style={{fontFamily: JOST, fontWeight: 700, fontSize: 150, color: CL.red, letterSpacing: '-0.03em',
          transform: `scale(${(1 + 0.12 * (1 - interpolate((raw ?? t) % 5, [0, 4], [0, 1], {easing: SNAP, ...clamp}))).toFixed(3)})`,
          display: 'inline-block'}}>{n}</span>
        <span style={{marginLeft: 26, fontFamily: JOST, fontWeight: 700, fontSize: 74, color: CL.dim}}>missed</span>
      </div>
      {MISSED.map(([who, sub, time], i) => {
        const at = 3 + i * 5;
        const p = pop(t, at, 11);
        const prev = pop(t - 1, at, 11);
        const fromLeft = i % 2 === 0;
        const speed = Math.abs(p - prev) * 760;
        return (
          <div key={i} style={{
            position: 'absolute', left: fromLeft ? 90 : 330, top: 320 + i * 126, width: 1500,
            display: 'flex', alignItems: 'center', gap: 34,
            padding: '30px 54px', borderRadius: 30, boxSizing: 'border-box',
            background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)',
            transform: `translateX(${((1 - p) * (fromLeft ? -760 : 760)).toFixed(1)}px)`,
            filter: speed > 4 ? `blur(${Math.min(16, speed * 0.045).toFixed(1)}px)` : undefined,
            opacity: interpolate(t, [at - 5, at - 1], [0, 1], clamp),
          }}>
            <svg width={44} height={44} viewBox="0 0 24 24" style={{flexShrink: 0}}>
              <path fill={CL.red} d="M6.6 11.8c1.9 3.7 5 6.7 8.6 8.6l2.9-2.9c.4-.4.9-.5 1.3-.3 1.4.5 3 .7 4.6.7.7 0 1.3.6 1.3 1.3V24c0 .7-.6 1.3-1.3 1.3C10.9 25.3 0 14.4 0 1c0-.7.6-1.3 1.3-1.3H5c.7 0 1.3.6 1.3 1.3 0 1.6.3 3.2.7 4.6.1.5 0 1-.3 1.3l-3.1 2.9z" />
            </svg>
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 54, color: CL.ink}}>{who}</div>
              <div style={{marginTop: 6, fontFamily: ARIAL, fontSize: 38, color: CL.dim}}>{sub}</div>
            </div>
            <span style={{marginLeft: 'auto', fontFamily: ARIAL, fontSize: 44, color: CL.red, flexShrink: 0}}>{time}</span>
          </div>
        );
      })}
    </Frame>
  );
};

/* ── the set, in order ─────────────────────────────────────────────────────*/
export const FRAMES = [
  WA_One, WA_Typing, WA_Stack, WA_Badge,
  IG_One, IG_Accept, IG_Field, IG_Count,
  ML_Types, ML_Slam, ML_Cascade, ML_Count,
  CL_Ring, CL_Number, CL_Missed,
];
export const FRAME_LABELS = [
  'wa-1-one', 'wa-2-typing', 'wa-3-stack', 'wa-4-badge',
  'ig-1-one', 'ig-2-accept', 'ig-3-field', 'ig-4-count',
  'ml-1-types', 'ml-2-slam', 'ml-3-cascade', 'ml-4-count',
  'cl-1-ring', 'cl-2-number', 'cl-3-missed',
];
export const FRAME_COUNT_PF = FRAMES.length;

/* design surface — one frame per composition, held at a moment where its
   motion has settled, so the look can be judged before anything is animated */
const STILL_AT = [26, 30, 34, 34, 30, 24, 40, 34, 30, 30, 44, 34, 12, 44, 34];
export const PlatformFrame: React.FC<{index?: number}> = ({index = 0}) => {
  const i = Math.min(FRAMES.length - 1, Math.max(0, index));
  const C = FRAMES[i];
  return <C t={STILL_AT[i]} />;
};
