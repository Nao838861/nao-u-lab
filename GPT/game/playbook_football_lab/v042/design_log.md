# Playbook Football Lab v042 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v041 で second weak は見えるようになったが、追加したラベルが端で切れる可能性を残したままだった。新しい情報を増やす前に、既存表示が安定して読めるようにするのが優先だと判断した。

## 変更

- `secondWeakCoverageLabelBounds()` を追加した。
- `next weak` ラベルの x/y を field bounds 内に clamp した。
- `drawSecondWeakCoverageCue()` が固定 offset ではなく bounds helper を使うようにした。
- debug snapshot に `secondWeakCoverageLabel` を追加した。
- storage key を v042 に更新した。

## 残り

- 保存済み look の並び替えはまだできない。
- `Confirm delete` の残り時間は UI 上に表示していない。
