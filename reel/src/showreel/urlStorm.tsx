import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ARIAL} from './ui';

/* ── THE RESULTS TAKE OVER ─────────────────────────────────────────────────
   FIRST VERSION FLEW THEM PAST THE CAMERA. Bare domains on the z axis, growing
   and blurring and blowing out past the frame edge. That reads as travel — you
   moving through results — and it leaves the screen as empty at the end as it
   was at the start. What it needed to read as is ACCUMULATION: the results
   arriving and staying, until there is no screen left.

   So each one is now a whole Google listing in a box — favicon, domain, the
   breadcrumb, the blue title, a star rating, two lines of snippet — and it pops
   out of the point the search field collapsed into, flies to a position, and
   STOPS THERE. The next one lands on top. By the end the frame is nothing but
   other people's businesses.

   Positions are uniform random over an area larger than the frame — see `seat`
   for why the spiral that was here before had to go.

   The escalation is the search field's, reused: faster and blurrier. The spawn
   gap decays, each box carries motion blur from its own arrival speed, and the
   whole layer takes a rising blur at the end so the last of it merges into one
   illegible mass.

   Every business is invented. The argument is that these are indistinguishable
   from each other, and putting real firms' names to it would be saying something
   about real firms. ── */

const OVER = Easing.bezier(0.14, 1.62, 0.3, 1);   // harder overshoot
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

/* Soft corners, not a stadium — enough radius that they read as related to the
   search field rather than as plain rectangles, without the ends curving so hard
   that the content has to be inset away from them. */
const CARD_W = 600, CARD_H = 194;
const CARD_R = 26;
const ARRIVE = 6;                     /* frames for a box to land. 13 -> 8 -> 6: the burst has to
                                         be over before the eye catches up with it. */
/* Wider and taller than the frame, so boxes bleed off every edge rather than
   stopping neatly at it. 160 boxes of 600x194 over this area is ~6x coverage,
   which puts the odds of any point staying uncovered at well under a percent. */
const SPREAD_X = 2200, SPREAD_Y = 1350;

const PLACES = [
  'Withdean', 'Hollingbury', 'Fiveways', 'Sevendials', 'Preston', 'Hanover',
  'Portslade', 'Westbourne', 'Lansdowne', 'Clifton', 'Kemptown', 'Cromwell',
  'Seafield', 'Marine', 'Steine', 'Queensway', 'Ditchling', 'Patcham',
  'Rottingdean', 'Saltdean', 'Woodingdean', 'Bevendean', 'Moulsecoomb', 'Coldean',
  'Southdown', 'Brightside', 'Meridian', 'Kingsway', 'Regency', 'Devonshire',
];

/* ── EVERY TRADE, NOT ONE ──────────────────────────────────────────────────
   All 58 used to be electricians, which only made sense while the query was on
   screen saying "electrician near me". The field is gone by then, so the viewer
   has nothing telling them what was searched and a wall of one trade reads as
   arbitrary. Spreading it across the trades that just flipped through the field
   also continues that passage's argument instead of restarting it: those 34
   trades all have this behind them. */
