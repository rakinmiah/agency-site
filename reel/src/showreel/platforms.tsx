import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {JOST} from '../fonts';
import {ARIAL} from './ui';
import {PLATFORMS} from './leads';

/* ── THE PLATFORM SCENES ───────────────────────────────────────────────────
   Four micro-scenes, two bars each, each one a different place a lead actually
   lands. Replaces the vertical notification stack, which was one axis repeated
   eight times.

   THREE RULES THESE ARE DESIGNED AGAINST:

   1. IMPRESSIONS, NOT REPLICAS. Each is on screen for about three seconds, so
      it is built at the scale you read in half a second — a third of the
      elements a real interface has and roughly double the type size. A faithful
      UI would be correct and illegible, which is the worse failure.

   2. THE FORM HAS TO CHANGE, NOT JUST THE COLOUR. Four chat interfaces in a row
      is the notification stack's problem moved up a level: WhatsApp, Messenger
      and Instagram DMs are all a list of rows with an avatar and a preview, and
      swapping green for blue for a gradient does not change what the eye is
      looking at. So the set runs list → list-with-a-different-signature →
      LIGHT → full-bleed, and the call has no panel at all.

   3. UI TYPE IS ARIAL, our own voice is Jost. Same logic as the Google page in
      the opening: the believability of an interface lives in its typeface, and
      a platform rendered in the brand font reads as our design of that platform
      rather than as the thing itself.

   THE COPY RULE, carried from the notification cards: open, no locations,
   nothing that says what the trade is, written the way people type rather than
   the way copy gets written. Any trade watching has to be able to receive every
   one of these. */

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OVER = Easing.bezier(0.34, 1.56, 0.64, 1);
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;
const lands = (at: number, dur: number, k: number): [number, number] =>
  [at - k * dur, at + (1 - k) * dur];
const pop = (f: number, at: number, dur = 12) =>
  interpolate(f, lands(at, dur, 0.370), [0, 1], {easing: OVER, ...clamp});
const ease = (f: number, at: number, dur = 10) =>
  interpolate(f, lands(at, dur, 0.330), [0, 1], {easing: SNAP, ...clamp});

const BEAT = (60 / 150.1) * 60;
const E = BEAT / 2;                    // 11.99 — one eighth, the fastest rate the track carries
const e = (n: number) => Math.round(n * E);

export const GREEN = '#25D366';
export const IG_GRAD = 'linear-gradient(135deg,#F9CE34 4%,#EE2A7B 48%,#6228D7 96%)';
export const PANEL_W = 1300;

const INK = '#FFFFFF';
const DIM = 'rgba(255,255,255,.58)';
const GROUND = '#08090B';

/* avatars are initials on flat colour — no photographs, so no identifiable
   person, and the rows read as shape rather than as detail */
const AV = ['#7E57C2', '#26A69A', '#EF6C00', '#5C6BC0', '#EC407A', '#43A047'];

const Avatar: React.FC<{i: number; label: string; size: number}> = ({i, label, size}) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: AV[i % AV.length], color: '#fff',
    fontFamily: ARIAL, fontWeight: 700, fontSize: size * 0.38,
  }}>{label}</div>
);

const GradRing: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <div style={{
    width: size + 16, height: size + 16, borderRadius: '50%', flexShrink: 0,
    background: IG_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: size + 6, height: size + 6, borderRadius: '50%', background: GROUND,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</div>
  </div>
);

export const panelBox = (bg: string): React.CSSProperties => ({
  borderRadius: 42, background: bg, overflow: 'hidden',
  boxShadow: '0 60px 140px -40px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.09)',
});

/* ── THE PANEL ARRIVES, AND THEN NEVER SITS STILL ─────────────────────────
   Bounce in on the bar line, then a 3% creep across the whole scene. Same
   reason the sentence cards creep: a cut that interrupts movement reads as a
   decision, one that interrupts stillness reads as a jump — and with the track
   flat from here to the end, that creep is one of the few things keeping the
   picture alive between hits. */
const Panel: React.FC<{t: number; w: number; bg: string; children: React.ReactNode; at?: number}> =
  ({t, w, bg, children, at = 0}) => {
    const p = pop(t, at, 14);
    const creep = interpolate(t, [at, at + 192], [1, 1.03], {easing: Easing.inOut(Easing.quad), ...clamp});
    /* NO GROUND ON THIS WRAPPER. It used to paint GROUND across the whole
       frame, which meant whichever scene rendered last covered the one before
       it completely — so Instagram disappeared four frames before the collapse
       that is supposed to swallow it, and the transition was a gradient line
       arriving on an empty frame rather than a panel folding into one. The run
       supplies the ground once, underneath everything. */
    return (
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          width: w, ...panelBox(bg),
          transform: `scale(${(lerp(p, 0.88, 1) * creep).toFixed(4)})`,
          opacity: interpolate(t, [at - 4, at + 2], [0, 1], clamp),
        }}>{children}</div>
      </AbsoluteFill>
    );
  };

