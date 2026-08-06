import React from 'react';
import {AbsoluteFill, Easing, Series, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ACC, BLACK, FLOOD_GOLD, FLOOD_GREEN, INK, OFF, WHITE} from '../theme';
import {ANTON, JOST} from '../fonts';
import {Burst, CardFX, Flood, Footage, SlamText} from '../ui';
import {BEAT_SEC, beatF} from '../music';

/* THE ADS, v2 — the flagship on the track's sustained peak, now in burst
   grammar: Sponsored takes #1 → money-energy burst → the machine (over
   footage, pushing in) → "booked." flood + the message → the ride runs →
   payoff burst → "paid." flood → £2,000,000+ lands. */

const D_SPONSOR = beatF(43) - beatF(39);     // 96
const D_BURST1 = beatF(44.5) - beatF(43);    // 36
const D_MACHINE = beatF(50) - beatF(44.5);   // 132
const D_BOOKED = beatF(52.5) - beatF(50);    // 60
const D_RIDE = beatF(57) - beatF(52.5);      // 108
const D_BURST2 = beatF(58.5) - beatF(57);    // 36
const D_PAID = beatF(60) - beatF(58.5);      // 36
const D_MONEY = beatF(72) - beatF(60);       // 288
export const ADS_D = D_SPONSOR + D_BURST1 + D_MACHINE + D_BOOKED + D_RIDE + D_BURST2 + D_PAID + D_MONEY;

