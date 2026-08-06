/* The site's exact pairing, both voices now on deck:
   Jost — the wordmark and quiet lines. Anton — the display slabs and numbers.
   The reel leans Anton hard: M3's energy came from heavy caps, and Anton is
   the heavy voice this brand already owns. */
import {loadFont as loadJost} from '@remotion/google-fonts/Jost';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';

/* 200 and 700 are here for the card's tracking collapse: the words arrive wide
   and thin and resolve tight and heavy, so the move needs both ends of the
   weight axis, not just the middle three the site ships. */
const jost = loadJost('normal', {weights: ['200', '300', '400', '500', '700']});
const anton = loadAnton();

export const JOST = jost.fontFamily;
export const ANTON = anton.fontFamily;
