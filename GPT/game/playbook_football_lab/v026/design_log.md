# Playbook Football Lab v026 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v025 の時点で man/press は見えるようになったが、zone duty はまだ文字としてしか存在していなかった。フットボールらしい守備設計には「誰がどこを守るか」が見えることが必要なので、zoneLandmark を直接描画に使う。

## 変更

- `drawZoneLandmarks()` を追加した。
- zone defender の landmark に gold pad を描いた。
- 選択中 defender の zone pad を強調した。
- snapshot に `zoneLandmarks` を追加した。

