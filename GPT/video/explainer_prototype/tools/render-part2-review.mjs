import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out/part2");
await mkdir(out, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  publicDir: path.join(root, "public"),
});
const composition = await selectComposition({ serveUrl, id: "Part2Review" });
const m = JSON.parse(
  await readFile(path.join(root, "narration/part2-cuts.json"), "utf8"),
);
if (!process.argv.includes("--video-only")) {
  for (const c of m.cuts) {
    for (const fraction of [0.25, 0.7]) {
      await renderStill({
        serveUrl,
        composition,
        frame: c.startFrame + Math.floor(c.durationFrames * fraction),
        output: path.join(out, `${c.id}_${fraction}.png`),
      });
    }
    console.log("QA " + c.id);
  }
}
if (process.argv.includes("--stills-only")) process.exit(0);
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  crf: 21,
  concurrency: 4,
  outputLocation: path.join(out, "part2_review_720p60.mp4"),
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 100);
    if (p >= last + 5) {
      last = p;
      console.log(`render ${p}%`);
    }
  },
});
console.log("Video ready: " + path.join(out, "part2_review_720p60.mp4"));
