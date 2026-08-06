/* Re-downloads the flip set at a usable resolution.

   THE ORIGINAL FETCH TOOK `src.medium`, which Pexels serves at about 525px
   wide. Everything downstream has been upscaling that to 1920 — a 3.7x blow-up
   before a single frame of zoom was applied — which is why the images look soft
   and why zooming made it obvious rather than caused it.

   The manifest kept `src.original` for every image, and those are 4000-6000px.
   Pexels' CDN takes a width parameter, so this pulls each one at 2560: sharp at
   1080p with room for the framing offsets, and a 1.33x downscale rather than a
   3.7x upscale.

   FOR A 4K MASTER this needs re-running at w=3840 or higher. 2560 into a 3840
   frame is an upscale again, and the whole point of this file is not doing that
   silently. */

import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';

const SRC_MANIFEST = 'out/cand/manifest.json';
const OUT = 'out/hires';
const COUNT = 192;
const WIDTH = 2560;

const main = async () => {
  await fs.mkdir(OUT, {recursive: true});
  const all = JSON.parse(await fs.readFile(SRC_MANIFEST, 'utf8'));

  /* round-robin by trade so the download order is already interleaved and the
     flip never runs four bakers in a row */
  const byTrade = new Map();
  for (const m of all) {
    if (!m.full) continue;
    if (!byTrade.has(m.slug)) byTrade.set(m.slug, []);
    byTrade.get(m.slug).push(m);
  }
  const trades = [...byTrade.keys()].sort();
  const order = [];
  for (let round = 0; order.length < COUNT && round < 14; round++) {
    for (const t of trades) {
      const list = byTrade.get(t);
      if (list[round] && order.length < COUNT) order.push(list[round]);
    }
  }

  let got = 0, skipped = 0, failed = 0;
  const manifest = [];
  for (let i = 0; i < order.length; i++) {
    const m = order[i];
    const name = String(i).padStart(3, '0') + '.jpg';
    const path = `${OUT}/${name}`;
    manifest.push({file: name, id: m.id, trade: m.slug, page: m.page, by: m.photographer});
    if (existsSync(path)) { skipped++; continue; }
    const url = `${m.full}?auto=compress&cs=tinysrgb&w=${WIDTH}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      await fs.writeFile(path, Buffer.from(await r.arrayBuffer()));
      got++;
    } catch (e) {
      console.error(`  ! ${m.file}: ${e.message}`);
      failed++;
    }
    if ((i + 1) % 40 === 0) console.log(`  ${i + 1}/${order.length}`);
  }

  await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`\ndownloaded ${got}, already had ${skipped}, failed ${failed}`);
  console.log(`${new Set(manifest.map((m) => m.trade)).size} trades`);
};

main().catch((e) => { console.error(e); process.exit(1); });
