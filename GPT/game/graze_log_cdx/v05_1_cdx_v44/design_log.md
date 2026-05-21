# graze_log v05.2_cdx_v44 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は `memory/raw/game_eval/graze_log_style_compare.jsonl` の最新2版を比較する script を作り、敵配置や boss cue の本質的変更を trace digest で見られるようにする。

## 実装前判断

今回は敵配置の追加よりも、直近の評価保存を「版間比較」へ接続することを優先した。v43 で JSONL 保存はできたが、次版との差分を読む道具がないため、人間が改善点を判断する時に標準出力やログを手で見比べる必要が残っていた。

使った過去知見:

- `Playable / Headless 評価`: clear だけではなく、route / pressure / movement / event trace を残す。
- `Repair / Iterative Improvement`: 次サイクルで比較できる evidence を保存する。
- `Feedback / Rights / Human Judgment`: headless は「楽しい」の代替ではなく、人間評価前の差分発見補助に留める。
- v43 の学び: JSONL へ保存しただけでは十分ではなく、最新2版の digest を読む script が必要。

## 設計サイクル 1

良いところ / 悪いところの要約:

- 良い: v43 は `route / aggressive / defensive / panic` の trace digest を JSONL に保存できる。
- 良い: bot policy split により、単一 bot の適性だけでゲームの良し悪しを見ない形になった。
- 悪い: v43 の digest は boss final cue が trace 上の明示イベントになっていない。
- 悪い: JSONL の最新2版を読む script がなく、差分確認が手作業になる。
- 悪い: `panic` は人間の焦りではなく端逃げ policy なので、差分解釈ではこの限界を見える形にする必要がある。

改善案:

- v43 を v44 にコピーし、ゲーム本体の stage / enemy grammar は維持する。
- `EVAL_METHOD_VERSION` を `graze-ledger-v002` に上げる。
- boss final cue が出た瞬間に `bossCue` event を記録し、trace digest に `bossCue` count を入れる。
- `tools/headless_game_style_compare_v004.js` で v44 の JSONL record を保存する。
- `tools/compare_graze_log_style_latest2.js` を追加し、最新2版の style digest delta を JSON で出す。

採用案:

`bossCue` を digest に加えるだけの小さな playable diff にした。敵配置を同時に変えないことで、v43 との差分が `bossCue` event 追加に限定され、比較 script の検証が読みやすい。敵配置や boss cue の中身を本格的に動かすのは、v44 の latest2 compare が通った後に戻す。

## 懸念

- v44 は評価系の改善が主で、プレイヤー体験としての新 wave は増えていない。
- v43 の古い JSONL record には `bossCue` が存在しないため、比較 script では未記録を 0 として扱う。
- `bossCue` count が増えることは、final BOMB prompt が trace に載った証拠であり、prompt の見やすさや面白さそのものの判定ではない。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v44_check.js
node tools\headless_game_style_compare_v004.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- v44 summary は `version: v05_1_cdx_v44` と `evalMethod: graze-ledger-v002` を持つ。
- `exportEvalLedger()` の trace digest に `bossCue: 1` が入る。
- style compare v004 が v44 record を JSONL に追記する。
- latest2 compare が v43 -> v44 の digest delta を出し、`bossCue` の増加を検出する。

## 次の作業

次版では latest2 compare の出力を見ながら、敵配置か boss cue の本質的な変更へ戻る。変更する場合は、具体 wave、敵数、座標、duration、実装後 trace を design_log に残す。
