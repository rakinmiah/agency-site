/* The grid, v2 — locked to the KICK, not the full mix.
   v1 phase-fit the full-band onset envelope and landed on a pre-drop synth rise
   at ~5.2s; the actual kick drop is at 10.047s (bass-band verified, ratio 3.77×).
   public/music/edit-master.wav is pre-cut sample-accurately at track 8.4484s —
   one bar before the drop, dead on the kick grid (measured phase 0.000) — so:
     frame 0        = downbeat
     beat 4  (1.60s) = THE DROP  → "One team"
     beat 12 (4.80s) = second-stage drop (full bass) → the typed line
   WAV, not mp3: no encoder delay, nothing for the decoder to shift. 60fps for
   tighter musical registration (max cut error 8.3ms vs 16.7ms at 30). */

export const FPS = 60;
export const BPM = 150.1;
export const BEAT_SEC = 60 / BPM;

export const beatF = (n: number): number => Math.round(n * BEAT_SEC * FPS);
export const barF = (n: number): number => beatF(n * 4);
