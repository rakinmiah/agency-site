import React from 'react';
import {ARIAL} from './ui';

/* ── THE RESULTS PAGE, TILEABLE ─────────────────────────────────────────────
   The scroll now travels ~89,000px. That is ~340 listings, and 340 result blocks
   in the DOM at 4K would be a 180,000px-tall element — the render would fall
   over. So this exports ONE TILE of known, fixed height, and Open.tsx stacks two
   of them and wraps the scroll position at TILE_H. Because the tiles are
   identical the wrap is seamless, which buys unlimited distance for a fixed DOM.

   Fixed heights matter: TOP_H and ROW_H are hard pixel values with overflow
   hidden, so TILE_H is exact. Measured heights would drift and the wrap would
   show as a jump.

   The listings are deliberately HOMOGENEOUS — same name shape, same 4.3-4.9
   rating, same snippet skeleton. The message is "there are thousands of
   businesses doing exactly what you do", and a realistic varied SERP (Wikipedia,
   blogs, directories) argues the opposite. The repetition IS the argument.

   Every business is invented. The story is that these results are
   indistinguishable, so naming real firms would say something about real firms.
   ─────────────────────────────────────────────────────────────────────────── */

const S = 1.7;
const px = (n: number) => Math.round(n * S);

const LINK = '#1a0dab';
const VISITED = '#681da8';
const TEXT = '#202124';
const DESC = '#4d5156';
const LINE = '#dadce0';
const GREY = '#70757a';
const STAR = '#e7711b';
const GREEN = '#188038';

export const SERP_COL_X = 300;
export const SERP_COL_W = px(652);

/* the tile's exact geometry */
export const ROW_H = 268;
export const N_ROWS = 46;
export const TOP_H = 2040;
export const TILE_H = TOP_H + ROW_H * N_ROWS;   // 14,368

const PLACES = [
  'Sussex', 'Coastal', 'Meridian', 'Brightside', 'Southdown', 'Kingsway',
  'Regency', 'Preston', 'Hanover', 'Portland', 'Westbourne', 'Lansdowne',
  'Clifton', 'Norfolk', 'Devonshire', 'Cromwell', 'Seafield', 'Marine',
  'Steine', 'Queensway', 'Ditchling', 'Patcham', 'Withdean', 'Hollingbury',
  'Fiveways', 'Sevendials', 'Rottingdean', 'Saltdean', 'Woodingdean', 'Bevendean',
];
const SUFFIX = [
  'Electrical', 'Electrics', 'Electrical Services', 'Power Services',
  'Electrical Contractors', 'Electricians', 'Power & Lighting',
];
const TITLE = [
  'Electrician in Brighton & Hove — Free Quotes',
  'Local Electrician — Fuse Boards, Rewires, EV Chargers',
  'NICEIC Approved Electrician — Brighton, Hove, Shoreham',
  'Emergency Electrician — 24 Hour Callout, No Fee',
  'Domestic & Commercial Electrician — Sussex',
  'Qualified Electrician Near You — Same Week Slots',
  'Electrical Installations & Testing — Brighton',
  'Trusted Local Electrician — Fully Insured',
];
const SNIP = [
  'NICEIC approved electricians covering Brighton, Hove and the surrounding area. Fuse boards, rewires, fault finding and EV chargers. No callout fee.',
  'Fully qualified and insured. Domestic and commercial work, landlord certificates, PAT testing and consumer unit upgrades. Free written quotes.',
  'Family run since 1998. Rewires, outdoor lighting, garden power, socket and lighting installation. All work guaranteed for twelve months.',
  'Same day appointments across Sussex. Fixed prices confirmed before we start. Over 400 five star reviews from local customers.',
  'Emergency callout, fault finding and full rewires. Part P registered, building control certificates issued on completion.',
];
const TLD = ['co.uk', 'co.uk', 'co.uk', 'com', 'co.uk', 'net'];

type Gen = {t: string; dom: string; path: string; d: string; rating: [number, number]; visited: boolean};

