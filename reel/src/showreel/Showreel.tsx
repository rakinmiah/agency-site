import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {ACC, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX} from '../theme';
import {ANTON, JOST} from '../fonts';
import {AdsConsole, Analytics, ARIAL, Browser, BusinessProfile, GoogleLogo, Push, SERP} from './ui';

/* ═══════════════════════════════════════════════════════════════════
   LOOMWORK — SHOWREEL
   24 bars @150.1bpm · 2304f · 38.4s · audio enters at track 22.838s
   (8 bars past the drop — the strongest sustained window, chosen by
   energy analysis: avg 7.45/9, no dead patches)

   Rule set: purely rendered, hyper-real surfaces, directional movement
   on every transition, M3 pace. Stock appears exactly once — a 28-image
   strobe on the peak, as texture, never as a held shot.
   ═══════════════════════════════════════════════════════════════════ */

const BAR = 96;
export const SHOWREEL_DUR = BAR * 24; // 2304

const INK = '#0B0C0E';

/* ── helpers ── */
const Slam: React.FC<{
  text: string;
  size: number;
  color?: string;
  bg?: string;
  sub?: string;
}> = ({text, size, color = '#fff', bg = INK, sub}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 5], [1.1, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', transform: `scale(${s})`}}>
        <div style={{fontFamily: ANTON, fontSize: size, color, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '.005em'}}>
          {text}
        </div>
        {sub && (
          <div style={{fontFamily: JOST, fontWeight: 300, fontSize: size * 0.19, color: 'rgba(255,255,255,.62)', marginTop: 22, letterSpacing: '.26em'}}>
            {sub}
          </div>
        )}
      </div>
      {f < 2 && <AbsoluteFill style={{background: '#fff', opacity: 0.15}} />}
    </AbsoluteFill>
  );
};

/* ── 1-2 · the search (2 bars) ── */
const TheSearch: React.FC = () => {
  const f = useCurrentFrame();
  const typed = Math.max(0, Math.min(14, Math.floor((f - 34) / 5)));
  return <SERP query="roofer near me" typed={typed} />;
};

/* ── 3-4 · the page loads, everyone but you (2 bars) ── */
const TheSERP: React.FC = () => {
  const f = useCurrentFrame();
  const res = f > 96 ? 3 : f > 64 ? 2 : f > 34 ? 1 : 0;
  return <SERP query="roofer near me" showAd={f > 8} adName="Coastal Roofing" showPack={f > 22} results={res} />;
};

