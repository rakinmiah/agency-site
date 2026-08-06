/* The 17 display faces the logo reel flips through. These load on demand in the
   site (197KB, parked off the hero); here they must all be resident before the
   first frame renders or treatments silently fall back and the reel looks broken.

   ── WHY THIS IS LAZY, AND WHY THE SUBSETS ARE PINNED ──────────────────────
   This module used to run a top-level Promise.all the instant it was imported,
   with every loadFont() called bare. Bare means EVERY weight crossed with EVERY
   subset — Jost alone is 100 through 900 across latin, latin-ext and cyrillic.
   Root.tsx imports LogoReel, LogoReel imported this, so rendering ANY composition
   fetched 241 font files for a reel that was not being rendered. A 4K render of
   the Open died on a delayRender timeout part-way through because the connection
   dropped and it was still chasing Cyrillic Rampart One.

   Now nothing is fetched until LogoReel actually mounts and asks, and when it
   does it asks for latin only. Everything here is English display type, so the
   other subsets were never going to be drawn. */

import {loadFont as silkscreen} from '@remotion/google-fonts/Silkscreen';
import {loadFont as alfaSlab} from '@remotion/google-fonts/AlfaSlabOne';
import {loadFont as archivoBlack} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as anton} from '@remotion/google-fonts/Anton';
import {loadFont as instrumentSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as unifraktur} from '@remotion/google-fonts/UnifrakturMaguntia';
import {loadFont as rubikMonoOne} from '@remotion/google-fonts/RubikMonoOne';
import {loadFont as instrumentSans} from '@remotion/google-fonts/InstrumentSans';
import {loadFont as bebasNeue} from '@remotion/google-fonts/BebasNeue';
import {loadFont as michroma} from '@remotion/google-fonts/Michroma';
import {loadFont as yellowtail} from '@remotion/google-fonts/Yellowtail';
import {loadFont as titanOne} from '@remotion/google-fonts/TitanOne';
import {loadFont as monoton} from '@remotion/google-fonts/Monoton';
import {loadFont as syne} from '@remotion/google-fonts/Syne';
import {loadFont as bungee} from '@remotion/google-fonts/Bungee';
import {loadFont as rampartOne} from '@remotion/google-fonts/RampartOne';
import {loadFont as jost} from '@remotion/google-fonts/Jost';

/* Typed tuples rather than `as const`: the loader wants a MUTABLE array of its
   own subset union, and a const assertion makes it readonly. */
const SUB: ['latin'] = ['latin'];
const W_SANS: ['400', '700'] = ['400', '700'];
const W_SYNE: ['700', '800'] = ['700', '800'];
const W_JOST: ['400', '600'] = ['400', '600'];
const LATIN = {subsets: SUB};

let pending: Promise<unknown> | null = null;

export const loadReelFonts = (): Promise<unknown> => {
  if (pending) return pending;
  pending = Promise.all([
    silkscreen('normal', LATIN).waitUntilDone(),
    alfaSlab('normal', LATIN).waitUntilDone(),
    archivoBlack('normal', LATIN).waitUntilDone(),
    anton('normal', LATIN).waitUntilDone(),
    instrumentSerif('normal', LATIN).waitUntilDone(),
    unifraktur('normal', LATIN).waitUntilDone(),
    rubikMonoOne('normal', LATIN).waitUntilDone(),
    instrumentSans('normal', {...LATIN, weights: ['400', '700']}).waitUntilDone(),
    bebasNeue('normal', LATIN).waitUntilDone(),
    michroma('normal', LATIN).waitUntilDone(),
    yellowtail('normal', LATIN).waitUntilDone(),
    titanOne('normal', LATIN).waitUntilDone(),
    monoton('normal', LATIN).waitUntilDone(),
    syne('normal', {...LATIN, weights: ['700', '800']}).waitUntilDone(),
    bungee('normal', LATIN).waitUntilDone(),
    rampartOne('normal', LATIN).waitUntilDone(),
    jost('normal', {...LATIN, weights: ['400', '600']}).waitUntilDone(),
  ]);
  return pending;
};
