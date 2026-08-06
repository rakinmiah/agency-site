/* Industry imagery for the montage segment.
   Usage:  PEXELS_KEY=... node tools/fetch-industry.mjs
   Key from the environment only — never hardcoded, never committed.

   WHAT THE FIRST PASS GOT WRONG, and what changed:

   1. WRONG SUBJECT. "window cleaner" returned car windscreens; "chimney sweep"
      returned a street sweeper and a figurine on a dandelion. Fix: two queries
      per industry, both describing the ACTION, so a bad one cannot own the row.
   2. WRONG COUNTRY. "roofer" returned US asphalt shingle, which does not exist on
      UK housing; "bricklayer" returned brick-making in South Asia. Fix: UK trade
      vocabulary — slate, consumer unit, combi boiler, pointing, skimming.
   3. WRONG SCALE. "gas engineer" returned industrial boiler houses; the trade is
      domestic. Fix: the word "domestic" and named domestic kit.
   4. FLAT-LAYS. "tools", "equipment", "workbench" all return arranged objects on
      a surface, which is its own stock cliché — I traded one for another. Fix:
      action verbs only, and "hands" wherever a person should be doing something.
   5. DUPLICATES. tiler and plasterer returned identical images. Fix: dedup by
      Pexels id across the whole run.
   6. TRADEMARKS. A Ferrari badge was clearly visible. Cannot be filtered by API —
      flagged in the manifest for a human check before anything is used. */

import fs from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.PEXELS_KEY;
if (!KEY) { console.error('PEXELS_KEY not set'); process.exit(1); }

const OUT = 'out/cand';
const PER_QUERY = 6;

