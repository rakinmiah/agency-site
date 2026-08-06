import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {siGmail} from 'simple-icons';
import {JOST} from '../fonts';
import {ACC} from '../theme';
import {ARIAL} from './ui';

/* ── THE LEADS BURST ───────────────────────────────────────────────────────
   Fifteen app frames cut together became eight; eight became this. What was
   wrong survived both edits, because it was never the pace:

   NINE OF THE FIFTEEN FRAMES WERE INTRODUCTIONS. Sorted by what they actually
   showed, only six carried accumulation — a stack, a badge, a cascade, a count.
   The other nine existed to say "this is WhatsApp", "this is Instagram". The
   tour structure was removed and the tour's CONTENT was kept, and interleaving
   them meant four platforms got introduced four times each instead of once.

   ── TWO CHANNELS ────────────────────────────────────────────────────────
   WhatsApp and website enquiries. They are the two most visually opposed things
   in the set — dark speech against white type — so the section reads as a
   rhythm rather than a slideshow, and the email one carries the causal link the
   whole film has been building: "New enquiry from your website" literally says
   we built the site and the site did this. Nothing else in the section connects
   the payoff back to the product.

   Call is gone because "6 missed" is a picture of FAILURE. It was designed as
   "too busy to keep up"; the plain reading is that work is being lost, and this
   is the one section that cannot afford an ambiguous image. Instagram is gone on
   relevance — a roofer does not live on DMs, and "message requests" is unread
   strangers, which is the same ambiguity in a milder form.

   ── ONE SURFACE, WHICH IS ALSO THE COLOUR FIX ───────────────────────────
   Everything lands on one near-black ground. Three things follow from that:

     · The contrast is INSIDE the frame instead of between frames. White cards
       against near-black is the strongest pairing available; the old WhatsApp
       frames were charcoal type on charcoal ground and read as mud at speed.

     · The edit makes sense. It is not four apps being visited, it is one phone
       filling up, which is what the client actually experiences.

     · It is SAFE. Full-frame white against full-frame near-black is a 240/255
       swing; alternating those at a half beat is 5 changes a second, which is
       over the photosensitive threshold on both count and amplitude. Cards that
       ACCUMULATE on a fixed ground can never do that — the luminance only ever
       climbs, it does not oscillate.

   ── AND IT IS ONE NUMBER GOING UP ───────────────────────────────────────
   The counter persists across everything. That is the fix for "not engaging":
   before, every frame independently asserted "look, leads" and nothing carried
   from one to the next, so there was no reason to still be watching at frame
   ten. A number climbing gives the section an arc, gives the acceleration a
   purpose — faster cuts mean a faster climb — and ends on the thing a client
   cares about. It also means the cards underneath no longer each have to be a
   complete argument, which is what lets them run this fast without feeling thin.

   ── THE GRID ────────────────────────────────────────────────────────────
   192 frames, two bars, 959 → 1151. Nine arrivals accelerating from a beat to a
   half beat, then the stack recedes and the number takes the frame.

     959 983 1007 1031    one a beat
     1043 1055 1067 1079 1091   one a half beat
     1103   the number slams — beat 46, low-band .850
     1151   out

   The acceleration lands on 1055 and 1067, which measure .889 and .899: the two
   heaviest hits anywhere in this half of the track. ── */

const FPS = 60;
const BEAT = (60 / 150.1) * FPS;
export const LEADS_BURST_DUR = 192;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BOUNCE = Easing.bezier(0.18, 1.62, 0.36, 1);
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

/* ── COLOUR ────────────────────────────────────────────────────────────────
   Four values and no more. The last version had WhatsApp green, Instagram's
   five-stop gradient, Gmail red and blue, iOS green and iOS red all inside
   twelve seconds, which is why nothing in it looked like it belonged to this
   film. Loomwork's own accent is what the section resolves to. */
const GROUND = '#04060A';
const WA_GREEN = '#00A884';      // WhatsApp's UI accent, not its logo green
const CARD_DARK = '#151F26';
const INK = '#E9EDEF';
const DIM = '#7C8B95';
const GMAIL_RED = '#EA4335';

/* ── THE ARRIVALS ──────────────────────────────────────────────────────────
   Alternating, so the claim "from everywhere" is made by the rhythm rather than
   by a caption. Every name and job is invented — same rule as the search
   results, for the same reason. */
type Card = {at: number; kind: 'wa' | 'web'; who: string; body: string; time: string};
const CARDS: Card[] = [
  {at: 0,   kind: 'wa',  who: 'Danny R.',  body: 'Hi — are you taking on new work?', time: 'now'},
  {at: 24,  kind: 'web', who: 'Priya N.',  body: 'Rewire — three bed semi',          time: 'now'},
  {at: 48,  kind: 'wa',  who: 'Marcus H.', body: 'Can you send me a quote?',         time: 'now'},
  {at: 72,  kind: 'web', who: 'Tom B.',    body: 'Fuse board upgrade',               time: '1m'},
  {at: 84,  kind: 'wa',  who: 'Sophie L.', body: 'Saw your site — free this week?',  time: '1m'},
  {at: 96,  kind: 'web', who: 'Aisha K.',  body: 'EV charger install',               time: '2m'},
  {at: 108, kind: 'wa',  who: 'Ryan M.',   body: 'Do you cover emergencies?',        time: '2m'},
  {at: 120, kind: 'web', who: 'Leah W.',   body: 'Garden lighting — quote please',   time: '3m'},
  {at: 132, kind: 'wa',  who: 'Nadia S.',  body: 'Any availability this month?',     time: '3m'},
];

