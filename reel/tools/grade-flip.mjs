/* Grades the stock set for the flip section and writes it into public/flip/.

   WHY THIS IS A BUILD STEP AND NOT A CSS FILTER. The correction each image
   needs depends on what that image measures, and a browser cannot measure an
   image before deciding how to filter it. A blanket filter chain — which is all
   Remotion could apply — preserves the spread it started with: the dark garage
   interior stays dark, the blown-out studio stays blown out. Ungraded, this set
   runs luminance 44 → 204, which at fifteen cuts a second is a strobe rather
   than a montage, and squarely in photosensitive-seizure territory for
   something that plays on social where nobody can opt out.

   So every image is measured, given its OWN brightness offset toward a common
   target, and the look goes on top of that.

   CONTRAST IS DELIBERATELY LOW. The first pass of this look ran contrast 1.18,
   which re-spread the luminance it had just corrected — sd went from 3.5 at
   neutral to 8.5. Contrast is the enemy of consistency here: it takes the
   matched exposures and pushes them apart again.

   ORDER IS INTERLEAVED BY TRADE. Consecutive frames come from different trades,
   so the half-second the eye gets on any one image reads as breadth rather than
   as a run of four bakers. */

import fs from 'node:fs/promises';
import {execSync} from 'node:child_process';

const SRC = 'out/hires';
const OUT = 'public/flip';
const COUNT = 192;
const TARGET = 106;
const W = 2560, H = 1440;   // 33% headroom over 1080p so the framing offsets never upscale

/* the cool look — pushed toward the brand's blue, saturation well down, so the
   flickering type is the only saturated thing on screen */
const LOOK = (b) => `eq=brightness=${b}:contrast=1.05:saturation=0.17,`
  + `colorbalance=rs=-0.10:bs=0.16:rm=-0.06:bm=0.12:rh=-0.03:bh=0.08`;

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

  /* out/hires is already interleaved by trade and numbered in order by the
     refetch, so the trade round-robin that used to live here would only shuffle
     an order that was already correct — and it keyed off a filename pattern
     ("barber-01.jpg") that the renumbered set no longer has. */
  const order = all.sort().slice(0, COUNT);

  /* ── TWO PASSES, NOT ONE ─────────────────────────────────────────────────
     A single correction is computed from the RAW image, but the look applied
     afterwards moves the luminance again — saturation, the colour balance and
     even a mild contrast curve all shift the mean, and by different amounts
     depending on what the image contains. One pass left spread 33 with a few
     images 15 points off target.

     That was survivable at fifteen cuts a second. At thirty it is not: the
     count of frame-to-frame jumps over 20/255 scales with the cut rate, and one
     pass would have put it right on the three-a-second limit. So each image is
     graded, the RESULT is measured, and the correction is redone from the
     original with the error folded in. */
  const lums = [];
  const manifest = [];
  for (let i = 0; i < order.length; i++) {
    const src = `${SRC}/${order[i]}`;
    const name = String(i).padStart(3, '0') + '.jpg';
    const geom = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;

    let b = Math.max(-0.5, Math.min(0.5, (TARGET - meanLum(src)) / 255));
    for (let pass = 0; pass < 2; pass++) {
      execSync(`ffmpeg -v error -i "${src}" -vf "${LOOK(b.toFixed(4))},${geom}" -q:v 4 "${OUT}/${name}" -y`);
      const got = meanLum(`${OUT}/${name}`);
      if (pass === 1) { lums.push(got); break; }
      b = Math.max(-0.5, Math.min(0.5, b + (TARGET - got) / 255));
    }
    manifest.push({file: name, from: order[i]});
    if ((i + 1) % 40 === 0) console.log(`  ${i + 1}/${order.length}`);
  }

  await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`\n${order.length} images, ${new Set(manifest.map((m) => m.trade)).size} trades`);
  console.log(`graded luminance  ${Math.min(...lums).toFixed(0)} → ${Math.max(...lums).toFixed(0)}`
    + `  spread ${(Math.max(...lums) - Math.min(...lums)).toFixed(0)}  sd ${sd(lums).toFixed(1)}`);
  console.log('(ungraded was 44 → 204, spread 160, sd 36.7)');
};

main().catch((e) => { console.error(e); process.exit(1); });
