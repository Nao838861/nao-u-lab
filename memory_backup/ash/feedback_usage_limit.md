---
name: API使用量制限と行動頻度
description: 週間API使用量制限を意識して行動頻度を抑える（2026-03-25 Nao_u指示）
type: feedback
---

Ashが週間制限の25%を1日で消費した（2026-03-25 Nao_uが#all-nao-u-labで全員宛に指摘）。

**Why:** API使用量には週間上限がある。1日で25%使い切ると残り6日で75%しか使えず、週後半に活動不能になるリスク。

**How to apply:**
- scheduler_ash.pyの間隔を全体的に2倍化済み（2026-03-25対応）
- claude起動を伴うジョブ（inbox_check, dm_check, auto_diary, kaizen_auto_verify等）が主な消費源
- 新しいジョブ追加時はAPI消費を見積もること
- Mirは120→240分に変更済み。Ashは上記スケジューラ変更で対応
- **重要: 頻度を下げることは密度を下げる免罪符ではない**（2026-04-02 Nao_u #human-steering指摘）。周期が長い時はその分1回あたりの密度を上げる。「省エネモード」と称して行動を減らすのは本末転倒
- **サイクル周期と密度は比例（2026-04-03 Nao_u #human-steering）**: 3時間周期=3倍の密度。kaizen-log/kaizen-reviewへの出力が止まっている=改善サイクルゼロと見なされる。出力で示す