const TRADES: Array<{w: string; t: string; s: string}> = [
  {w: 'barbers', t: 'Barbers in Brighton — Walk-ins Welcome', s: 'Skin fades, beard trims and hot towel shaves. Open seven days a week, no appointment needed.'},
  {w: 'plumbing', t: 'Local Plumber — Leaks, Boilers, Bathrooms', s: 'No call-out charge. Emergency repairs, and fixed prices confirmed before any work starts.'},
  {w: 'roofing', t: 'Roofer in Brighton & Hove — Free Quotes', s: 'Slate and tile repairs, flat roofs, guttering and chimney work. Fully insured, scaffold included.'},
  {w: 'joinery', t: 'Carpenter & Joiner — Bespoke Fitted Work', s: 'Alcove units, wardrobes, staircases and doors. Workshop-made and fitted across Sussex.'},
  {w: 'tiling', t: 'Tiler — Bathrooms, Kitchens & Floors', s: 'Porcelain, ceramic and natural stone. Wet rooms tanked and guaranteed for ten years.'},
  {w: 'plastering', t: 'Plasterer — Skimming, Rendering, Coving', s: 'Clean, dust-sheeted work and walls ready to paint. Small repairs and full house re-skims.'},
  {w: 'locksmiths', t: 'Emergency Locksmith — 24 Hour Callout', s: 'Non-destructive entry, lock changes and uPVC repairs. Usually with you inside the hour.'},
  {w: 'gardening', t: 'Gardener in Brighton — Regular Maintenance', s: 'Hedge cutting, lawns, borders and clearances. Weekly, fortnightly or one-off visits.'},
  {w: 'decorating', t: 'Painter & Decorator — Interior & Exterior', s: 'Preparation done properly, dust-free sanding and trade paints. Free written estimates.'},
  {w: 'building', t: 'Builder — Extensions, Loft Conversions', s: 'Plans, party wall and building control handled. Twenty years across Brighton and Hove.'},
  {w: 'cleaning', t: 'Cleaners in Brighton — Domestic & Office', s: 'Vetted, insured and the same cleaner each visit. End of tenancy and deep cleans too.'},
  {w: 'glazing', t: 'Glazier — Emergency Board Up & Glass Repair', s: 'Misted double glazing, broken panes and locks. Same day boarding, glass in 48 hours.'},
  {w: 'landscapes', t: 'Landscaping — Patios, Decking & Driveways', s: 'Design, groundwork and planting. Porcelain paving, sleepers and full garden rebuilds.'},
  {w: 'gasheating', t: 'Gas Engineer — Boiler Service & Repair', s: 'Gas Safe registered. Servicing, landlord certificates and combi installations.'},
  {w: 'treecare', t: 'Tree Surgeon — Felling, Pruning, Stumps', s: 'NPTC qualified and fully insured. Free quotes, all waste chipped and taken away.'},
  {w: 'windowclean', t: 'Window Cleaner — Homes & Shopfronts', s: 'Pure water reach and wash. Four-weekly rounds across Brighton, Hove and Portslade.'},
  {w: 'brickwork', t: 'Bricklayer — Walls, Repointing, Extensions', s: 'Lime and cement pointing, garden walls and chimney rebuilds. Time-served since 2004.'},
  {w: 'handyman', t: 'Handyman — Small Jobs, Same Week', s: 'Flat-pack, shelving, door hanging and repairs. Minimum one hour, no job too small.'},
  {w: 'mobilemech', t: 'Mobile Mechanic — We Come To You', s: 'Servicing, diagnostics and brakes at your home or work. Fixed prices, parts included.'},
  {w: 'doggrooming', t: 'Dog Groomer in Brighton — Book Online', s: 'Breed-standard clips, hand stripping and puppy first grooms. Calm, one dog at a time.'},
  {w: 'pestcontrol', t: 'Pest Control — Mice, Wasps, Bed Bugs', s: 'Discreet unmarked vans, same day callouts and a guarantee on every treatment.'},
  {w: 'removals', t: 'Removals — House & Office Moves', s: 'Fully insured, blankets and boxes supplied. Storage available, free survey.'},
  {w: 'kitchens', t: 'Kitchen Fitter — Supply & Installation', s: 'Templating, worktops, appliances and tiling. One team from strip-out to snagging.'},
  {w: 'driveways', t: 'Driveways & Patios — Free Design Visit', s: 'Block paving, resin bound and tarmac. Drainage compliant, ten year guarantee.'},
  {w: 'electrical', t: 'Electrician — Fuse Boards, Rewires, EV', s: 'NICEIC approved. Emergency callout, fault finding and certificates on completion.'},
];

const TLD = ['.co.uk', '.co.uk', '.co.uk', '.com', '.net', '.uk'];
const CRUMB = ['services', 'areas-covered', 'contact', 'about', 'prices'];
const DOT = ['#e8453c', '#4285f4', '#34a853', '#fbbc05', '#5f6368', '#8e24aa'];

type Item = {
  domain: string; crumb: string; title: string; rating: string; count: number;
  snip: string; dot: string;
};
export const ITEMS: Item[] = Array.from({length: 160}, (_, i) => {
  const p = PLACES[(i * 7) % PLACES.length];
  const tr = TRADES[(i * 11) % TRADES.length];
  const domain = p.toLowerCase() + tr.w + TLD[i % TLD.length];
  return {
    domain,
    crumb: `https://${domain} › ${CRUMB[i % CRUMB.length]}`,
    title: tr.t,
    /* (i*7)%7 is 0 for every integer i, so all 110 read 4.3 — which is exactly
       the kind of tell that makes invented data look invented. 3 is coprime
       with 7, so this actually walks the range. */
    rating: (4.3 + ((i * 3) % 7) / 10).toFixed(1),
    count: 38 + ((i * 53) % 260),
    snip: tr.s,
    dot: DOT[i % DOT.length],
  };
});

