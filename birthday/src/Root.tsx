import {parseMedia} from '@remotion/media-parser';
import React from 'react';
import {Composition, staticFile} from 'remotion';
import {BirthdayVideo} from './BirthdayVideo';
import {CLIP_FILES} from './manifest';
import {buildTransitions, FPS, totalDuration} from './timing';
import {BirthdayProps, ClipMeta} from './types';

const DEFAULT_PROPS: BirthdayProps = {
  clips: [],
  transitions: [],
  title: 'Happy Birthday Yahya',
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="BirthdayVideo"
      component={BirthdayVideo}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={300}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={async ({props}) => {
        const clips: ClipMeta[] = [];
        for (const file of CLIP_FILES) {
          const meta = await parseMedia({
            src: staticFile(file),
            fields: {
              slowDurationInSeconds: true,
              dimensions: true,
            },
            acknowledgeRemotionLicense: true,
          });
          const dim = meta.dimensions ?? {width: 1080, height: 1920};
          clips.push({
            src: file,
            durationInFrames: Math.max(
              1,
              Math.round(meta.slowDurationInSeconds * FPS)
            ),
            width: dim.width,
            height: dim.height,
          });
        }

        // Orientation follows the majority of the clips.
        const portraitCount = clips.filter((c) => c.height >= c.width).length;
        const isPortrait = portraitCount >= clips.length / 2;

        const transitions = buildTransitions(clips);

        return {
          durationInFrames: totalDuration(clips, transitions),
          width: isPortrait ? 1080 : 1920,
          height: isPortrait ? 1920 : 1080,
          props: {...props, clips, transitions},
        };
      }}
    />
  );
};