/* ── Sponsored takes the top slot ── */
const Sponsored: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = spring({frame: frame - 16, fps, config: {damping: 14, stiffness: 210}});
  const push = interpolate(slide, [0, 1], [0, 150]);
  const Skeleton: React.FC<{y: number}> = ({y}) => (
    <div style={{position: 'absolute', left: '50%', top: y + push, transform: 'translateX(-50%)', width: 1060, height: 122, borderRadius: 16, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', padding: '22px 28px'}}>
      <div style={{width: 330, height: 20, borderRadius: 6, background: 'rgba(255,255,255,.16)'}} />
      <div style={{width: 600, height: 13, borderRadius: 5, background: 'rgba(255,255,255,.08)', marginTop: 15}} />
    </div>
  );
  return (
    <CardFX bg={OFF}>
      <div style={{position: 'absolute', top: 54, left: 76}}>
        <span style={{fontFamily: ANTON, fontSize: 38, color: ACC, letterSpacing: '0.06em'}}>THE ADS</span>
      </div>
      <div style={{position: 'relative', width: 1920, height: 1080}}>
        <Skeleton y={300} />
        <Skeleton y={452} />
        <Skeleton y={604} />
        <div
          style={{
            position: 'absolute', left: '50%', top: 282,
            transform: `translateX(-50%) translateY(${(1 - slide) * -240}px)`,
            opacity: slide, width: 1060, borderRadius: 16, background: WHITE,
            padding: '24px 28px', boxShadow: '0 40px 110px -30px rgba(0,0,0,.65)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
            <span style={{fontFamily: JOST, fontWeight: 500, fontSize: 21, color: WHITE, background: ACC, borderRadius: 6, padding: '4px 12px'}}>Sponsored</span>
            <span style={{fontFamily: JOST, fontWeight: 500, fontSize: 32, color: INK}}>National Taxi — Brighton</span>
          </div>
          <div style={{fontFamily: JOST, fontSize: 23, color: 'rgba(21,22,26,.62)', marginTop: 9}}>
            Fixed-price airport transfers · book online in 60 seconds
          </div>
        </div>
      </div>
    </CardFX>
  );
};

/* ── the machine, over footage, pushing in ── */
const Machine: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bf = BEAT_SEC * fps;
  const push = 1 + Math.min(1, frame / 132) * 0.06;
  const dial = interpolate(frame, [6, 110], [0, 0.78], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const R = 175, CIRC = 2 * Math.PI * R;
  const BARS = [0.35, 0.62, 0.48, 0.8, 0.58, 0.92, 0.7];
  return (
    <Footage src="stock/laptop-typing.mp4" from={14} brightness={0.28}>
      <AbsoluteFill style={{transform: `scale(${push})`, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 140}}>
          <div style={{position: 'relative', width: 440, height: 440}}>
            <svg width={440} height={440} viewBox="0 0 440 440">
              <circle cx={220} cy={220} r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={24} />
              <circle cx={220} cy={220} r={R} fill="none" stroke={ACC} strokeWidth={24} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - dial)} transform="rotate(-90 220 220)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: JOST, fontWeight: 500, fontSize: 31, letterSpacing: '0.3em', paddingLeft: '0.3em', color: 'rgba(255,255,255,.65)'}}>
              SPEND
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 30, height: 400}}>
            {BARS.map((h, i) => {
              const grow = spring({frame: frame - 8 - i * 7, fps, config: {damping: 16, stiffness: 150}});
              const pulse = 1 + Math.exp(-((frame % bf) / bf) * 5) * 0.05;
              return <div key={i} style={{width: 56, height: 400 * h * grow * pulse, borderRadius: 9, background: i === 5 ? ACC : 'rgba(255,255,255,.24)'}} />;
            })}
          </div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
        {Array.from({length: 16}, (_, i) => (
          <span key={i} style={{width: 40, height: 11, borderRadius: 4, background: Math.floor(frame / 5) % 20 >= i ? ACC : 'rgba(255,255,255,.14)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 62, left: 0, right: 0, textAlign: 'center', fontFamily: JOST, fontWeight: 500, fontSize: 24, letterSpacing: '0.32em', color: 'rgba(255,255,255,.55)'}}>
        IMPRESSIONS&nbsp;&nbsp;·&nbsp;&nbsp;CLICKS&nbsp;&nbsp;·&nbsp;&nbsp;CONVERSIONS
      </div>
    </Footage>
  );
};

/* ── the ride, compressed: route draws, cab runs, booking lands ── */
const ROUTE: Array<[number, number]> = [[380, 860], [380, 560], [820, 560], [820, 300], [1260, 300], [1260, 680], [1560, 680]];
const RideRun: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const segs = ROUTE.slice(1).map((p, i) => {
    const q = ROUTE[i];
    return {from: q, to: p, len: Math.hypot(p[0] - q[0], p[1] - q[1])};
  });
  const total = segs.reduce((a, s) => a + s.len, 0);
  const pointAt = (t: number) => {
    let d = Math.max(0, Math.min(1, t)) * total;
    for (const s of segs) {
      if (d <= s.len) {
        const p = d / s.len;
        return {x: s.from[0] + (s.to[0] - s.from[0]) * p, y: s.from[1] + (s.to[1] - s.from[1]) * p, a: (Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]) * 180) / Math.PI};
      }
      d -= s.len;
    }
    return {x: 1560, y: 680, a: 0};
  };
  const draw = interpolate(frame, [4, 42], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const run = interpolate(frame, [30, 86], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const car = pointAt(run);
  const chip = spring({frame: frame - 84, fps, config: {damping: 13, stiffness: 200}});
  const bubble = spring({frame: frame - 2, fps, config: {damping: 13, stiffness: 220}});
  return (
    <CardFX bg={WHITE} light>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {[240, 480, 720, 960, 1200, 1440, 1680].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={1080} stroke="#ECEDEF" strokeWidth={14} />
        ))}
        {[170, 400, 630, 860].map((y) => (
          <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke="#ECEDEF" strokeWidth={14} />
        ))}
        <path d={'M' + ROUTE.map(([x, y]) => `${x} ${y}`).join(' L ')} pathLength={1000} fill="none"
          stroke={ACC} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={1000} strokeDashoffset={1000 - draw * 1000} />
      </svg>
      {/* the message that starts it */}
      <div style={{position: 'absolute', left: 250, top: 130, transform: `scale(${bubble})`, transformOrigin: '10% 100%', background: '#E8F1FF', borderRadius: '22px 22px 22px 6px', padding: '18px 28px', boxShadow: '0 18px 50px -18px rgba(0,0,0,.25)', fontFamily: JOST, fontWeight: 500, fontSize: 29, color: INK}}>
        Can you pick me up? Airport, 4:30
      </div>
      <div style={{position: 'absolute', left: car.x, top: car.y, transform: `translate(-50%, -50%) rotate(${car.a}deg)`}}>
        <svg width={54} height={28} viewBox="0 0 58 30">
          <rect x={1} y={1} width={56} height={28} rx={9} fill={INK} />
          <rect x={12} y={4.5} width={7} height={21} rx={2.5} fill="#E8ECEF" />
          <rect x={38} y={4.5} width={7} height={21} rx={2.5} fill="#E8ECEF" />
          <rect x={25.5} y={10} width={7} height={10} rx={2} fill={ACC} />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 1330, top: 740, transform: `scale(${chip})`, transformOrigin: '30% 0%', background: WHITE, border: '1px solid rgba(21,22,26,.14)', borderRadius: 999, padding: '15px 28px', boxShadow: '0 22px 60px -20px rgba(0,0,0,.28)', fontFamily: JOST, fontWeight: 500, fontSize: 28, color: INK, display: 'flex', alignItems: 'center', gap: 13}}>
        <span style={{width: 13, height: 13, borderRadius: 7, background: FLOOD_GREEN, display: 'inline-block'}} />
        Booking confirmed
      </div>
    </CardFX>
  );
};

