import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

/* HYPER-REAL SURFACES.
   Everything a prospect actually looks at, rebuilt faithfully: the Google
   results page, the Business Profile panel, the Ads console, Analytics.
   Realism is the brief — generic "search box" mockups read as fake, and the
   whole showreel's credibility rests on these looking like screenshots. */

export const ARIAL = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
export const G_LINK = '#1a0dab';
export const G_TEXT = '#202124';
export const G_DESC = '#4d5156';
export const G_LINE = '#dfe1e5';
export const G_STAR = '#e7711b';
export const G_BLUE = '#1a73e8';
export const G_GREEN = '#188038';

/* directional push — scenes travel, they don't fade */
export const Push: React.FC<{
  dir?: 'left' | 'right' | 'up' | 'down';
  dur: number;
  ramp?: number;
  children: React.ReactNode;
}> = ({dir = 'left', dur, ramp = 10, children}) => {
  const f = useCurrentFrame();
  const inT = interpolate(f, [0, ramp], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outT = interpolate(f, [dur - ramp, dur], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const axis = dir === 'left' || dir === 'right' ? 'X' : 'Y';
  const sign = dir === 'left' || dir === 'up' ? 1 : -1;
  const off = (1 - inT) * 110 * sign - outT * 110 * sign;
  return (
    <AbsoluteFill style={{transform: `translate${axis}(${off}%)`}}>{children}</AbsoluteFill>
  );
};

export const GoogleLogo: React.FC<{size: number}> = ({size}) => {
  const L = [
    ['G', '#4285F4'],
    ['o', '#EA4335'],
    ['o', '#FBBC05'],
    ['g', '#4285F4'],
    ['l', '#34A853'],
    ['e', '#EA4335'],
  ] as const;
  return (
    <span style={{fontFamily: 'Product Sans, Arial, sans-serif', fontSize: size, fontWeight: 400, letterSpacing: '-0.04em'}}>
      {L.map(([c, col], i) => (
        <span key={i} style={{color: col}}>{c}</span>
      ))}
    </span>
  );
};

const Stars: React.FC<{n: number; size?: number}> = ({n, size = 15}) => (
  <span style={{display: 'inline-flex', gap: 1, verticalAlign: 'middle'}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z"
          fill={i < n ? G_STAR : '#dadce0'}
        />
      </svg>
    ))}
  </span>
);

