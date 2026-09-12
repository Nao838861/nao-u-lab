// 生成音声の文字起こし。秘密情報は出力しない。
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const root = path.resolve(import.meta.dirname, "..");
let key = process.env.OPENAI_API_KEY;
for (const file of [
  path.join(root, ".env"),
  path.join(root, "key.env"),
  path.resolve(root, "../../.env"),
]) {
  if (key) break;
  try {
    const s = await readFile(file, "utf8");
    key =
      s.match(/^OPENAI_API_KEY\s*=\s*["']?([^\s"']+)/m)?.[1] ??
      (s.trim().startsWith("sk-") ? s.trim() : undefined);
  } catch {}
}
if (!key) throw new Error("API key unavailable");
const m = JSON.parse(
  await readFile(path.join(root, "narration/part2-cuts.json"), "utf8"),
);
const out = path.join(root, "public/narration/part2/transcripts");
await mkdir(out, { recursive: true });
let cursor = 0;
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (cursor < m.cuts.length) {
      const c = m.cuts[cursor++];
      const dest = path.join(out, c.id + ".json");
      const wav = await readFile(
        path.join(root, "public/narration/part2", c.id + ".wav"),
      );
      const audioHash = createHash("sha256").update(wav).digest("hex");
      try {
        const old = JSON.parse(await readFile(dest, "utf8"));
        if (old.sourceText === c.ttsText && old.audioHash === audioHash) {
          console.log(c.id + " cached");
          continue;
        }
      } catch {}
      const form = new FormData();
      form.append(
        "file",
        new Blob([wav], { type: "audio/wav" }),
        c.id + ".wav",
      );
      form.append("model", "whisper-1");
      form.append("language", "ja");
      form.append("response_format", "verbose_json");
      form.append("timestamp_granularities[]", "word");
      const res = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        },
      );
      if (!res.ok) throw new Error(`${c.id}: transcription HTTP ${res.status}`);
      await writeFile(
        dest,
        JSON.stringify(
          { ...(await res.json()), sourceText: c.ttsText, audioHash },
          null,
          2,
        ) + "\n",
      );
      console.log(c.id + " transcribed");
    }
  }),
);
