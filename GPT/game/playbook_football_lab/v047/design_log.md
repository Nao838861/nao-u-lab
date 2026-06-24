# Playbook Football Lab v047 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v046 で削除確認の状態は分かりやすくなった。次は weak 表示の比較側が少し粗い。主 weak には danger style があるのに second weak は固定線だったため、比較情報としての密度を上げるべきだと判断した。

## 変更

- `secondWeakThreatStyle(second)` を追加した。
- second weak の ring radius / line width / alpha / target radius を grade に連動させた。
- 主 weak より控えめな範囲に抑え、視覚階層は維持した。
- debug snapshot に `secondWeakThreatStyle` を追加した。
- storage key を v047 に更新した。

## 残り

- replay marker から preview 差分地点へはまだジャンプできない。
- threat line の危険度に down / distance はまだ反映していない。
