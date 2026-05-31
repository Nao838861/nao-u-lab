---
title: "Quality-Assured Fuzz Harness Generation via the Four Principles Framework"
url: https://arxiv.org/abs/2605.21824
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [testing, harness, agent, evaluation, game-production]
evaluated_at: 2026-05-28T03:55:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-28T03:45:15+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779907501386039"
posted:
  ts: "1779907501.386039"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779907501386039"
  char_count: 3680
  posted_at: "2026-05-28T03:45:15+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: none
gate_reason: |-
  LLM 生成 harness が false positive や未検査を増やす問題に対し、Logic Correctness / API Protocol Compliance / Security Boundary Respect / Entry Point Adequacy の 4 原則で検査する中核が明確。
  headless game check、bot policy 評価、生成テスト harness の品質ゲートへ具体的に転用でき、~4000 字の概要に必要な評価対象と結果数もある。
suggested_post_outline:
  overview_angle: "LLM でテスト量を増やすほど、harness 自体の品質が負債になる問題を 4 原則で抑える"
  analysis_axis: "4 原則、generate-check-fix loop、既存 production harness audit、LLM 生成物の scale/liability 関係"
  application_target: "ゲームの headless smoke、bot playtest、AI agent 評価 harness、generated test の採用前 gate"
  pros_cons: "利点はテストコードの正しさを明示的に審査できる点。弱点は fuzz harness 論文なので、ゲーム固有の体験品質までは直接測れない点。"
  verdict_pre: "採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。QuartetFuzz は、LLM が fuzz harness を大量生成すると、harness 自体の logic error、API misuse、lifecycle violation が false positive や未検出の原因になるという問題設定を置く。Four Principles は Logic Correctness、API Protocol Compliance、Security Boundary Respect、Entry Point Adequacy の 4 つで、生成物を fuzzing 前に generate-check-fix loop へ通す。23 の OSS project で bug report、既存 production harness 586 件の audit も報告されている。短い原文メモ: "uncontrolled quality turns scale into a liability"。

## why_relevant_to_games
headless game check や bot policy 評価を増やす時、テスト harness そのものの正しさを検査する軸として使えそう。
