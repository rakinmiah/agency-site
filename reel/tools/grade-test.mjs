/* Grading test for the stock flip.

   MEASURED, UNGRADED, across 60 images spanning all 70 trades:
     luminance   44 → 204   (63% of the full range), sd 36.7
     saturation   2% → 84%                           sd 18.0
     warm/cool  -27 → +114  (R minus B)              sd 28.7

   Cutting between those every five frames is not a montage, it is a strobe —
   and a full-frame luminance swing of 160 at ten-plus changes a second is also
   squarely in photosensitive-seizure territory for something that will play on
   social where nobody can opt out.

   THE FIX IS PER-IMAGE, NOT A BLANKET LUT. A single filter chain applied to
   every image preserves the spread it started with — a dark interior stays dark
   and a blown-out exterior stays blown out. Each image is measured first and
   given its own brightness offset toward a common target, THEN the look is
   applied on top. That is what makes fifty stock photos read as one film
   instead of a stock library. */

import fs from 'node:fs/promises';
import {execSync} from 'node:child_process';

const SRC = 'out/cand';
const OUT = 'out/grade';
const TARGET = 106;          // where every image's mean luminance is pulled to

/* three looks to choose between, all on top of the same exposure match */
const LOOKS = {
  /* keeps colour, just tames it — the images still read as photographs */
  neutral: (b) => `eq=brightness=${b}:contrast=1.06:saturation=0.42,`
    + `colorbalance=rs=-0.04:gs=-0.01:bs=0.07:rm=-0.02:bm=0.05`,
  /* pushed toward the brand's cool blue, close to a duotone but not quite */
  cool: (b) => `eq=brightness=${b}:contrast=1.18:saturation=0.18,`
    + `colorbalance=rs=-0.10:bs=0.16:rm=-0.06:bm=0.12:rh=-0.03:bh=0.08`,
  /* near-mono with lifted blacks — colour then belongs to the type alone */
  mono: (b) => `eq=brightness=${b}:contrast=1.24:saturation=0.05,`
    + `curves=all='0/0.06 0.5/0.5 1/0.96'`,
};

const meanLum = (path, vf = '') => {
  const b = execSync(`ffmpeg -v error -i "${path}" -vf "${vf}scale=64:36" -f rawvideo -pix_fmt rgb24 -`,
    {maxBuffer: 1e8});
  let r = 0, g = 0, bl = 0; const n = 64 * 36;
  for (let i = 0; i < n * 3; i += 3) { r += b[i]; g += b[i + 1]; bl += b[i + 2]; }
  return 0.299 * (r / n) + 0.587 * (g / n) + 0.114 * (bl / n);
};

const sd = (a) => {
  const m = a.reduce((x, y) => x + y, 0) / a.length;
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
};

const main = async () => {
  await fs.mkdir(OUT, {recursive: true});
  const all = (await fs.readdir(SRC)).filter((x) => /\.jpg$/i.test(x));
  const sample = Array.from({length: 60}, (_, i) => all[Math.floor(i * all.length / 60)]);
  const shown = Array.from({length: 10}, (_, i) => sample[Math.floor(i * sample.length / 10)]);

  const report = {};
  for (const [name, look] of Object.entries(LOOKS)) {
    const lums = [];
    for (const f of sample) {
      const raw = meanLum(`${SRC}/${f}`);
      /* ffmpeg brightness is -1..1 on the 0..1 range, so the correction is the
         luminance gap expressed in that space */
      const b = Math.max(-0.5, Math.min(0.5, (TARGET - raw) / 255)).toFixed(4);
      lums.push(meanLum(`${SRC}/${f}`, look(b) + ','));
    }
    report[name] = {min: Math.min(...lums), max: Math.max(...lums), sd: sd(lums)};
    console.log(`${name.padEnd(8)} luminance ${report[name].min.toFixed(0)} → ${report[name].max.toFixed(0)}`
      + `  spread ${(report[name].max - report[name].min).toFixed(0)}  sd ${report[name].sd.toFixed(1)}`);

    /* a strip of the same ten images under this look */
    const tiles = [];
    for (let i = 0; i < shown.length; i++) {
      const raw = meanLum(`${SRC}/${shown[i]}`);
      const b = Math.max(-0.5, Math.min(0.5, (TARGET - raw) / 255)).toFixed(4);
      const p = `${OUT}/t-${name}-${i}.png`;
      execSync(`ffmpeg -v error -i "${SRC}/${shown[i]}" -vf "${look(b)},scale=320:180:force_original_aspect_ratio=increase,crop=320:180" "${p}" -y`);
      tiles.push(p);
    }
    execSync(`ffmpeg -v error ${tiles.map((t) => `-i "${t}"`).join(' ')} `
      + `-filter_complex "${tiles.map((_, i) => `[${i}:v]`).join('')}hstack=inputs=${tiles.length}" "${OUT}/row-${name}.png" -y`);
  }

  /* the same ten, untouched, for the top row */
  const rawTiles = shown.map((f, i) => {
    const p = `${OUT}/t-raw-${i}.png`;
    execSync(`ffmpeg -v error -i "${SRC}/${f}" -vf "scale=320:180:force_original_aspect_ratio=increase,crop=320:180" "${p}" -y`);
    return p;
  });
  execSync(`ffmpeg -v error ${rawTiles.map((t) => `-i "${t}"`).join(' ')} `
    + `-filter_complex "${rawTiles.map((_, i) => `[${i}:v]`).join('')}hstack=inputs=${rawTiles.length}" "${OUT}/row-raw.png" -y`);

  execSync(`ffmpeg -v error -i "${OUT}/row-raw.png" -i "${OUT}/row-neutral.png" -i "${OUT}/row-cool.png" -i "${OUT}/row-mono.png" `
    + `-filter_complex "[0:v][1:v][2:v][3:v]vstack=inputs=4" "${OUT}/compare.png" -y`);
  console.log(`\ncompare sheet: ${OUT}/compare.png   (rows: ungraded / neutral / cool / mono)`);
};

main().catch((e) => { console.error(e); process.exit(1); });
