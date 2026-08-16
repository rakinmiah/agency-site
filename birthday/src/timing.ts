import {ClipMeta} from './types';

export const FPS = 30;
export const INTRO_FRAMES = 105; // 3.5s title card
export const OUTRO_FRAMES = 120; // 4s closing card
export const MAX_TRANSITION = 20; // ~0.66s soft crossfade

// A transition eats into both neighbouring sequences, so each side must keep
// at least a few frames of its own. Cap the fade by the shorter neighbour.
export const transitionBetween = (a: number, b: number): number => {
  const cap = Math.floor(Math.min(a, b) / 2) - 2;
  return Math.max(2, Math.min(MAX_TRANSITION, cap));
};

export const buildTransitions = (clips: ClipMeta[]): number[] => {
  const seqs = [
    INTRO_FRAMES,
    ...clips.map((c) => c.durationInFrames),
    OUTRO_FRAMES,
  ];
  const out: number[] = [];
  for (let i = 0; i < seqs.length - 1; i++) {
    out.push(transitionBetween(seqs[i], seqs[i + 1]));
  }
  return out;
};

export const totalDuration = (
  clips: ClipMeta[],
  transitions: number[]
): number => {
  const seqSum =
    INTRO_FRAMES +
    clips.reduce((acc, c) => acc + c.durationInFrames, 0) +
    OUTRO_FRAMES;
  const transSum = transitions.reduce((a, b) => a + b, 0);
  return seqSum - transSum;
};