/* ── 5 · the absence (1 bar) ── */
const TheAbsence: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = interpolate(f, [0, 58], [0, 420], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const gap = interpolate(f, [50, 74], [0, 1], {
    easing: Easing.out(Easing.back(1.7)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <SERP query="roofer near me" showAd showPack adName="Coastal Roofing" results={3} scroll={scroll} gap={gap} />;
};

/* ── 7-8 · the site builds (2 bars) ── */
const TheSite: React.FC = () => {
  const f = useCurrentFrame();
  const b = (i: number) =>
    interpolate(f, [8 + i * 9, 34 + i * 9], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const scroll = interpolate(f, [110, 190], [0, 300], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <Browser url="nationaltaxi.co.uk">
        <div style={{transform: `translateY(${-scroll}px)`, fontFamily: ARIAL}}>
          <div style={{height: 74, borderBottom: '1px solid #eceef0', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 26, opacity: b(0)}}>
            <span style={{fontSize: 24, color: '#111', fontWeight: 700}}>NATIONAL TAXI</span>
            <span style={{marginLeft: 'auto', display: 'flex', gap: 22, fontSize: 17, color: '#5f6368'}}>
              <span>Airports</span><span>Fares</span><span>Contact</span>
            </span>
            <span style={{background: '#111', color: '#fff', borderRadius: 6, padding: '10px 20px', fontSize: 16}}>Book now</span>
          </div>
          <div style={{padding: '56px 60px'}}>
            <div style={{fontSize: 62, color: '#111', lineHeight: 1.1, maxWidth: 820, opacity: b(1), transform: `translateY(${(1 - b(1)) * 18}px)`}}>
              Brighton’s long-distance taxi service.
            </div>
            <div style={{fontSize: 22, color: '#5f6368', marginTop: 18, maxWidth: 700, opacity: b(2)}}>
              Fixed-price journeys to every UK airport. Professional local drivers, no surge pricing.
            </div>
            <div style={{display: 'flex', gap: 14, marginTop: 30, opacity: b(3)}}>
              <span style={{background: '#111', color: '#fff', borderRadius: 8, padding: '16px 30px', fontSize: 19}}>Get a fixed price</span>
              <span style={{border: '1px solid #dadce0', borderRadius: 8, padding: '16px 30px', fontSize: 19, color: '#111'}}>Call now</span>
            </div>
            <div style={{display: 'flex', gap: 18, marginTop: 46}}>
              {[4, 5, 6].map((i) => (
                <div key={i} style={{flex: 1, height: 190, background: '#f3f4f6', borderRadius: 10, opacity: b(i), transform: `translateY(${(1 - b(i)) * 26}px)`}} />
              ))}
            </div>
            <div style={{marginTop: 44, height: 240, background: '#111', borderRadius: 12, opacity: b(7)}} />
          </div>
        </div>
      </Browser>
    </AbsoluteFill>
  );
};

/* ── 9-10 · the listing (2 bars) ── */
const TheListing: React.FC = () => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [6, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <BusinessProfile fill={fill} rating={5.0} reviews={80} />
    </AbsoluteFill>
  );
};

/* ── 11-12 · the ads (2 bars) ── */
const TheAds: React.FC = () => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [8, 130], [0.12, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AdsConsole grow={grow} spend={18400 * grow} />;
};

/* ── 13-14 · THE AVALANCHE (2 bars, 20 words) ── */
const WORDS: Array<[string, string, string]> = [
  ['found.', INK, '#fff'],
  ['seen.', '#fff', INK],
  ['ranked.', '#1a73e8', '#fff'],
  ['clicked.', INK, '#fff'],
  ['called.', '#fff', INK],
  ['quoted.', '#e8710a', '#fff'],
  ['chosen.', INK, '#fff'],
  ['trusted.', '#fff', INK],
  ['reviewed.', '#188038', '#fff'],
  ['rated.', INK, '#fff'],
  ['shared.', '#fff', INK],
  ['booked.', '#1a73e8', '#fff'],
  ['scheduled.', INK, '#fff'],
  ['dispatched.', '#fff', INK],
  ['delivered.', '#e8710a', '#fff'],
  ['invoiced.', INK, '#fff'],
  ['paid.', '#fff', INK],
  ['repeated.', '#188038', '#fff'],
  ['recommended.', INK, '#fff'],
  ['busy.', ACC, INK],
];

const Word: React.FC<{w: string; bg: string; fg: string; i: number}> = ({w, bg, fg, i}) => {
  const f = useCurrentFrame();
  const dir = i % 4;
  const t = Math.min(1, f / 3);
  const x = dir === 0 ? (1 - t) * 60 : dir === 2 ? (1 - t) * -60 : 0;
  const y = dir === 1 ? (1 - t) * 50 : dir === 3 ? (1 - t) * -50 : 0;
  return (
    <AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center'}}>
      <span
        style={{
          fontFamily: ANTON,
          fontSize: 168,
          color: fg,
          lineHeight: 1,
          transform: `translate(${x}px, ${y}px) scale(${1.06 - t * 0.06})`,
        }}
      >
        {w}
      </span>
    </AbsoluteFill>
  );
};

/* ── 15 · THE BURST (1 bar, 28 stills) ── */
const BURST = [
  't4','c4','g4','p4','l5','d4','h4','b4','t5','c5','g5','p5','l6','d5',
  'h5','b5','t6','c6','g6','p6','l7','d6','h6','b6','t7','c7','l8','b7',
];

const Flash: React.FC<{img: string; i: number}> = ({img, i}) => {
  const f = useCurrentFrame();
  const dir = i % 2 === 0 ? 1 : -1;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img
        src={staticFile(`stills/${img}.jpg`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(1.14) translateX(${dir * f * 5}px)`,
          filter: 'contrast(1.2) brightness(0.9) saturate(1.1)',
        }}
      />
      {f < 1 && <AbsoluteFill style={{background: '#fff', opacity: 0.22}} />}
    </AbsoluteFill>
  );
};

/* ── 16-19 · the proof ── */
const Proof: React.FC<{label: string; value: string}> = ({label, value}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [4, 68], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <Analytics draw={draw} label={label} value={value} />;
};

const Money: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [4, 110], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const v = f >= 112 ? 2000000 : Math.round(2000000 * t);
  return (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: ANTON, fontSize: 230, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          £{v.toLocaleString('en-GB')}
          <span style={{color: ACC}}>{f >= 112 ? '+' : ''}</span>
        </div>
        <div style={{fontFamily: JOST, fontWeight: 500, fontSize: 34, letterSpacing: '.32em', color: 'rgba(255,255,255,.7)', marginTop: 24}}>
          AD SPEND MANAGED
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── 22-24 · the close ── */
const Close: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [10, 110], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const settle = interpolate(f, [110, 150], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const W = interpolate(settle, [0, 1], [660, 250]);
  const H = (W * 100) / 220;
  const letters = interpolate(f, [128, 168], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const domain = interpolate(f, [186, 216], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drift = (1 - letters) * 34;
  const L: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    fontFamily: JOST,
    fontWeight: 400,
    fontSize: 152,
    letterSpacing: '-.01em',
    color: '#fff',
    opacity: letters,
    whiteSpace: 'pre',
  };
  return (
    <AbsoluteFill style={{background: INK}}>
      <svg viewBox={LEM_VIEWBOX} width={W} height={H} style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
        <path d={LEM_PATH} pathLength={1000} fill="none" stroke={ACC} strokeWidth={LEM_STROKE_WIDTH}
          strokeLinecap="round" strokeDasharray={1000} strokeDashoffset={1000 - draw * 1000} />
      </svg>
      <span style={{...L, right: `calc(50% + ${W / 2 + 8}px)`, transform: `translateY(-54%) translateX(${-drift}px)`}}>L</span>
      <span style={{...L, left: `calc(50% + ${W / 2 + 8}px)`, transform: `translateY(-54%) translateX(${drift}px)`}}>
        MWORK<span style={{fontSize: '.3em', verticalAlign: '1.1em', opacity: 0.6}}>®</span>
      </span>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '63%',
          textAlign: 'center',
          fontFamily: JOST,
          fontWeight: 300,
          fontSize: 40,
          letterSpacing: '.2em',
          color: 'rgba(255,255,255,.72)',
          opacity: domain,
        }}
      >
        loomwork.co.uk
      </div>
    </AbsoluteFill>
  );
};

/* ═══ the edit ═══ */
export const Showreel: React.FC = () => (
  <>
    <Audio
      src={staticFile('music/showreel.wav')}
      volume={(f) => interpolate(f, [SHOWREEL_DUR - 56, SHOWREEL_DUR], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    <Series>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Push dir="left" dur={BAR * 2}><TheSearch /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Push dir="left" dur={BAR * 2}><TheSERP /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR}>
        <Push dir="up" dur={BAR}><TheAbsence /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR}>
        <Slam text="We fix that." size={190} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Push dir="right" dur={BAR * 2}><TheSite /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Push dir="left" dur={BAR * 2}><TheListing /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Push dir="up" dur={BAR * 2}><TheAds /></Push>
      </Series.Sequence>

      {/* the avalanche — 20 words across 2 bars */}
      {WORDS.map(([w, bg, fg], i) => (
        <Series.Sequence key={w} durationInFrames={i < 12 ? 10 : 9}>
          <Word w={w} bg={bg} fg={fg} i={i} />
        </Series.Sequence>
      ))}

      {/* the burst — 28 stills in exactly one bar (12×4 + 16×3 = 96) */}
      {BURST.map((img, i) => (
        <Series.Sequence key={img + i} durationInFrames={i < 12 ? 4 : 3}>
          <Flash img={img} i={i} />
        </Series.Sequence>
      ))}

      <Series.Sequence durationInFrames={BAR}>
        <Push dir="left" dur={BAR}><Proof label="Enquiries · month one" value="16" /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR}>
        <Push dir="left" dur={BAR}><Proof label="Search visibility" value="5×" /></Push>
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR}>
        <Slam text="£10,000+" size={210} sub="FROM A STANDING START" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Money />
      </Series.Sequence>
      {/* the triad — two beats each, quick */}
      <Series.Sequence durationInFrames={64}>
        <Slam text="The site." size={168} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={64}>
        <Slam text="The search." size={168} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={64}>
        <Slam text="The ads." size={168} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BAR * 2}>
        <Close />
      </Series.Sequence>
    </Series>
  </>
);
