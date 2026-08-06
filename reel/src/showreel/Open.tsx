import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {beatF} from '../music';
import {ACC, GRAIN_URL} from '../theme';
import {ARIAL} from './ui';
import {JOST} from '../fonts';
import {GoogleMark, GOOGLE_ASPECT, Magnifier} from './googleMark';
import {SerpBody, TILE_H} from './serpBody';


import {CardGround} from './buildCard';
import {UrlStorm, GoogleG, Melt} from './urlStorm';
import {DropLine, SwapLine, UnwindLine, NoiseWord} from './lines';
import {StockFlip, FLIP_DUR} from './stockFlip';
import {WordFlip, WORD_FLIP_DUR} from './wordFlip';
import {Stats, STATS_DUR} from './stats';

/* ── THE OPEN ──────────────────────────────────────────────────────────────
   1  the hook types onto black
   2  its caret opens into a BIG centred search field, hook text still inside it
   3  the field stays big and in your face; the page behind it arrives already
      out of focus
   4  hook clears, cursor clicks, a trade is typed, and the trades flip while the
      field GROWS and the surround blurs FURTHER — the two together are the
      "there are thousands of these" beat
   5  the field flies to the results header as the page snaps sharp, and the
      scroll runs continuously away

   WHY THE FIELD STAYS BIG. The previous cut shrank the hook 3.1x → 1x and flew it
   into a top-left corner at the exact frame the track arrived — the picture got
   smaller as the music got louder. It also revealed the whole Google page 240
   frames before anything used it, and then had to scale the tiny field back UP 9%
   for the drop, so two moves fought each other. Now there is one continuous
   growth, and the page reveal is welded to the scroll that needs it.
   ─────────────────────────────────────────────────────────────────────────── */

const LINE = "It's hard getting found.";
/* 32 again — but in the SAME 144-frame window as the 24 were, because the rate
   doubles on bar 5. Denser, not longer. First 16 at 6 frames, last 16 at 3. */
const TRADES = [
  'barber', 'plumber', 'roofer', 'joiner', 'tiler', 'plasterer',
  'locksmith', 'gardener', 'decorator', 'builder', 'cleaner', 'scaffolder',
  'glazier', 'landscaper', 'painter', 'welder',
  'carpet fitter', 'gas engineer', 'tree surgeon', 'window cleaner',
  'bricklayer', 'handyman', 'chimney sweep', 'aerial installer',
  'mobile mechanic', 'dog groomer', 'pest control', 'removals',
  'kitchen fitter', 'bathroom fitter', 'driveway company',
  'fencing contractor', 'oven cleaner',
  /* 34 → 47. Three bars and three rate steps need the names to fill them, and
     "there are thousands of these" is carried by how many go past rather than by
     how long the passage runs. 47 exactly: one held through the opening beat,
     then 12 at six frames, 18 at four and 16 at three. Any more and they would
     never be reached; any fewer and it would run out before the bar does. */
  'upholsterer', 'stonemason', 'damp specialist', 'loft converter',
  'garage door fitter', 'blind fitter', 'gutter cleaner', 'drain unblocker',
  'jet washing', 'man with a van', 'security installer', 'underfloor heating',
  'log burner fitter', 'appliance repair', 'skip hire', 'sash window repair',
  /* 50 → 58. The flip now starts on the cut at beat 10 rather than a beat or
     two into a transition, which buys the first rate step 24 trades instead of
     16. The count has to track the span exactly — too few and the last name
     sits through four changes at the fastest rate, too many and they are never
     reached. */
  'curtain fitter', 'french polisher', 'garden clearance', 'tv mounting',
  'floor sander', 'wallpaper hanger', 'garage conversion', 'shower installer',
  /* electrician stays last: the flip has to end on it because it is the query
     the field is left holding when it collapses */
  'electrician',
];

type Ev = {t: number; n: number; kind: 'key' | 'space'};

/* One word per beat, characters flurrying inside it — the same construction as
   the opening hook, and for the same reason. Used for both. */
const wordBursts = (words: string[], at: number[], gap: number): Ev[] => {
  const out: Ev[] = [];
  let acc = 0;
  words.forEach((w, wi) => {
    const chars = (wi ? ' ' : '') + w;       // the spacebar leads each later word
    const start = at[wi] - (chars.length - 1) * gap;
    [...chars].forEach((ch, ci) => {
      acc += 1;
      out.push({t: Math.round(start + ci * gap), n: acc, kind: ch === ' ' ? 'space' : 'key'});
    });
  });
  return out;
};

/* ── THE HOOK, ON THE KICK ─────────────────────────────────────────────────
   Measured, the first three bars of the track are almost nothing but kick:
   below-200Hz sits at 0.24-0.26 while 1.2kHz reads 0.0007 and above-5kHz reads
   0.001-0.010. There is no top end at all — it arrives later (above-6kHz is
   0.040-0.057 by 32s). So the opening was sparse music under a sparse picture,
   both empty at once, which is what read as flat.

   The fix is to stop fighting the kick and marry the line to it: one WORD per
   beat instead of 24 evenly spaced characters. Four hits on four kicks, the last
   landing on the bar-2 downbeat. It is also truer to typing — people type in
   bursts with pauses, not at a metronomic 4 frames per key — so the characters
   flurry inside each beat rather than being spread across it.

   Beat 0 is a lone blinking caret. The film previously just started typing at
   frame 8 with no cursor established. */
const BEAT = (60 / 150.1) * 60;                 // 23.976

/* ── THE TRACK STARTS 2 BARS EARLIER; THE PICTURE DOES NOT MOVE ────────────
   showreel-2bar.wav is cut at 19.642s of so-freaky rather than 22.840s. Two
   bars is 3.198s; two SECONDS would have been 5.003 beats and put frame 0 on an
   off-beat, which would have broken the grid the entire film is timed against.

   The first attempt shifted every visual event 2 bars later to keep it over the
   music it was tuned to. That was wrong: the drop moved 2 bars later as well, so
   the runway to it was unchanged and the 3.2s went into a caret on black. The
   point of moving the music was to lengthen the film BEFORE the drop, and you
   only get that by leaving the picture where it is.

   So every frame number here is the original one. What changed is what plays
   underneath: the opening now runs over the track's intro (a filter sweep) in
   place of the bare kick. Measured kick onset per beat through the new front:
     beat 1  .190   2  .214   3  .218   4  .223
     beat 5  .230   6  .243   7  .326   8  .238
     beat 9  .381  ← the sweep ends and the main loop starts, at frame 192
   Every beat still carries a kick, so nothing in the opening lands on silence,
   and the flood at 192 lands on the largest step in the sequence (.238 → .381).
   Runway from the end of the scroll to the drop: 24.0s → 27.2s. ── */

const WORDS = ["It's", 'hard', 'getting', 'found.'];
const WORD_AT = [1, 2, 3, 4].map((n) => beatF(n));   // 24, 48, 72, 96 — COMPLETION
const TAP_GAP = 1.7;

/* ── HITTING A BEAT ────────────────────────────────────────────────────────
   The eye reads an ease-out move as having arrived at roughly 90% of its
   travel, not at 100%. A 6-frame SNAP move reaches 90% about 2 frames in — so
   a move that STARTS on the downbeat is perceived 2-3 frames (33-50ms) after
   it, and that is precisely the "almost on the beat" miss.

   Every landing move therefore starts LEAD frames early and runs to LAND after,
   which puts the perceived arrival within half a frame of the beat.

   These two are the SIX-FRAME case, which is all they were ever solved for.
   Anything of a different duration goes through lands() below instead. */
const LEAD = 2, LAND = 4;

/* ── LANDING ON THE BEAT, NOT LEAVING ON IT ────────────────────────────────
   Two things were wrong here and they compounded.

   1. THE BURST STARTED ON THE BEAT. A word beginning on the downbeat finishes
      after it, so the eye reads the arrival late — which is exactly the "almost
      on the beat" feel. Motion has to ARRIVE on the beat, not depart from it.
      So WORD_AT is now the frame the word COMPLETES and the burst is rolled
      back ahead of it.

   2. SIGHT AND SOUND DISAGREED. The keystrokes fired per character while the
      text appeared per whole word, so you heard four taps and saw one event.
      The text is now built from the same tap list that triggers the audio, so a
      character cannot appear without its keystroke or the other way round. */
const FULL_LINE = WORDS.join(' ');
const TAPS = wordBursts(WORDS, WORD_AT, TAP_GAP);
const TYPE_END = WORD_AT[3] + 14;

/* ── THE GRID, mapped onto the track's measured build ──────────────────────
   Per-bar energy of the NEW file. Bars 1-2 are the track's intro; bar 3 onward
   is what the film was originally cut against, shifted 2 bars later in time:
     bar 1  f  0   mid .091  high .067   kick .19-.22   the sweep, wide open
     bar 2  f 96   mid .057  high .021   kick .23-.33   filter closing
     bar 3  f192   mid .027  high .0062  kick .38-.43   THE LOOP STARTS
     bar 4  f288   mid .024  high .0010  the sparsest bar in the track
     bar 5  f384   mid .059  high .0028  mids arrive — 2.5x
     bar 6  f480   mid .094  high .0089  mids build
     bar 7  f576   mid .116  high .0289  MIDS PEAK + HIGHS 3x
     bar 8  f672   mid .113  high .0472  highs build

   THE OPENING NOW SITS OVER THE INTRO, and the events line up better than they
   did, not worse. The four words land on beats 1-4 of the sweep; the three-step
   field build answers beats 5, 6 and 7 — and beat 7 is the hardest kick in the
   whole intro (.326, a 34% jump on its neighbours), which is where the second
   build step now lands. The flood at 192 lands on beat 9, the largest step in
   the sequence (.238 → .381): the exact frame the sweep resolves and the main
   loop begins. That is a bigger structural event than the mid-band arrival it
   used to sit on.

   Bar 4 is dead music: the field opened in one 16-frame move and nothing
   answered its kicks. Holding through the sparsest bar is defensible, but a
   pulse against stillness is not — so the field BUILDS across those kicks in
   three steps and resolves on bar 3.

   Bar 7 was the worst miss: the largest musical event in the span passed with
   the flip already running and nothing marking it. The flip rate now DOUBLES
   there. ── */
