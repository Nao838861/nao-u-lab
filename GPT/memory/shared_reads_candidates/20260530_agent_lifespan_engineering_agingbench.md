---
title: "Your Agents Are Aging Too: Agent Lifespan Engineering for Deployed Systems"
url: "https://arxiv.org/abs/2605.26302"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, memory, lifespan, harness, game-testing]
---

## raw_excerpt

arXiv 要旨によると、AgingBench は long-lived AI agents を day-one benchmark だけで評価する問題を扱う。agent は model weights が固定でも、interaction history の圧縮、memory store の成長、fact revision、maintenance によって effective state が変わるため、reliability は base model の snapshot 性能ではなく harness 全体の lifespan property になる。提案は agent aging を compression aging、interference aging、revision aging、maintenance aging の 4 mechanism に分け、temporal dependency graph と paired counterfactual probes で memory pipeline の write / retrieval / utilization stage を診断すること。7 scenarios、14 models、複数 memory policy、runner-controlled / autonomous agent を含む 400 run 超、8-200 sessions の実験で、behavioral tests が clean に見えても factual precision が落ちるなど、劣化が一方向ではないことを示している。

## why_relevant_to_games

ゲーム制作 agent や headless 評価 agent を継続運用すると、記憶・評価基準・修正履歴が蓄積して挙動が変わる。長期サイクルで「評価器が古びる」問題を扱う候補。
