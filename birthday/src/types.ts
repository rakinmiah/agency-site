export type ClipMeta = {
  src: string; // staticFile-relative path, e.g. 'clips/clip-01.mov'
  durationInFrames: number;
  width: number; // displayed width (rotation applied)
  height: number; // displayed height (rotation applied)
};

export type BirthdayProps = {
  clips: ClipMeta[];
  // Crossfade length between sequence i and i+1 of [clips..., outro], in
  // frames. length = clips.length (the last entry leads into the outro card).
  transitions: number[];
  title: string;
};
