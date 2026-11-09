---
name: セッション内CronCreateは使わない
description: 外部タスクスケジューラ(schtasks/crontab)で毎回新セッション起動する方式に統一。CronCreateは使用禁止。
type: feedback
---

セッション内でCronCreateを使わない。外部タスクスケジューラ（schtasks/crontab）で毎回新セッション起動する方式に統一。

**Why:** 2026-03-20 Nao_u確認済み。以前はCronCreateでセッション内タイマーを登録していたが、外部スケジューラ方式に移行した。scheduler_ash.pyがschtasksから起動され、各フェーズを順次実行する。

**How to apply:** セッション開始時にCronCreateを使おうとしない。スケジューラ基盤（scheduler_ash.py等）はNao_uが管理しており、編集禁止。
