# Playbook Football Lab v040 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v039 で weak defender の target は見えるようになった。ただし線の強さが固定だと、どの程度危ないのかを瞬時に読めない。次は grade を視覚変数に変換して、危険な弱点ほど強く見せるのが妥当だと判断した。

## 変更

- `weakThreatStyle()` を追加した。
- weak grade から `danger` を計算するようにした。
- threat line の太さ、alpha、target marker 半径を danger に連動させた。
- zone landmark 線の alpha も danger に連動させた。
- debug snapshot に `weakCoverageThreatStyle` を追加した。

## 残り

- 2番目に弱い defender との比較はまだできない。
- 保存済み look の並び替えはまだできない。
