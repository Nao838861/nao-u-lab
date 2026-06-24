# Playbook Football Lab v041 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v040 で最弱 defender の危険度は見えるようになった。ただし守備調整では「そこを直したら次にどこが弱いか」が重要になるため、2 番目に弱い defender を薄く表示するのが次の改善として妥当だと判断した。

## 変更

- `drawSecondWeakCoverageCue()` を追加した。
- current coverage strength の下位 2 件から second weak を選ぶようにした。
- second weak は琥珀色の薄いリング、破線、短い `next weak` ラベルで表示する。
- debug snapshot に `secondWeakCoverage` を追加した。
- storage key を v041 に更新した。

## 残り

- second weak のラベルはまだ field bounds clamp していない。
- 保存済み look の並び替えはまだできない。
