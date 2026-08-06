/* Per-half-beat band energy for showreel-2bar.wav.
   usage: node tools/beats.mjs <firstBeat> <lastBeat>
   Prints, for each half-beat grid point, the onset (peak abs in the 0.10s
   window that starts there) in the low / mid / high bands. */
import {execSync} from 'node:child_process';

const SRC = 'public/music/showreel-2bar.wav';
const FPS = 60, BPM = 150.1, BEAT = (60 / BPM) * FPS;   // 23.984 frames
const SR = 22050;
const A = Number(process.argv[2] ?? 30);
const B = Number(process.argv[3] ?? 48);

const BANDS = {
  low: 'lowpass=f=200',
  mid: 'bandpass=f=1600:width_type=o:w=2',
  high: 'highpass=f=6000',
};

const pcm = (filter) => {
  const buf = execSync(
    `ffmpeg -v error -i "${SRC}" -af "${filter}" -ac 1 -ar ${SR} -f s16le -`,
    {maxBuffer: 1 << 28, encoding: 'buffer'},
  );
  const n = buf.length >> 1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
};

const data = Object.fromEntries(Object.entries(BANDS).map(([k, v]) => [k, pcm(v)]));

const peak = (a, from, len) => {
  let m = 0;
  for (let i = from; i < from + len && i < a.length; i++) {
    const v = Math.abs(a[i]);
    if (v > m) m = v;
  }
  return m;
};

const WIN = Math.round(0.10 * SR);
const bar = (v, k) => '#'.repeat(Math.round(v * k));
console.log('beat   frame   low            mid            high');
for (let b = A; b <= B; b += 0.5) {
  const frame = Math.round(b * BEAT);
  const s = Math.round((frame / FPS) * SR);
  const l = peak(data.low, s, WIN), m = peak(data.mid, s, WIN), h = peak(data.high, s, WIN);
  const downbeat = Number.isInteger(b) && (b - 1) % 4 === 0;
  console.log(
    `${String(b).padStart(5)}${downbeat ? '|' : ' '} ${String(frame).padStart(5)}  ` +
    `${l.toFixed(3)} ${bar(l, 14).padEnd(8)} ${m.toFixed(3)} ${bar(m, 40).padEnd(8)} ${h.toFixed(3)} ${bar(h, 90)}`,
  );
}
