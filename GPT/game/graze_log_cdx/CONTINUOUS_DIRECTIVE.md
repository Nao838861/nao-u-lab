# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-23T00:00:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v59/` で v58 の bottom-camp 対策を維持しつつ、上中段で横切り `raider` / lateral target を倒す `CHASE` 報酬を追加した。`forwardAttackPct` / `forwardChaseKills` / `chaseBonus` を telemetry と policy matrix に追加し、`tools/headless_graze_log_cdx_v05_2_v59_check.js` と `tools/headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js` が pass。matrix では route/aggressive/marksman が clear し、chaseBonus は route 19157 / aggressive 54322 / marksman 51377、camper は clear 0 / routeCoverage 0.313 / chaseBonus 0。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v47 で boss 前の手作り wave `DP cross-lock carrier braid` は `crossLockWave` と route event として trace に入った。
2. v48 で midboss 後の手作り wave `DP post-midboss cross squeeze` は `postMidCrossWave` と route event として trace に入った。
3. v49 で 2 つの横移動 wave に薄い lane guide と専用敵色を追加し、`readabilityGuides: 2` を trace に入れた。
4. v50 で guide を alpha 0.10 / lineWidth 2.2 に下げ、post-midboss の中央線を削った。
5. v53 で alpha 0.12 は採用可能に見える。Browser Use Node REPL が使えるセッションで in-app browser 目視する余地は残る。
6. v55 で policy 側に「初心者らしい迷い」「狙い撃ち優先」「生存優先」を追加した。次は seed 本数より、matrix JSONL の過去版比較 helper が有効。
7. v59 で `CHASE` 報酬を追加し、底待ちへの罰だけでなく、前へ出る積極報酬を headless で分離した。
8. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case を、人間評価前の比較補助として使う。
9. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
10. `panic` は人間の焦りの再現ではなく端逃げ policy。v55 では `novice` が panic より遅い失敗様式として追加されたが、これも人間再現ではなく proxy として扱う。
11. 次の焦点は、Browser Use または実機で `CHASE` popup と上中段迎撃の見た目がうるさくないか、突撃一択になっていないかを確認すること。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