/* a number that climbs, popping on every increment — the single element doing
   the most work in this section, because volume IS the argument */
const Count: React.FC<{t: number; steps: [number, number][]; bg: string; size?: number; grad?: boolean}> =
  ({t, steps, bg, size = 52, grad}) => {
    let n = steps[0][1], last = steps[0][0];
    for (const [at, v] of steps) if (t >= at) { n = v; last = at; }
    const k = 1 + 0.42 * (1 - ease(t, last + 3, 10));
    return (
      <div style={{
        minWidth: size, height: size, borderRadius: size / 2,
        background: grad ? IG_GRAD : bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
        fontFamily: ARIAL, fontWeight: 700, fontSize: size * 0.52, color: '#fff',
        transform: `scale(${k.toFixed(3)})`,
      }}>{n}</div>
    );
  };

/* rows are TRAVEL — they exist off-panel before they arrive — so they may lead
   the beat, unlike a content cut which has to land on the exact frame. The blur
   is real, off the frame-to-frame delta: without it a 150px slide at 60fps
   strobes rather than moves. */
const rowIn = (t: number, at: number): React.CSSProperties => {
  const p = pop(t, at, 12), prev = pop(t - 1, at, 12);
  const speed = Math.abs(p - prev) * 150;
  return {
    opacity: interpolate(t, [at - 6, at - 2], [0, 1], clamp),
    transform: `translateX(${((1 - p) * 150).toFixed(1)}px)`,
    filter: speed > 2.5 ? `blur(${Math.min(9, speed * 0.15).toFixed(1)}px)` : undefined,
  };
};

const Row: React.FC<{children: React.ReactNode; h?: number; border?: string; style?: React.CSSProperties}> =
  ({children, h = 148, border, style}) => (
    <div style={{
      height: h, display: 'flex', alignItems: 'center', gap: 30, padding: '0 44px',
      borderBottom: border ? `1px solid ${border}` : undefined, boxSizing: 'border-box', ...style,
    }}>{children}</div>
  );

/* ── 1 · WHATSAPP — the chat LIST, not a conversation ──────────────────────
   A conversation says one person is talking to you. A list says seven are, and
   the section is about volume. The green unread badges are what the eye reads,
   which is also what makes them the right thing to carry the cut out. */
const WA_ROWS: [string, string, string, string, number][] = [
  ['DR', 'Danny R.', 'Hi — are you taking on new work?', 'now', 2],
  ['PN', 'Priya N.', 'Do you have any availability?', 'now', 1],
  ['MH', 'Marcus H.', 'Can you send me a quote?', '1m', 3],
  ['SL', 'Sophie L.', 'saw your page, free this week?', '2m', 1],
];

