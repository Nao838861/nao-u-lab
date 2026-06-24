# Playbook Football Lab v030 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v029 で守備 look を複数持てるようになったため、次は比較の根拠が必要になった。単に保存できるだけではプレーブック作成の面白さに届かないので、defender ごとの strength を出して、どの look がどこに強いかを読めるようにする。

## 変更

- `coverageCard` を追加した。
- `currentCoverageStrength()` で defender ごとの簡易 grade を計算した。
- `renderCoverageCard()` で best / weak spot と一覧を表示した。
- snapshot に `coverageStrength` を追加した。

