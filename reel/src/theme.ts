/* The site's exact palette — reel and page must read as one artefact. */
export const BLACK = '#000000';   // --black  hero / contact ground
export const OFF = '#101114';     // --off    cases / faq ground
export const WHITE = '#FFFFFF';   // --white  the light chapter
export const INK = '#15161A';     // dark type on light grounds
export const ACC = '#83B7D8';     // LOOMWORK accent
export const ACC_DARK = '#4F6E82';

/* The PRODUCTION lemniscate — lifted verbatim from index.html's --lemI10 mask
   (220x100 viewBox, stroke path, round caps, broken once at the crossing so the
   thread passes over and under itself). Drawing this path IS drawing the mark. */
/* Flood palette — the reel's saturated punctuation, per the M3 extraction:
   floods are RARE (≤10% of screen time) and loud. Client colours promoted to
   panels: taxi gold, Deen-adjacent green; blues from the brand family at full
   saturation. The accent stays the recurring anchor. */
export const FLOOD_BLUE = '#2743F0';
export const FLOOD_SKY = '#47B2F5';
export const FLOOD_GOLD = '#F0AE2E';   // richer — the mustard read flat on screen
export const FLOOD_GREEN = '#2FBF71';  // emerald — the flat green read municipal
/* two added for the word run, which needs eight ground states and had six.
   The reference's own colour phase runs coral and a violet-pink, and this
   palette was extracted off that reference in the first place — so these are
   filling in the family rather than inventing outside it. */
export const FLOOD_CORAL = '#E2513A';
export const FLOOD_VIOLET = '#6B3FD4';
/* a mid-luminance rose, added so the word run's late colour cuts can be small
   enough not to count as flashes while still being obvious hue changes */
export const FLOOD_ROSE = '#C33C7A';
export const SILVER_GRAD =
  'linear-gradient(115deg, #C7CCD1 0%, #EDEFF1 52%, #B9BEC4 100%)';

/* The site's film grain, verbatim — SVG turbulence, stepped like analogue noise.
   Dead-flat black was the biggest "cheap" tell in the first Act One pass; every
   ground now carries the same texture the site's hero carries. */
export const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.45 0 0 0 0 0.44 0 0 0 0 0.42 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E";

export const LEM_VIEWBOX = '0 0 220 100';
export const LEM_STROKE_WIDTH = 10;
export const LEM_PATH =
  'M110 50C113 54 122 65 129 72C136 78 144 86 153 90C161 93 173 97 183 94C192 91 206 82 210 71C215 60 215 40 210 29C206 18 192 9 183 6C173 3 161 7 153 10C144 14 136 22 129 28C122 35 113 46 110 50' +
  'M100 38C97 35 89 25 82 20C75 15 67 9 59 7C51 5 40 4 31 8C23 12 12 21 9 31C5 41 5 59 9 69C12 79 23 88 31 92C40 96 51 95 59 93C67 91 75 85 82 80C89 75 97 65 100 62';