export const WhatsAppScene: React.FC<{t: number}> = ({t}) => (
  <Panel t={t} w={PANEL_W} bg="#0B141A">
    <div style={{
      height: 130, display: 'flex', alignItems: 'center', gap: 26, padding: '0 44px',
      background: '#111B21', borderBottom: '1px solid rgba(255,255,255,.07)',
    }}>
      <svg width={54} height={54} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill={GREEN} />{PLATFORMS.whatsapp.glyph}</svg>
      <span style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 40, color: INK}}>WhatsApp</span>
      <span style={{marginLeft: 'auto'}}>
        {/* climbs across the whole scene on the beat — the rows stop arriving
            after half a bar, and without this the second half would be static */}
        <Count t={t} bg={GREEN} steps={[[e(1), 2], [e(2), 3], [e(3), 6], [e(4), 7],
          [e(6), 9], [e(8), 11], [e(11), 14], [e(14), 18]]} />
      </span>
    </div>
    {WA_ROWS.map(([ini, name, msg, time, n], i) => (
      <Row key={i} border="rgba(255,255,255,.06)" style={rowIn(t, e(i + 1))}>
        <Avatar i={i} label={ini} size={92} />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 38, color: INK}}>{name}</div>
          <div style={{fontFamily: ARIAL, fontSize: 33, color: DIM, marginTop: 8,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{msg}</div>
        </div>
        <div style={{textAlign: 'right', flexShrink: 0}}>
          <div style={{fontFamily: ARIAL, fontSize: 26, color: GREEN, marginBottom: 12}}>{time}</div>
          <div style={{transform: `scale(${(0.4 + 0.6 * pop(t, e(i + 1) + 4, 9)).toFixed(3)})`}}>
            <div style={{
              minWidth: 46, height: 46, borderRadius: 23, background: GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 14px',
              fontFamily: ARIAL, fontWeight: 700, fontSize: 24, color: '#fff',
            }}>{n}</div>
          </div>
        </div>
      </Row>
    ))}
  </Panel>
);

/* ── 2 · INSTAGRAM — message requests ──────────────────────────────────────
   Requests rather than the inbox: a request is someone who does not know you
   yet, which is exactly what a lead is. The gradient rings give this scene a
   colour signature the others cannot borrow, and the Accept buttons make it
   the only list where the business has something to DO. */
const IG_ROWS: [string, string, string][] = [
  ['SM', 'sophie.makes', 'Saw your work — do you take bookings?'],
  ['TB', 'tom_builds', 'hi! is this something you do?'],
  ['JD', 'jaaadeee', 'how much would this be??'],
  ['KW', 'k.wilson_', 'any slots this weekend?'],
];

export const InstagramScene: React.FC<{t: number}> = ({t}) => {
  let req = 4; for (const [at, v] of [[e(1), 5], [e(2), 7], [e(4), 9], [e(7), 12], [e(11), 16]] as [number, number][]) if (t >= at) req = v;
  return (
    <Panel t={t} w={PANEL_W} bg="#000000">
      <div style={{
        height: 130, display: 'flex', alignItems: 'center', gap: 26, padding: '0 44px',
        borderBottom: '1px solid rgba(255,255,255,.1)',
      }}>
        <svg width={54} height={54} viewBox="0 0 100 100">
          <defs><linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
            <stop offset="4%" stopColor="#F9CE34" /><stop offset="48%" stopColor="#EE2A7B" /><stop offset="96%" stopColor="#6228D7" />
          </linearGradient></defs>
          <rect width="100" height="100" rx="26" fill="url(#ig)" />
          {PLATFORMS.instagram.glyph}
        </svg>
        <span style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 40, color: INK}}>Message requests</span>
        <span style={{
          marginLeft: 'auto', fontFamily: ARIAL, fontWeight: 700, fontSize: 36,
          background: IG_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>{req} new</span>
      </div>
      {IG_ROWS.map(([ini, name, msg], i) => (
        <Row key={i} border="rgba(255,255,255,.08)" style={rowIn(t, e(i + 1))}>
          <GradRing size={84}><Avatar i={i + 2} label={ini} size={84} /></GradRing>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 36, color: INK}}>{name}</div>
            <div style={{fontFamily: ARIAL, fontSize: 32, color: DIM, marginTop: 8,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{msg}</div>
          </div>
          {/* the accepts fire on the off-beats, after all four rows are in —
              so the second half of the scene has its own rhythm rather than
              waiting out the bar */}
          <div style={{
            padding: '14px 30px', borderRadius: 14, flexShrink: 0, background: IG_GRAD,
            fontFamily: ARIAL, fontWeight: 700, fontSize: 28, color: '#fff',
            transform: `scale(${(1 - 0.14 * (1 - ease(t, e(6 + i * 2), 8))).toFixed(3)})`,
            opacity: t > e(6 + i * 2) - 2 ? 1 : 0.55,
          }}>{t > e(6 + i * 2) ? 'Accepted' : 'Accept'}</div>
        </Row>
      ))}
    </Panel>
  );
};

