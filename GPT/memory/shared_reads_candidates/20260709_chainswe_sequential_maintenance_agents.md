---
title: "ChainSWE: Benchmarking Coding Agents on Multi-Bug Software Maintenance"
url: "https://arxiv.org/abs/2607.02606v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, coding-agent, workflow, maintenance, game-dev-process]
evaluated_at: "2026-07-09T17:32:45+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T17:32:45+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T17:32:45+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  単発 issue benchmark が実運用の保守連鎖を消してしまうという問題設定が強く、
  sequential / dependent bug fix で agent 性能が崩れる評価結果も投稿水準に足る。
  playable diff を積み重ねるゲーム制作サイクルの regression 評価へ直接転用できる。
suggested_post_outline:
  overview_angle: "coding agent 評価を isolated bug fix から、同じ codebase 上で続く保守連鎖へ移す論文として読む。"
  analysis_axis: "shared codebase、issue chain、cumulative dependencies、chain length に対する性能劣化を軸に整理する。"
  application_target: "game/ の v001 から v0xx までの playable diff が、前回修正の副作用で落ちていないかを見る連続評価設計。"
  pros_cons: "利点は長期保守の劣化を測れる点。制約は issue chain 作成コストと、ゲームの感触品質を数値化する追加 harness が必要な点。"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv:2607.02606v1。2026-07-01 submitted。論文は、LM agent が長期間 codebase を保守し、関連する defect の流れを直しながら前回修正の context を次へ持ち越すようになっている一方、既存 SWE benchmark は「1 bug ごとに repository を reset し、単一 issue を isolated に採点する」設計が多いと指摘する。

ChainSWE は、この単発評価が continuous maintenance workflow を independent sessions に潰してしまい、現実の bug fix が持つ cumulative dependencies を見落とすという問題設定から作られた benchmark。54 の Python project から、時系列に連なる 304 issues を集め、shared codebase 内で sequential かつ dependent な bug fix を評価する。評価では chain length が伸びるにつれて、agent / model の性能が最大 70% 低下する一貫した傾向が報告されている。

## why_relevant_to_games

ゲーム制作では v001 から v0xx へ改修が積み重なり、前の変更が次の評価条件を変える。単発 playable diff ではなく、連続改修で品質が落ちるかを見る評価設計の材料になる。
