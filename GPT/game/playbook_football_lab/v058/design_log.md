# Playbook Football Lab v058 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v057 で削除確認の状態は視覚以外にも伝わるようになった。次に弱かったのは replay marker の active 表示で、exact frame の 1 点だけに依存しているため、スクラブや再生中にイベント地点を見失いやすかった。v058 では現在 frame から近い marker を前後 4 frame の window 内で active とみなし、プレーの出来事を追いやすくする。

## 変更

- `replayMarkerActiveWindowFrames` を追加した。
- `activeReplayMarkerForIndex()` で近傍 frame の marker を選ぶようにした。
- marker strip の active / `aria-current` を近傍判定に合わせた。
- debug snapshot に active window を追加した。
- storage key を v058 に更新した。

## 残り

- badge 文と live region 文はまだ英語で、日本語 UI との一体感が弱い。
- urgency は clock までは見ていない。
