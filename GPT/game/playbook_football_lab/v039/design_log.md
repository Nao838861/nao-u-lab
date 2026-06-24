# Playbook Football Lab v039 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v038 で保存ルック削除の不安は減った。次は「weak defender がなぜ弱いか」を文字だけでなく位置関係として見せるべきだと判断した。特に zone は landmark と receiver の関係が見えないと、フットボールの読みとして直感的にならない。

## 変更

- `currentCoverageStrength()` の各 row に `targetId` / `targetPoint` / `zonePoint` を追加した。
- `drawWeakCoverageThreat()` を追加した。
- man / press / rush は defender から target へ赤い破線を引く。
- zone は defender から zone landmark、zone landmark から target receiver へ分けて線を引く。
- debug snapshot に `weakCoverageTarget` を追加した。

## 残り

- threat line は常時同じ色で、成功/失敗の強弱はまだない。
- 保存済み look の並び替えはまだできない。