/* ── SEATS ARE RANDOM NOW, NOT A SPIRAL ────────────────────────────────────
   It was a sunflower — golden angle, radius growing as sqrt(i/n). Even coverage
   on paper, and wrong here for two reasons. Radius growing with INDEX means the
   run marches outward: the last third all land near the edges, so the centre
   stops receiving anything and goes stale while the rim does all the work. And a
   golden-angle spiral is a pattern — the eye finds it and then stops being
   surprised, which is the opposite of what a burst is for.

   Uniform random over a box wider and taller than the frame. Boxes land in the
   middle and at the edges throughout, they overlap unevenly, some bleed off the
   sides, and no arrival predicts the next one.

   Hashed rather than Math.random(): the position has to be the same on every
   render of a given frame or the whole wall boils. */
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ── AND THE ENVELOPE GROWS ────────────────────────────────────────────────
   Flat uniform random over the whole spread meant the centre filled LAST. More
   of the area is out at the edges than in the middle, so a box is simply more
   likely to land off-centre — and the eye is in the middle, because that is
   where the field just imploded. It read as arriving from the outside in.

   So each box is random in angle and random in radius, but the radius CEILING
   grows with index: the first volleys can only land near the middle, and the
   ceiling opens to the full frame by about a third of the way through. Centre
   first, everywhere after — and because both the angle and the radius inside
   the ceiling are still random, there is no spiral to spot. sqrt keeps the fill
   even in area rather than piling everything at the middle. */
const seat = (i: number, n: number) => {
  const t = i / Math.max(1, n - 1);
  const ceil = 0.30 + 0.70 * Math.pow(t, 0.42);
  const ang = rnd(i, 1) * Math.PI * 2;
  const rad = ceil * Math.sqrt(rnd(i, 2));
  return {
    x: Math.cos(ang) * rad * (SPREAD_X / 2),
    y: Math.sin(ang) * rad * (SPREAD_Y / 2),
    rot: (rnd(i, 3) - 0.5) * 5,
  };
};

/* ── VOLLEYS, NOT A STREAM ─────────────────────────────────────────────────
   This was a smooth geometric ramp: gap decaying from ~4 frames to a fraction of
   one, boxes arriving continuously. Densifying it twice did not help, and now I
   think that was never the problem.

   Everything else in this film lands on a beat — the words, the three flip rate
   steps, the implosion, the G. The burst was the ONE passage with no rhythm in
   it. A continuous stream gives the eye nothing to anticipate, so after about
   fifteen boxes the idea is fully understood and the remaining hundred and forty
   are texture. That is what zoning out is.

   So they arrive in VOLLEYS, one per beat. Nine hits instead of one stream, and
   the count per hit grows by half again each time — roughly 2, 3, 5, 7, 11, 16,
   24, 37, 55 — so the passage escalates instead of just continuing. Within a
   volley they splash across three frames rather than landing on the same one,
   which keeps it from looking mechanical. */
export const spawnTimes = (start: number, end: number, n: number, beat: number) => {
  const beats = Math.max(1, Math.round((end - start) / beat));
  const w = Array.from({length: beats}, (_, b) => Math.pow(1.5, b));
  const tot = w.reduce((a, c) => a + c, 0);
  const out: number[] = [];
  for (let b = 0; b < beats; b++) {
    const cnt = Math.round((w[b] / tot) * n);
    for (let k = 0; k < cnt && out.length < n; k++) {
      out.push(start + b * beat + (k % 7) * 0.42);
    }
  }
  while (out.length < n) out.push(start + (beats - 1) * beat);
  return out;
};

