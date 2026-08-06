/* Reads .env.local for the fetch tools.

   It parses defensively because of how the file gets created on this machine:
   `echo "..." > .env.local` in PowerShell writes UTF-16LE with a BOM, so the
   bytes come back as "﻿P\0E\0X\0..." and a naive split on '=' finds a key
   named "﻿P\0E\0X\0E\0L\0S\0_\0K\0E\0Y" with a NUL-riddled value. It looks
   fine in an editor and fails at runtime, which is the worst combination. So:
   sniff the BOM, decode accordingly, and strip anything left over. */

import fs from 'node:fs';
import path from 'node:path';

export const readEnvLocal = (file = path.join(process.cwd(), '.env.local')) => {
  if (!fs.existsSync(file)) return {};
  const buf = fs.readFileSync(file);

  let text;
  if (buf[0] === 0xff && buf[1] === 0xfe) text = buf.subarray(2).toString('utf16le');
  else if (buf[0] === 0xfe && buf[1] === 0xff) text = buf.swap16().subarray(2).toString('utf16le');
  else text = buf.toString('utf8').replace(/^﻿/, '');

  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\0/g, '').trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (k) out[k] = v;
  }
  return out;
};

/* env var wins, then the file. Returns null rather than throwing so the caller
   can print something useful instead of a stack trace. */
export const pexelsKey = () => {
  const fromEnv = process.env.PEXELS_KEY?.trim();
  if (fromEnv) return fromEnv;
  const v = readEnvLocal().PEXELS_KEY?.trim();
  if (!v || v === 'your_key_here') return null;
  return v;
};
