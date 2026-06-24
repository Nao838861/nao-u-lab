# Playbook Football Lab v057 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v056 で replay marker の現在位置は見えるようになった。次は delete confirmation の補助。progress は視覚的に分かるが、支援技術には残り時間や確認状態が弱い。aria label と live region で補う。

## 変更

- `deleteLookStatus` live region を追加した。
- `resetDefenseButton` に `aria-describedby` と confirming 中の `aria-pressed` を追加した。
- `aria-label` を通常時と confirmation 中で切り替える。
- debug snapshot に `deleteLookAriaLabel` と `deleteLookStatus` を追加した。
- storage key を v057 に更新した。

## 残り

- marker active は exact frame 一致だけで、近傍 frame では点灯しない。
- live region は英語で、UI の日本語とはまだ揃っていない。
