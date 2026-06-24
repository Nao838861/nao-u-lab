# Playbook Football Lab v055 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v054 で replay badge は短くなった。次は状況判断。weak cue は down / distance を見ているが、ball on 80 と ball on 30 が同じに扱われていた。得点圏に近づくほど弱点を突く価値は上がるので、field position urgency を控えめに足す。

## 変更

- `fieldPositionUrgency()` を追加した。
- ballOn が 60 / 75 / 90 を超えるごとに 0.04 / 0.08 / 0.12 を足す。
- 既存の down / distance 補正と合算し、全体上限を 0.5 にした。
- debug snapshot に `fieldPositionUrgency` を追加した。
- storage key を v055 に更新した。

## 残り

- replay marker 自体の選択中状態はまだない。
- delete confirmation の aria 補助はまだない。