const LISTINGS: Gen[] = Array.from({length: N_ROWS}, (_, i) => {
  const slug = (PLACES[i % PLACES.length] + SUFFIX[(i * 3) % SUFFIX.length])
    .toLowerCase().replace(/[^a-z]/g, '');
  return {
    t: TITLE[(i * 5) % TITLE.length],
    dom: `${slug}.${TLD[i % TLD.length]}`,
    path: ['› services', '› electricians › brighton', '› about', '› contact', '› areas-covered'][(i * 2) % 5],
    d: SNIP[(i * 7) % SNIP.length],
    rating: [4.3 + ((i * 13) % 7) / 10, 20 + ((i * 71) % 380)],
    visited: i % 11 === 4,
  };
});

const PACK = [
  {n: 'Sussex Electrical Co.', r: 4.9, c: 186, cat: 'Electrician', area: 'Brighton', open: true, note: 'Open 24 hours'},
  {n: 'Brightside Electrics', r: 4.6, c: 94, cat: 'Electrician', area: 'Hove', open: true, note: 'Closes 6 pm'},
  {n: 'Meridian Power Services', r: 4.4, c: 51, cat: 'Electrical installation', area: 'Portslade', open: false, note: 'Closed · Opens 8 am'},
];

const ASK = [
  'How much does an electrician charge per hour in the UK?',
  'How do I know which electrician to choose?',
  'How do I check if an electrician is registered?',
  'Why do all the quotes look the same?',
];

const Stars: React.FC<{r: number}> = ({r}) => (
  <span style={{display: 'inline-flex', gap: 1, verticalAlign: 'middle'}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={px(13)} height={px(13)} viewBox="0 0 24 24">
        <path d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" fill={i < Math.round(r) ? STAR : '#dadce0'} />
      </svg>
    ))}
  </span>
);

const HUES = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#7B1FA2', '#0097A7', '#E64A19', '#455A64'];
const Favicon: React.FC<{seed: number}> = ({seed}) => (
  <span style={{width: px(26), height: px(26), borderRadius: '50%', flex: 'none', background: HUES[seed % HUES.length]}} />
);

const MapPlate: React.FC = () => (
  <div style={{position: 'relative', width: '100%', height: px(184), background: '#e8eaed', overflow: 'hidden', borderRadius: px(8)}}>
    {[18, 46, 74].map((t) => <div key={`h${t}`} style={{position: 'absolute', left: 0, right: 0, top: `${t}%`, height: px(6), background: '#fff'}} />)}
    {[22, 55, 82].map((l) => <div key={`v${l}`} style={{position: 'absolute', top: 0, bottom: 0, left: `${l}%`, width: px(6), background: '#fff'}} />)}
    <div style={{position: 'absolute', left: '4%', top: '24%', width: '15%', height: '20%', background: '#dfe3e6'}} />
    <div style={{position: 'absolute', left: '60%', top: '50%', width: '18%', height: '22%', background: '#dfe3e6'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '14%', background: '#aadaff'}} />
    {[[30, 30], [58, 52], [76, 22]].map(([l, t], i) => (
      <svg key={i} width={px(22)} height={px(30)} viewBox="0 0 24 34" style={{position: 'absolute', left: `${l}%`, top: `${t}%`}}>
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 22 12 22s12-13.6 12-22C24 5.4 18.6 0 12 0z" fill="#EA4335" />
        <circle cx={12} cy={12} r={4.4} fill="#fff" />
      </svg>
    ))}
  </div>
);

/* fixed-height row, so TILE_H is exact */
const Result: React.FC<{o: Gen; i: number}> = ({o, i}) => (
  <div style={{height: ROW_H, overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: px(12), marginBottom: px(5)}}>
      <Favicon seed={i} />
      <div style={{lineHeight: 1.25}}>
        <div style={{fontSize: px(14), color: TEXT}}>{o.dom}</div>
        <div style={{fontSize: px(12), color: GREY}}>https://{o.dom} {o.path}</div>
      </div>
    </div>
    <div style={{fontSize: px(20), color: o.visited ? VISITED : LINK, lineHeight: 1.3, marginBottom: px(4)}}>{o.t}</div>
    <div style={{fontSize: px(14), color: DESC, marginBottom: px(3), display: 'flex', alignItems: 'center', gap: px(6)}}>
      <span>{o.rating[0].toFixed(1)}</span><Stars r={o.rating[0]} /><span>({o.rating[1]})</span>
    </div>
    <div style={{fontSize: px(14), color: DESC, lineHeight: 1.58}}>{o.d}</div>
  </div>
);

