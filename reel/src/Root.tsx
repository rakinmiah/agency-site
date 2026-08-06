import React from 'react';
import {Composition} from 'remotion';
import {ActOne, ACT_ONE_DUR} from './ActOne';
import {ActTwo, ACT_TWO_DUR} from './ActTwo';
import {PilotOpen, PILOT_DUR} from './beats/PilotOpen';
import {TransplantOne, TRANS_ONE_DUR} from './beats/TransplantOne';
import {Continuous, CONT_DUR} from './beats/Continuous';
import {Showreel, SHOWREEL_DUR} from './showreel/Showreel';
import {Frames, FRAME_COUNT} from './showreel/Frames';
import {LogoReel, LOGO_REEL_DUR} from './showreel/LogoReel';
import {Open, OPEN_DUR} from './showreel/Open';
import {LeadsStill} from './showreel/leads';
import {PlatformStills, PLATFORM_STILL_COUNT} from './showreel/platforms';
import {LeadsBurst, LEADS_BURST_DUR} from './showreel/leadsBurst';
import {StockFlip, FLIP_DUR} from './showreel/stockFlip';
import {PlatformFrame, FRAME_COUNT_PF} from './showreel/platformFrames';
import {ThumbTest, THUMB_DUR} from './showreel/thumbTest';
import {ShaderDemo, SHADER_DEMO_DUR} from './showreel/shaderDemo';
import {GlDebug} from './showreel/gldebug';
import {FPS} from './music';

/* The Proof composition (30fps, pre-music skeleton) is retired — its beats are
   being rebuilt act by act on the 60fps kick grid. Source files remain. */

export const RemotionRoot: React.FC = () => (
  <>
    {/* WebGL proof — the burst as a noise-warped SDF with chromatic aberration,
        live fbm grounds, and the badge as lit extruded geometry */}
    <Composition id="GlDebug" component={GlDebug} durationInFrames={10} fps={FPS} width={1920} height={1080} />
    <Composition
      id="ShaderDemo"
      component={ShaderDemo}
      durationInFrames={SHADER_DEMO_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Open"
      component={Open}
      defaultProps={{keys: true}}
      durationInFrames={OPEN_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* same cut, keystrokes muted — the track now runs from frame 0, so the
        question is whether the taps still earn their place over it */}
    <Composition
      id="OpenNoKeys"
      component={Open}
      defaultProps={{keys: false}}
      durationInFrames={OPEN_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="OpenNoKeys4K"
      component={Open}
      defaultProps={{keys: false}}
      durationInFrames={OPEN_DUR}
      fps={FPS}
      width={3840}
      height={2160}
    />
    {/* Same component, 2x frame. Everything in the open is vector or type — the
        Google wordmark is now real SVG, not a typeface impression — so it is
        genuinely resolution-independent rather than an upscale. */}
    <Composition
      id="Open4K"
      component={Open}
      durationInFrames={OPEN_DUR}
      fps={FPS}
      width={3840}
      height={2160}
    />
    {/* design surface only — the leads section as a still, before any of it
        moves, so the look can be settled without paying for a render */}
    <Composition
      id="LeadsStill"
      component={LeadsStill}
      durationInFrames={1}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* the four platform scenes as their own composition — film frames
        1055-1823, with the music carried from the same offset, so this is
        exactly what will sit in the film rather than an approximation */}
    <Composition
      id="LeadsBurst"
      component={LeadsBurst}
      durationInFrames={LEADS_BURST_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* the fifteen platform frames as stills — each composed for 1920x1080 in
        its own right, judged before any motion goes on top */}
    {Array.from({length: FRAME_COUNT_PF}, (_, i) => (
      <Composition
        key={i}
        id={`PF${i}`}
        component={PlatformFrame}
        defaultProps={{index: i}}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
    {/* the stock flip on its own — film frames 1823-2207, music from the same
        offset. Images are pre-graded into public/flip by tools/grade-flip.mjs. */}
    <Composition
      id="StockFlip"
      component={StockFlip}
      durationInFrames={FLIP_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* the silhouette hinge, on its own, so the hand can be judged before
        anything gets designed around it */}
    <Composition
      id="ThumbTest"
      component={ThumbTest}
      durationInFrames={THUMB_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* design surface only — one platform scene per frame, so the set can be
        judged as stills before any of it is animated */}
    {Array.from({length: PLATFORM_STILL_COUNT}, (_, i) => (
      <Composition
        key={i}
        id={`Platform${i}`}
        component={PlatformStills}
        defaultProps={{index: i}}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
    <Composition
      id="LogoReel"
      component={LogoReel}
      durationInFrames={LOGO_REEL_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Frames"
      component={Frames}
      durationInFrames={FRAME_COUNT}
      fps={1}
      width={1920}
      height={1080}
    />
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={SHOWREEL_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Continuous"
      component={Continuous}
      durationInFrames={CONT_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="TransplantOne"
      component={TransplantOne}
      durationInFrames={TRANS_ONE_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Pilot"
      component={PilotOpen}
      durationInFrames={PILOT_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="ActOne"
      component={ActOne}
      durationInFrames={ACT_ONE_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="ActTwo"
      component={ActTwo}
      durationInFrames={ACT_TWO_DUR}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
