// Probe every clip in public/clips with @remotion/media-parser and print
// duration / dimensions / audio info. Usage: node tools/probe.mjs
import {parseMedia} from '@remotion/media-parser';
import {nodeReader} from '@remotion/media-parser/node';
import {readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const clipsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'clips');
const files = readdirSync(clipsDir).filter((f) => /\.(mov|mp4|webm|m4v)$/i.test(f)).sort();

let total = 0;
for (const f of files) {
  try {
    const meta = await parseMedia({
      src: join(clipsDir, f),
      reader: nodeReader,
      acknowledgeRemotionLicense: true,
      fields: {
        slowDurationInSeconds: true,
        dimensions: true,
        unrotatedDimensions: true,
        rotation: true,
        fps: true,
        tracks: true,
        videoCodec: true,
        audioCodec: true,
      },
    });
    total += meta.slowDurationInSeconds;
    const d = meta.dimensions;
    const audio = meta.tracks.filter((t) => t.type === 'audio').length;
    console.log(
      `${f}  ${meta.slowDurationInSeconds.toFixed(2)}s  ${d.width}x${d.height} (rot ${meta.rotation})  ${meta.fps?.toFixed(2)}fps  v:${meta.videoCodec} a:${meta.audioCodec ?? 'none'} tracks(audio):${audio}`
    );
  } catch (e) {
    console.log(`${f}  FAILED: ${e.message}`);
  }
}
console.log(`\nTotal: ${total.toFixed(2)}s across ${files.length} clips`);
