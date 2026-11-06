// Räknar ut vågformen ("peaks") och längden för alla ljudfiler i public/tracks
// och sparar resultatet i src/data/peaks.json. Spelaren läser därifrån, så
// besökarna slipper ladda ner hela låten bara för att se vågformen.
//
// Kör:  npm run peaks            (räknar bara ut nya filer)
//       npm run peaks -- --force (räknar om alla)

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import decode from "audio-decode";

const ROOT = path.resolve(import.meta.dirname, "..");
const TRACKS_DIR = path.join(ROOT, "public", "tracks");
const OUT_FILE = path.join(ROOT, "src", "data", "peaks.json");
const SAMPLES = 400; // antal staplar som sparas – spelaren skalar om efter bredden
const AUDIO_EXT = /\.(mp3|wav|ogg|flac|opus)$/i;

const force = process.argv.includes("--force");

let existing = {};
try {
  existing = JSON.parse(await readFile(OUT_FILE, "utf8"));
} catch {
  // Ingen fil än – börja från noll.
}

const files = (await readdir(TRACKS_DIR)).filter((f) => AUDIO_EXT.test(f)).sort();
const result = {};

for (const file of files) {
  if (!force && existing[file]) {
    result[file] = existing[file];
    console.log(`✓ ${file} (redan klar)`);
    continue;
  }

  process.stdout.write(`… ${file} `);
  const { channelData, sampleRate } = await decode(await readFile(path.join(TRACKS_DIR, file)));
  const length = channelData[0].length;
  const bucket = Math.ceil(length / SAMPLES);
  const peaks = [];

  for (let i = 0; i < SAMPLES; i++) {
    const start = i * bucket;
    const end = Math.min(start + bucket, length);
    let max = 0;
    for (let s = start; s < end; s++) {
      let sum = 0;
      for (const ch of channelData) sum += Math.abs(ch[s]);
      const v = sum / channelData.length;
      if (v > max) max = v;
    }
    peaks.push(max);
  }

  const top = Math.max(...peaks) || 1;
  result[file] = {
    duration: Math.round((length / sampleRate) * 100) / 100,
    peaks: peaks.map((p) => Math.round((p / top) * 1000) / 1000),
  };
  console.log(`klar (${result[file].duration}s)`);
}

const removed = Object.keys(existing).filter((f) => !result[f]);
for (const f of removed) console.log(`− ${f} (filen finns inte längre)`);

await writeFile(OUT_FILE, JSON.stringify(result) + "\n");
console.log(`\nSparade ${Object.keys(result).length} låt(ar) i src/data/peaks.json`);
