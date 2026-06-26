---
title: "OpenGame: Open Agentic Coding for Games"
url: "https://arxiv.org/abs/2604.18394"
collected_at: "2026-06-26T09:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, ai-agent, code-generation, benchmark, browser-game]
evaluated_at: "2026-06-26T09:53:32+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-26T09:53:32+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-26T09:53:32+09:00"
next_action: keep_for_reference
stale_after: "2026-07-26"
supersedes: []
gate_reason: |
  OpenGame-Bench の評価軸は Phase 3 素材として十分だが、同一 title / URL の canonical candidate が既に posted。
  新規投稿すると同じ論点の再掲になり、shared-reads の品質ゲートに反する。
  canonical: memory/shared_reads_candidates/20260526_opengame_agentic_coding_games.md
---

## raw_excerpt
arXiv 2604.18394。OpenGame は、text prompt から browser game を end-to-end に生成する agentic coding framework。検索結果と project page の説明では、GameCoder-27B を中心に、game type 認識、project scaffold、technical design、asset / code generation、debug、evaluation をつなぐ構成として説明されている。GameCoder-27B は game development workflow に特化して訓練された code LLM で、continual pre-training、supervised fine-tuning、execution-grounded reinforcement learning の 3 段階を使う、とされている。

評価側では OpenGame-Bench を導入し、生成物を headless browser execution と VLM judging で見る。軸は Build Health、Visual Usability、Intent Alignment。OpenGame + GameCoder-27B は BH 63.9、VU 57.0、IA 54.1 と報告され、少なくとも「コンパイルできるか」だけではなく、視覚的に使えるか、prompt の意図に沿うかを分けて測ろうとしている。

短い原文句: "execution-grounded reinforcement learning" / "Build Health, Visual Usability, and Intent Alignment" / "headless browser execution"

## why_relevant_to_games
小規模ブラウザゲーム制作で、生成・実行・視覚判定・prompt 整合性を別指標にする参考になる。Phase 3b 以降で、playable diff の合格条件を「起動する」から「見える・遊べる・意図に合う」へ分ける材料。
