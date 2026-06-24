# Playbook Football Lab v031 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v030 の strength panel は比較材料として有効だが、field との接続が弱い。守備を直す操作はフィールド上で行うため、最弱 defender を直接フィールドで示す方が改善行動につながる。

## 変更

- `drawWeakCoverageCue()` を追加した。
- 最弱 defender を赤い破線リングと `weak` ラベルで表示した。
- snapshot に `weakCoverage` を追加した。

