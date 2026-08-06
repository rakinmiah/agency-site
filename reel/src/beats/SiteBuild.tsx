import React from 'react';
import {AbsoluteFill, Easing, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ACC, OFF, WHITE} from '../theme';
import {ANTON, JOST} from '../fonts';
import {CardFX, Grain, Vignette} from '../ui';
import {beatF} from '../music';

/* THE SITE, v2 — four movements in 3.6s:
   browser slams + assembles (fast) → capture-crop STROBE (the site tour as a
   burst) → JDH pan (second client) → three-client mosaic. Real work only. */

const D_BROWSER = beatF(23) - beatF(20);   // 72
const D_STROBE = beatF(24.5) - beatF(23);  // 36
const D_JDH = beatF(26) - beatF(24.5);     // 36
const D_MOSAIC = beatF(29) - beatF(26);    // 72
export const SITE_D = D_BROWSER + D_STROBE + D_JDH + D_MOSAIC;

const WIN_W = 1420, WIN_H = 780, CHROME_H = 58;
const VIEW_H = WIN_H - CHROME_H;

const BrowserPan: React.FC<{img: string; label: string; nativeW: number; nativeH: number; panTo: number; assemble?: boolean}> = ({
  img, label, nativeW, nativeH, panTo, assemble,
}) => {
  const frame = useCurrentFrame();
  const dispH = (nativeH * WIN_W) / nativeW;
  const pan = interpolate(frame, [assemble ? 22 : 4, assemble ? 70 : 34], [0, dispH * panTo - VIEW_H], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const winIn = interpolate(frame, [0, 8], [0.95, 1], {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const BANDS = 5;
  return (
    <CardFX bg={OFF}>
      <div style={{position: 'absolute', top: 54, left: 76}}>
        <span style={{fontFamily: ANTON, fontSize: 38, color: ACC, letterSpacing: '0.06em'}}>THE SITE</span>
      </div>
      <div
        style={{
          width: WIN_W, height: WIN_H, borderRadius: 16, overflow: 'hidden', background: '#0B0B0D',
          border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 60px 140px -40px rgba(0,0,0,.75)',
          transform: `scale(${winIn})`,
        }}
      >
        <div style={{height: CHROME_H, display: 'flex', alignItems: 'center', gap: 9, padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,.1)'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <span key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.85}} />
          ))}
          <div style={{margin: '0 auto', background: 'rgba(255,255,255,.08)', borderRadius: 999, padding: '7px 24px', fontFamily: JOST, fontSize: 22, color: 'rgba(255,255,255,.75)'}}>
            {label}
          </div>
        </div>
        <div style={{position: 'relative', width: WIN_W, height: VIEW_H, overflow: 'hidden'}}>
          {Array.from({length: BANDS}, (_, i) => {
            const bandTop = (VIEW_H / BANDS) * i;
            const enter = assemble
              ? interpolate(frame, [2 + i * 4, 16 + i * 4], [1, 0], {easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
              : 0;
            return (
              <div key={i} style={{position: 'absolute', top: bandTop, left: 0, width: WIN_W, height: VIEW_H / BANDS + 1, overflow: 'hidden', transform: `translateX(${enter * 80 * (i % 2 === 0 ? 1 : -1)}px)`, opacity: 1 - enter * 0.9}}>
                <img src={staticFile(img)} style={{position: 'absolute', top: -bandTop - pan, left: 0, width: WIN_W}} />
              </div>
            );
          })}
        </div>
      </div>
    </CardFX>
  );
};

/* full-bleed crops of the capture, strobed — stills kept alive by scale punches */
const CropShot: React.FC<{pos: string; zoom: number}> = ({pos, zoom}) => {
  const frame = useCurrentFrame();
  const punch = 1.06 - Math.min(1, frame / 6) * 0.06;
  const flash = interpolate(frame, [0, 2, 5], [0.2, 0.08, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url("${staticFile('captures/taxi-desktop.jpg')}")`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: pos,
          transform: `scale(${punch})`,
        }}
      />
      <AbsoluteFill style={{background: '#FFF', opacity: flash}} />
      <Grain opacity={0.3} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Strobe: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={12}><CropShot pos="50% 6%" zoom={165} /></Series.Sequence>
    <Series.Sequence durationInFrames={12}><CropShot pos="50% 30%" zoom={185} /></Series.Sequence>
    <Series.Sequence durationInFrames={12}><CropShot pos="50% 58%" zoom={175} /></Series.Sequence>
  </Series>
);

/* three clients, one mosaic — panels slam in staggered */
const Mosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panels = [
    {img: 'captures/taxi-desktop.jpg', label: 'nationaltaxi.co.uk', at: 0},
    {img: 'captures/jdh-desktop.jpg', label: 'jdhgas.co.uk', at: 5},
    {img: 'captures/deen-desktop.jpg', label: 'deenrelief.org', at: 10},
  ];
  return (
    <CardFX bg={OFF}>
      <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
        {panels.map((p, i) => {
          const s = spring({frame: frame - p.at, fps, config: {damping: 15, stiffness: 210}});
          return (
            <div key={i} style={{transform: `translateY(${(1 - s) * 260}px)`, opacity: s}}>
              <div
                style={{
                  width: 560, height: 660, borderRadius: 20, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 44px 110px -34px rgba(0,0,0,.7)',
                  backgroundImage: `url("${staticFile(p.img)}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: `50% ${2 + i * 1.5}%`,
                }}
              />
              <div style={{marginTop: 16, textAlign: 'center', fontFamily: JOST, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,.75)'}}>
                {p.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 46, left: 0, right: 0, textAlign: 'center', fontFamily: JOST, fontSize: 27, color: 'rgba(255,255,255,.6)'}}>
        Three live businesses &mdash; <span style={{color: WHITE}}>every one built from scratch</span>
      </div>
    </CardFX>
  );
};

export const SiteBuild: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={D_BROWSER}>
      <BrowserPan img="captures/taxi-desktop.jpg" label="nationaltaxi.co.uk" nativeW={2160} nativeH={12279} panTo={0.34} assemble />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_STROBE}>
      <Strobe />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_JDH}>
      <BrowserPan img="captures/jdh-desktop.jpg" label="jdhgas.co.uk" nativeW={2160} nativeH={10346} panTo={0.22} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={D_MOSAIC}>
      <Mosaic />
    </Series.Sequence>
  </Series>
);
