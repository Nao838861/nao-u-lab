# Playbook Football Lab v063 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v062 で active window の存在は分かるようになった。次は、複数 marker が window 内にある場合の選択根拠が暗黙だった。リプレイの挙動は検証しやすさが重要なので、v063 では候補一覧と理由を snapshot に出す。

## 変更

- `activeReplayMarkerCandidates()` を追加した。
- active marker は距離順、同距離なら登録順で決める形にした。
- snapshot に候補一覧と reason を追加した。
- storage key を v063 に更新した。

## 残り

- 日本語化した文言の長さは field badge 幅に対してまだ最適化しきれていない。
- clock は簡易モデルで、タイムアウトやハーフ終了の戦術までは扱っていない。