const SLAM = 144;                 // the number takes the frame — beat 46
const LAST_ARRIVAL = 132;
const FINAL = 47;

const CARD_W = 1240, CARD_H = 152, GAP = 20;
/* ── THE STACK GROWS DOWNWARD, NOT UPWARD ────────────────────────────────
   Anchored at the bottom, the pile climbed into the counter: by the seventh
   arrival the top card was at y = -32 and the number was sitting on top of a
   white card with its label unreadable behind it. Capping the pile or fading it
   sooner would have bought sixty pixels and made the volume read as smaller.

   Newest at the TOP, older pushed down and off the bottom, which is what every
   real notification list does. The top edge is then FIXED — the pile can never
   reach the counter no matter how many land — and four cards fit exactly
   between 300 and the bottom of frame. */
const STACK_TOP = 300;
const VISIBLE = 4;

/* the counter runs on its own clock rather than on the arrivals — the cards are
   a SAMPLE and the number is the total, which is why it can be climbing between
   them. Ticking continuously is also what makes it read as "faster than you can
   watch" instead of as a tally of what is on screen. */
/* EASE IN, not out. Out reached 47 seventeen frames before the slam, so the
   number was already sitting still on the frame that is supposed to reveal it —
   the slam became a scale-up of something finished. In it climbs the way the
   arrivals do, slowly at first and then in a sprint, and the last digit lands on
   the slam itself. */
const countAt = (f: number) => {
  const p = interpolate(f, [0, SLAM], [0, 1], {easing: Easing.in(Easing.quad), ...clamp});
  return Math.max(1, Math.round(p * FINAL));
};