const PageTop: React.FC = () => (
  <div style={{height: TOP_H, overflow: 'hidden'}}>
    <div style={{fontSize: px(14), color: GREY, marginBottom: px(22)}}>About 2,410,000 results (0.51 seconds)</div>
    {[
      {n: 'Sussex Electrical Co.', u: 'sussexelectrical.co.uk', t: 'Electrician in Brighton — Fixed Prices, No Callout Fee', d: 'NICEIC approved. Same day appointments. Fuse boards, rewires, EV chargers.'},
      {n: 'Coastal Electrics', u: 'coastalelectrics.co.uk', t: 'Local Electrician — Slots Available This Week', d: 'Fixed hourly rate shown before you book. Twelve month workmanship guarantee.'},
    ].map((a, i) => (
      <div key={i} style={{marginBottom: px(28)}}>
        <div style={{fontSize: px(14), fontWeight: 700, color: TEXT, marginBottom: px(6)}}>Sponsored</div>
        <div style={{display: 'flex', alignItems: 'center', gap: px(12), marginBottom: px(5)}}>
          <Favicon seed={i + 5} />
          <div style={{lineHeight: 1.25}}>
            <div style={{fontSize: px(14), color: TEXT}}>{a.n}</div>
            <div style={{fontSize: px(12), color: GREY}}>https://{a.u}</div>
          </div>
        </div>
        <div style={{fontSize: px(20), color: LINK, lineHeight: 1.3, marginBottom: px(4)}}>{a.t}</div>
        <div style={{fontSize: px(14), color: DESC, lineHeight: 1.58}}>{a.d}</div>
      </div>
    ))}
    <div style={{border: `1px solid ${LINE}`, borderRadius: px(10), padding: px(16), marginBottom: px(30)}}>
      <div style={{fontSize: px(18), color: TEXT, marginBottom: px(12)}}>Places</div>
      <MapPlate />
      <div style={{marginTop: px(14)}}>
        {PACK.map((p, i) => (
          <div key={i} style={{padding: `${px(13)}px 0`, borderTop: i ? `1px solid ${LINE}` : 'none'}}>
            <div style={{fontSize: px(17), color: TEXT, marginBottom: px(3)}}>{p.n}</div>
            <div style={{fontSize: px(14), color: DESC, display: 'flex', alignItems: 'center', gap: px(6), marginBottom: px(2)}}>
              <span>{p.r.toFixed(1)}</span><Stars r={p.r} /><span>({p.c})</span><span>· {p.cat}</span>
            </div>
            <div style={{fontSize: px(14), color: DESC}}>{p.area} · <span style={{color: p.open ? GREEN : '#d93025'}}>{p.note}</span></div>
          </div>
        ))}
      </div>
    </div>
    <div style={{border: `1px solid ${LINE}`, borderRadius: px(10)}}>
      <div style={{fontSize: px(19), color: TEXT, padding: `${px(14)}px ${px(16)}px ${px(6)}px`}}>People also ask</div>
      {ASK.map((q, i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${px(15)}px ${px(16)}px`, borderTop: `1px solid ${LINE}`, fontSize: px(16), color: TEXT}}>
          <span>{q}</span>
          <svg width={px(20)} height={px(20)} viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill={GREY} /></svg>
        </div>
      ))}
    </div>
  </div>
);

/* ONE tile of exactly TILE_H. Open.tsx stacks two and wraps between them. */
export const SerpTile: React.FC = () => (
  <div style={{width: SERP_COL_W, height: TILE_H, fontFamily: ARIAL, textAlign: 'left'}}>
    <PageTop />
    {LISTINGS.map((o, i) => <Result key={i} o={o} i={i} />)}
  </div>
);

export const SerpBody: React.FC = () => (
  <div style={{position: 'absolute', left: SERP_COL_X, top: 0, width: SERP_COL_W}}>
    <SerpTile />
    <SerpTile />
  </div>
);
