import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {ClipMeta} from './types';

type Props = {
  clip: ClipMeta;
  fadeIn: number; // frames of audio fade-in (matches visual crossfade)
  fadeOut: number; // frames of audio fade-out
};

// Renders one clip filling the canvas. If the clip's aspect ratio is close to
// the canvas we simply cover-fill; otherwise the clip is letterboxed over a
// blurred, dimmed copy of itself so mixed portrait/landscape footage still
// looks intentional.
export const ClipFill: React.FC<Props> = ({clip, fadeIn, fadeOut}) => {
  const {width, height} = useVideoConfig();
  const src = staticFile(clip.src);

  const canvasAspect = width / height;
  const clipAspect = clip.width / clip.height;
  const needsBlurFill =
    Math.abs(Math.log(clipAspect / canvasAspect)) > 0.18;

  const volume = (f: number) =>
    interpolate(
      f,
      [0, fadeIn, clip.durationInFrames - fadeOut, clip.durationInFrames],
      [0, 1, 1, 0],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0710'}}>
      {needsBlurFill ? (
        <OffthreadVideo
          muted
          src={src}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(46px) brightness(0.5) saturate(1.15)',
            transform: 'scale(1.18)',
          }}
        />
      ) : null}
      <OffthreadVideo
        src={src}
        volume={volume}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: needsBlurFill ? 'contain' : 'cover',
        }}
      />
    </AbsoluteFill>
  );
};
