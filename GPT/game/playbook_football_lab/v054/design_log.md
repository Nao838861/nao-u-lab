# Playbook Football Lab v054 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v053 で delete confirmation の視認性は上がった。次は replay 分析。`PREVIEW DELTA` badge は field 上に出るようになったが、長い preview delta 文を切るだけなので、見るべき理由がすぐに入ってこない。結果種別ごとの短文に分ける。

## 変更

- `previewDeltaBadgeText()` を追加した。
- sack は pressure、incomplete は coverage、penalty は holding、complete は catch/RAC として要約する。
- result card の長い比較文は残し、field badge だけ短文にする。
- storage key を v054 に更新した。

## 残り

- urgency はまだ field position を見ていない。
- replay marker 自体の選択中状態はまだない。
