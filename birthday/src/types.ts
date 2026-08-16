export type ClipMeta = {
  src: string; // staticFile-relative path, e.g. 'clips/clip-01.mov'
  durationInFrames: number;
  width: number; // displayed width (rotation applied)
  height: number; // displayed height (rotation applied)
};

export type BirthdayProps = {
  clips: ClipMeta[];
  // Crossfade length between clip i and i+1, in frames. length = clips.length + 1
  // (index 0 = intro→first clip, last = last clip→outro).
  transitions: number[];
  title: string;
  outroLine: string;
};
