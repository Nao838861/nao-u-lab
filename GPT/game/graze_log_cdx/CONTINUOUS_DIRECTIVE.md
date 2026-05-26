# graze_log_cdx 継続改善 directive

status: stopped
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
stopped_at: 2026-05-27T00:19:02+09:00
stopped_by: codex
stop_reason: Nao_u の 2026-05-26 直接指示「graze_log_cdxの制作はもう止めていい」により、継続改善対象から外す。
last_handled_at: 2026-05-26T22:04:11+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v93/` で v92 の policy reason family + review question + review anchor 契約を維持しつつ、anchor を便宜的な frame window から `BOMB` / `firstChaseKill` / `gameOver` などの event-derived anchor へ更新した。`tools/headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js` は seeds 12345 / 77777 で route / aggressive / marksman clear、camper / survival / panic / defensive / novice failure、j4/j6 causal split、source telemetry match、rendered reason row + review question + event anchor contract、screenshot contract を検証して pass。raw evidence を `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。

2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 現在の焦点

1. v47-v49 の手作り cross wave と readability guide は維持する。
2. v55 以降の複数 bot policy は、単一 bot 適性に寄せない比較軸として維持する。
3. v58 以降の camper / bottom-camp bad-policy 分離は維持する。
4. v59-v62 の CHASE reward / popup は、良い policy には報酬を出し、bad policy には出さない検証軸として扱う。
5. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case / bad-policy failure を、人間評価前の比較証拠として使う。
6. v69-v72 の review stability packet と stable frame search を使い、単一 frame の見た目ではなく、人間確認に渡せる安定 frame を headless が選ぶ形へ寄せる。
7. v72 の cue family review を使い、CHASE 報酬だけでなく Active DEF / boss cue / BOMB も人間確認候補として抽出する。
8. v74 の human review packet を使い、raw JSON だけではなく、人間が policy 差分を同じ画面で確認できる evidence へ変換する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化していない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置がランダム出現ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が完成または停止を判断する。
