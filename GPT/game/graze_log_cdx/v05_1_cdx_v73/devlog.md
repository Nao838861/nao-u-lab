# graze_log v05.2_cdx_v73 devlog

## 2026-05-24 Codex v73: policy-by-cue review matrix

### 背景

v72 は route / seed 12345 で CHASE、Active DEF、boss cue、BOMB の stable frame を選べた。継続 directive の主眼は、AI がゲームを作る時の headless のあり方を実地検証することなので、今回は gameplay は固定し、同じ cue family が policy によってどう違う frame として現れるかを見る。

### 実装

- `v05_1_cdx_v73` を v72 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `index.html` の version 表記と source note を v73 化。
- v72 の既存 headless check 群を v73 に複製。
- `tools/headless_graze_log_cdx_v05_2_v73_policy_cue_review_check.js` を追加。
- policy cue review は `route / aggressive / marksman / survival` で `chasePopup / activeDef / bossCue / bomb` の stable frame を探索する。
- 代表 4 件は Chrome headless の DOM / screenshot で version、canvas contract、画像サイズを確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v73_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v73_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v73_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_cue_review_check.js
```

### 結果

7 本すべて pass。新規 `policy_cue_review_check` では、route が CHASE / Active DEF / boss cue / BOMB の 4 cue family をすべて検出し、aggressive / marksman は boss cue と BOMB を検出した。survival は boss cue に届かず、BOMB と Active DEF に寄る cue absence として記録した。

`policy_cue_review_check` は `memory/raw/headless_eval/graze_log_cdx_policy_cue_review.jsonl` に raw result を追記し、`.tmp/graze_log_cdx_v73_policy_cue_review/` に確認用 screenshot を生成した。

### 次

policy x cue family の候補 frame が通れば、次は「どの frame を人間に渡すべきか」を HTML packet にまとめる。通らない場合は gameplay 変更ではなく、policy がその cue を出さない理由を先に記録する。