/* ── THE INTRO, REASSIGNED ─────────────────────────────────────────────────
   Measured per HALF beat, the track's floor turns upward at frame 300-324 — the
   ramp starts at beat 13, not at bar 5. Per-BAR averaging had hidden it, because
   the rise begins inside bar 4 and the bar's low first half dragged the mean
   down. So the search animation belongs from beat 13, and everything before it
   is intro and must carry only the intro.

   Which left the four hardest kicks in the whole opening with nothing on them.
   Onsets: beats 5-7 are .243 / .326 / .238, and beats 8-11 are .381 / .383 /
   .392 / .426. The field was building on the soft ones.

     beats 1-4    hook types, a word a beat
     beats 5-10   the line is WORKED — six beats of treatment, one change each
     beat 11      the field opens, ONE continuous move
     beat 12      the page floods — and the query swaps in behind it, unseen
     beat 13      the flip, exactly where the ramp turns

   Nothing is typed into the field. The expansion covers the content change, so
   the box you typed a thought into turns out to be a box someone is searching
   in — and no search-animation event ever lands on an intro beat. */
const M = 192;                        // the B() origin, kept so downstream holds

/* ── FIVE STATEMENTS, NOT ONE SENTENCE TREATED ─────────────────────────────
   The last cut ran one sentence through six renderings of itself — caps, lower,
   caps, colour. It read slow, and the reason is that a case change is a TEXTURE
   device: the eye absorbs it in three frames and then waits out the other
   twenty-one. Held for a whole beat each, every state becomes a frame you read
   rather than a flicker you feel.

   A new STATEMENT, by contrast, takes the whole beat to read. The event
   duration finally matches the beat duration, so nothing has to move faster.
   And the opening starts making the argument instead of decorating it.

     beats 1-4  It's hard getting found.    types, a word a beat
     beat 5     It's hard getting chosen.   the tail swaps
     beat 6     It's hard standing out.     hard cut, bigger
     beat 7     It's hard growing.          vertical roll — and the frame inverts
     beat 8     It's hard.                  the tail is eaten
     beats 9-10 (holds, creeping)
     beat 11    the field opens around it

   THE SHARED STEM IS A SPEED TRICK. Every line runs "It's hard ___", so the eye
   only has to read the changed tail — the substance of a new statement at the
   reading cost of one word. And the tail SHORTENS every time: three words, two,
   one, none. The sentence is being eaten down to its own core, which is why
   four repetitions of the same stem read as a structure rather than a list.

   Sizes climb 92 → 148 as the words fall away, so the line holds roughly its
   width while the type gets heavier. 148 is deliberately under the 168 that
   LEADS gets in the back half — nothing here may outrank the payoff. */
const SAY_AT = [5, 6, 7, 8].map((n) => beatF(n));   // 120, 144, 168, 192
const STATEMENTS = [
  {head: "It's hard getting", tail: ' found.', size: 92, inv: 0},
  {head: "It's hard getting", tail: ' chosen.', size: 92, inv: 0},
  {head: "It's hard standing", tail: ' out.', size: 124, inv: 0},
  {head: "It's hard", tail: ' growing.', size: 84, inv: 1},
  {head: "It's hard.", tail: '', size: 160, inv: 0},
];
const LAST_SAY = STATEMENTS.length - 1;
/* ── WHERE THE HOLD GOES ───────────────────────────────────────────────────
   The last statement landed on beat 8 and the box opened on beat 11, which left
   beats 9 and 10 carrying nothing but a creep — two beats of dead air at the
   end of an intro that was rebuilt specifically to stop having any.

   The box now opens on beat 10 instead, so the hold is one beat on the
   statement (its emotional peak) and one beat on the field afterwards (the
   reveal that the sentence was in a search box all along). Every beat from 8 to
   13 now has something either arriving or settling on it. */
const SAY_HOLD_END = beatF(10);       // 240

/* ── LANDING ON THE BEAT, PROPERLY ─────────────────────────────────────────
   LEAD 2 / LAND 4 was right, but only by accident of duration. Solving the
   actual curves for the point the eye reads as ARRIVED — y=0.9 for a plain
   ease-out, the first crossing of y=1.0 for an overshoot, since an overshoot is
   perceived as having landed when it first reaches the target rather than when
   it settles back onto it:

     SNAP   bezier(.16,1,.3,1)      y=0.9 at 0.330 of the move
     OVER   bezier(.34,1.56,.64,1)  y=1.0 at 0.370
     SETTLE ease-out cubic          y=0.9 at 0.541
     INOUT  bezier(.5,0,.2,1)       y=0.9 at 0.642

   A 6-frame SNAP therefore leads by 1.98 frames, which is where LEAD=2 came
   from — but a 22-frame INOUT leads by 14.1, and using 2 there lands it twelve
   frames early. Every move below is placed through `lands()` so the duration
   and the curve decide the offset, not a constant that happened to fit one
   case. */
const ARRIVE = {snap: 0.330, over: 0.370, settle: 0.541, inout: 0.642};
const lands = (beat: number, dur: number, at: number): [number, number] =>
  [beat - at * dur, beat + (1 - at) * dur];

/* ── THERE IS NO TRANSITION INTO THE SEARCH BOX ANY MORE ───────────────────
   Five versions of one were built and every one of them was clunky: a four-step
   staircase, a single 22-frame gesture, a highlight that became a field, a
   white flood, and finally a character scramble that morphed the sentence into
   the query. Each fixed the specific fault of the one before it and each still
   read as forced.

   They were all failing for the same reason, which is not a timing problem and
   could not be solved by re-timing. "It's hard." and "barber near me" are not
   two states of one object — they are two REGISTERS. One is Loomwork speaking:
   Jost 700, centred, black on grey, a thought. The other is a machine artifact:
   Arial 400, left-aligned in a UI chrome, on a white page. Every transition
   between them was making a CONTINUITY claim — that this thing became that
   thing — which is not true, and an animation asserting something the audience
   can see is untrue always reads as effort.

   So the claim is dropped. The statements end as statements and the search
   arrives as a CUT. The contrast IS the transition: the biggest type in the
   opening, black on grey, holding — then white, a search box, and a query
   already running away with itself. The audience connects them because they are
   adjacent, which is how film has always done it, and it is the grammar this
   film uses at every other join.

   ── WHY BEAT 10 ─────────────────────────────────────────────────────────
   Bar 3 is beats 9-12 (216, 240, 264, 288), so 240 is the SECOND beat of the
   bar — the snare. A scene change wants a strong position and this is the
   strongest one available: beat 9 would give the last statement a single beat
   like all the others and lose its emphasis, and beat 11 or 12 puts the search
   later than it already was, which is the note this passage keeps getting.

   It also means the last statement gets two beats where every other one gets
   one — held, creeping, the sentence closing itself — and then it is gone. */
const CUT_IN = beatF(10);             // 240 — the film cuts to the search
const PILL_A = CUT_IN;
const PAGE_AT = CUT_IN;
/* the box's pre-cut life is dead along with the transition, but the geometry it
   resolved TO is still what the field is, so the constants stay */
const HL_PAD = 14, HL_PADY = 10, HL_R = 12;
export const MUSIC_AT = 0;
/* The picture did not move but the file did, so the drop is 8 beats further out
   than it was: 2302 = 38.37s, where the highs collapse .055 → .035 → .025. */
export const CUT_AT = beatF(96);      // 2302 = 38.37s

const B = (n: number) => M + beatF(n);

/* ── THE FLIP IS ALREADY RUNNING ON THE FRAME WE CUT TO ───────────────────
   Nothing is typed, nothing morphs, and nothing waits. The first frame of the
   search is a search box with a query in it and a page behind it, and six
   frames later the query has already changed — so the passage the audience
   lands in is one that was in motion before they got there.

   That is the whole reason the cut works where five transitions did not: a cut
   INTO movement reads as an arrival, a cut into stillness reads as a slide. */
const FLIP_A = CUT_IN;                // 240 — same frame as the cut
const FLIP_MID = B(8);                // 384, bar 5 — the rate doubles on the accent
/* ── THREE RATES, NOT TWO ──────────────────────────────────────────────────
   It ran 6 frames a trade then 4, over two bars, 34 trades. Longer and faster
   both: three bars, three rates, 50 trades. Each step lands on a bar line, so
   the acceleration is something you hear as well as see.

     288 → 384   6 frames   16 trades
     384 → 456   4 frames   18 trades   (bar 7, the biggest accent in the span)
     456 → 504   3 frames   16 trades   (the last bar runs away with it)

   3 frames on its own was flicker when it was half the passage — nothing
   registered as a word. As the final third, after 6 and 4 have set the reference,
   it reads as the thing coming apart rather than as noise. */
const FLIP_T3 = B(11);                // 456 — rate 4 → 3
const FLIP_B = beatF(21);             // 504
/* where the riser starts. The mid band is flat on the beats for the whole
   search (.105-.236) and climbs only on the OFF-beats, from .238 here to .414
   at 20.5 — a bar and a half of build that the picture used to sit through. */
const RISER_A = beatF(16) + 12;       // 396 — beat 16.5
const R1 = 6, R2 = 4, R3 = 3;

/* the walk starts on the cut: the first entry is the query that is already
   in the box when the film arrives, and it gets one flip slot of stillness
   (240 → 246) before the first change */
const N1 = Math.round((FLIP_MID - FLIP_A) / R1);      // 24
const N2 = Math.round((FLIP_T3 - FLIP_MID) / R2);     // 18
const N3 = Math.round((FLIP_B - FLIP_T3) / R3);       // 16
/* ── THE DOCK IS DEAD, AND SO IS THE SCROLL ────────────────────────────────
   The field used to fly to a Google results header and the page then scrolled
   away under it. Four versions of that join and it was clunky in all of them,
   and the scroll itself said nothing the trade flip had not already said — with
   less to look at, and with no events in it at all.

   Both are gone. The field COLLAPSES where it stands, into its own centre, and
   the results come out of that point at the viewer. The frame it reaches zero is
   the frame the first domain leaves the origin: implosion into explosion, one
   event, on the beat. Nothing flies anywhere and nothing has to be handed over.

   The field is already dead centre — 1280x160 at (960, 540) — so "into the
   middle of the scene" costs no travel, only scale. ── */
