/* The phone-tap plate for the leads transition.
   Usage:  PEXELS_KEY=... node tools/fetch-phone-plate.mjs
   Key from the environment only — never hardcoded, never committed.

   THE BRIEF this is searching against, and why each part matters:

     black background   we composite over black, or luma-key it so notifications
                        can pass behind the hands. A green plate would work too
                        but that pool is small and skews low-budget, and green
                        bounce in skin is the artefact that reads as "cheap comp"
     locked off         the screen gets replaced with our own notification stack.
                        A static camera makes that one perspective transform set
                        once; a moving one makes it four corners keyframed
     tight crop         no face. The film has no other human in it and a
                        recognisable person is both a licensing question and a
                        tonal one
     50/60fps           the composition is 60. A 30fps source doubles every
                        frame, and a fast tap is exactly where that judders
     short              under half a second on screen, so anything over ~10s of
                        source is mostly waste

   Sorting is by measured DARKNESS of the poster frame, not by relevance —
   "dark background" is the one criterion the API cannot filter and the one that
   decides whether the shot belongs in this film. */

import fs from 'node:fs/promises';
import {pexelsKey} from './env.mjs';

const KEY = pexelsKey();
if (!KEY) {
  console.error('No Pexels key. Paste one into reel/.env.local after PEXELS_KEY=');
  console.error('Free key: https://www.pexels.com/api/new/');
  process.exit(1);
}

const OUT = 'out/plate';
const PER_QUERY = 15;

const QUERIES = [
  'hand holding smartphone dark background',
  'finger tapping phone screen close up',
  'smartphone dark room hands using',
  'hands using mobile phone black background',
  'phone screen glow dark hands',
  'scrolling smartphone close up macro',
  'mobile phone green screen hand holding',
  'typing on smartphone dark moody',
  'person checking phone notification dark',
  'smartphone in hand studio black',
  /* Second pass. The first ten found plenty of HOLDING and almost no TOUCHING,
     and the whole transition hangs on a finger contacting glass. Also chasing
     the passive read — a phone lighting up on its own is closer to what the
     film actually sells than a tap is. */
  'finger touching phone screen',
  'tapping phone screen dark',
  'phone lighting up on table dark',
  'phone notification screen turns on night',
  'hand reaching for phone dark table',
  'thumb scrolling phone screen dark close up',
  'phone screen illuminating face dark',
  'smartphone vibrating table dark',
];

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

/* 401 IS RETRYABLE HERE, which is not what a 401 normally means. Under burst
   this endpoint returns 401 for a request it will serve on the next attempt —
   verified by firing the identical URL twice seconds apart and getting 401 then
   200. Treating it as a hard auth failure aborted every query in the first run.
   Retry both statuses, and pace the queries so it happens less. */
const get = async (url) => {
  for (let a = 0; a < 6; a++) {
    const r = await fetch(url, {headers: {Authorization: KEY}});
    if (r.ok) return r.json();
    if (r.status === 429 || r.status === 401) { await sleep(1800 * (a + 1)); continue; }
    throw new Error(`${r.status} ${url}`);
  }
  throw new Error(`gave up after 6 attempts: ${url}`);
};

const main = async () => {
  await fs.mkdir(OUT, {recursive: true});
  const seen = new Map();

  for (const q of QUERIES) {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}`
      + `&per_page=${PER_QUERY}&orientation=landscape&size=medium`;
    let data;
    try { data = await get(url); } catch (e) { console.error('  ! ' + q + ': ' + e.message); continue; }
    for (const v of data.videos ?? []) {
      if (seen.has(v.id)) { seen.get(v.id).queries.push(q); continue; }
      /* the best file we would actually use: highest fps first, then height */
      const files = (v.video_files ?? [])
        .filter((f) => f.file_type === 'video/mp4' && f.width >= f.height)
        .sort((a, b) => (b.fps ?? 0) - (a.fps ?? 0) || (b.height ?? 0) - (a.height ?? 0));
      if (!files.length) continue;
      seen.set(v.id, {
        id: v.id, dur: v.duration, w: v.width, h: v.height,
        poster: v.image, page: v.url, by: v.user?.name ?? '?',
        best: files[0], queries: [q],
      });
    }
    console.log(`${q}  →  ${data.videos?.length ?? 0} results, ${seen.size} unique so far`);
    await sleep(900);
  }

  const all = [...seen.values()].filter((v) => v.dur <= 30);
  console.log(`\n${all.length} candidates (<=30s). Downloading posters…`);

  for (const v of all) {
    try {
      const buf = Buffer.from(await (await fetch(v.poster)).arrayBuffer());
      await fs.writeFile(`${OUT}/p-${v.id}.jpg`, buf);
    } catch { v.dead = true; }
  }

  await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify(all.filter((v) => !v.dead), null, 2));
  console.log(`posters in ${OUT}/  ·  manifest written`);
};

main().catch((e) => { console.error(e); process.exit(1); });