/* ── the number ── */
const Money: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bf = BEAT_SEC * fps;
  const t = interpolate(frame, [6, 150], [0, 1], {easing: Easing.out(Easing.exp), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const landed = frame >= 150;
  const value = landed ? 2000000 : Math.round(2000000 * t);
  const tick = interpolate(frame, [152, 168], [0, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + Math.exp(-((frame % bf) / bf) * 5) * 0.008;
  const glitch = landed && frame < 156;
  const BARS = [0.3, 0.55, 0.42, 0.7, 0.5, 0.85, 0.62, 0.9];
  return (
    <CardFX bg={BLACK} flash={false}>
      {/* quiet bars rising behind the number */}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70, alignItems: 'flex-end', height: 1080, opacity: 0.09}}>
        {BARS.map((h, i) => {
          const grow = spring({frame: frame - i * 9, fps, config: {damping: 18, stiffness: 60}});
          return <div key={i} style={{width: 110, height: 1080 * h * grow, background: WHITE}} />;
        })}
      </div>
      <div style={{textAlign: 'center', transform: `scale(${pulse})`, position: 'relative'}}>
        {glitch && (
          <div style={{position: 'absolute', left: -7, top: 5, fontFamily: ANTON, fontSize: 235, lineHeight: 1, color: '#FF3B30', opacity: 0.7, whiteSpace: 'pre', mixBlendMode: 'screen'}}>
            £{value.toLocaleString('en-GB')}+
          </div>
        )}
        <div style={{fontFamily: ANTON, fontWeight: 400, fontSize: 235, lineHeight: 1, color: WHITE, whiteSpace: 'pre'}}>
          £{value.toLocaleString('en-GB')}
          <span style={{color: ACC}}>{landed ? '+' : ''}</span>
        </div>
        <div style={{margin: '24px auto 0', height: 9, width: `${tick}%`, background: ACC, borderRadius: 5}} />
        <div style={{marginTop: 28, fontFamily: JOST, fontWeight: 500, fontSize: 37, letterSpacing: '0.34em', paddingLeft: '0.34em', color: 'rgba(255,255,255,.72)', opacity: landed ? 1 : 0.35}}>
          AD SPEND MANAGED
        </div>
      </div>
    </CardFX>
  );
};

export const AdsFlagship: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={D_SPONSOR}><Sponsored /></Series.Sequence>
    <Series.Sequence durationInFrames={D_BURST1}>
      <Burst dur={D_BURST1} shots={[
        {src: 'stock/laptop-typing.mp4', from: 8},
        {src: 'stock/card-payment.mp4', from: 2.5},
        {src: 'stock/night-tunnel-drive.mp4', from: 8},
      ]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_MACHINE}><Machine /></Series.Sequence>
    <Series.Sequence durationInFrames={D_BOOKED}>
      <Flood color={FLOOD_GREEN} alt="#7BD98F" verb="booked." offsetX={-110}>
        <div style={{margin: '30px auto 0', display: 'inline-block', background: WHITE, borderRadius: '20px 20px 20px 5px', padding: '15px 26px', boxShadow: '0 22px 60px -20px rgba(0,0,0,.3)', fontFamily: JOST, fontWeight: 500, fontSize: 28, color: INK}}>
          Can you pick me up?
        </div>
      </Flood>
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_RIDE}><RideRun /></Series.Sequence>
    <Series.Sequence durationInFrames={D_BURST2}>
      <Burst dur={D_BURST2} shots={[
        {src: 'stock/handshake-keys.mp4', from: 3},
        {src: 'stock/card-payment.mp4', from: 5},
      ]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_PAID}>
      <Flood color={FLOOD_GOLD} alt="#F0D08A" verb="paid." />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_MONEY}><Money /></Series.Sequence>
  </Series>
);
