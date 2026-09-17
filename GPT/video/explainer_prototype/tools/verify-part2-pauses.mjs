// 保護した句読点を削らず、無音だけを編集したことを元PCMから確認する。
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { compactPcmWavSilence } from "./compact-narration-silence.mjs";
const root = new URL("../", import.meta.url);
const manifestName = process.argv.find(a => a.startsWith('--manifest='))?.slice(11) ?? 'part2-cuts.json';
const m = JSON.parse(
  await readFile(new URL("narration/" + manifestName, root), "utf8"),
);
const base = new URL("public/" + m.outputDirectory + "/", root);
const map = JSON.parse(await readFile(new URL("pause-map.json", base), "utf8"));
const stats = {};
for (const c of m.cuts) {
  if(c.silent)continue;
  const raw = await readFile(new URL("raw/" + c.id + ".wav", base));
  if (createHash("sha256").update(raw).digest("hex") !== map[c.id].rawHash)
    throw new Error(c.id + ": stale pause map");
  const options = { ...m.silenceCompaction, ...c.silenceCompaction };
  const result = compactPcmWavSilence(raw, options);
  const actual = await readFile(new URL(c.id + ".wav", base));
  if (!actual.equals(result.buffer))
    throw new Error(c.id + ": audio differs from verified edit");
  for (const b of map[c.id].punctuation.filter((b) => b.candidate !== null)) {
    const span = map[c.id].spans[b.candidate];
    if (
      result.stats.removals.some(
        (r) => r.startFrame < span.endFrame && r.endFrame > span.startFrame,
      )
    )
      throw new Error(c.id + ": punctuation pause removed");
  }
  if (
    result.stats.removals.some(
      (r) => r.pauseKind === "internal" && r.compactedDurationMs !== 110,
    )
  )
    throw new Error(c.id + ": unexpected pause target");
  if (result.stats.insertions.length && !c.pauseBeforeLastSentenceMs)
    throw new Error(c.id + ": unexpected inserted silence");
  if(result.stats.insertions.some(i=>i.pauseKind!=="custom"))
    throw new Error(c.id + ": inserted silence outside explicit pause");
  stats[c.id] = result.stats;
}
await writeFile(
  new URL("pause-verification.json", base),
  JSON.stringify(stats, null, 2) + "\n",
);
console.log(
  `Verified ${m.cuts.length} cuts: punctuation preserved, only detected PCM silence edited, output bytes match.`,
);
