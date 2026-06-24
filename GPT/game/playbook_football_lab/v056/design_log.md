# Playbook Football Lab v056 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v055 で状況判断は進んだ。次は replay の読解。marker から frame に飛べるが、飛んだ後に strip のどの event を見ているかが残らない。現在 frame と一致する marker を active にする。

## 変更

- marker button に `data-frame` を持たせた。
- `syncReplayMarkerActive()` で現在 frame と marker frame を比較する。
- active marker に class と `aria-current` を付ける。
- debug snapshot に `activeReplayMarker` を追加した。
- storage key を v056 に更新した。

## 残り

- delete confirmation の aria 補助はまだない。
- marker active は exact frame 一致だけで、近傍 frame では点灯しない。
