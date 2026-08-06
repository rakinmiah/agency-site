import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {JOST} from '../fonts';

const OVER = Easing.bezier(0.18, 1.5, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

/* ── THE LEADS ─────────────────────────────────────────────────────────────
   The storm's inverse, and that is the whole reason it works as a payoff:

     storm                          leads
     hundreds                       a handful
     identical                      each one specific
     random positions               an ordered stack
     illegible by design            you read every one
     other people's businesses      your customers

   Same grammar — things arriving and accumulating — turned completely around.
   The first half buries you in noise; this is signal.

   GROUND IS BLACK, because the NOISE move inverts into it and because platform
   colour only sings against black. It is also the biggest register change in the
   film: twelve seconds of white UI, then this.

   CARDS ARE BIG — 1240 wide in a 1920 frame. Real notifications are small, and
   small chips after a full-frame storm would shrink the film exactly where it
   should be most confident.

   Colour comes from the ICON TILE, not from the card. Fully coloured cards read
   as a template; a dark card with a saturated tile reads as a notification,
   which is the thing we want it believed as. ── */

export const CARD_W = 1240;
export const CARD_H = 190;

type Platform = {
  key: string;
  name: string;
  tile: string;          // the icon tile fill
  ink: string;           // the sender-name colour
  glyph: React.ReactNode;
};

const g = (d: string, fill = '#fff') => <path d={d} fill={fill} />;

export const PLATFORMS: Record<string, Platform> = {
  whatsapp: {
    key: 'whatsapp', name: 'WhatsApp', tile: '#25D366', ink: '#5BE58F',
    glyph: g('M50 12c-21 0-38 17-38 38 0 6.7 1.8 13 4.9 18.4L12 88l20.4-5.3C37.6 85.6 43.6 87.4 50 87.4c21 0 38-17 38-38S71 12 50 12zm22.4 53.1c-.9 2.6-5.3 5-7.4 5.3-1.9.3-4.3.4-6.9-.4-1.6-.5-3.6-1.2-6.2-2.3-10.9-4.7-18-15.7-18.6-16.4-.5-.7-4.4-5.8-4.4-11.1s2.8-7.9 3.8-9c1-1.1 2.2-1.4 2.9-1.4h2.1c.7 0 1.6-.3 2.5 1.9.9 2.3 3.1 7.9 3.4 8.4.3.6.5 1.2.1 1.9-.4.7-.6 1.2-1.1 1.8l-1.7 2c-.6.6-1.1 1.2-.5 2.3.6 1.1 2.8 4.6 6 7.4 4.1 3.7 7.6 4.8 8.7 5.4 1.1.6 1.7.5 2.3-.3.7-.8 2.7-3.1 3.4-4.2.7-1.1 1.4-.9 2.4-.6 1 .4 6.4 3 7.5 3.6 1.1.6 1.8.8 2.1 1.3.3.4.3 2.4-.6 5z'),
  },
  instagram: {
    key: 'instagram', name: 'Instagram', tile: 'linear-gradient(135deg,#F9CE34 4%,#EE2A7B 48%,#6228D7 96%)', ink: '#FF7BB0',
    glyph: (
      <>
        <rect x="20" y="20" width="60" height="60" rx="18" fill="none" stroke="#fff" strokeWidth="7" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#fff" strokeWidth="7" />
        <circle cx="68" cy="32" r="4.5" fill="#fff" />
      </>
    ),
  },
  facebook: {
    key: 'facebook', name: 'Facebook', tile: '#1877F2', ink: '#66A6FF',
    glyph: g('M62 34h-8c-2.2 0-3 1.4-3 3.4V45h11l-1.5 12H51v29H39V57h-9V45h9v-9.6C39 26.7 43.8 22 52.2 22H62v12z'),
  },
  tiktok: {
    /* TikTok's real tile is black, which vanishes against a dark card. Kept
       black — using the wrong colour would be more wrong — but given a visible
       rim so it still reads as a tile rather than a hole. */
    key: 'tiktok', name: 'TikTok', tile: '#0E0E11', ink: '#25F4EE',
    glyph: (
      <>
        <path d="M62 14c1.7 8.6 6.7 13.7 15 14.4v10.2c-4.8.5-9-1.1-13.9-4.1v18.1c0 23-25.1 30.2-35.2 13.7-6.5-10.6-2.5-29.3 18.3-30v10.8c-1.6.3-3.3.7-4.8 1.2-4.6 1.6-7.2 4.5-6.5 9.6.4 3 2.5 5.6 5.4 6.4 5.9 1.4 12.1-2.5 12.1-9.3V14H62z" fill="#25F4EE" />
        <path d="M58 14c1.7 8.6 6.7 13.7 15 14.4v10.2c-4.8.5-9-1.1-13.9-4.1v18.1c0 23-25.1 30.2-35.2 13.7-6.5-10.6-2.5-29.3 18.3-30v10.8c-1.6.3-3.3.7-4.8 1.2-4.6 1.6-7.2 4.5-6.5 9.6.4 3 2.5 5.6 5.4 6.4 5.9 1.4 12.1-2.5 12.1-9.3V14H58z" fill="#FE2C55" opacity="0.85" />
        <path d="M60 14c1.7 8.6 6.7 13.7 15 14.4v10.2c-4.8.5-9-1.1-13.9-4.1v18.1c0 23-25.1 30.2-35.2 13.7-6.5-10.6-2.5-29.3 18.3-30v10.8c-1.6.3-3.3.7-4.8 1.2-4.6 1.6-7.2 4.5-6.5 9.6.4 3 2.5 5.6 5.4 6.4 5.9 1.4 12.1-2.5 12.1-9.3V14H60z" fill="#fff" />
      </>
    ),
  },
  site: {
    key: 'site', name: 'loomwork.co.uk', tile: '#83B7D8', ink: '#A9D2EA',
    glyph: g('M20 30h60c2.2 0 4 1.8 4 4v32c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V34c0-2.2 1.8-4 4-4zm3 8 27 18 27-18v-2H23v2z'),
  },
  google: {
    key: 'google', name: 'Google', tile: '#FFFFFF', ink: '#E9EAEE',
    glyph: (
      <>
        <path fill="#4285F4" d="M88 50c0-2.6-.2-5.1-.7-7.5H50v14.2h21.4c-.9 4.6-3.7 8.5-7.9 11.1v9.2h12.8C83.8 70.4 88 60.9 88 50z" />
        <path fill="#34A853" d="M50 88c10.7 0 19.7-3.5 26.3-9.6L63.5 69.2c-3.6 2.4-8.1 3.8-13.5 3.8-10.3 0-19.1-7-22.2-16.3H14.6v10.3C21.1 79.6 34.5 88 50 88z" />
        <path fill="#FBBC05" d="M27.8 56.7c-.8-2.4-1.3-4.9-1.3-7.5s.5-5.1 1.3-7.5V31.4H14.6C11.9 36.7 10.4 42.8 10.4 49.2s1.5 12.5 4.2 17.8l13.2-10.3z" />
        <path fill="#EA4335" d="M50 26c5.8 0 11 2 15.1 5.9l11.3-11.3C69.7 14.4 60.7 10.4 50 10.4c-15.5 0-28.9 8.4-35.4 21l13.2 10.3C30.9 33 39.7 26 50 26z" />
      </>
    ),
  },
};

export type Lead = {platform: keyof typeof PLATFORMS; from: string; msg: string; time: string};

/* ── OPEN, NOT SPECIFIC ────────────────────────────────────────────────────
   The first pass named places and trades — Hove, Kemptown, a rewire, a boiler
   service. That pins the film to one customer and one job, and every viewer who
   is not an electrician in Hove reads themselves out of it.

   These say nothing about what the work is or where. Any trade could receive
   every one of them, which is the point: the section has to belong to whoever is
   watching. Still written as real people type — lower case, double question
   marks, no punctuation where none would be — because the tell that kills this
   is not vagueness, it is sounding written. */
export const LEADS: Lead[] = [
  {platform: 'whatsapp', from: 'Danny R.', msg: 'Hi — are you taking on new work?', time: 'now'},
  {platform: 'instagram', from: 'sophie.makes', msg: 'Saw your page. Free this week?', time: 'now'},
  {platform: 'site', from: 'New enquiry', msg: "Someone's asked for a callback", time: '1m'},
  {platform: 'facebook', from: 'Marcus Hale', msg: 'Can you send me a quote?', time: '2m'},
  {platform: 'google', from: 'New review', msg: '★★★★★ "Exactly what we needed."', time: '2m'},
  {platform: 'tiktok', from: 'jaaadeee', msg: 'how much would this be??', time: '3m'},
  {platform: 'whatsapp', from: 'Priya N.', msg: 'Do you have any availability?', time: '4m'},
  {platform: 'instagram', from: 'tom_builds', msg: 'Hi! Is this something you do?', time: '5m'},
];

export const LeadCard: React.FC<{lead: Lead; w?: number}> = ({lead, w = CARD_W}) => {
  const p = PLATFORMS[lead.platform];
  const k = w / CARD_W;
  const tile = 116 * k;

  return (
    <div style={{
      width: w, height: CARD_H * k, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 30 * k,
      padding: `0 ${34 * k}px`,
      borderRadius: 30 * k,
      background: 'rgba(255,255,255,0.065)',
      border: '1px solid rgba(255,255,255,0.12)',
      /* the platform's colour spills a little past its tile — enough that the
         card reads as belonging to that app without the card itself being it */
      boxShadow: `0 ${18 * k}px ${44 * k}px -${16 * k}px rgba(0,0,0,.7), inset ${3 * k}px 0 0 ${p.tile.startsWith('linear') ? '#EE2A7B' : p.tile}`,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: tile, height: tile, borderRadius: 30 * k, flexShrink: 0,
        background: p.tile,
        border: p.key === 'tiktok' ? '1px solid rgba(255,255,255,.22)' : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 ${34 * k}px -${6 * k}px ${
          p.tile.startsWith('linear') ? '#EE2A7B' : p.key === 'tiktok' ? '#25F4EE' : p.tile}`,
      }}>
        <svg width={tile * 0.66} height={tile * 0.66} viewBox="0 0 100 100">{p.glyph}</svg>
      </div>

      <div style={{flex: 1, minWidth: 0, fontFamily: JOST}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14 * k}}>
          <span style={{fontSize: 27 * k, fontWeight: 600, color: p.ink, letterSpacing: '.01em'}}>
            {p.name}
          </span>
          <span style={{fontSize: 25 * k, fontWeight: 400, color: 'rgba(255,255,255,.52)'}}>
            {lead.from}
          </span>
          <span style={{marginLeft: 'auto', fontSize: 23 * k, color: 'rgba(255,255,255,.36)'}}>
            {lead.time}
          </span>
        </div>
        <div style={{
          fontSize: 40 * k, fontWeight: 500, color: '#fff', marginTop: 6 * k,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lead.msg}
        </div>
      </div>
    </div>
  );
};

/* FOUR IS THE MAXIMUM. At 190 tall plus a 22 gap, six cards is 1272px in a
   1080 frame — the first and last were sliced off. */
export const VISIBLE = 4;
const SLOT = CARD_H + 22;                       // 212
const TOP = (1080 - (VISIBLE * SLOT - 22)) / 2; // 127 — the stack, centred

/* ── THEY COME FROM THE TOP ────────────────────────────────────────────────
   Each lead drops in above the frame and lands in the top slot, bouncing. Every
   arrival pushes the whole stack down one place, and once a card is past the
   fourth slot it simply keeps going and leaves the bottom — no special case
   needed, the push carries it out.

   That push is doing two jobs. It is what makes the stack read as filling up
   rather than as four things appearing, and it means the frame is never still
   between arrivals: something is always moving even on the beats where nothing
   new lands.

   THE BOUNCE IS THE UBER ONE, measured: enters flattened and skewed rather than
   scaled, overshoots, settles with a secondary wobble, and is motion-blurred
   the whole way through. The blur is what makes it feel like an object with
   weight instead of a CSS transition. ── */
export const LeadStack: React.FC<{at: number[]; push?: number}> = ({at, push = 11}) => {
  const f = useCurrentFrame();
  const ENTRY = 13;

  return (
    <AbsoluteFill>
      {LEADS.map((lead, i) => {
        const t0 = at[i];
        if (f < t0 - 1) return null;

        /* how far down the stack it has been pushed: one slot per later arrival */
        let slot = 0;
        for (let j = i + 1; j < at.length; j++) {
          slot += interpolate(f, [at[j], at[j] + push], [0, 1],
            {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        }

        const p = interpolate(f, [t0, t0 + ENTRY], [0, 1], {easing: OVER, ...clamp});
        const prev = interpolate(f - 1, [t0, t0 + ENTRY], [0, 1], {easing: OVER, ...clamp});
        const y = lerp(p, -CARD_H - 120, TOP) + slot * SLOT;
        const yPrev = lerp(prev, -CARD_H - 120, TOP) + slot * SLOT;
        const speed = Math.abs(y - yPrev);

        if (y > 1080) return null;

        /* squash on the way in, stretch as it overshoots back — the vertical and
           horizontal scales are inverses so the card keeps its area */
        const sq = (1 - p) * 0.34;
        const fade = interpolate(y, [1080 - CARD_H * 1.2, 1080], [1, 0], clamp);

        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: 0,
            transform: `translateX(-50%) translateX(${(i % 2 ? 1 : -1) * 26}px) translateY(${y.toFixed(1)}px) scaleY(${(1 - sq).toFixed(3)}) scaleX(${(1 + sq * 0.5).toFixed(3)})`,
            transformOrigin: '50% 0%',
            opacity: interpolate(f, [t0, t0 + 3], [0, 1], clamp) * fade,
            filter: speed > 2 ? `blur(${Math.min(14, speed * 0.16).toFixed(2)}px)` : undefined,
          }}>
            <LeadCard lead={lead} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* design surface only */
export const LeadsStill: React.FC = () => (
  <AbsoluteFill style={{background: '#0A0C0D'}}>
    {LEADS.slice(0, VISIBLE).map((l, i) => (
      <div key={i} style={{
        position: 'absolute', left: '50%', top: TOP + i * SLOT,
        transform: `translateX(-50%) translateX(${(i % 2 ? 1 : -1) * 26}px)`,
      }}>
        <LeadCard lead={l} />
      </div>
    ))}
  </AbsoluteFill>
);
