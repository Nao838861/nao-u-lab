---
title: "Ask Early, Ask Late, Ask Right: When Does Clarification Timing Matter for Long-Horizon Agents?"
url: https://arxiv.org/abs/2605.07937
collected_at: 2026-05-16T11:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, clarification, long-horizon, evaluation, workflow]
source_note: "memory/raw/web_research/results.jsonl query=AI coding agents benchmark workflow; arXiv page checked 2026-05-16"
---

## raw_excerpt

arXiv abstract short quotes:

> "a single wrong assumption early on can cascade into irreversible errors"

> "the value of clarification depends sharply on what information is missing"

採取メモ: Gulati ほかによる 2026-05-08 submitted paper。長い作業を行う AI agent が、曖昧な指示に対して「聞くべきか」だけでなく「いつ聞くべきか」を測る。forced-injection framework により、goal / input / constraint / context の 4 種類の情報を、agent trajectory の異なる時点で注入し、3 benchmark、4 frontier model、84 task variants、6000+ runs で比較する。抽象のポイントは、早ければ常に良いのではなく、goal clarification は実行 10% を過ぎると価値をほぼ失い、input clarification は 50% 付近まで価値が残る、mid-trajectory を過ぎた clarification は never asking より悪化しうる、という timing profile。

## why_relevant_to_games

ゲーム制作サイクルで「曖昧だが進める」「今聞く」「後で評価する」の境界を設計する材料。特に phase 制の中で、着手前ゲートと実装途中確認を分ける判断に使えそう。
