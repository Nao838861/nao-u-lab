---
title: "PowerAgentBench-Dyn: A Benchmark for Agentic AI in Power System Dynamic Studies"
url: "https://arxiv.org/abs/2606.20401"
collected_at: "2026-06-22T06:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-benchmark, simulation, tool-use, evaluation, game-ai]
evaluated_at: "2026-06-22T07:03:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T07:14:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782080032624219"
next_action: none
posted:
  ts: "1782080032.624219"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782080032624219"
  char_count: 3626
  posted_at: "2026-06-22T07:14:02+09:00"
stale_after: "2026-07-22"
supersedes: []
gate_reason: |
  電力系統という題材自体はゲーム外だが、評価対象は単発コード生成ではなく simulation budget、tool use、途中判断、evidence-backed report を含む長い agentic workflow である。
  ゲーム制作では headless playtest / NPC 実験 / バランス検証を「実行予算付きの仮説検証タスク」として測る設計に直結し、CoopEval 水準の概要を書く材料も足りている。
suggested_post_outline:
  overview_angle: "Power system dynamic studies を題材に、LLM agent を長期 simulation workflow として評価する benchmark として書く。"
  analysis_axis: "task design、observation/action space、simulation budget、deterministic evaluator、repeated-run success rate の分離。"
  application_target: "Nao_u_BOT のゲーム制作では、自動プレイテストを単発スコアではなく、仮説立案、再シミュレーション、証拠付き判断の loop として設計する部分に効く。"
  pros_cons: "利点は評価設計が実務 workflow に近いこと。弱点は題材が電力系統で、ゲーム固有の面白さや体験評価は別途写像が必要なこと。"
  verdict_pre: "部分採用。ゲーム用 headless evaluation harness の設計原則として採用し、ドメイン固有指標は別途作る。"
---

## raw_excerpt
arXiv と web_research から拾った一次メモ。PowerAgentBench-Dyn は、LLM agent を単発のコード生成や最適化ではなく、シミュレータを呼び、途中結果を解釈し、次の実験を計画し、制約付き action space の中で判断する長い engineering workflow として評価する benchmark。対象領域は power system dynamic studies で、静的な計算問題よりも parameter calibration、model quality review、contingency screening、mitigation proposal など、専門家の反復的判断が必要になる。最初の benchmark task は、operator が指定した compliance criteria に沿って dynamic model を検証・診断する Dynamic Model Quality Review と、semantic memory と限られた simulation budget を使い、未知の fault dataset から critical short-circuit contingencies を見つけて順位付けし、緩和策を検討する Dynamic Security Risk Screening。評価は simulation environment、observation/action space、metrics を定義し、deterministic evaluator と repeated runs の success rate で再現性を確保する設計。

## why_relevant_to_games
ゲーム制作での headless 評価や自動テストを「単発スコア」ではなく、限られた実行予算の中で仮説を立てて再シミュレーションする agent workflow として設計する材料になる。
