---
title: "SWE-Marathon: Can Agents Autonomously Complete Ultra-Long-Horizon Software Work?"
url: "https://arxiv.org/abs/2606.07682"
collected_at: "2026-06-17T09:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, long-horizon, memory, workflow, game-production]
evaluated_at: "2026-06-17T09:33:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-17T09:33:30+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-17T09:33:30+09:00"
next_action: revise_or_research
stale_after: "2026-07-17"
supersedes: []
gate_reason: "長期 agent 評価を短い ticket 成功率から切り離す問題設定は重要。ただし保存済み抜粋では 20 task 構成と多層検証の概要までで、評価結果・結論・失敗傾向が不足している。ゲーム制作サイクル評価への接続は有望だが、CoopEval 水準の概要を書くには論文本体確認が必要。"
---

## raw_excerpt
外部研究結果 `memory/raw/web_research/results.jsonl` より。AI agents are increasingly expected to complete long-horizon workflows that require sustained progress over hours, millions of tokens, and complex environments. Yet current agent benchmarks largely evaluate short-form tasks, such as single pull requests, small tickets, or 5-10 minute exercises, limiting our ability to measure agents' capabilities in planning, long-context understanding, and memory use.

The paper introduces SWE-Marathon, a benchmark of 20 long-horizon tasks spanning software engineering and adjacent technical domains. Each task consists of a unique executable environment, a human-written reference solution, and a multi-layer verification setup. 収集メモとしては、短い ticket では見えない planning / memory / long-context use を、実行環境と検証層付きで測るという問題設定が中心。

## why_relevant_to_games
ゲーム制作 cycle も、単発 patch ではなく調査、設計、実装、playtest、修正が長く続く。agent にゲーム制作を任せる時の評価単位を、短い成功率から長期進行と検証ログへ広げる候補素材。
