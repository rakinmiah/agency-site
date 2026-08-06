import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ACC, LEM_PATH, LEM_STROKE_WIDTH, LEM_VIEWBOX} from '../theme';
import {ANTON, JOST} from '../fonts';
import {AdsConsole, Analytics, ARIAL, Browser, BusinessProfile, GoogleLogo, G_BLUE, G_DESC, G_LINE, G_LINK, G_STAR, G_TEXT, SERP} from './ui';

/* STYLE FRAMES — one designed scene per frame index, rendered as stills so the
   look can be agreed before anything is animated.
   Through-line: THE PLACES YOUR CUSTOMERS LOOK. Search, Maps, the listing, the
   site, the ads, the phone. Every frame is the same universe — nothing can read
   as disconnected. No stock anywhere. */

export const FRAME_COUNT = 12;
const INK = '#0B0C0E';

const Stars: React.FC<{size?: number}> = ({size = 16}) => (
  <span style={{display: 'inline-flex', gap: 1, verticalAlign: 'middle'}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" fill={G_STAR} />
      </svg>
    ))}
  </span>
);

/* a real phone shell */
const Phone: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      width: 430,
      height: 880,
      borderRadius: 54,
      background: dark ? '#000' : '#fff',
      border: '10px solid #14161a',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 50px 120px -40px rgba(0,0,0,.85)',
    }}
  >
    <div style={{position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 118, height: 30, background: '#14161a', borderRadius: 16, zIndex: 3}} />
    {children}
  </div>
);

const Statement: React.FC<{big: string; small?: string; bg?: string; fg?: string}> = ({big, small, bg = INK, fg = '#fff'}) => (
  <AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{textAlign: 'center'}}>
      <div style={{fontFamily: ANTON, fontSize: 200, color: fg, lineHeight: 0.98, textTransform: 'uppercase'}}>{big}</div>
      {small && (
        <div style={{fontFamily: JOST, fontWeight: 300, fontSize: 38, letterSpacing: '.3em', color: 'rgba(255,255,255,.6)', marginTop: 26}}>
          {small}
        </div>
      )}
    </div>
  </AbsoluteFill>
);

