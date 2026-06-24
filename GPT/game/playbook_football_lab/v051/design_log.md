# Playbook Football Lab v051 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v050 で replay と結果分析の接続は改善した。次は編集の手触り。route slot と defensive look の保存操作はよく使うのに、2列グリッドで主操作と危険操作が同じ見え方だった。小さな toolbar にして、保存を primary、矢印を icon、削除を danger として整理する。

## 変更

- `slot-toolbar` と `defense-toolbar` を追加した。
- route slot の Save / ↑ / ↓ / Delete を 1 行の compact toolbar にした。
- defense look の Save / New / Copy / ↑ / ↓ / Delete を 1 行の compact toolbar にした。
- danger と primary のスタイルを分けた。
- storage key を v051 に更新した。

## 残り

- delete countdown はまだ progress 表現ではない。
- reorder の端状態はまだ disabled で見えない。