const IMP_A = FLIP_B;                 // 504 — the flip ends, the field starts to go
const IMP_B = beatF(22);              // 528 — zero, and the storm's origin

/* ── THE STORM ─────────────────────────────────────────────────────────────
   Listings out of the origin the field just collapsed into, 216 frames of it,
   the rate climbing the whole way. They land and stay: by the end the frame is
   nothing but other people's businesses.

   Spawning stops at 744 but the last ones are still in flight after it, so the
   tail runs under the G rather than stopping dead at a boundary — the same rule
   as the implosion, nothing here ends before the next thing has started. ── */
const STORM_A = IMP_B;                // 528
const STORM_SPAWN_END = beatF(31);    // 744
const STORM_OUT_A = 900, STORM_OUT_B = 910;   // never reached — the cut ends it

/* ── THE G ─────────────────────────────────────────────────────────────────
   The bloom was four coloured corners fading up and down, which is a dissolve
   wearing Google's palette — soft where this needs to be hard.

   Instead: the moment the storm tops out, the Google G SLAMS on over the wall of
   results, the ground behind it takes one quick colour sweep, and then the whole
   thing CUTS to the card. No fade at either end. The G earns the colour — it is
   why the frame is allowed to go multicoloured for a third of a second — and it
   is the last thing you see of Google before the film stops being about Google. */
const G_AT = STORM_SPAWN_END;         // 744 — lands with the last volley
const G_BREAK = beatF(32);            // 767 — the wind-up ends, it comes apart
/* ── THE MELT RESOLVES IN 14 FRAMES, NOT 25 ───────────────────────────────
   The break is on beat 32, which is a bar downbeat measuring .368 and is
   exactly right. What was slow is the RESOLVE — a 25-frame dissolve handing
   over to the card, at the point in the track where the pace has picked up. At
   14 it is a snap out of the melt rather than a fade out of it, and the card is
   already there before the eye has finished reading the G coming apart. */
const G_OUT = G_BREAK + 14;           // 781 — gone, and the card is already there

/* The blurred results page behind the field goes as the storm builds. Leaving it
   would give the eye somewhere to rest, which is the opposite of the point. */
const SERP_OUT_A = 472, SERP_OUT_B = 518;

/* ── ACT 3: THE CARD, THEN THE BUILD ───────────────────────────────────────
   The card used to come AFTER the site and label what had already happened.
   Stating the claim first and then demonstrating it is the stronger order —
   problem, answer, proof — so it moves in front.

   The cut into it is hard, on the frame the scroll is at peak velocity and peak
   blur. Nothing is legible there, which is why it is the one frame in the film
   where a cut costs nothing.

   The card's ground then STAYS UP through the build: the website assembles on
   the same lit surface rather than cutting to black between them. One location,
   two beats of the same argument. */
const CARD_A = G_OUT;                 // 791 — the melt ends on it

/* ── THE SENTENCE ──────────────────────────────────────────────────────────
   The website build is gone — the whole thing, along with the browser frame and
   the client capture. In its place, four cards carrying one sentence, which is
   how the reference does it rather than four separate claims.

   Sizes escalate across every cut — 92 → 108 → 124 — because in M3 the cap
   height changes at every single one (46 → 57 → 75 → 37 → 46) and a cut at
   constant scale reads as a jump rather than a decision. Cards 2 and 3 share a
   size because they are not a cut: they are one card with a word swapped.

   Two beats each, which sits alongside the reference's measured 0.38-0.83s.

   ── EVERY ARRIVAL WAS ONE BEAT OFF THE BAR ────────────────────────────────
   Measured across this section, the bar downbeats are beats 32, 36, 40, 44, 48
   and 52, with low-band onsets of .368 / .390 / .414 / .436 / .366 / .386.
   Everything else sits at .17-.25.

   The cards were landing on beats 35, 37, 39, 41 and 43 — onsets .186 / .201 /
   .210 / .172 / .207. Not approximately off: all five, systematically, on the
   weakest beat available. LEADS, the payoff word of the entire sentence, was on
   .207 while the kick one beat later measures .436, the heaviest hit in the
   section. That is why it read as not matching the music, and it had nothing to
   do with duration.

   Everything from card 1 onward moves ONE BEAT EARLIER, which lands the
   arrivals on 34 / 36 / 38 / 40 / 42 — alternating downbeat and mid-bar, which
   is the correct reading of a two-beat phrase against a four-beat bar. The
   section also finishes 24 frames sooner than it did.

   Card 1's landing is the one that cannot be rescued: beats 33, 34 and 35 all
   measure ~.19 and there is no strong beat between the melt and beat 36. It
   keeps 34 because it is carried by the melt resolving into it, which is a large
   enough visual event to sell itself without a kick underneath.

   ── AND THEY WERE NEVER STILL ─────────────────────────────────────────────
   Card 1's letters took all 48 frames of its two-beat life to finish falling and
   it began leaving at 879, so it was assembling for 55% of its existence and was
   never once at rest. A card still mid-entry when it gets cut away reads as
   sluggish however short you make it. Every entry below is about a third of its
   card's life now; the creep keeps the hold alive, which is what the creep is
   for.

   ── AND THEN THE WHOLE SECTION WAS RUNNING AT A QUARTER OF THE PULSE ──────
   Two beats a card is 48 frames. Measured across this exact window, the kick is
   on an EIGHTH-note grid — 12 frames — and the off-beats are not filler, they
   are the heaviest hits in the section:

     beat  34  .382     34.5  .801
     beat  36  .774     36.5  .859
     beat  42  .427     42.5  .840
     beat  44  .889     44.5  .899

   So the picture was placing one event for every four the track played. That is
   the "doesn't match the fast rhythm" note, and no amount of re-choosing WHICH
   beat to land on could have fixed it — the rate itself was wrong.

   Everything from card 2 on now runs ONE beat, and the events that used to
   happen inside a card's hold are placed on the half beats the track is already
   hitting. Seven events across six beats where there used to be five across
   ten: 781 → 959 rather than 781 → 1055.

   Card 1 keeps a beat and a half. It is the only card whose entrance is a
   26-letter cascade, and at one beat it would still be assembling when it was
   cut away — which is the specific sluggishness this section was fixed for
   once already. It leaves on 34.5, the .801, so its exit lands on a hit rather
   than filling the gap before one. ── */
const SAY_1 = CARD_A;                 // 781 — letters begin to fall
/* -3 because `landAt` is when the LAST letter starts its 9-frame fall, and an
   OVER curve is read as arrived 32% in. The line completes on beat 34, holds
   one half beat, and leaves on the next hit. */
const SAY_1_LAND = beatF(34) - 3;     // 812 — last letter down
/* card 1 does not sit and wait to be cut away from: its letters resume falling
   and drop out of frame while card 2 rises into the hole. The two overlap by
   sixteen frames, so it is one vertical push rather than two events. */
const SAY_1_OUT = 827;                // beat 34.5 — the .801
const SAY_1_GONE = 851;
/* -4: the card rises over 11 frames on an OVER curve, so it has to leave the
   floor ahead of the beat to be read as arriving on it */
const SAY_2 = beatF(35) - 4;          // 835 — rises from below, lands on beat 35
const SAY_SWAP = beatF(36) - 3;       // 860 — the squeegee, 9 frames on SNAP
const SAY_2_OUT = 875;                // beat 36.5 — the .859, the biggest hit here
const SAY_2_GONE = 891;
const SAY_4 = beatF(37) - 4;          // 883 — the melt, backwards, onto the bar line
const SAY_4_SET = beatF(37) + 12;     // 899 — assembled by the half beat
/* the NOISE move: ten frames, measured. Huge on the old ground, shrinks hard,
   lands small on the new one with the colour inverted on the way through. */
const LEADS_IN = beatF(38);           // 911
const LEADS_LAND = 922;
/* LEADS keeps its full two beats — the sentence got faster, the payoff did not.
   It is still on screen when the first message arrives. */
const LEADS_GONE = beatF(40);         // 959 — it shrinks away rather than parking

/* ── THE LEADS ARRIVE ──────────────────────────────────────────────────────
   One a beat, consistent — deliberately NOT accelerating. The storm already
   escalated, and doing it twice means the second one cannot top the first. A
   steady groove is a different gear, and it keeps every message readable, which
   here is the entire point: the storm's job was that you cannot read them, this
   one's job is that you can.

   Eight of them over two bars. Four fit the frame, so the last four arrive by
   pushing the earlier ones out of the bottom — which is what turns four cards
   into a sense of volume. */
const SAY_END = beatF(40);            // 959 — the sentence hands straight to the flip

/* ── THE BACK HALF ─────────────────────────────────────────────────────────
   The eight-bar platform run and the four-bar stock flip are their own
   compositions, dropped in on Sequences so each keeps its internal frame
   numbering. Every boundary is a bar line. */
/* ── THE BACK HALF, REORDERED ──────────────────────────────────────────────
   It ran sentence → leads → stock flip. The leads section is gone and the flip
   has moved up into its slot, because the flip and the statistics that will
   follow it are the same claim told twice — 192 businesses saying "whoever you
   are, whatever you do", and 50+ clients / 30+ industries saying it as a
   number. Evidence before claim is backwards, and it is why the back half felt
   like a list rather than an argument.

   Every attempt at a section between LEADS and the flip was turned down for
   good reasons — platforms, jobs, invented counts — and the reason none of them
   worked is that the slot did not need filling. LEADS is a strong enough word
   to carry its own beat and hand straight over.

   ── THE THIRTEEN BARS ───────────────────────────────────────────────────
   From the end of the sentence at 959 to a bar-aligned out at 2207 (36.8s,
   where the film sat before all the shortening) there are exactly 13 bars. The
   track never resolves — it runs flat at RMS .24-.38 to 41.5s and then simply
   stops — so there is no ending to land on and the audio gets a hard cut and a
   short fade wherever the picture decides to stop.

     2 bars    959 → 1151   the stock flip          BUILT
     4 bars   1151 → 1535   "we'll help your business [grow]"  BUILT
     3 bars   1535 → 1823   the statistics                   TO BUILD
     4 bars   1823 → 2207   the mark                         TO BUILD

   The flip gave up two of its four bars — six and a half seconds of images at
   thirty cuts a second stopped being overwhelming and started being long — and
   the word run took one of them, because an accelerating list needs somewhere
   to accelerate.

   FILM_END tracks what EXISTS, not what is planned, so the composition never
   renders bars of nothing while the rest is being built. */
