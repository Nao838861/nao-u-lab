# Playbook Football Lab v049 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v048 で結果差分へ戻る導線はできた。次は pre-snap の弱点 cue がフットボール状況を見ていない点が気になった。2nd & 6 と 4th & 1 で同じ grade の弱点が同じ強さに見えるのは判断支援として弱いので、down / distance urgency を threat style に混ぜる。

## 変更

- `downDistanceUrgency()` を追加した。
- `weakThreatStyle()` と `secondWeakThreatStyle()` の danger に urgency を加えた。
- second weak は urgency を 72% に抑え、主 weak との視覚階層を保った。
- debug snapshot に `downDistanceUrgency` を追加した。
- storage key を v049 に更新した。

## 残り

- `PREVIEW DELTA` frame で field 上に分析 badge はまだ出していない。
- 保存ボタン群はまだ散らかっている。