/* ── 3 · EMAIL — and it is WHITE ───────────────────────────────────────────
   The register break. Two dark platform scenes in a row and the eye stops
   registering the cuts between them; one light frame resets it. It is also the
   only scene where the sender is the business's OWN website rather than a
   platform, which is the thing the film sold two cards earlier. */
const MAIL_ROWS: [string, string, string][] = [
  ['New enquiry from your website', "Someone's asked for a callback", 'now'],
  ['Quote request', 'Could you give me a price for —', 'now'],
  ['New enquiry from your website', "Hi, I'd like to book something in", '1m'],
  ['Contact form submission', 'Are you free later this week?', '3m'],
];

export const EmailScene: React.FC<{t: number}> = ({t}) => (
  <Panel t={t} w={1340} bg="#FFFFFF" at={-8}>
    <div style={{
      height: 128, display: 'flex', alignItems: 'center', gap: 26, padding: '0 44px',
      borderBottom: '1px solid #E4E7EB',
    }}>
      <svg width={52} height={52} viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#EA4335" />
        <path d="M22 34h56c1.7 0 3 1.3 3 3v26c0 1.7-1.3 3-3 3H22c-1.7 0-3-1.3-3-3V37c0-1.7 1.3-3 3-3zm2 6 26 17 26-17v-2H24v2z" fill="#fff" /></svg>
      <span style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 40, color: '#15161A'}}>Inbox</span>
      <span style={{marginLeft: 'auto'}}>
        <Count t={t} bg="#1A73E8" steps={[[e(2), 4], [e(3), 6], [e(5), 7], [e(8), 9], [e(12), 12]]} />
      </span>
    </div>
    {MAIL_ROWS.map(([subj, prev, time], i) => (
      <Row key={i} h={140} border="#EDEFF2" style={rowIn(t, e(i + 2))}>
        <div style={{
          width: 16, height: 16, borderRadius: 8, background: '#1A73E8', flexShrink: 0,
          transform: `scale(${(0.2 + 0.8 * pop(t, e(i + 2) + 3, 9)).toFixed(3)})`,
        }} />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 37, color: '#15161A'}}>{subj}</div>
          <div style={{fontFamily: ARIAL, fontSize: 31, color: 'rgba(21,22,26,.56)', marginTop: 8,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{prev}</div>
        </div>
        <div style={{fontFamily: ARIAL, fontWeight: 700, fontSize: 27, color: '#15161A', flexShrink: 0}}>{time}</div>
      </Row>
    ))}
  </Panel>
);

/* ── 4 · THE PHONE ACTUALLY RINGS ──────────────────────────────────────────
   Every other scene is a rectangle full of rows. This is full-bleed with three
   elements on it, so it is the only cut in the section where the SHAPE of the
   frame changes rather than its colour.

   It is also the truest to the audience. For a trade the conversion is not a
   message thread, it is the phone going — and finishing the run on a ring, with
   calls already stacked behind it, hands into what follows on a rise instead of
   a lull.

   The number is masked. A plausible UK mobile is somebody's actual number. */