const Avatar: React.FC<{who: string}> = ({who}) => {
  const initials = who.split(' ').map((w) => w[0]).join('');
  /* deterministic hue per name — Math.random boils across frames */
  const h = Math.round((who.charCodeAt(0) * 37 + who.charCodeAt(1) * 11) % 360);
  return (
    <div style={{
      width: 86, height: 86, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(145deg, hsl(${h} 42% 46%), hsl(${(h + 40) % 360} 44% 32%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: ARIAL, fontWeight: 700, fontSize: 36, color: '#fff', letterSpacing: '0.02em',
    }}>{initials}</div>
  );
};

const CardView: React.FC<{c: Card}> = ({c}) => {
  const web = c.kind === 'web';
  return (
    <div style={{
      width: CARD_W, height: CARD_H, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 30, padding: '0 44px',
      borderRadius: 30,
      background: web ? '#FFFFFF' : CARD_DARK,
      border: web ? 'none' : `1px solid rgba(255,255,255,.10)`,
      boxShadow: web ? '0 26px 60px rgba(0,0,0,.55)' : '0 20px 46px rgba(0,0,0,.45)',
    }}>
      {web ? (
        <div style={{
          width: 86, height: 86, borderRadius: 22, flexShrink: 0, background: '#F1F3F4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={46} height={46} viewBox="0 0 24 24"><path d={siGmail.path} fill={GMAIL_RED} /></svg>
        </div>
      ) : <Avatar who={c.who} />}

      <div style={{minWidth: 0, flex: 1}}>
        <div style={{
          fontFamily: ARIAL, fontWeight: 700, fontSize: 44,
          color: web ? '#17181B' : INK, whiteSpace: 'nowrap',
        }}>
          {web ? 'New enquiry from your website' : c.who}
        </div>
        <div style={{
          marginTop: 8, fontFamily: ARIAL, fontSize: 36,
          color: web ? '#5F6368' : DIM, whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          {web ? `${c.who} — ${c.body}` : c.body}
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0}}>
        <span style={{fontFamily: ARIAL, fontSize: 32, color: web ? '#80868B' : DIM}}>{c.time}</span>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: web ? '#1A73E8' : WA_GREEN,
        }} />
      </div>
    </div>
  );
};

export const LeadsBurst: React.FC<{music?: boolean}> = ({music = true}) => {
  const f = useCurrentFrame();

  /* how many have landed, and how far the stack has been pushed up by them */
  const landed = CARDS.filter((c) => f >= c.at).length;
  /* the push is continuous rather than stepped: each arrival drives the whole
     stack up by one card, settling over ten frames, so the surface is never
     still between arrivals */
  const pushOf = (fr: number) => CARDS.reduce((a, c) =>
    a + interpolate(fr, [c.at, c.at + 10], [0, 1], {easing: SNAP, ...clamp}), 0);
  const push = pushOf(f);
  const pushPrev = pushOf(f - 1);

  /* ── THE HANDOVER ────────────────────────────────────────────────────────
     The stack does not cut away, it RECEDES — scaling back, dimming and
     blurring — while the number scales up through it. One object replacing
     another in depth, which is the only move in this section that is not an
     arrival, so it reads as the section resolving rather than as another cut. */
  const slam = interpolate(f, [SLAM - 12, SLAM], [0, 1], {easing: SNAP, ...clamp});
  const stackScale = lerp(slam, 1, 0.84);
  const stackDim = 1 - slam * 0.82;
  const stackBlur = slam * 13;

  /* the counter: a badge riding the top of the frame, then the frame itself */
  const n = countAt(f);
  const nPrev = countAt(f - 1);
  /* a compact badge riding above the list, then 4.4x and dead centre. Small
     enough at the start that it reads as UI rather than as a title card — the
     number has to earn the frame across the section, not be handed it. */
  const numScale = lerp(slam, 0.58, 4.35);
  const numY = lerp(slam, 132, 512);
  /* every tick pops — the number is doing the same thing the cards are */
  const tick = n !== nPrev ? 1 : Math.max(0, 1 - ((f - 1) % 2) / 2);
  const numPop = 1 + 0.055 * interpolate(tick, [0, 1], [0, 1], clamp) * (1 - slam);

  /* the ground heats up as the pile grows, then resolves to Loomwork's own
     accent when the number takes over — the one colour change in the section */
  const heat = interpolate(landed, [0, CARDS.length], [0.10, 0.42], clamp);
  const glow = slam > 0.02
    ? `radial-gradient(ellipse at 50% 46%, rgba(131,183,216,${(0.10 + slam * 0.30).toFixed(3)}) 0%, transparent 64%)`
    : `radial-gradient(ellipse at 50% 72%, rgba(0,168,132,${heat.toFixed(3)}) 0%, transparent 62%)`;

  return (
    <AbsoluteFill style={{background: GROUND, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: glow}} />

      {/* ── THE PILE ── */}
      <AbsoluteFill style={{
        transform: `scale(${stackScale.toFixed(4)})`,
        opacity: stackDim,
        filter: stackBlur > 0.4 ? `blur(${stackBlur.toFixed(1)}px)` : undefined,
      }}>
        {CARDS.map((c, i) => {
          if (f < c.at - 4) return null;
          const p = interpolate(f, [c.at, c.at + 13], [0, 1], {easing: BOUNCE, ...clamp});
          const pPrev = interpolate(f - 1, [c.at, c.at + 13], [0, 1], {easing: BOUNCE, ...clamp});
          /* 0 is the one that just landed and sits at the top of the list */
          const age = push - (i + 1);
          const y = STACK_TOP + age * (CARD_H + GAP);
          const yPrev = STACK_TOP + (pushPrev - (i + 1)) * (CARD_H + GAP);
          const x = lerp(p, 620, 0);
          const xPrev = lerp(pPrev, 620, 0);
          const speed = Math.hypot(x - xPrev, y - yPrev);
          /* older cards fall back as they descend rather than simply scrolling
             off — the pile has depth, so what is underneath still reads as
             volume rather than as a list that happens to be long */
          const depth = Math.max(0, age);
          return (
            <div key={i} style={{
              position: 'absolute', left: (1920 - CARD_W) / 2, top: y,
              transform: `translateX(${x.toFixed(1)}px) scale(${(1 - depth * 0.045).toFixed(3)})`,
              transformOrigin: 'center top',
              opacity: Math.min(interpolate(p, [0, 0.25], [0, 1], clamp),
                interpolate(depth, [VISIBLE - 0.9, VISIBLE + 0.3], [1, 0], clamp)),
              filter: speed > 4 ? `blur(${Math.min(15, speed * 0.075).toFixed(1)}px)` : undefined,
            }}>
              <CardView c={c} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* ── THE COUNT ── */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: numY,
          textAlign: 'center',
          transform: `translateY(-50%) scale(${(numScale * numPop).toFixed(4)})`,
        }}>
          <div style={{
            fontFamily: JOST, fontWeight: 700, fontSize: 128, lineHeight: 1,
            letterSpacing: '-0.035em',
            color: slam > 0.5 ? ACC : '#FFFFFF',
          }}>{n}</div>
          <div style={{
            marginTop: 10, fontFamily: JOST, fontWeight: 700,
            fontSize: 34, letterSpacing: '0.16em',
            color: slam > 0.5 ? 'rgba(131,183,216,.78)' : 'rgba(255,255,255,.5)',
          }}>NEW ENQUIRIES</div>
        </div>
      </AbsoluteFill>

      {music && <Audio src={staticFile('music/showreel-2bar.wav')} startFrom={959} volume={0.88} />}
    </AbsoluteFill>
  );
};