const Card: React.FC<{
  it: Item; p: number; seatX: number; seatY: number; rot: number; size: number;
}> = ({it, p, seatX, seatY, rot, size}) => {
  const t = interpolate(p, [0, 1], [0, 1], {easing: OVER, ...clamp});
  const fade = interpolate(p, [0, 0.22], [0, 1], clamp);
  const x = lerp(t, 0, seatX), y = lerp(t, 0, seatY);
  /* `size` shrinks with index: the first listings arrive full size and readable,
     the last volleys are barely half that. So "more of them" escalates as a
     picture rather than just as a count — the wall of legible results becomes a
     blizzard of them, which is the difference between repeating the idea and
     building it. */
  const sc = lerp(t, 0.28, 1) * size;
  /* motion blur from its own arrival speed — the distance it still has to cover
     this frame, which is what makes a fast one smear and a settled one sharp */
  const rem = Math.max(0, 1 - t);
  const dist = Math.hypot(seatX, seatY);
  const blur = Math.min(18, (dist / 90) * rem * rem);

  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2,
      transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`,
      opacity: fade,
      filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined,
      background: '#fff', borderRadius: CARD_R,
      border: '1px solid #e3e6e8',
      boxShadow: '0 10px 30px -12px rgba(20,26,30,.28)',
      padding: '20px 26px', boxSizing: 'border-box',
      fontFamily: ARIAL, overflow: 'hidden',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
        <span style={{width: 24, height: 24, borderRadius: '50%', background: it.dot, flexShrink: 0}} />
        <span style={{fontSize: 14.5, color: '#202124', whiteSpace: 'nowrap'}}>{it.domain}</span>
      </div>
      <div style={{fontSize: 11.5, color: '#5f6368', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {it.crumb}
      </div>
      <div style={{fontSize: 19.5, color: '#1a0dab', marginTop: 7, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {it.title}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12.5, color: '#70757a'}}>
        <span style={{color: '#202124'}}>{it.rating}</span>
        <span style={{color: '#e7711b', letterSpacing: 1}}>★★★★★</span>
        <span>({it.count})</span>
      </div>
      <div style={{fontSize: 12.5, color: '#4d5156', marginTop: 6, lineHeight: 1.42,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
        {it.snip}
      </div>
    </div>
  );
};

export const UrlStorm: React.FC<{
  startAt: number;
  spawnEnd: number;
  beat: number;
  fadeA: number;
  fadeB: number;
}> = ({startAt, spawnEnd, beat, fadeA, fadeB}) => {
  const f = useCurrentFrame();
  const n = ITEMS.length;
  const times = React.useMemo(
    () => spawnTimes(startAt, spawnEnd, n, beat), [startAt, spawnEnd, n, beat]);
  const layer = interpolate(f, [fadeA, fadeB], [1, 0], clamp);
  if (layer <= 0.001) return null;

  /* the whole wall goes soft at the end — the individual boxes were readable one
     at a time and are not meant to be by the time there are a hundred of them */
  const mass = interpolate(f, [spawnEnd - 52, spawnEnd + 10], [0, 8.5], clamp);

  return (
    <AbsoluteFill style={{
      opacity: layer, pointerEvents: 'none',
      filter: mass > 0.3 ? `blur(${mass.toFixed(2)}px)` : undefined,
    }}>
      {times.map((t0, i) => {
        const p = interpolate(f, [t0, t0 + ARRIVE], [0, 1], clamp);
        if (p <= 0) return null;
        const s = seat(i, n);
        return (
          <Card key={i} it={ITEMS[i]} p={p} seatX={s.x} seatY={s.y} rot={s.rot}
            size={lerp(i / (n - 1), 1, 0.52)} />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── THE G ─────────────────────────────────────────────────────────────────
   What was here was four coloured corners fading up and fading down — a dissolve
   wearing Google's palette. Soft at both ends, and soft is wrong for a join the
   whole back half hangs off.

   This is hard at both ends. The instant the storm tops out the G SLAMS on over
   the wall of listings, the ground behind it takes one colour sweep, and then it
   CUTS. Nothing fades in and nothing fades out — the component simply stops
   existing on the frame the card starts.

   One gradient sweeping across, not four corners: corners read as a vignette,
   and this wants to read as the screen changing colour. The G is what earns it —
   it is the reason the frame is allowed to go multicoloured for a third of a
   second, and it is the last of Google you see before the film stops being about
   Google. */
const SNAP_IN = Easing.bezier(0.16, 1.5, 0.36, 1);

/* ── THE MELT ──────────────────────────────────────────────────────────────
   Built off the reference rather than invented. Measured in M3's reel, the same
   move runs twice with different motivating objects — hands turning a rotary
   control in a car, and the logo mark itself:

     the object turns, slowly, for long enough to be established
     the turn ACCELERATES and takes over the whole frame
     chromatic fringing pulls off the content, then displacement liquefies it
     three or four frames where nothing is legible at all — the cut hides there
     it unwinds into the next scene

   0.3s of spin on the dial, ~1s of wind-up on the logo before it breaks.

   The G is our rotating object: it is the only round thing in the film and it is
   already sitting where the transition has to happen. The colour is not painted
   on — the aberration pulls it off what is already there, and what is already
   there is a wall of Google listings: blue link titles, orange stars, red, blue,
   green and yellow favicon dots. So the palette is motivated rather than
   applied, which is the difference between this and the gradient card it
   replaces.

   The G does not survive it. It is consumed. */
export const Melt: React.FC<{
  windUp: number;      // the slow turn starts
  breakAt: number;     // it accelerates and comes apart
  endAt: number;       // gone
  id: string;
  children: React.ReactNode;
}> = ({windUp, breakAt, endAt, id, children}) => {
  const f = useCurrentFrame();
  if (f >= endAt) return null;

  /* rotation in two stages: a slow establishing turn, then an accelerating one
     on top of it. Easing.in on both, so it is always speeding up and never
     appears to settle — a rotation that eases OUT would read as arriving. */
  const slow = interpolate(f, [windUp, breakAt], [0, 6], {easing: Easing.in(Easing.quad), ...clamp});
  const fast = interpolate(f, [breakAt, endAt], [0, 152], {easing: Easing.in(Easing.cubic), ...clamp});
  const t = interpolate(f, [breakAt, endAt], [0, 1], clamp);

  const sep = t * t * 52;                  // channel separation, px
  const disp = Math.pow(t, 1.4) * 165;     // liquefaction
  const blur = t * t * 24;
  const scale = 1 + Math.pow(t, 1.7) * 0.7;
  const on = t > 0.006;

  return (
    <>
      {on && (
        <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
          <defs>
            <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0055" numOctaves="2" seed="9" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={disp.toFixed(1)}
                xChannelSelector="R" yChannelSelector="G" result="d" />
              {/* red and blue pulled apart, green left where it is — the fringe
                  only appears where the content has edges, which on a white page
                  means exactly the type and the favicon dots */}
              <feOffset in="d" dx={(-sep).toFixed(1)} dy={(sep * 0.34).toFixed(1)} result="ro" />
              <feOffset in="d" dx={sep.toFixed(1)} dy={(-sep * 0.34).toFixed(1)} result="bo" />
              <feColorMatrix in="ro" type="matrix" result="rc"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feColorMatrix in="d" type="matrix" result="gc"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feColorMatrix in="bo" type="matrix" result="bc"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              <feBlend in="rc" in2="gc" mode="screen" result="rg" />
              <feBlend in="rg" in2="bc" mode="screen" result="rgb" />
              <feGaussianBlur in="rgb" stdDeviation={blur.toFixed(2)} />
            </filter>
          </defs>
        </svg>
      )}
      <AbsoluteFill style={{
        transform: `rotate(${(slow + fast).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
        transformOrigin: '50% 50%',
        filter: on ? `url(#${id}) saturate(${(1 + t * 2.4).toFixed(2)})` : undefined,
      }}>
        {children}
      </AbsoluteFill>
    </>
  );
};

export const GoogleG: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;

  /* 5 frames to full size with an overshoot — the pop has to beat the eye */
  const pop = interpolate(f, [a, a + 5], [0, 1], {easing: SNAP_IN, ...clamp});
  /* THE GRADIENT WASH IS GONE. It was a full-frame coloured card at 0.92 opacity
     with the G laid on top — an overlay that hid the wall of listings completely.
     The colour comes out of the picture now: the melt pulls it off the content,
     and the content is already Google's palette. The G just lands on the wall
     and gets taken apart with it. */
  const size = lerp(pop, 150, 360);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={size} height={size} viewBox="0 0 48 48"
          style={{filter: 'drop-shadow(0 14px 34px rgba(12,18,22,.34))'}}>
          <rect x="1" y="1" width="46" height="46" rx="10" fill="#fff" />
          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