/* [slug, queryA, queryB] — two angles on each so one bad query cannot own a row */
const TERMS = [
  ['barber', 'barber clippers fading hair', 'barber shaving razor neck close'],
  ['plumber', 'plumber fixing pipe under sink', 'plumbing wrench hands working joint'],
  ['roofer', 'slate roof repair working', 'roof tiles laying craftsman'],
  ['joiner', 'carpenter planing wood workshop', 'chisel cutting joint hands wood'],
  ['tiler', 'tiling wall spacers working', 'tile cutter cutting ceramic'],
  ['plasterer', 'plastering skimming wall trowel', 'plasterer smoothing ceiling'],
  ['locksmith', 'fitting door lock hands', 'locksmith working door cylinder'],
  ['gardener', 'pruning shears hands garden', 'hedge cutting working garden'],
  ['decorator', 'painting wall roller room', 'cutting in paint brush edge wall'],
  ['builder', 'building site worker wall', 'construction worker concrete pouring'],
  ['cleaner', 'mopping floor commercial cleaning', 'wiping surface cleaning cloth hands'],
  ['scaffolder', 'erecting scaffolding building', 'scaffold tube clamp worker'],
  ['glazier', 'fitting window glass hands', 'cutting glass sheet workshop'],
  ['landscaper', 'laying paving slabs garden', 'landscaping garden construction working'],
  ['painter', 'painting sash window brush', 'spray painting workshop worker'],
  ['welder', 'welder sparks mask working', 'mig welding metal close'],
  ['carpet-fitter', 'laying carpet floor fitting', 'flooring installer working boards'],
  ['gas-engineer', 'domestic boiler service engineer', 'combi boiler repair hands'],
  ['tree-surgeon', 'arborist climbing rope chainsaw', 'tree felling climber harness'],
  ['window-cleaner', 'cleaning shop window outside squeegee', 'window cleaner ladder building'],
  ['bricklayer', 'laying bricks trowel mortar wall', 'brickwork pointing hands'],
  ['handyman', 'drilling wall repair hands', 'fixing door hinge screwdriver'],
  ['chimney-sweep', 'sweeping chimney brush fireplace', 'chimney sweep rods soot'],
  ['electrician', 'electrician consumer unit wiring', 'fitting light switch hands wires'],

  ['baker', 'baker kneading dough hands flour', 'bread oven bakery working'],
  ['butcher', 'butcher cutting meat knife', 'butcher block trimming working'],
  ['florist', 'florist arranging bouquet hands', 'trimming flower stems working'],
  ['tattooist', 'tattoo machine needle skin', 'tattoo artist working gloves'],
  ['mechanic', 'mechanic working engine hands', 'car repair garage under bonnet'],
  ['tyre-fitter', 'changing tyre garage working', 'wheel balancing machine workshop'],
  ['bike-shop', 'bicycle repair wheel workshop', 'truing bike wheel hands'],
  ['barista', 'barista tamping espresso portafilter', 'pouring latte art close'],
  ['chef', 'chef plating dish kitchen service', 'chopping vegetables kitchen hands'],
  ['pizzeria', 'pizza peel wood fired oven', 'stretching pizza dough hands'],
  ['brewery', 'brewery mash tun brewing', 'pouring craft beer tap'],
  ['farm-shop', 'farm vegetables crates market', 'harvesting produce hands soil'],
  ['fishmonger', 'fishmonger filleting fish counter', 'fresh fish ice display market'],
  ['cheesemonger', 'cutting cheese wheel counter', 'cheese shop shelves ageing'],
  ['tailor', 'sewing machine fabric hands', 'tailor pinning garment measuring'],
  ['cobbler', 'shoe repair leather workshop', 'stitching leather boot hands'],
  ['upholsterer', 'upholstery stapling fabric chair', 'reupholstering furniture workshop'],
  ['framer', 'picture framing workshop moulding', 'cutting mount board frame'],
  ['potter', 'pottery wheel throwing clay hands', 'glazing ceramic pot workshop'],
  ['blacksmith', 'blacksmith hammering anvil forge', 'heating steel forge glowing'],
  ['jeweller', 'jeweller bench soldering ring', 'setting stone jewellery hands'],
  ['optician', 'fitting spectacle frames optician', 'lens grinding optical workshop'],
  ['dentist', 'dentist working patient chair', 'dental tools tray clinic'],
  ['physio', 'physiotherapist treating patient hands', 'sports massage therapy table'],
  ['vet', 'vet examining dog clinic', 'veterinary nurse holding cat'],
  ['dog-groomer', 'dog grooming clippers salon', 'washing dog grooming bath'],
  ['nail-salon', 'manicure painting nails hands', 'nail technician working client'],
  ['beautician', 'facial treatment spa therapist', 'applying makeup brush client'],
  ['gym', 'lifting barbell gym training', 'kettlebell rack gym floor'],
  ['yoga', 'yoga studio class morning light', 'rolling yoga mat studio'],
  ['photographer', 'photographer shooting camera hands', 'studio lighting setup shoot'],
  ['print-shop', 'printing press ink rollers', 'screen printing squeegee working'],
  ['sign-maker', 'vinyl cutting signage workshop', 'neon sign making bending'],
  ['removals', 'carrying boxes removal van', 'loading van moving house'],
  ['courier', 'delivery driver parcel handover', 'courier bike bag city'],
  ['taxi', 'taxi driving city night', 'driver hands steering wheel night'],
  ['driving-school', 'learner driver steering wheel', 'driving instructor car interior'],
  ['laundrette', 'laundrette washing machines row', 'folding laundry service'],
  ['sound-studio', 'recording studio mixing desk faders', 'microphone vocal booth studio'],
  ['woodworker', 'wood workshop hand plane shavings', 'sanding timber workshop hands'],
  ['cafe', 'cafe counter serving customer', 'cafe interior morning light'],
  ['bookshop', 'bookshop shelves browsing', 'stacking books shop'],
  ['record-shop', 'record shop flicking vinyl crates', 'turntable record shop'],
  ['bar', 'bartender pouring cocktail shaker', 'pulling pint bar tap'],
  ['garden-centre', 'plant nursery greenhouse rows', 'potting plants nursery hands'],
  ['deli', 'deli counter slicing meat', 'delicatessen shelves produce'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  await fs.mkdir(OUT, {recursive: true});
  const seen = new Set();
  const manifest = [];
  let dl = 0, dupes = 0;

  for (const [slug, qa, qb] of TERMS) {
    let kept = 0;
    for (const [qi, query] of [qa, qb].entries()) {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${PER_QUERY}&orientation=landscape&size=large`;
      let j;
      try {
        const r = await fetch(url, {headers: {Authorization: KEY}});
        if (!r.ok) { console.log(`  ! ${slug}/${qi}: HTTP ${r.status}`); continue; }
        j = await r.json();
      } catch (e) { console.log(`  ! ${slug}/${qi}: ${e.message}`); continue; }

      for (const p of j.photos || []) {
        if (seen.has(p.id)) { dupes++; continue; }       // dedup across the whole run
        seen.add(p.id);
        const file = `${slug}-${String(kept + 1).padStart(2, '0')}.jpg`;
        try {
          const img = await fetch(p.src.medium);
          await fs.writeFile(path.join(OUT, file), Buffer.from(await img.arrayBuffer()));
          manifest.push({
            slug, file, id: p.id, query, w: p.width, h: p.height,
            photographer: p.photographer, page: p.url, full: p.src.original,
            alt: (p.alt || '').slice(0, 100),
          });
          kept++; dl++;
        } catch (e) { console.log(`  ! ${file}: ${e.message}`); }
      }
      await sleep(60);
    }
    console.log(`${slug.padEnd(15)} ${String(kept).padStart(2)} kept`);
  }

  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log(`\n${dl} unique images · ${TERMS.length} industries · ${dupes} duplicates rejected`);
  console.log('NOTE: visible trademarks cannot be filtered by API — needs a human pass before use.');
};

run();
