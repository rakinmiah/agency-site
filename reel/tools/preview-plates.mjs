/* Pull real frames from the shortlisted plates and build a contact sheet.

   A poster frame is not enough to judge these. Pexels' poster is often the
   first frame, and several of the darkest candidates score 100% black on it
   simply because the clip fades up — the score says "perfect" and the shot may
   be nothing of the kind. And the two things that actually decide whether a
   plate is usable here, neither of which a still can show:

     is it locked off   we replace the phone screen with our own artwork. Static
                        camera = one perspective transform. Moving = four
                        corners keyframed across the clip
     is there a tap     the whole cut hangs on a finger contacting glass on a
                        downbeat. No contact, no transition

   So: three frames per clip at 15% / 50% / 85%. Frame-to-frame difference
   between them is a crude camera-movement proxy — a locked-off shot with a
   moving hand changes in a small region, a moving camera changes everywhere. */

import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {pexelsKey} from './env.mjs';

const KEY = pexelsKey();
if (!KEY) { console.error('no key'); process.exit(1); }

const OUT = 'out/plate';
const N = 8;

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

const main = async () => {
  const scored = JSON.parse(await fs.readFile(`${OUT}/scored.json`, 'utf8'));
  /* 50fps first — a 30fps source in a 60fps comp doubles every frame and the
     tap is exactly where that shows — then darkest. */
  const pick = scored
    .filter((v) => (v.best.fps ?? 0) >= 23)

    .slice(0, N);

  await fs.mkdir(`${OUT}/frames`, {recursive: true});
  const rows = [];

  for (const v of pick) {
    /* smallest mp4 for preview — we only need to see it, not use it */
    let files = [];
    try {
      const r = await fetch(`https://api.pexels.com/videos/videos/${v.id}`, {headers: {Authorization: KEY}});
      if (r.ok) files = (await r.json()).video_files ?? [];
    } catch {}
    await sleep(400);
    const small = files.filter((f) => f.file_type === 'video/mp4' && f.width >= f.height)
      .sort((a, b) => (a.height ?? 9999) - (b.height ?? 9999))[0];
    if (!small) { console.log(`${v.id}  no file`); continue; }

    const mp4 = `${OUT}/frames/v-${v.id}.mp4`;
    if (!existsSync(mp4)) {
      const buf = Buffer.from(await (await fetch(small.link)).arrayBuffer());
      await fs.writeFile(mp4, buf);
    }

    const stamps = [0.15, 0.5, 0.85].map((p) => (v.dur * p).toFixed(2));
    const shots = [];
    for (let i = 0; i < 3; i++) {
      const png = `${OUT}/frames/f-${v.id}-${i}.png`;
      try {
        execSync(`ffmpeg -v error -ss ${stamps[i]} -i "${mp4}" -frames:v 1 -vf scale=480:270 "${png}" -y`);
        shots.push(png);
      } catch { }
    }
    if (shots.length < 3) { console.log(`${v.id}  extract failed`); continue; }

    /* crude motion proxy: mean abs difference between the three frames */
    const gray = shots.map((p) =>
      execSync(`ffmpeg -v error -i "${p}" -vf scale=96:54 -pix_fmt gray -f rawvideo -`, {maxBuffer: 1e8}));
    const diff = (a, b) => {
      let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
      return s / a.length;
    };
    const motion = (diff(gray[0], gray[1]) + diff(gray[1], gray[2])) / 2;
    rows.push({...v, shots, motion, previewH: small.height});
    console.log(`${String(v.id).padEnd(10)} fps ${String(v.best.fps).padStart(5)}  dur ${String(v.dur).padStart(3)}s  motion ${motion.toFixed(1).padStart(5)}`);
  }

  rows.sort((a, b) => a.motion - b.motion);
  await fs.writeFile(`${OUT}/preview.json`, JSON.stringify(rows.map((r) => ({
    id: r.id, fps: r.best.fps, dur: r.dur, res: `${r.best.width}x${r.best.height}`,
    mean: +r.mean.toFixed(1), motion: +r.motion.toFixed(1), page: r.page, by: r.by,
  })), null, 2));

  /* contact sheet: one row per clip, three frames across, label strip on top */
  const inputs = rows.flatMap((r) => r.shots.map((s) => `-i "${s}"`)).join(' ');
  const per = 3;
  const filters = rows.map((r, ri) =>
    Array.from({length: per}, (_, ci) => `[${ri * per + ci}:v]`).join('') + `hstack=inputs=${per}[r${ri}]`
  ).join(';');
  const stack = rows.map((_, ri) => `[r${ri}]`).join('') + `vstack=inputs=${rows.length}[out]`;
  execSync(`ffmpeg -v error ${inputs} -filter_complex "${filters};${stack}" -map "[out]" "${OUT}/contact.png" -y`);
  console.log(`\ncontact sheet: ${OUT}/contact.png  (${rows.length} clips, sorted by camera stillness)`);
  rows.forEach((r, i) => console.log(`  row ${i + 1}: ${r.id}  ${r.best.fps}fps  ${r.dur}s  motion ${r.motion.toFixed(1)}  ${r.page}`));
};

main().catch((e) => { console.error(e); process.exit(1); });