export const CallScene: React.FC<{t: number; bloom?: number}> = ({t, bloom = 1}) => {
  /* the ring pulses ON the beat — two expanding rings per beat, decaying, so
     the scene has a pulse even while nothing else moves */
  const b = Math.floor(t / BEAT);
  const since = t - b * BEAT;
  const r1 = interpolate(since, [0, BEAT], [0, 1], clamp);
  const r2 = interpolate(since - BEAT / 2, [0, BEAT], [0, 1], clamp);
  const Ring = ({p}: {p: number}) => p <= 0 || p >= 1 ? null : (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      width: 148 + p * 460, height: 148 + p * 460, marginLeft: -(148 + p * 460) / 2, marginTop: -(148 + p * 460) / 2,
      borderRadius: '50%', border: `3px solid rgba(52,199,89,${(0.5 * (1 - p)).toFixed(3)})`,
    }} />
  );

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 42%, rgba(22,53,31,${bloom.toFixed(2)}) 0%, #08090B 62%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 74, left: '50%',
        transform: `translateX(-50%) translateY(${((1 - pop(t, e(4), 12)) * -90).toFixed(1)}px)`,
        opacity: interpolate(t, [e(4) - 6, e(4) - 2], [0, 1], clamp),
        display: 'flex', alignItems: 'center', gap: 22,
        padding: '22px 40px', borderRadius: 26,
        background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)',
        fontFamily: ARIAL, fontSize: 32, color: 'rgba(255,255,255,.82)',
      }}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: '#FF3B30'}} />
        {t >= e(10) ? '3 missed calls' : '2 missed calls'}
      </div>

      <div style={{
        fontFamily: ARIAL, fontSize: 40, letterSpacing: '.16em',
        color: 'rgba(255,255,255,.5)', marginBottom: 34,
        opacity: interpolate(t, [2, 8], [0, 1], clamp),
      }}>INCOMING CALL</div>
      <div style={{
        fontFamily: JOST, fontWeight: 700, fontSize: 168, color: '#fff',
        letterSpacing: '-0.018em', lineHeight: 1,
        transform: `scale(${(0.9 + 0.1 * pop(t, 4, 14)).toFixed(3)})`,
        opacity: interpolate(t, [0, 6], [0, 1], clamp),
      }}>07•• ••• •••</div>
      <div style={{
        fontFamily: ARIAL, fontSize: 38, color: 'rgba(255,255,255,.55)', marginTop: 26,
        opacity: interpolate(t, [8, 16], [0, 1], clamp),
      }}>mobile</div>

      <div style={{display: 'flex', gap: 150, marginTop: 96, position: 'relative'}}>
        <div style={{
          width: 148, height: 148, borderRadius: '50%', background: '#FF3B30',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(134deg)',
          opacity: interpolate(t, [e(1), e(1) + 8], [0, 1], clamp),
        }}>
          <svg width={72} height={72} viewBox="0 0 24 24"><path fill="#fff" d="M6.6 11.8c1.9 3.7 5 6.7 8.6 8.6l2.9-2.9c.4-.4.9-.5 1.3-.3 1.4.5 3 .7 4.6.7.7 0 1.3.6 1.3 1.3V24c0 .7-.6 1.3-1.3 1.3C10.9 25.3 0 14.4 0 1c0-.7.6-1.3 1.3-1.3H5c.7 0 1.3.6 1.3 1.3 0 1.6.3 3.2.7 4.6.1.5 0 1-.3 1.3l-3.1 2.9z" /></svg>
        </div>
        <div style={{position: 'relative'}}>
          <Ring p={r1} /><Ring p={r2} />
          <div style={{
            width: 148, height: 148, borderRadius: '50%', background: '#34C759',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 22px rgba(52,199,89,.16), 0 0 0 46px rgba(52,199,89,.07)',
            opacity: interpolate(t, [e(1), e(1) + 8], [0, 1], clamp),
          }}>
            <svg width={72} height={72} viewBox="0 0 24 24"><path fill="#fff" d="M6.6 11.8c1.9 3.7 5 6.7 8.6 8.6l2.9-2.9c.4-.4.9-.5 1.3-.3 1.4.5 3 .7 4.6.7.7 0 1.3.6 1.3 1.3V24c0 .7-.6 1.3-1.3 1.3C10.9 25.3 0 14.4 0 1c0-.7.6-1.3 1.3-1.3H5c.7 0 1.3.6 1.3 1.3 0 1.6.3 3.2.7 4.6.1.5 0 1-.3 1.3l-3.1 2.9z" /></svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* design surface: one scene per frame at its fullest, so the set can be judged
   as stills without paying for a render */
const SCENES = [WhatsAppScene, InstagramScene, EmailScene, CallScene];
export const PLATFORM_STILL_COUNT = SCENES.length;

export const PlatformStills: React.FC<{index?: number}> = ({index = 0}) => {
  const S = SCENES[Math.min(SCENES.length - 1, Math.max(0, index))];
  return <S t={150} />;
};
