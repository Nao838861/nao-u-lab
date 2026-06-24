# Playbook Football Lab v029 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

守備編集の直接性、可視化、overlay 保存まで整ったので、次は戦術案を複数残せることが重要になる。PlayMaker 的な面白さはプレーや守備案を保存して比較するところにあるため、守備保存も route slot と同じ方向へ拡張した。

## 変更

- 守備保存を named slots 形式へ拡張した。
- legacy layout 形式は `Saved 1` に移行する。
- `Save defense` と `New look` を分けた。
- 守備 look 一覧と snapshot を追加した。

