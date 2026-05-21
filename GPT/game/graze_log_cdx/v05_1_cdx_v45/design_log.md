# graze_log v05.2_cdx_v45 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は latest2 compare の digest delta を見ながら、敵配置または boss cue の本質的変更を 1 件入れる。

## 実装前判断

v44 は比較基盤の整備が主で、プレイ体験の変化は `bossCue` event が trace に入ったことに限られていた。今回は敵配置全体を広く変えず、boss final cue だけを「文字の合図」から「短い退避先を読む圧」に変える。変更範囲を boss cue に閉じることで、latest2 compare で v44 -> v45 の差分が読みやすい。

使った過去知見:

- `Playable / Headless 評価`: clear だけでなく、event trace と pressure を残す。
- `Repair / Iterative Improvement`: 変更は小さくし、次サイクルで比較できる digest を残す。
- `Feedback / Rights / Human Judgment`: headless は楽しさの代替ではないため、「読める圧が trace に入ったか」までを機械確認する。
- v44 の学び: `bossCue` だけでは final BOMB prompt が見えた証拠にはなるが、プレイヤーの判断を作った証拠にはならない。

## 設計サイクル 1

良いところ / 悪いところ:

- 良い: v44 は route / aggressive / defensive / panic の policy split と JSONL 保存が通っている。
- 良い: boss final cue は clear route 上で到達できる。
- 悪い: cue が主に文字表示で、画面上の避ける・寄る判断に接続していない。
- 悪い: v44 の `bossCue` count だけでは、final cue が弾幕圧を作ったかを比較できない。

改善案:

- boss final cue 発火時に、プレイヤー位置と反対側に短い GAP を示す escape-gate volley を出す。
- `bossCueVolley` event を追加し、trace digest に `bossCueVolley` count を入れる。
- 敵 HP、route timeline、midboss 以前の配置は変えない。
- `tools/headless_game_style_compare_v005.js` で v45 record を JSONL に保存し、`tools/compare_graze_log_style_latest2.js` で latest2 delta に `bossCueVolley` を出す。

採用案:

boss cue のみに playable diff を限定した。final cue で `CORE OPEN - BOMB` と同時に `GAP` を出し、7 本の短命 cue bullet を流す。route bot は従来通り BOMB を使って clear できるが、trace 上では `bossCueVolley: 1` が残る。

## 懸念

- bot は cue の次フレームで BOMB を使いやすく、escape-gate volley を長く避け続ける評価にはなっていない。
- `bossCueVolley` は「圧を生成した」証拠であり、「人間に楽しい/読みやすい」証拠ではない。
- 今回は final cue だけを変えたため、道中の密度や敵配置の根本改善は次サイクル以降に残る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v45_check.js
node tools\headless_game_style_compare_v005.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- v45 summary は `version: v05_1_cdx_v45` と `evalMethod: graze-ledger-v002` を持つ。
- `exportEvalLedger()` の trace digest に `bossCue: 1` と `bossCueVolley: 1` が入る。
- style compare v005 が v45 record を JSONL に追記する。
- latest2 compare が v44 -> v45 の digest delta を出し、`bossCueVolley` が最新側で 1 になっている。

## 次の作業

次版では latest2 compare の pressure / movementSwitches / kills の差分を見て、boss cue の GAP が実際に緊急判断として読めるかを人間プレイ前の観察項目にする。道中を触る場合は、具体 wave、敵数、座標、duration、実装後 trace を design_log に残す。