const FLIP_AT = beatF(40);                    // 959
/* ── THE TWO JOINS ROUND THE FLIP ──────────────────────────────────────────
   Both were placeholders. The flip's own source called its exit "a placeholder
   for the join into the M3 section", and its entrance was LEADS scaling up and
   then a hard cut — the word getting out of the way rather than handing over.

   IN · LEADS becomes a WINDOW. The images play inside the letterforms for the
   last twenty-three frames, and the word scales up past the camera until the
   letters are wider than the frame and all that is left is the barrage. The
   pictures come OUT of the word rather than after it, which is the only
   reading that makes the join causal: leads, and here is who they come from.

   The obvious alternative — LEADS imploding to a point with the images
   exploding out of it — is what the field does into the storm seven seconds
   earlier, so it would land as a repeat rather than as an idea.

   The portal uses images 180-191, which the flip itself never reaches: it runs
   96 shots off a 192-image library, so the back half is free.

   OUT · the MEANDER sweeps the paper in — the same mark the word section draws
   forty frames later, used here as the wipe. The transition and the section
   that follows it are then made of the same thing.

   It also fixes a real mismatch: the flip wiped to a flat #F4F2ED, which was
   the word section's ground before that section moved onto CardGround. The
   join was stepping from a flat grey to a lit gradient. It now reveals
   CardGround itself. */
const PORTAL_A = FLIP_AT - 23;                // 936
const MEANDER_A = 1134;                       // 17 frames into the join at 1151
const CLAUSE_AT = FLIP_AT + FLIP_DUR;                   // 1151
export const STATS_AT_PLAN = CLAUSE_AT + WORD_FLIP_DUR; // 1535
export const MARK_AT_PLAN = STATS_AT_PLAN + STATS_DUR;  // 1919
export const OUT_PLAN = MARK_AT_PLAN + 384;             // 2303 = 38.4s
const FILM_END = STATS_AT_PLAN + STATS_DUR;   // 1919 — the statistics are the last built thing

const L1 = 'a digital marketing agency';
const L2_PRE = 'that builds the ';
const L4 = 'to generate you';

export const OPEN_DUR = FILM_END;     // 1535 = 25.6s (grows to 2207 as the last two land)

/* ── geometry ── */
const W = 1920, H = 1080, CX = W / 2;
const SCALE = 1.7;
const FS = Math.round(16 * SCALE);              // 27 — the field's native type size

/* the BIG field: commanding, but still 8:1 so it reads as a search box */
const BIG_W = 1280, BIG_H = 160, BIG_CY = 540;
const BIG_X = (W - BIG_W) / 2;                  // 320
const BIG_TOP = BIG_CY - BIG_H / 2;             // 460
const BIG_R = BIG_H / 2;
const BIG_PADX = 60, BIG_ICON = 72, BIG_GAP = 36;
const BIG_TEXT_X = BIG_X + BIG_PADX + BIG_ICON + BIG_GAP;   // 488
const BIG_TEXT_SCALE = 2.3;                     // 62px type
/* 0.094 → 0.36. The 9% creep was sized for a cut where the field then flew off
   to a results header and a scroll took over, so it could not afford to commit.
   Nothing follows it now except its own collapse, so it can: 1280x160 becomes
   1741x218, which is 91% of the frame's width with 90px of margin either side.
   The type goes with it at 3.13x — 84px — and the longest query in the list
   ("underfloor heating near me", 26 characters) still clears the box by 340px. */
const GROW = 0.36;                              // → 1741 x 218, type 84px

/* the results header it flies to */
const BAR_W = 1120, BAR_H = 76, BAR_TOP = 58;
const BAR_X = 300;
const BAR_CY = BAR_TOP + BAR_H / 2;
const BAR_R = Math.round(26 * SCALE);
const PADX = Math.round(20 * SCALE), ICON = Math.round(24 * SCALE), GAP = Math.round(13 * SCALE);
const TEXT_X = BAR_X + PADX + ICON + GAP;
const HEADER_H = BAR_TOP + BAR_H + 79;
const LOGO_W = 175, LOGO_X = 72;

/* only the vertical anchor survives the move to per-statement sizing: the
   statements are centred on their own measured widths at render, so there is no
   longer a single STATEMENT_X or STATEMENT_SCALE for the layout to hang on. */
const STATEMENT_CY = 520;

/* ── THE STATEMENTS ARE IN THE BRAND VOICE, NOT GOOGLE'S ───────────────────
   Arial was here because the field is a Google search box and its query has to
   be Arial to be believable. But the OPENING is not a search box yet — it is
   the film talking — and a 400-weight system sans reads thin and anonymous
   against the heavy Jost the four cards use in the back half. The film should
   open and resolve in one voice.

   So the statements are Jost 700 at the cards' own tracking, and the type
   reverts to Arial at the flood, where twelve frames of expansion already cover
   the text swap. Between the field opening on beat 11 and the flood on beat 12
   there is a white rounded box holding a heavy sentence — which is correct,
   because there is no Google page behind it yet. It only becomes a Google
   search field at the moment a Google page arrives. */
const SAY_TRACK = '-0.018em';
const sayW = (t: string, size: number) => (t ? measureText({
  text: t, fontFamily: JOST, fontSize: size, fontWeight: '700', letterSpacing: SAY_TRACK,
}).width : 0);
/* what the last statement measures once it is sitting in the field. 2.6x FS is
   70px — heavier than the 62px Arial query it hands over to, because Jost at
   700 needs the extra to hold the box without the box looking empty. */
const FIELD_SAY_SIZE = Math.round(FS * 2.6);                // 70
/* one base size everything is a multiple of, so a scale and a measured width
   can never disagree. 100 because the statements live between 92 and 148. */
const SAY_BASE = 100;
/* how far a line travels on the roll — 1.15 line-heights, so it is properly
   out of the way rather than clipping the incoming one */
const ROLL_H = Math.round(SAY_BASE * 1.5);
/* the slot the roll happens in. Without it both lines are legible at the
   midpoint and it reads as a two-line paragraph rather than one line replacing
   another; masked, you see the bottom of the outgoing and the top of the
   incoming, which is what a roll actually looks like. */
const ROLL_BAND = 170;
/* what the last statement measures once it is sitting in the field, which is
   what the boxs right-hand padding has to resolve to */
const LAST_SAY_W = sayW(STATEMENTS[STATEMENTS.length - 1].head, FIELD_SAY_SIZE);

const G_INK = 'rgba(0,0,0,.87)';
const G_LINE = '#dadce0';
const SNAP = Easing.bezier(0.16, 1, 0.3, 1);
const SETTLE = Easing.out(Easing.cubic);
const OVER = Easing.bezier(0.34, 1.56, 0.64, 1);
const CREEP = Easing.in(Easing.quad);           // gradual, back-loaded growth
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Grain: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{
    backgroundImage: `url("${GRAIN_URL}")`, backgroundRepeat: 'repeat',
    backgroundPosition: `${(f * 37) % 240}px ${(f * 61) % 240}px`,
    opacity, pointerEvents: 'none',
  }} />;
};

