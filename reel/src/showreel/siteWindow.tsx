import React from 'react';
import {Img, staticFile} from 'remotion';
import {ARIAL} from './ui';

/* ── THE SITE WINDOW ───────────────────────────────────────────────────────
   nationaltaxi.co.uk in a browser frame, matching the case-study template on
   the Loomwork homepage: 14px radius, hairline border, deep shadow, chrome bar
   with three dots and a URL pill.

   The capture is the REAL full page — 2160 x 12279 — so the scrolling is
   genuine rather than a parallax fake. At 1280px wide the image sits at 0.593
   scale, which makes the page 7275px tall inside an 800px window: 6475px of
   real travel. Nothing here is a mock-up of a website; it is the website.

   Purely presentational. Every value is driven from Open.tsx so the interaction
   stays on the same musical grid as the rest of the film. */

export const CAP_W = 2160;
export const CAP_H = 12279;

export const WIN_W = 1280;                       // deliberately not full-frame
export const WIN_H = Math.round(WIN_W * 10 / 16);   // 800
export const CHROME_H = 42;
export const FRAME_H = WIN_H + CHROME_H;         // 842
export const IMG_SCALE = WIN_W / CAP_W;          // 0.5926
export const PAGE_H = Math.round(CAP_H * IMG_SCALE);   // 7275
export const SCROLL_MAX = PAGE_H - WIN_H;        // 6475

export const SiteWindow: React.FC<{
  x: number; y: number; w: number; h: number; radius: number;
  scrollY: number;
  chrome: number;          // 0-1, chrome bar fade
  blur: number;            // vertical smear, px
  filterId: string;
}> = ({x, y, w, h, radius, scrollY, chrome, blur, filterId}) => {
  const k = w / WIN_W;     // the frame can be scaled up during the collapse
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: radius, overflow: 'hidden',
      border: `1px solid rgba(255,255,255,${0.14 * chrome})`,
      boxShadow: `0 ${Math.round(34 * chrome)}px ${Math.round(80 * chrome)}px -30px rgba(0,0,0,${0.65 * chrome})`,
      background: '#141519',
    }}>
      {/* chrome */}
      <div style={{
        height: CHROME_H * k, display: 'flex', alignItems: 'center', gap: 6 * k,
        padding: `0 ${14 * k}px`, borderBottom: `1px solid rgba(255,255,255,${0.12 * chrome})`,
        background: '#17181d', opacity: chrome, boxSizing: 'border-box',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{width: 10 * k, height: 10 * k, borderRadius: '50%', background: 'rgba(255,255,255,.18)'}} />
        ))}
        <span style={{
          flex: 1, marginLeft: 10 * k, background: 'rgba(255,255,255,.08)',
          borderRadius: 7 * k, padding: `${5 * k}px ${12 * k}px`,
          fontFamily: ARIAL, fontSize: 12.5 * k, color: 'rgba(255,255,255,.55)',
        }}>
          nationaltaxi.co.uk
        </span>
      </div>

      {/* the page */}
      <div style={{position: 'relative', height: h - CHROME_H * k, overflow: 'hidden', background: '#fff'}}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '100%',
          transform: `translateY(${-scrollY * k}px)`,
          filter: blur > 0.25 ? `url(#${filterId})` : undefined,
        }}>
          <Img src={staticFile('captures/taxi-desktop.jpg')} style={{width: '100%', display: 'block'}} />
        </div>
      </div>
    </div>
  );
};

/* a focus ring / hover plate drawn over the capture — a static image cannot
   change state, so the interaction has to be drawn on top of it */
export const Hit: React.FC<{x: number; y: number; w: number; h: number; t: number; radius?: number}> = ({
  x, y, w, h, t, radius = 8,
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h,
    borderRadius: radius, pointerEvents: 'none',
    border: `2px solid rgba(26,115,232,${0.85 * t})`,
    boxShadow: `0 0 0 ${Math.round(4 * t)}px rgba(26,115,232,${0.18 * t})`,
  }} />
);
