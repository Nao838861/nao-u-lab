# graze_log v05.2_cdx_v43 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> v42 で graze_log 側にも複数 bot style が入り、shot_log と同じ policy split 比較ができるようになった。次は style compare v002 の report を JSONL に保存し、v42 以降の version 間で signature diff を見られるようにする。

## 実装前判断

今回は敵配置やスコア式を動かすより、v42 で作った評価信号を「次の版と比較できる保存物」にする方が重要だと判断した。単発の headless 出力だけでは、次サイクルで良くなった/悪くなったを人間が追いにくい。そこで v43 はゲーム本体の playable 内容を維持し、telemetry summary に version / method / trace digest を入れ、比較 script が JSONL に記録を残す形にした。

使った過去知見:

- `Playable / Headless 評価`: 起動と clear だけでなく、playthrough の中身を観測する。
- `Repair / Iterative Improvement`: 後から比較できる evidence を残す。
- `Feedback / Rights / Human Judgment`: headless は面白さの代替判定ではなく、人間評価前に差分を見つける補助。
- v42 の学び: policy split は有効だが、結果を保存しないと版間の改善判断に接続しない。

## 設計サイクル 1

良いところ / 悪いところの要約:

- 良い: v42 は route / aggressive / defensive / panic の差を同一 stage / seed で出せる。
- 良い: 30f cadence sample と sparse event は、coverage / pressure / movement / kill / bomb を説明できる。
- 悪い: `node tools\headless_game_style_compare_v002.js` の出力は標準出力だけで、次版との比較対象として残らない。
- 悪い: `summarizeEvalTelemetry()` に version と method がなく、別版の summary を混ぜると意味が曖昧になる。
- 悪い: `panic` は人間の焦りではなく端逃げ policy なので、trace digest 側でも pressure / movement として扱う必要がある。

改善案:

- v42 を v43 にコピーし、ゲーム内容と bot policy は維持する。
- summary に `version`, `evalMethod`, `seed`, `phaseCoverage`, `riskEconomyScore`, `traceDigest` を追加する。
- `exportEvalLedger()` を追加し、summary / routeLog / events / samples を headless から取得できるようにする。
- `tools/headless_game_style_compare_v003.js` で `memory/raw/game_eval/graze_log_style_compare.jsonl` に 1 run 1 record を追記する。

採用案:

`graze-ledger-v001` として、保存対象を compact な trace digest 中心に絞った。全 sample / event はゲーム本体から export できるが、JSONL には style ごとの digest だけを保存する。これによりログが肥大化しすぎず、次サイクルで v43 と v44 の比較をしやすい。

## 懸念

- v43 は評価保存の改善であり、プレイヤーが感じる新しい敵配置や新 mechanics は増えていない。
- JSONL への追記は同じ script を何度も走らせると同一条件の行が増える。これは run record としては許容するが、分析時は最新行や commit 単位で見る必要がある。
- `riskEconomyScore` は provisional な比較補助であり、単独で面白さを判定しない。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v43_check.js
node tools\headless_game_style_compare_v003.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- v43 summary は `version: v05_1_cdx_v43` と `evalMethod: graze-ledger-v001` を持つ。
- `exportEvalLedger()` の eventCount / traceDigest が summary と一致する。
- style compare v003 が shot_log と graze_log の policy split を検証し、`memory/raw/game_eval/graze_log_style_compare.jsonl` に保存する。

## 次の作業

v44 では `graze_log_style_compare.jsonl` の最新2版を読み、trace digest の差分を表示する小さな compare script を作る。差分が読めるようになったら、敵配置や boss cue の本質的な変更を再開し、その変更が route / aggressive / defensive / panic にどう効いたかを記録する。
