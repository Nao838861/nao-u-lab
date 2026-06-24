# Playbook Football Lab v061 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v060 で mobile toolbar の窮屈さは少し下がった。次に残るのは状況感で、weak threat urgency が down / distance と field position だけを見ていた。フットボールらしさには時間の圧も必要なので、v061 では簡易 clock を state と topbar に接続し、2 minute 付近や 4Q 終盤で urgency を少し上げる。

## 変更

- `clockText` と `driveText` の topbar 接続を整えた。
- `quarter` / `clockSeconds` と `advanceGameClock()` を追加した。
- `gameClockUrgency()` を weak threat urgency に加算した。
- snapshot と verify に clock urgency を追加した。
- storage key を v061 に更新した。

## 残り

- replay marker window の範囲は UI にはまだ出ていない。
- clock は簡易モデルで、タイムアウトやハーフ終了の戦術までは扱っていない。