export const Open: React.FC<{keys?: boolean}> = ({keys = true}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const k = width / W;

  /* ── what the field says ── */
  const charsShown = TAPS.reduce((n, e) => (e.t <= f ? e.n : n), 0);
  const flipRate = f < FLIP_MID ? R1 : f < FLIP_T3 ? R2 : R3;
  const flipIdx = Math.min(TRADES.length - 1, Math.max(0,
    f < FLIP_MID ? Math.floor((f - FLIP_A) / R1)
      : f < FLIP_T3 ? N1 + Math.floor((f - FLIP_MID) / R2)
        : N1 + N2 + Math.floor((f - FLIP_T3) / R3)));
  /* ── WHICH STATEMENT IS ON SCREEN ────────────────────────────────────────
     Every join is a cut, so this is an index lookup rather than an
     interpolation. The transitions decorate the frames either side of the cut;
     none of them owns which words are showing. */
  const si = SAY_AT.reduce((n, t, i) => (f >= t ? i + 1 : n), 0);
  const say = STATEMENTS[si];
  const prev = STATEMENTS[Math.max(0, si - 1)];
  /* statement 1's life starts when it FINISHES typing, not at frame 0 — the
     creep is for a line that is sitting there, and this one is still arriving */
  const cutAt = si === 0 ? WORD_AT[WORD_AT.length - 1] : SAY_AT[si - 1];
  const invert = say.inv;

  /* ── STATEMENT 1: TYPES, A WORD A BEAT ──────────────────────────────────
     Only the first one is typed. It is the first thing in the film and the
     audience has to be told somebody is writing this; after that the film has
     permission to simply cut, and every later statement arrives whole. */
  const typed = FULL_LINE.slice(0, TAPS.reduce((n, e) => (e.t <= f ? e.n : n), 0));
  const head = si === 0 ? typed.slice(0, Math.min(typed.length, say.head.length)) : say.head;
  const tail = si === 0 ? typed.slice(say.head.length) : say.tail;

  /* ── WHAT `lands()` DOES AND DOES NOT APPLY TO ──────────────────────────
     Leading a move so its perceived arrival is on the beat only works if the
     thing can be shown BEFORE the beat. Words cannot: showing the next
     statement early to make it "arrive" on the downbeat means the audience has
     already read it by the time the kick hits, and the beat marks nothing.

     So the rule is: a CONTENT change is a cut, landing on the exact frame, and
     a hard cut is the strongest beat marker there is. Only TRAVEL — something
     moving through space that can start off-screen — gets lands(). Anything
     attached to a cut is either an anticipation on the outgoing words or a
     settle on the incoming ones, and neither is the event.

     STATEMENT 2 — the tail swaps. "getting found." → "getting chosen.": the
     stem is identical, so the eye reads one word instead of a sentence. The cut
     is the beat; the new word then swells from 82% out of its own left edge, a
     settle, not the arrival. */
  const swap = si === 1
    ? interpolate(f, [SAY_AT[0], SAY_AT[0] + 8], [0.82, 1], {easing: OVER, ...clamp})
    : 1;

  /* STATEMENT 3 is a hard cut with no decoration at all — the M3 move, and the
     only way to establish that a cut on its own is enough. */

  /* STATEMENT 4 — the vertical roll. This one IS travel: the outgoing line
     rolls up out of frame while the incoming one comes up from below into the
     hole, so the new words are legitimately off-screen beforehand and lands()
     applies. Eight frames, motion-blurred so it reads as one push rather than
     two teleports. The frame inverts to the brand on the beat itself. */
  const [RL_A, RL_B] = lands(SAY_AT[2], 8, ARRIVE.snap);
  const roll = interpolate(f, [RL_A, RL_B], [0, 1], {easing: SNAP, ...clamp});
  const rolling = f >= RL_A && f < RL_B;
  const rollBlur = rolling
    ? Math.min(9, Math.abs(roll - interpolate(f - 1, [RL_A, RL_B], [0, 1], {easing: SNAP, ...clamp})) * ROLL_H * 0.055)
    : 0;

  /* STATEMENT 5 — the tail is eaten. " growing." is not cut away, it is
     squeezed out of existence: scaleX to zero from its own left edge across
     five frames, finishing ON the beat, with the line re-centring as it goes so
     the remaining words pull themselves together. That is an anticipation on
     the OUTGOING words, which is allowed — they are already on screen. Then the
     cut, and what is left swells to the biggest size in the passage with the
     full stop arriving on it, so the sentence visibly closes itself. Three
     words, two, one, none. */
  const EAT_A = SAY_AT[3] - 5;
  const eat = si === 3 ? interpolate(f, [EAT_A, SAY_AT[3]], [1, 0], {easing: SNAP, ...clamp}) : 1;
  const punchUp = si === 4
    ? interpolate(f, [SAY_AT[3], SAY_AT[3] + 8], [prev.size / say.size, 1], {easing: OVER, ...clamp})
    : 1;

  /* ── THE CREEP ───────────────────────────────────────────────────────────
     Every statement grows slowly for its whole life, the same trick the four
     back-half cards use: four hard cuts against dead stillness reads as a
     slideshow, whereas a cut that interrupts movement reads as a decision.

     The RATE is fixed, not the amount. The cards hold two beats and creep 9%;
     copying that number here would have these one-beat statements creeping
     twice as fast, and — worse — a 9% creep against a 12% size step means each
     statement has almost caught up with the next one's size before the cut
     lands, so the cuts get progressively weaker exactly as they should be
     getting stronger. At a fixed 0.19%/frame a one-beat statement gains 4.5%
     and the three-beat hold on the last one gains 13%, which is the pressure
     building into the transition. */
  const CREEP_RATE = 0.0019;
  const creepTo = si >= LAST_SAY ? SAY_HOLD_END : SAY_AT[si];
  const sayCreep = interpolate(f, [cutAt, creepTo], [1, 1 + CREEP_RATE * (creepTo - cutAt)],
    {easing: Easing.inOut(Easing.quad), ...clamp});

  /* the query takes over at the flood, where twelve frames of expansion mean
     nothing in the field is legible anyway — and the typeface reverts with it */
  const isQuery = f >= FLIP_A;
  const text = isQuery ? `${TRADES[flipIdx]} near me` : head + tail;

  /* When the only instrument is a kick drum, nothing in the picture responding to
     it is what reads as flat. Two frames of lift per beat, black act only.

     The amplitude now tracks the MEASURED kick rather than sitting flat, because
     the opening no longer plays over a constant one. Onsets run .19 through bar 1
     and .23-.33 through bar 2 before stepping to .38 at the flood, so a flat
     pulse would have the picture hitting harder than the track for two bars. */
  const kick = f < CUT_IN
    ? interpolate(f % BEAT, [0, 3.2],
        [interpolate(f, [0, 96, CUT_IN], [0.028, 0.036, 0.055], clamp), 0],
        {extrapolateRight: 'clamp'})
    : 0;

  /* ── the growth: a small step ON the drop so the beat lands, then a gradual,
     back-loaded creep across the whole flip. Released at the handoff. ── */
  const step = interpolate(f, [FLIP_A, FLIP_A + 5], [0, 1], {easing: SNAP, ...clamp});
  const creep = interpolate(f, [FLIP_A + 5, FLIP_B], [0, 1], {easing: CREEP, ...clamp});
  const grown = 0.23 * step + 0.77 * creep;                    // 0 → 1 across the flip
  /* Pinned at 0: the field no longer travels anywhere, so every lerp that used
     to carry geometry to the results header holds at its BIG value. Kept as a
     named constant rather than ripped out because it also gates the header
     furniture, the surround blur and the zoom release — one place to reverse
     this if the dock ever comes back. */
  const hand = 0;

  /* ── THE COLLAPSE ────────────────────────────────────────────────────────
     Easing.in, so it accelerates INTO the point. The field is not settling
     somewhere, it is being swallowed — and it has to be travelling at its
     fastest as it vanishes, because the domains leaving that point on the next
     frame inherit the motion. An ease-out here would have it arrive at rest and
     the storm would look like a separate animation starting. */
  /* cubic → poly(5). At cubic the collapse was half gone by the midpoint, which
     is why it read as soft: a 24-frame move that is visibly shrinking for the
     whole beat is a shrink, not a collapse. At the fifth power it barely moves
     for the first three quarters and then loses 76% of itself in the last six
     frames — the field holds its ground and then goes. */
  const imp = interpolate(f, [IMP_A, IMP_B], [0, 1], {easing: Easing.in(Easing.poly(5)), ...clamp});
  const zoom = (1 + GROW * grown) * (1 - hand) + 1 * hand;

  /* ── the surround: present from the cut, blurs FURTHER as trades pile up.
     The deepening is half the impact; the growth alone is not.

     A step, not a ramp. The page does not fade its own contents up — it is a
     cut, so everything on it is simply there, and the only thing that moves
     after the cut is the growth. ── */
  const arrive = f >= CUT_IN ? 1 : 0;
  const focusBlur = (4 * arrive + 7 * grown) * (1 - hand);
  const focusDim = (0.07 * arrive + 0.09 * grown) * (1 - hand);

  /* ── field geometry: BIG → header on the handoff ── */
  const barX = lerp(hand, BIG_X, BAR_X);
  const barTop = lerp(hand, BIG_TOP, BAR_TOP);
  const barW = lerp(hand, BIG_W, BAR_W);
  const barH = lerp(hand, BIG_H, BAR_H);
  const barR = lerp(hand, BIG_R, BAR_R);
  const barPad = lerp(hand, BIG_PADX, PADX);
  const barIcon = lerp(hand, BIG_ICON, ICON);
  const barCY = barTop + barH / 2;

  /* ── THE BUILD IS A STEP ─────────────────────────────────────────────────
     This was the field opening out of the sentence — a staircase, then one
     22-frame gesture, then a highlight becoming a box. All of it is gone with
     the transition it belonged to. Zero before the cut and one after it, which
     leaves every lerp that reads it doing exactly what a cut should do: the
     statement is at statement geometry, the query is at field geometry, and no
     frame is halfway between them. ── */
  const buildAt = (fr: number) => (fr >= CUT_IN ? 1 : 0);

  /* GROW WAS BEING APPLIED TWICE. It was multiplied in here AND again by `zoom`
     on the FOCUS group the text sits inside, so the type grew by (1+GROW)² while
     the field around it grew by (1+GROW). At 0.094 that is a 9% drift and it
     passed unnoticed; at the size the growth needs to be now it would push the
     query straight through the side of the box. The group's zoom does it once. */
  const cyAt = (fr: number) => lerp(buildAt(fr), STATEMENT_CY, BIG_CY);

  const sinceFlip = f < FLIP_MID ? (f - FLIP_A) % R1
      : f < FLIP_T3 ? (f - FLIP_MID) % R2 : (f - FLIP_T3) % R3;

  /* ── THE SWAP BLUR IS GONE ───────────────────────────────────────────────
     It was meant to soften the word change. Frame by frame it does the
     opposite: a 5.5px blur lasting two frames, repeating every six, is a
     STROBE — sharp, blurred, sharp, blurred, ten times a second. Softening one
     frame at the cost of a flicker across the whole passage is a bad trade, and
     that flicker is what "choppy" was.

     A word change on type wants to be a clean cut. What made the join harsh was
     never the swap: it was the pop and the flash, both now dealt with. */
  /* ── NO POP ON THE FIRST TRADE ───────────────────────────────────────────
     The flip's first entry IS "barber near me" — the words the scramble has
     just resolved to — so nothing changes on that frame. But the pop fired
     anyway: a jump to 107% scale in a single frame, on text that had not
     moved. That single frame was the harsh clunk out of the transition.

     It is now silent on trade 0 and eases in across the next three, so the
     flip starts from what is already on screen and picks up energy instead of
     announcing itself. */
  const popAmp = Math.min(1, flipIdx / 3) * 0.07;
  const pop = f >= FLIP_A && f < FLIP_B && popAmp > 0
    ? interpolate(sinceFlip, [0, flipRate - 1], [1 + popAmp, 1], {easing: OVER, ...clamp})
    : 1;
  /* ── ONE SCALE, ONE WIDTH, ONE CENTRE ────────────────────────────────────
     Everything on the line is a multiplier on SAY_BASE, and its width is that
     base width times the same multiplier — so the type can never be a size its
     measured width disagrees with, which is what the box opening around it
     depends on. Statements are centred on CX; the field's query is not (it sits
     after the magnifier), so the x lerps between the two across the open and
     the whole correction disappears the moment p reaches 1. */
  const p = buildAt(f);
  const sayScale = (say.size / SAY_BASE) * sayCreep * punchUp;
  const lineScale = isQuery
    ? BIG_TEXT_SCALE * pop
    : lerp(p, sayScale, FIELD_SAY_SIZE / SAY_BASE);
  /* the eaten tail shortens the LAYOUT width, not just the paint, so the line
     re-centres as it is swallowed rather than drifting off axis */
  const baseW = isQuery
    ? measureText({text, fontFamily: ARIAL, fontSize: FS, fontWeight: '400', letterSpacing: '-0.01em'}).width
    : sayW(head, SAY_BASE) + sayW(tail, SAY_BASE) * eat;
  const textW = baseW * lineScale;
  /* ── WHAT THE LINE IS CENTRED ON ────────────────────────────────────────
     Its own ink, except while statement 1 is still typing — there it is centred
     on the FINISHED sentence, so the words land where they will end up instead
     of the line re-centring on every keystroke and sliding what is already
     typed leftward. Text does not move as you type it.

     The eat is the opposite case and deliberately so: there the width really is
     shrinking and the line SHOULD pull itself together as the tail goes. */
  const centreW = si === 0
    ? (sayW(say.head, SAY_BASE) + sayW(say.tail, SAY_BASE)) * lineScale
    : textW;
  const lineX = isQuery ? BIG_TEXT_X : lerp(p, CX - centreW / 2, BIG_TEXT_X);
  const lineCY = cyAt(f);
  /* THE CUT IS NOT A MOVE. buildAt is a step now, so on frame 240 the line's y
     jumps 20px and its x jumps 122 — and this blur is derived from exactly that
     delta. Left alone it lays a 2px softening on the first frame of the search,
     which on a hard cut reads as a dropped frame rather than as speed. A frame
     where the geometry steps has no velocity to report. */
  const stepping = buildAt(f) !== buildAt(f - 1);
  const vel = stepping ? 0
    : Math.abs(lineX - (isQuery ? BIG_TEXT_X : lerp(buildAt(f - 1), CX - centreW / 2, BIG_TEXT_X)))
      + Math.abs(cyAt(f) - cyAt(f - 1)) * 0.6;
  const textBlur = Math.min(5, vel * 0.16) + rollBlur;

  /* ── ONE rect: caret → big field → frame ── */
  /* The line's own height, in frame pixels. It used to be FS * 1.2 * scale,
     which was correct only while everything on screen was 27px Arial scaled up.
     Jost 700 at 148 in a 1.2 line box would give a 198px highlight around 107px
     of cap, so this measures the em rather than the line box — 168px at the
     last statement, which is within 8px of the 160 the field lands on and means
     the box barely changes height while it opens. */
  const caretH = (isQuery ? FS : SAY_BASE) * lineScale;
  /* THE FIELD OPENS FROM THE MIDDLE OF THE LINE, not its end. This was the right
     edge — where a caret would sit — so the search box grew sideways out of the
     full stop after "found." and the whole move was lopsided. Growing from the
     line's centre means it expands symmetrically around the text it is
     swallowing, which is what the eye expects and reads as one object becoming
     another rather than a box sliding out from behind a word. */
  /* ── THE BOX IS THE TYPE'S OWN BOUNDING BOX ──────────────────────────────
     It used to be a point at the line's centre lerping out to the field's
     rectangle. Independent of the type — and the type is doing its own move at
     the same time, shrinking 3.75x → 2.3x and sliding left. The two crossed:
     the type's left edge barely moves (476 → 488) while the box's sweeps from
     960 to 320, so for two thirds of the transition the sentence hung out of
     the left end of the box. A search field with its query poking out of it.

     Now the box IS the type's bounds plus a padding that grows. At p=0 that is
     a highlight sitting tight around the sentence; at p=1 the padding has
     reached 168px left and 519px right, which lands the rectangle on exactly
     BIG_X / BIG_W. It cannot overflow, because there is nothing to cross. */
  /* ── THE PILL IS GONE WITH THE TRANSITION ────────────────────────────────
     A highlight that swiped across the sentence, grew padding, became a search
     field and then flooded out to a page: five values interpolating against
     each other to sell one continuity claim, and the claim was the thing that
     was wrong. The page is either not there or it is the whole frame. ── */
  const boxX = 0, boxTop = 0, boxW = W, boxH = H, boxR = 0;
  /* the flood's motion blur went with the flood. A cut does not blur — a
     single blurred frame on a hard cut reads as a dropped frame, not as speed. */
  const pageBlur = 0;

  /* The cursor and its click ring went with the typed query — there is nothing
     for a pointer to do now. The field reads as focused from the frame it
     exists, because on a cut there is no "before" for it to have been idle in. */
  const focused = f >= CUT_IN ? 1 : 0;

  /* ── THE PAGE REPAINTS ───────────────────────────────────────────────────
     The scroll was killed for good reason: a page CREEPING upward behind the
     query is one continuous motion too many and it pulls the eye off the
     subject. That verdict stands and this is not that.

     What was left, though, was a search animation in which the only thing that
     ever changes is fourteen characters in the middle of the frame. The query
     turns over sixty times and the results behind it — the entire argument, the
     thing the query is supposedly querying — are one frozen screenshot for four
     and a half seconds. That is what goes stale: not the length, the fact that
     nothing else in the picture is participating.

     So the page CUTS to a new position on the beat. Not a scroll — a repaint,
     instant, on the grid, which is the film's grammar everywhere else and is
     also what a search engine actually does when the query changes. Behind 4 to
     11px of blur nobody reads a listing; what they read is the mass of the page
     reconfiguring under a query that will not sit still.

     And the repaint rate DOUBLES at the riser, from one a beat to one a half
     beat, so the page starts thrashing in the same bar and a half the track
     spends building. Sixty query changes, eighteen repaints — enough that the
     page is clearly reacting, sparse enough that it never becomes the subject.

     Held through the implosion rather than snapped back to zero: the field is
     collapsing into that frame and a page jump underneath it would read as the
     collapse having missed. */
  const rnd = (n: number) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const scrollY = (() => {
    if (f < CUT_IN) return 0;
    const g = Math.min(f, IMP_A - 1);
    const i = Math.floor((g - CUT_IN) / (g < RISER_A ? BEAT : BEAT / 2));
    /* the cut itself lands on the top of the page, which is the composition
       every still of this section has been judged on */
    return i === 0 ? 0 : Math.round(1600 + rnd(i) * 6200);
  })();
  const serpFade = interpolate(f, [SERP_OUT_A, SERP_OUT_B], [1, 0], {easing: SETTLE, ...clamp});

  /* ── ACT 3: the sentence ── */
  const cardOn = f >= CARD_A;

  /* The white blowout is gone. It was covering a cut, and there is no cut here
     any more — the storm flies over the boundary and the bloom carries the eye
     across it, so a flash of white would only be hiding something that is not
     happening. */
  /* ── THE FRAME BOUNCES ───────────────────────────────────────────────────
     Only the storm had a physical response to the track. The intro had a
     darkening flash at 3-5% and the entire search animation had nothing at all
     — 264 frames, 4.4 seconds, in which the frame itself never moves.

     ── THE INTRO PLAYS TWO GRIDS AND WE WERE ANSWERING ONE ─────────────────
     Measured across beats 0-11, the low band is on the quarter and grows:

       beat  0  .500   1 .573   2 .571   3 .609   4 .610   5 .721
       beat  6  .935   7 .507   8 .921   9 .924  10 .896  11 .915

     but the HIGH band is on the EIGHTH, and it is louder off the beat than on
     it — .333 / .336 / .362 / .338 at 0.5, 1.5, 2.5, 3.5 against .266 / .301 /
     .282 / .276 on the beats themselves. That is the metal the picture was
     ignoring completely. It then collapses: .282 at 4.5, .200 at 5.5, .147,
     .091, .049, .027, .016.

     So there are two impulses. The BEAT is a drop — scale and a vertical kick,
     amplitude tracking the kick's own growth. The OFF-BEAT is a tick: smaller,
     shorter, scale-dominant, and its amplitude DIES WITH THE HATS. The picture
     stops subdividing at exactly the point the track does, which is what makes
     the last four beats before the search feel like a run-up rather than a
     slowdown.

     ── AND THE SEARCH GETS THE SAME TREATMENT, ESCALATING ──────────────────
     Through 240-504 the low band never drops below .70 on the beat, so a floor
     under the whole passage is free and it was simply missing. On top of that
     the MID band rises on the off-beats and only there — .238 at 16.5, then
     .317, .370, .408, .414, against .128-.236 on the beats. That is the riser
     into the drop, it lasts a bar and a half, and nothing in the picture moved
     for it. The off-beat impulse now grows out of nothing at 16.5 and is nearly
     the size of the beat by 20.5, so the last bar audibly and visibly doubles
     up into the implosion.

     Both rate steps also land as hits now. They are the only structural events
     in the span and they were passing as pure information. ── */
  const dBeat = Math.max(0, 1 - (f % BEAT) / 6) ** 2;
  const dHat = Math.max(0, 1 - ((f + BEAT / 2) % BEAT) / 5) ** 2;
  const punch = (() => {
    if (f < CUT_IN) {
      const aBeat = interpolate(f, [0, 120, 144, CUT_IN], [0.60, 0.80, 1, 0.98], clamp) * dBeat;
      const aHat = interpolate(f, [0, 84, 132, 204], [1, 1, 0.45, 0.04], clamp) * dHat;
      return {s: aBeat * 0.028 + aHat * 0.011, x: 0, y: aBeat * -8 + aHat * -2.5};
    }
    if (f < IMP_A) {
      const aBeat = interpolate(f, [CUT_IN, FLIP_MID, IMP_A], [0.70, 0.90, 1.15], clamp) * dBeat;
      const aHat = interpolate(f, [RISER_A - 24, RISER_A, 468], [0, 0.55, 1], clamp) * dHat;
      /* the two rate steps, decaying over eight frames */
      const stepAt = f >= FLIP_T3 ? FLIP_T3 : FLIP_MID;
      const step2 = f >= stepAt && f < stepAt + 8 ? Math.max(0, 1 - (f - stepAt) / 8) ** 2 : 0;
      return {
        s: aBeat * 0.026 + aHat * 0.020 + step2 * 0.030,
        x: 0,
        y: aBeat * -7 + aHat * -6 + step2 * -10,
      };
    }
    /* ── THE VOLLEYS HIT THE CAMERA ────────────────────────────────────────
       The boxes land on the beat but the frame they land in does not react, so
       each volley is something happening in front of a camera rather than
       something the camera feels. A scale punch and a small kick, decaying over
       six frames, amplitude growing with the volley so the last lands hardest.

       Deliberately small (max 2.2% scale, 9px). Anything you can consciously
       see here reads as a wobble; what this does is make the hits land in the
       body rather than on the screen. */
    if (f < STORM_A || f >= G_OUT) return {s: 0, x: 0, y: 0};
    const b = Math.floor((f - STORM_A) / BEAT);
    const since = f - (STORM_A + b * BEAT);
    const decay = Math.max(0, 1 - since / 6) ** 2;
    const amp = Math.min(1, (b + 1) / 9) * decay;
    return {s: amp * 0.022, x: amp * 9 * (b % 2 ? -1 : 1), y: amp * -7};
  })();

  /* ── THE PUSH HAD A HOLE IN IT ───────────────────────────────────────────
     Two segments, both starting at 1: the intro crept to 1.035 and then the
     next segment restarted from 1.0, so the whole frame snapped 3.4% smaller on
     one frame at the handover. It has been there since the black act ended at
     192; it is only conspicuous now because it lands on the exact frame the box
     opens, and a scale tick under a transition reads as a dropped frame.

     The intro push now leans IN to the brand beat and settles back out across
     the last two beats, arriving at 1.0 exactly where the second segment picks
     it up. Continuous, and the lean is motivated by the loudest frame in the
     passage rather than just running to the end of it. */
  const push = (f < CUT_IN
    ? interpolate(f, [0, SAY_AT[2], CUT_IN], [1, 1.035, 1],
        {easing: Easing.inOut(Easing.quad), ...clamp})
    : f < CARD_A
      ? interpolate(f, [CUT_IN, CARD_A], [1, 1.02], {easing: Easing.inOut(Easing.quad), ...clamp})
      : 1) + punch.s;
  /* ── THE BLUE FLASH IS GONE ──────────────────────────────────────────────
     A full-frame wash of the accent at 16% for five frames, fired at FLIP_A.
     It dated from a cut where FLIP_A was the frame the trades started changing,
     so it was marking an event. Since the first trade now HOLDS for a beat,
     FLIP_A is the frame nothing happens on — and the flash was landing there
     anyway: a blue pulse over the whole picture at the exact moment the typing
     finishes, marking nothing. Frame by frame it is the most visible artifact
     in the passage. */

  /* ── ONE LINE RENDERER ───────────────────────────────────────────────────
     Head and tail are separate spans so the two tail devices can act on the
     tail alone — the swap swells it, the eat squeezes it — without the head
     moving under its own transform. Neither transform affects layout, so the
     line's measured width stays whatever `baseW` says it is and the box that
     opens around it cannot disagree with what is drawn.

     The blur is divided by the scale. A filter inside a scaled element is
     applied in the element's own coordinate space and then magnified, so
     passing a frame-pixel value straight in made a 5px blur render as 15px at
     3.1x. Every blur here is now in the units it was computed in. */
  const Line: React.FC<{
    h: string; t: string; color: string;
    x: number; cy: number; sc: number; blur: number; tailS: number; tailEat: number;
  }> = ({h, t, color, x, cy, sc, blur, tailS, tailEat}) => (
    <div style={{
      position: 'absolute', left: x, top: cy,
      transform: `translateY(-50%) scale(${sc})`, transformOrigin: 'left center',
      display: 'flex', alignItems: 'center', whiteSpace: 'pre',
      fontFamily: isQuery ? ARIAL : JOST, fontWeight: isQuery ? 400 : 700,
      fontSize: isQuery ? FS : SAY_BASE, color,
      letterSpacing: isQuery ? '-0.01em' : SAY_TRACK,
      filter: blur / sc > 0.25 ? `blur(${(blur / sc).toFixed(2)}px)` : undefined,
    }}>
      <span>{h}</span>
      {t !== '' && (
        <span style={{
          display: 'block',
          transform: `scaleX(${tailEat.toFixed(4)}) scale(${tailS.toFixed(4)})`,
          transformOrigin: 'left center',
        }}>{t}</span>
      )}
    </div>
  );

  /* whatever statement is current, or the query from the cut onward. There is
     nothing in between — the two never share a frame. */
  const Text: React.FC<{color: string}> = ({color}) => (
    <Line h={isQuery ? text : head} t={isQuery ? '' : tail} color={color}
      x={lineX} cy={lineCY} sc={lineScale} blur={textBlur}
      tailS={swap} tailEat={eat} />
  );

  /* ── THE ROLL, WHICH IS THE ONLY TIME TWO LINES EXIST AT ONCE ────────────
     Statement 3 leaves upward as statement 4 arrives from below, both travelling
     ROLL_H at the statement's own scale. Each is centred on its own width, so
     the two do not have to be the same length — which they are not. */
  const rollScale = (st: typeof say) => (st.size / SAY_BASE) * sayCreep;
  const RollPair: React.FC<{color: string}> = ({color}) => {
    const out = STATEMENTS[2], into = STATEMENTS[3];
    const outSc = rollScale(out), inSc = rollScale(into);
    const outW = (sayW(out.head, SAY_BASE) + sayW(out.tail, SAY_BASE)) * outSc;
    const inW = (sayW(into.head, SAY_BASE) + sayW(into.tail, SAY_BASE)) * inSc;
    return (
      <AbsoluteFill style={{
        clipPath: `inset(${lineCY - ROLL_BAND / 2}px 0 ${H - lineCY - ROLL_BAND / 2}px 0)`,
      }}>
        <Line h={out.head} t={out.tail} color={color} x={CX - outW / 2}
          cy={lineCY - roll * ROLL_H * outSc} sc={outSc} blur={textBlur} tailS={1} tailEat={1} />
        <Line h={into.head} t={into.tail} color={color} x={CX - inW / 2}
          cy={lineCY + (1 - roll) * ROLL_H * inSc} sc={inSc} blur={textBlur} tailS={1} tailEat={1} />
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${k})`, transformOrigin: 'top left'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H,
          transform: `translate(${punch.x.toFixed(2)}px, ${punch.y.toFixed(2)}px) scale(${push})`,
          transformOrigin: 'center center'}}>
          {/* ── THE OPENING GROUND ─────────────────────────────────────────
              Was black with white type. It is now the same lit grey surface the
              card and the build sit on, with the same black type — so the film
              opens and resolves on one material instead of two, and the hook and
              the answer are visibly the same voice saying both.

              It also softens the flood: light grey into a white Google page is a
              brighten rather than the black-to-white slam it used to be, which
              suits a transition that is supposed to be a page arriving rather
              than an explosion.

              grain 0 here because the global pass below already lays it — twice
              reads as dirt. */}
          <AbsoluteFill>
            <CardGround grain={0} />
            {/* THE BRAND BEAT. A hard cut — no fade in, no fade out — so the
                whole frame changes on one frame and changes back a beat later.
                Anything gradual here would read as a transition to somewhere,
                and this is not going anywhere: it is one beat of the film in
                Loomwork's own colourway and then the grey returns. */}
            {invert === 1 && <AbsoluteFill style={{background: '#0A0C0D'}} />}
            {/* gated: once the Google layer is hidden at CARD_A this layer is
                exposed, and its copy of the query was showing through top-left */}
            {f < CARD_A && (rolling
              ? <RollPair color={invert === 1 ? ACC : '#0A0C0D'} />
              : <Text color={invert === 1 ? ACC : '#0A0C0D'} />)}
          </AbsoluteFill>

          <AbsoluteFill style={{
            background: '#FFFFFF',
            clipPath: `inset(${boxTop}px ${W - boxX - boxW}px ${H - boxTop - boxH}px ${boxX}px round ${boxR}px)`,
            display: f < PILL_A || f >= CARD_A ? 'none' : undefined,
            filter: pageBlur > 0.3 ? `blur(${pageBlur}px)` : undefined,
          }}>
            {/* SURROUND — everything that is not the field */}
            <AbsoluteFill style={{
              filter: focusBlur > 0.25 ? `blur(${focusBlur}px)` : undefined,
              opacity: (1 - focusDim) * serpFade,
            }}>
              <div style={{position: 'absolute', left: LOGO_X, top: BAR_CY - LOGO_W / GOOGLE_ASPECT / 2, opacity: arrive * hand}}>
                <GoogleMark width={LOGO_W} />
              </div>
              <div style={{position: 'absolute', left: BAR_X, top: HEADER_H - 53, display: 'flex', gap: 40, fontFamily: ARIAL, fontSize: 22, color: '#5f6368', opacity: arrive * hand}}>
                {['All', 'Maps', 'Images', 'News', 'Shopping'].map((t, i) => (
                  <span key={t} style={{color: i === 0 ? '#1a73e8' : '#5f6368', borderBottom: i === 0 ? '3px solid #1a73e8' : 'none', paddingBottom: 12}}>{t}</span>
                ))}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: HEADER_H, height: 1, background: G_LINE, opacity: arrive * hand}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', opacity: arrive}}>
                <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-scrollY}px)`}}>
                  <SerpBody />
                </div>
              </div>
            </AbsoluteFill>

            {/* FOCUS — the field and its query, one group so they scale together.
                The implosion multiplies the group's scale down to nothing about
                its own centre: the field does not move, it is consumed where it
                stands, and the storm's first domain leaves that exact point. */}
            <AbsoluteFill style={{
              transform: `scale(${zoom * (1 - imp)})`,
              transformOrigin: `${barX + barW / 2}px ${barCY}px`,
              opacity: 1 - imp * imp,
            }}>
              <div style={{
                position: 'absolute', left: barX, top: barTop, width: barW, height: barH,
                borderRadius: barR, border: `${lerp(hand, 2.4, 1.7)}px solid ${G_LINE}`,
                boxShadow: `0 ${2 + focused * 5 + grown * 14}px ${10 + focused * 16 + grown * 34}px rgba(31,31,31,${0.10 + focused * 0.05 + grown * 0.10})`,
                background: '#fff', display: 'flex', alignItems: 'center',
                padding: `0 ${barPad}px`, boxSizing: 'border-box',
              }}>
                <Magnifier size={barIcon} stroke={lerp(hand, 1.7, 2)} />
                <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                  <svg width={barIcon} height={barIcon} viewBox="0 0 24 24"><path fill="#4285F4" d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-3.1A7 7 0 0019 11h-2z" /></svg>
                </span>
              </div>
              <Text color={G_INK} />
                          </AbsoluteFill>
          </AbsoluteFill>

          {/* ── ACT 3: one sentence, four cards, all on the same ground ──────
              Every join is a HARD CUT — the components simply stop existing on
              the frame the next one starts. The only join that is not a cut is
              cards 2 → 3, because that is not a new card: it is the same line
              with one word swapped under the stroke that swaps it. */}
          {cardOn && (
            <AbsoluteFill>
              <CardGround />
              {/* the cards OVERLAP at every join — one leaving as the next
                  arrives — so there is never a frame of a line simply sitting
                  there waiting to be cut away from */}
              {f < SAY_1_GONE && (
                <DropLine text={L1} startAt={SAY_1 + 5} landAt={SAY_1_LAND}
                  exitAt={SAY_1_OUT} exitEnd={SAY_1_GONE} size={92} />
              )}
              {f >= SAY_2 && f < SAY_2_GONE && (
                <SwapLine prefix={L2_PRE} wordA="websites" wordB="campaigns"
                  inAt={SAY_2} swapAt={SAY_SWAP}
                  exitAt={SAY_2_OUT} exitEnd={SAY_2_GONE} size={108} />
              )}
              {f >= SAY_4 && f < LEADS_IN && (
                <UnwindLine text={L4} inAt={SAY_4} settleAt={SAY_4_SET}
                  holdTo={LEADS_IN} size={124} id="unwind" />
              )}
              {/* the ground inverts under the word, not before it — the
                  reference flips between f178 and f180, with the word already
                  small by the time the colour changes */}
              {f >= LEADS_LAND - 11 && (
                <AbsoluteFill style={{
                  /* 5 frames → 11. A full grey-card-to-black inversion in five
                     frames is 11/255 a frame on its own, but it stacks on the
                     word shrinking out of its 7.2x entrance and the pair
                     measured 22 and 53 on consecutive frames. */
                  background: '#0A0C0D',
                  opacity: interpolate(f, [LEADS_LAND - 11, LEADS_LAND], [0, 1], clamp),
                }} />
              )}
              {/* it hands over to the portal rather than blowing up on its own */}
              {f >= LEADS_IN && f < PORTAL_A && (
                <NoiseWord word="LEADS" inAt={LEADS_IN} landAt={LEADS_LAND}
                  goneAt={PORTAL_A + 11} size={168} />
              )}
            </AbsoluteFill>
          )}

          {/* ══ THE STOCK FLIP ═══════════════════════════════════════════════
              It used to sit last, after the leads section. It is now the thing
              LEADS hands to, because the flip and the statistics that follow it
              are the SAME ARGUMENT — 192 businesses saying "whoever you are,
              whatever you do", and 50+ clients / 30+ industries saying it as a
              number. The old order stated the evidence before the claim.

              Its own copy was written for this position and was in the wrong
              place with it: the fragments are a subordinate clause with no main
              clause, and "we help your business grow" is the main clause. The
              two have to be adjacent or the sentence never closes.

              The joins either side of it are LEADS-as-a-window on the way in
              and the meander on the way out — see PORTAL_A / MEANDER_A. */}

          {/* ── LEADS BECOMES A WINDOW ─────────────────────────────────────
              The images run inside the letterforms while the word scales up
              past the camera. By 959 the letters are far wider than the frame
              and nothing is left but the barrage, so the flip does not cut in
              — it is already there, and it arrived through the word. */}
          {f >= PORTAL_A && f < FLIP_AT && (() => {
            const p = interpolate(f, [PORTAL_A, FLIP_AT], [0, 1],
              {easing: Easing.in(Easing.cubic), ...clamp});
            const sc = lerp(p, 1, 22);
            const img = 180 + Math.min(11, Math.floor((f - PORTAL_A) / 2));
            return (
              <AbsoluteFill style={{background: '#0A0C0D'}}>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
                  style={{position: 'absolute', left: 0, top: 0}}>
                  <defs>
                    <mask id="leadsWindow" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
                      <rect x={0} y={0} width={W} height={H} fill="black" />
                      <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="central"
                        fontFamily={JOST} fontWeight={700} fontSize={168 * sc}
                        letterSpacing="0.01em" fill="white">LEADS</text>
                    </mask>
                  </defs>
                  <foreignObject x={0} y={0} width={W} height={H} mask="url(#leadsWindow)">
                    <div style={{width: W, height: H}}>
                      <Img src={staticFile(`flip/${String(img).padStart(3, '0')}.jpg`)}
                        style={{width: W, height: H, objectFit: 'cover'}} />
                    </div>
                  </foreignObject>
                  {/* the letters do not JUMP from solid to filled. Cutting
                      straight to image-filled type measured a 40/255 step on
                      one frame, and it landed in the same second as the word's
                      arrival and the ground inversion — four flashes where the
                      guidance allows three. Six frames of the white draining
                      out of the letterforms costs nothing and reads as the
                      pictures coming up through them. */}
                  <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="central"
                    fontFamily={JOST} fontWeight={700} fontSize={168 * sc}
                    letterSpacing="0.01em" fill="#FFFFFF"
                    opacity={interpolate(f, [PORTAL_A, PORTAL_A + 6], [1, 0], clamp)}>LEADS</text>
                </svg>
              </AbsoluteFill>
            );
          })()}

          {f >= FLIP_AT && f < CLAUSE_AT && (
            <Sequence from={FLIP_AT} durationInFrames={FLIP_DUR} layout="none">
              <StockFlip music={false} />
            </Sequence>
          )}

          {/* ── THE MEANDER SWEEPS THE PAPER IN ────────────────────────────
              The same mark the word section draws forty frames later, used
              here as the wipe — so the transition and the section that follows
              it are made of the same thing.

              Stroked at 900 rather than the 240 the mark itself uses: the four
              passes sit 440-490 apart, so at 900 they overlap by 400 and the
              union covers the frame with no seam between them. At the mark's
              own weight it would sweep in stripes. */}
          {f >= MEANDER_A && f < CLAUSE_AT && (() => {
            const p = interpolate(f, [MEANDER_A, CLAUSE_AT], [0, 1], {easing: Easing.linear, ...clamp});
            const MEANDER = 'M 400 1240 C 350 700, 470 210, 560 -140 C 710 -330, 900 -300, 940 -70 '
              + 'C 985 410, 850 900, 930 1250 C 1075 1430, 1290 1400, 1330 1150 '
              + 'C 1375 690, 1270 250, 1380 -130 C 1530 -320, 1745 -285, 1795 -30 '
              + 'C 1845 420, 1755 910, 1820 1250';
            return (
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
                style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <defs>
                  <mask id="meanderIn" maskUnits="userSpaceOnUse" x={-600} y={-600} width={W + 1200} height={H + 1200}>
                    <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="black" />
                    <path d={MEANDER} fill="none" stroke="white" strokeWidth={900}
                      strokeLinecap="round" strokeLinejoin="round"
                      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                  </mask>
                </defs>
                <foreignObject x={0} y={0} width={W} height={H} mask="url(#meanderIn)">
                  <div style={{width: W, height: H, position: 'relative'}}>
                    <CardGround grain={0.05} />
                  </div>
                </foreignObject>
              </svg>
            );
          })()}

          {f >= CLAUSE_AT && (
            <Sequence from={CLAUSE_AT} durationInFrames={WORD_FLIP_DUR} layout="none">
              <WordFlip music={false} />
            </Sequence>
          )}

          {f >= STATS_AT_PLAN && (
            <Sequence from={STATS_AT_PLAN} durationInFrames={STATS_DUR} layout="none">
              <Stats music={false} />
            </Sequence>
          )}

          {/* ── THE STORM, over both ─────────────────────────────────────────
              It outlives the boundary on purpose: spawning stops at 640 but the
              last domains are still in flight past 672, so they blow across the
              card's ground as it arrives rather than stopping at a seam. Same
              rule as the implosion — nothing here ends before the next thing
              has started. */}
          {/* the wall and the G go into the spin TOGETHER — the aberration has
              to pull its colour off the listings, not just off the logo, or the
              palette is painted on again */}
          {f >= STORM_A && f < G_OUT && (
            <Melt windUp={G_AT} breakAt={G_BREAK} endAt={G_OUT} id="melt">
              <UrlStorm startAt={STORM_A} spawnEnd={STORM_SPAWN_END} beat={BEAT}
                fadeA={STORM_OUT_A} fadeB={STORM_OUT_B} />
              <GoogleG a={G_AT} b={G_OUT} />
            </Melt>
          )}
        </div>
      </div>

      {/* CardGround lays its own grain from BUILD_A on, and a gradient that wide
          needs it to keep from banding at 4K. Two coats read as dirt. */}
      {f < CARD_A && <Grain opacity={0.11} />}
      {/* .42 → .20: CardGround already carries a raking falloff into the top-left,
          and stacking a full vignette on top of it turned the corners to mud */}
      {f < CUT_IN && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 58%, rgba(10,14,16,.20) 100%)', pointerEvents: 'none'}} />}
      {/* the kick pulse DARKENS now. A white flash was invisible against a light
          ground — on this surface the impact has to be a thump, not a flash. */}
      {kick > 0 && <AbsoluteFill style={{background: '#0A0C0D', opacity: kick, pointerEvents: 'none'}} />}

      {/* Taps sit around 1.2kHz, which is exactly the band the track vacates at the
          start (0.0007). They are filling a hole, not competing — so they run hotter
          here (0.52) than the 0.42 they were at before. */}
      {keys && TAPS.map((e, i) => (
        <Sequence key={`a${i}`} from={e.t} durationInFrames={8} layout="none">
          <Audio src={staticFile(e.kind === 'space' ? 'sfx/space.wav' : `sfx/t${(i % 4) + 1}.wav`)} volume={0.52} />
        </Sequence>
      ))}
      <Sequence from={MUSIC_AT} layout="none">
        <Audio src={staticFile('music/showreel-2bar.wav')} volume={0.88} />
      </Sequence>
    </AbsoluteFill>
  );
};