/* ── the frames ── */
const F: Array<() => React.ReactNode> = [
  // 1 · the search
  () => <SERP query="emergency electrician brighton" typed={29} />,

  // 2 · everyone but you
  () => <SERP query="emergency electrician brighton" showAd adName="Voltage Electrical" showPack results={3} gap={1} scroll={330} />,

  // 3 · the turn
  () => <Statement big={'You’re\ninvisible.'} />,

  // 4 · the site, desktop
  () => (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <Browser url="nationaltaxi.co.uk">
        <div style={{fontFamily: ARIAL}}>
          <div style={{height: 76, borderBottom: '1px solid #eceef0', display: 'flex', alignItems: 'center', padding: '0 42px', gap: 26}}>
            <span style={{fontSize: 25, color: '#111', fontWeight: 700, letterSpacing: '.02em'}}>NATIONAL TAXI</span>
            <span style={{marginLeft: 'auto', display: 'flex', gap: 24, fontSize: 17, color: '#5f6368'}}>
              <span>Airports</span><span>Fares</span><span>Fleet</span><span>Contact</span>
            </span>
            <span style={{background: '#111', color: '#fff', borderRadius: 7, padding: '11px 22px', fontSize: 16}}>Book now</span>
          </div>
          <div style={{padding: '64px 64px 0'}}>
            <div style={{fontSize: 68, color: '#111', lineHeight: 1.08, maxWidth: 840, letterSpacing: '-.02em'}}>
              Brighton’s long-distance taxi service.
            </div>
            <div style={{fontSize: 23, color: '#5f6368', marginTop: 20, maxWidth: 660, lineHeight: 1.5}}>
              Fixed-price journeys to every UK airport, London and the South East. Professional local drivers, no surge pricing.
            </div>
            <div style={{display: 'flex', gap: 14, marginTop: 34}}>
              <span style={{background: '#111', color: '#fff', borderRadius: 9, padding: '18px 34px', fontSize: 20}}>Get a fixed price</span>
              <span style={{border: '1px solid #dadce0', borderRadius: 9, padding: '18px 34px', fontSize: 20, color: '#111'}}>01273 …</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 30, fontSize: 18, color: '#5f6368'}}>
              <Stars size={20} /><span style={{color: '#111'}}>5.0</span> from 80 Google reviews
            </div>
          </div>
        </div>
      </Browser>
    </AbsoluteFill>
  ),

  // 5 · the site, mobile
  () => (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <Phone>
        <div style={{fontFamily: ARIAL, paddingTop: 58}}>
          <div style={{height: 62, borderBottom: '1px solid #eceef0', display: 'flex', alignItems: 'center', padding: '0 22px'}}>
            <span style={{fontSize: 17, fontWeight: 700}}>NATIONAL TAXI</span>
            <span style={{marginLeft: 'auto', width: 22, height: 2, background: '#111', boxShadow: '0 7px 0 #111, 0 -7px 0 #111'}} />
          </div>
          <div style={{padding: '34px 24px'}}>
            <div style={{fontSize: 34, lineHeight: 1.12, color: '#111', letterSpacing: '-.02em'}}>Brighton’s long-distance taxi service.</div>
            <div style={{fontSize: 16, color: '#5f6368', marginTop: 14, lineHeight: 1.5}}>Fixed-price journeys to every UK airport.</div>
            <div style={{background: '#111', color: '#fff', borderRadius: 9, padding: '16px 0', textAlign: 'center', fontSize: 17, marginTop: 22}}>
              Get a fixed price
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 14, color: '#5f6368'}}>
              <Stars size={15} /> 5.0 · 80 reviews
            </div>
            <div style={{height: 190, background: '#f3f4f6', borderRadius: 12, marginTop: 24}} />
            <div style={{height: 120, background: '#111', borderRadius: 12, marginTop: 14}} />
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  ),

  // 6 · the listing
  () => <BusinessProfile fill={1} rating={5.0} reviews={80} />,

  // 7 · the map — your pin, top of the pack
  () => (
    <AbsoluteFill style={{background: '#fff', fontFamily: ARIAL}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <rect width="1920" height="1080" fill="#e8eaed" />
        <rect x={1180} y={90} width={520} height={330} rx={14} fill="#cfe8d0" />
        <rect x={140} y={640} width={430} height={290} rx={14} fill="#cfe8d0" />
        {[300, 640, 980, 1320, 1660].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={1080} stroke="#fff" strokeWidth={22} />)}
        {[240, 540, 840].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke="#fff" strokeWidth={22} />)}
        <line x1={0} y1={540} x2={1920} y2={540} stroke="#fff" strokeWidth={34} />
        <circle cx={640} cy={300} r={13} fill="#9aa0a6" />
        <circle cx={1320} cy={800} r={13} fill="#9aa0a6" />
        <circle cx={1660} cy={330} r={13} fill="#9aa0a6" />
      </svg>
      <div style={{position: 'absolute', left: 960, top: 540, transform: 'translate(-50%,-100%)'}}>
        <svg width={92} height={122} viewBox="0 0 54 72">
          <path d="M27 0C12 0 0 12 0 27c0 20 27 45 27 45s27-25 27-45C54 12 42 0 27 0Z" fill="#d93025" />
          <circle cx={27} cy={26} r={10} fill="#fff" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 60, top: 60, width: 520, background: '#fff', borderRadius: 12, boxShadow: '0 4px 18px rgba(32,33,36,.22)', overflow: 'hidden'}}>
        <div style={{padding: '18px 24px', borderBottom: `1px solid ${G_LINE}`, fontSize: 20, color: G_TEXT}}>
          electrician near me
        </div>
        {[
          {n: 'National Electrical', r: '5.0', c: 80, you: true},
          {n: 'Voltage Electrical', r: '4.6', c: 41},
          {n: 'Brighton Sparks Ltd', r: '4.4', c: 27},
        ].map((b, i) => (
          <div key={b.n} style={{padding: '16px 24px', borderBottom: i < 2 ? `1px solid ${G_LINE}` : 'none', background: b.you ? '#e8f0fe' : '#fff'}}>
            <div style={{fontSize: 21, color: G_LINK}}>{b.n}</div>
            <div style={{fontSize: 16, color: G_DESC, marginTop: 5, display: 'flex', alignItems: 'center', gap: 7}}>
              <span style={{color: G_TEXT}}>{b.r}</span><Stars size={14} /> ({b.c}) · Electrician
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  ),

  // 8 · the ads console
  () => <AdsConsole grow={1} spend={18400} />,

  // 9 · sponsored, position one
  () => <SERP query="airport taxi brighton" showAd adName="National Taxi" showPack results={2} />,

  // 10 · the phone fills
  () => (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <Phone dark>
        <div style={{paddingTop: 88, fontFamily: ARIAL}}>
          <div style={{textAlign: 'center', color: 'rgba(255,255,255,.55)', fontSize: 15}}>Tuesday 9 September</div>
          <div style={{textAlign: 'center', color: '#fff', fontSize: 78, fontWeight: 200, letterSpacing: '-.02em', marginTop: 2}}>08:42</div>
          <div style={{padding: '34px 16px', display: 'flex', flexDirection: 'column', gap: 11}}>
            {[
              ['New enquiry', 'Flat roof — can you quote this week?'],
              ['Missed call', '07… · Brighton'],
              ['New enquiry', 'Gutter replacement, BN1'],
              ['New booking', 'Gatwick 05:30 — confirmed'],
            ].map(([t, b], i) => (
              <div key={i} style={{background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(8px)', borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center'}}>
                <span style={{width: 34, height: 34, borderRadius: 9, background: '#34A853', flex: 'none'}} />
                <div>
                  <div style={{fontSize: 16, color: '#fff'}}>{t}</div>
                  <div style={{fontSize: 14, color: 'rgba(255,255,255,.66)', marginTop: 2}}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  ),

  // 11 · the number
  () => (
    <AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: ANTON, fontSize: 250, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          £2,000,000<span style={{color: ACC}}>+</span>
        </div>
        <div style={{fontFamily: JOST, fontWeight: 500, fontSize: 36, letterSpacing: '.34em', color: 'rgba(255,255,255,.7)', marginTop: 26}}>
          AD SPEND MANAGED
        </div>
      </div>
    </AbsoluteFill>
  ),

  // 12 · the endcard
  () => (
    <AbsoluteFill style={{background: INK}}>
      <svg viewBox={LEM_VIEWBOX} width={250} height={113.6} style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
        <path d={LEM_PATH} fill="none" stroke={ACC} strokeWidth={LEM_STROKE_WIDTH} strokeLinecap="round" />
      </svg>
      <span style={{position: 'absolute', top: '50%', right: 'calc(50% + 133px)', transform: 'translateY(-54%)', fontFamily: JOST, fontWeight: 400, fontSize: 152, color: '#fff'}}>L</span>
      <span style={{position: 'absolute', top: '50%', left: 'calc(50% + 133px)', transform: 'translateY(-54%)', fontFamily: JOST, fontWeight: 400, fontSize: 152, color: '#fff'}}>
        MWORK<span style={{fontSize: '.3em', verticalAlign: '1.1em', opacity: .6}}>®</span>
      </span>
      <div style={{position: 'absolute', left: 0, right: 0, top: '64%', textAlign: 'center', fontFamily: JOST, fontWeight: 300, fontSize: 40, letterSpacing: '.2em', color: 'rgba(255,255,255,.72)'}}>
        loomwork.co.uk
      </div>
    </AbsoluteFill>
  ),
];

export const Frames: React.FC = () => {
  const f = useCurrentFrame();
  const scene = F[Math.min(F.length - 1, f)];
  return <>{scene()}</>;
};