/* ── the results page ── */
export const SERP: React.FC<{
  query: string;
  typed?: number;          // chars revealed; omit for full
  results?: number;        // organic rows visible
  showPack?: boolean;
  showAd?: boolean;
  adName?: string;
  gap?: number;            // 0-1, the "you're not here" slot
  scroll?: number;
}> = ({query, typed, results = 0, showPack, showAd, adName, gap = 0, scroll = 0}) => {
  const q = typed === undefined ? query : query.slice(0, typed);
  const ORG = [
    {t: 'Coastal Roofing Services | Roofers in Brighton & Hove', u: 'coastalroofing.co.uk', p: '› roofing › brighton', d: 'Trusted local roofers covering Brighton, Hove and the surrounding area. Free quotes, flat roofs, tiling and emergency repairs.'},
    {t: 'A1 Roofline & Guttering — Roofing Contractor', u: 'a1roofline.co.uk', p: '› services', d: 'Family run roofing business with over 20 years experience. Guttering, fascias, soffits and complete roof replacement.'},
    {t: 'Sussex Roof Repairs | Emergency Roofer', u: 'sussexroofrepairs.co.uk', p: '› contact', d: 'Same-day emergency roof repair across Sussex. Fully insured, all work guaranteed for 10 years.'},
  ];
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: ARIAL, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-scroll}px)`}}>
        {/* header */}
        <div style={{display: 'flex', alignItems: 'center', gap: 34, padding: '26px 40px 0'}}>
          <GoogleLogo size={46} />
          <div
            style={{
              flex: 1,
              maxWidth: 1180,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: `1px solid ${G_LINE}`,
              borderRadius: 26,
              padding: '12px 22px',
              boxShadow: '0 1px 6px rgba(32,33,36,.18)',
              fontSize: 26,
              color: G_TEXT,
            }}
          >
            <span style={{whiteSpace: 'pre'}}>{q}</span>
            {typed !== undefined && typed < query.length && (
              <span style={{width: 2, height: 28, background: G_TEXT, display: 'inline-block'}} />
            )}
            <span style={{marginLeft: 'auto', display: 'flex', gap: 18, alignItems: 'center'}}>
              <svg width={24} height={24} viewBox="0 0 24 24"><path fill="#4285F4" d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-3.1A7 7 0 0019 11h-2z"/></svg>
              <svg width={24} height={24} viewBox="0 0 24 24"><circle cx={11} cy={11} r={7} fill="none" stroke="#4285F4" strokeWidth={2}/><line x1={16} y1={16} x2={21} y2={21} stroke="#4285F4" strokeWidth={2} strokeLinecap="round"/></svg>
            </span>
          </div>
        </div>
        {/* tabs */}
        <div style={{display: 'flex', gap: 30, padding: '20px 40px 0', marginLeft: 132, fontSize: 19, color: '#5f6368'}}>
          {['All', 'Maps', 'Images', 'News', 'Shopping'].map((t, i) => (
            <span key={t} style={{color: i === 0 ? G_BLUE : '#5f6368', borderBottom: i === 0 ? `3px solid ${G_BLUE}` : 'none', paddingBottom: 10}}>{t}</span>
          ))}
        </div>
        <div style={{borderBottom: `1px solid ${G_LINE}`, marginTop: -1}} />
        <div style={{padding: '16px 40px 0', marginLeft: 132, fontSize: 16, color: '#70757a'}}>
          About 2,340,000 results (0.48 seconds)
        </div>

        <div style={{marginLeft: 172, marginTop: 22, maxWidth: 1100}}>
          {/* sponsored */}
          {showAd && (
            <div style={{marginBottom: 26}}>
              <div style={{fontSize: 17, fontWeight: 700, color: G_TEXT, marginBottom: 5}}>Sponsored</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 11, marginBottom: 3}}>
                <span style={{width: 30, height: 30, borderRadius: 15, background: '#111', display: 'inline-block'}} />
                <div>
                  <div style={{fontSize: 17, color: G_TEXT, lineHeight: 1.2}}>{adName}</div>
                  <div style={{fontSize: 15, color: G_DESC}}>{adName?.toLowerCase().replace(/[^a-z]/g, '')}.co.uk</div>
                </div>
              </div>
              <div style={{fontSize: 25, color: G_LINK, lineHeight: 1.35}}>Emergency Roofer — Same Day Callout, Brighton</div>
              <div style={{fontSize: 18, color: G_DESC, lineHeight: 1.5, marginTop: 4}}>
                Fully insured local roofers. Free quote in 24 hours. 5.0★ from 80 reviews.
              </div>
            </div>
          )}

          {/* map pack */}
          {showPack && (
            <div style={{border: `1px solid ${G_LINE}`, borderRadius: 10, overflow: 'hidden', marginBottom: 26, display: 'flex'}}>
              <div style={{width: 320, background: '#e8eaed', position: 'relative'}}>
                <svg width="100%" height="100%" viewBox="0 0 320 260">
                  <rect width="320" height="260" fill="#e8eaed" />
                  <rect x={180} y={20} width={120} height={80} rx={5} fill="#cfe8d0" />
                  {[70, 150, 240].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={260} stroke="#fff" strokeWidth={8} />)}
                  {[80, 170].map((y) => <line key={y} x1={0} y1={y} x2={320} y2={y} stroke="#fff" strokeWidth={8} />)}
                  <circle cx={150} cy={120} r={9} fill="#EA4335" />
                  <circle cx={215} cy={185} r={9} fill="#EA4335" />
                  <circle cx={85} cy={95} r={9} fill="#EA4335" />
                </svg>
              </div>
              <div style={{flex: 1, padding: '14px 22px'}}>
                {[
                  {n: 'Coastal Roofing Services', r: 4.8, c: 62},
                  {n: 'A1 Roofline & Guttering', r: 4.6, c: 41},
                  {n: 'Sussex Roof Repairs', r: 4.9, c: 33},
                ].map((b, i) => (
                  <div key={b.n} style={{padding: '11px 0', borderBottom: i < 2 ? `1px solid ${G_LINE}` : 'none'}}>
                    <div style={{fontSize: 20, color: G_LINK}}>{b.n}</div>
                    <div style={{fontSize: 16, color: G_DESC, marginTop: 4, display: 'flex', alignItems: 'center', gap: 7}}>
                      <span style={{color: G_TEXT}}>{b.r}</span><Stars n={Math.round(b.r)} /> ({b.c}) · Roofer
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* organic */}
          {ORG.slice(0, results).map((r) => (
            <div key={r.u} style={{marginBottom: 30}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4}}>
                <span style={{width: 30, height: 30, borderRadius: 15, background: '#e8eaed', display: 'inline-block'}} />
                <div>
                  <div style={{fontSize: 17, color: G_TEXT, lineHeight: 1.2}}>{r.u.replace('.co.uk', '')}</div>
                  <div style={{fontSize: 15, color: G_DESC}}>https://{r.u} {r.p}</div>
                </div>
              </div>
              <div style={{fontSize: 25, color: G_LINK, lineHeight: 1.35}}>{r.t}</div>
              <div style={{fontSize: 18, color: G_DESC, lineHeight: 1.5, marginTop: 4}}>{r.d}</div>
            </div>
          ))}

          {/* the absence */}
          {gap > 0 && (
            <div
              style={{
                height: gap * 104,
                opacity: gap,
                border: '2px dashed #d93025',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#d93025',
                overflow: 'hidden',
              }}
            >
              your business isn’t here
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Google Business Profile panel ── */
export const BusinessProfile: React.FC<{fill: number; rating: number; reviews: number}> = ({fill, rating, reviews}) => {
  const row = (i: number) => Math.max(0, Math.min(1, fill * 6 - i));
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: ARIAL, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 760, border: `1px solid ${G_LINE}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(32,33,36,.16)'}}>
        <div style={{height: 190, background: '#111', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg,#1c2430,#0d1117)'}} />
          <div style={{position: 'absolute', left: 28, bottom: 22, color: '#fff', fontSize: 34}}>National Taxi</div>
        </div>
        <div style={{padding: '22px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: row(0)}}>
            <span style={{fontSize: 26, color: G_TEXT}}>{rating.toFixed(1)}</span>
            <Stars n={5} size={20} />
            <span style={{fontSize: 19, color: G_DESC}}>({reviews})</span>
          </div>
          <div style={{fontSize: 19, color: G_DESC, marginTop: 6, opacity: row(0)}}>Taxi service in Brighton</div>
          <div style={{height: 1, background: G_LINE, margin: '18px 0'}} />
          {[
            ['Address', '12 Queens Road, Brighton BN1'],
            ['Hours', 'Open 24 hours'],
            ['Phone', '01273 …'],
            ['Website', 'nationaltaxi.co.uk'],
          ].map(([k, v], i) => (
            <div key={k} style={{display: 'flex', gap: 18, padding: '9px 0', opacity: row(i + 1), transform: `translateX(${(1 - row(i + 1)) * 16}px)`}}>
              <span style={{width: 110, fontSize: 18, color: G_DESC}}>{k}</span>
              <span style={{fontSize: 18, color: k === 'Website' ? G_LINK : G_TEXT}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop: 16, display: 'flex', gap: 12, opacity: row(5)}}>
            <span style={{background: G_BLUE, color: '#fff', borderRadius: 6, padding: '11px 22px', fontSize: 18}}>Book online</span>
            <span style={{border: `1px solid ${G_LINE}`, borderRadius: 6, padding: '11px 22px', fontSize: 18, color: G_BLUE}}>Directions</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Google Ads console ── */
export const AdsConsole: React.FC<{grow: number; spend: number}> = ({grow, spend}) => {
  const BARS = [0.42, 0.58, 0.5, 0.72, 0.63, 0.86, 0.78, 0.95];
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: ARIAL, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1320, border: `1px solid ${G_LINE}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(32,33,36,.14)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 26px', borderBottom: `1px solid ${G_LINE}`}}>
          <svg width={28} height={28} viewBox="0 0 24 24"><path fill="#FBBC04" d="M3.5 17.5l6-10.4 3.5 2-6 10.4z"/><path fill="#4285F4" d="M14.5 7.1l6 10.4-3.5 2-6-10.4z"/><circle cx="6" cy="18" r="3" fill="#34A853"/></svg>
          <span style={{fontSize: 22, color: G_TEXT}}>Google Ads</span>
          <span style={{marginLeft: 'auto', fontSize: 17, color: G_DESC}}>Last 30 days</span>
        </div>
        <div style={{display: 'flex', gap: 44, padding: '24px 26px', borderBottom: `1px solid ${G_LINE}`}}>
          {[
            ['Clicks', Math.round(4820 * grow).toLocaleString()],
            ['Impressions', Math.round(186400 * grow).toLocaleString()],
            ['Conv.', Math.round(312 * grow).toLocaleString()],
            ['Cost', '£' + Math.round(spend).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{fontSize: 16, color: G_DESC}}>{k}</div>
              <div style={{fontSize: 34, color: G_TEXT, marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{padding: '26px 26px 30px', display: 'flex', alignItems: 'flex-end', gap: 22, height: 240}}>
          {BARS.map((h, i) => (
            <div key={i} style={{flex: 1, height: `${h * 100 * Math.min(1, grow * 1.2)}%`, background: i === BARS.length - 1 ? G_BLUE : '#c9dcfb', borderRadius: '4px 4px 0 0'}} />
          ))}
        </div>
        <div style={{padding: '0 26px 22px', display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 9, height: 9, borderRadius: 5, background: G_GREEN, display: 'inline-block'}} />
          <span style={{fontSize: 18, color: G_TEXT}}>Campaign — Brighton · Roofing · Search</span>
          <span style={{marginLeft: 'auto', fontSize: 18, color: G_GREEN}}>Eligible</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Analytics line ── */
export const Analytics: React.FC<{draw: number; label: string; value: string}> = ({draw, label, value}) => {
  const PTS = [0.18, 0.22, 0.2, 0.3, 0.28, 0.42, 0.5, 0.47, 0.62, 0.7, 0.68, 0.84, 0.93];
  const W = 1240, H = 420;
  const path = PTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (PTS.length - 1)) * W} ${H - p * H}`).join(' ');
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: ARIAL, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: W}}>
        <div style={{fontSize: 20, color: G_DESC}}>{label}</div>
        <div style={{fontSize: 74, color: G_TEXT, marginTop: 2, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
        <svg width={W} height={H} style={{marginTop: 20, overflow: 'visible'}}>
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1={0} y1={H - g * H} x2={W} y2={H - g * H} stroke="#f1f3f4" strokeWidth={2} />
          ))}
          <path d={path} fill="none" stroke={G_BLUE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 - draw * 1000} />
          {draw > 0.98 && <circle cx={W} cy={H - PTS[PTS.length - 1] * H} r={9} fill={G_BLUE} />}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ── real browser frame ── */
export const Browser: React.FC<{url: string; children: React.ReactNode}> = ({url, children}) => (
  <div style={{width: 1420, height: 800, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 80px -30px rgba(0,0,0,.7)'}}>
    <div style={{height: 52, background: '#f1f3f4', display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', borderBottom: '1px solid #dadce0'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <span key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
      ))}
      <div style={{marginLeft: 16, flex: 1, maxWidth: 620, background: '#fff', borderRadius: 14, padding: '7px 18px', fontFamily: ARIAL, fontSize: 17, color: '#5f6368'}}>
        {url}
      </div>
    </div>
    <div style={{position: 'relative', width: '100%', height: 748, overflow: 'hidden'}}>{children}</div>
  </div>
);
