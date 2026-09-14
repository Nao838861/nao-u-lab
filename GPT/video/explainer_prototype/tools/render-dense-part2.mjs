import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, ".."),
  out = path.join(root, "out/part2/rebuilt");
await mkdir(out, { recursive: true });
const m = JSON.parse(
  await readFile(path.join(root, "narration/part2-cuts.json"), "utf8"),
);
const a = JSON.parse(
  await readFile(path.join(root, "src/part2Alignment.json"), "utf8"),
);
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  publicDir: path.join(root, "public"),
});
const composition = await selectComposition({ serveUrl, id: "Part2Rebuilt" });
const samples = [];
for (const c of m.cuts) {
  const start = c.startFrame + (c.sourceCut === "C01" ? 0 : 4621);
  for (const f of [0.25, 0.7])
    samples.push({
      id: `${c.id}_${f}`,
      frame: start + Math.floor(c.durationFrames * f),
    });
  if (["C30", "C31", "C32", "C33", "C34", "C18"].includes(c.sourceCut)) {
    for (let i = 0; i < c.sentences.length; i++)
      samples.push({
        id: `${c.id}_sentence${i}`,
        frame: Math.min(
          start + c.durationFrames - 1,
          start + Math.floor(((a[c.id]?.starts[i] ?? 0) + 1.5) * 30),
        ),
      });
  }
}
for (const [name, offset] of [
  ["old18", 45],
  ["old19", 640],
  ["old20", 1259 + 300],
  ["old21", 1259 + 1230],
  ["old22", 1259 + 2100],
  ["old23", 1259 + 2700],
])
  samples.push({ id: name, frame: m.cuts[0].durationFrames + offset });
if (!process.argv.includes("--video-only"))
  for (const sample of samples) {
    await renderStill({
      serveUrl,
      composition,
      frame: sample.frame,
      output: path.join(out, sample.id + ".png"),
    });
    console.log("QA " + sample.id);
  }
await writeFile(
  path.join(out, "samples.json"),
  JSON.stringify(samples, null, 2),
);
if (process.argv.includes("--stills-only")) process.exit(0);
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  crf: 18,
  concurrency: 12,
  outputLocation: path.join(out, "part2_rebuilt_full_720p30.mp4"),
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 100);
    if (p >= last + 5) {
      last = p;
      console.log("render " + p + "%");
    }
  },
});
console.log("Video ready");
