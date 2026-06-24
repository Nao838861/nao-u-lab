# Playbook Football Lab v062 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v061 で clock pressure は入った。次に、replay marker が前後 4 frame でも active になる仕様が画面上では分かりにくい。常時表示テキストを増やすと field がうるさくなるため、marker button の title / aria-label と debug snapshot へ範囲情報を出す。

## 変更

- marker button の title と aria-label に active window を追加した。
- `activeReplayMarkerDistance()` を追加した。
- snapshot に active marker までの距離を追加した。
- storage key を v062 に更新した。

## 残り

- marker 同士が近い時の優先順位は snapshot にまだ出ていない。
- clock は簡易モデルで、タイムアウトやハーフ終了の戦術までは扱っていない。
