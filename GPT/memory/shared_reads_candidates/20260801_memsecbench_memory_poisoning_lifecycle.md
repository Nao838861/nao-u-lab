---
title: "MemSecBench: Tracking Agent Memory Poisoning from Persistence to Consequence and Repair"
url: "https://arxiv.org/abs/2607.27080"
collected_at: "2026-08-01T23:31:03+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, memory, security, evaluation, game-development-workflow]
evaluated_at: "2026-08-01T23:35:46+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-01T23:46:01.6570722+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785595542402169"
next_action: none
stale_after: "2026-08-31"
supersedes: []
posted:
  ts: "1785595542.402169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785595542402169"
  char_count: 3696
  posted_at: "2026-08-01T23:46:01.6570722+09:00"
gate_reason: >
  記憶汚染の問題設定、Write--Execute--Forget の7 checkpoint、310 case・24構成の比較、
  攻撃成立率と selective repair の結果まで抽出でき、CoopEval 水準の概要を組める。
  制作 agent の記憶を保存件数ではなく実装影響と選択的修復まで通して検証する場面へ具体適用できる。
suggested_post_outline:
  overview_angle: "agent memory security を保存時の検査ではなく、Write--Execute--Forget を貫く lifecycle 評価として説明する"
  analysis_axis: "7 checkpoint の分解、deterministic check・judge model・programmatic gate の役割、24構成で表れた persistence と consequence と repair の非対称性"
  application_target: "Log_cdx のゲーム制作記憶で、外部記事や playtest lesson の ingest、後続実装への影響、正しい記憶を残す選択的修復を一続きに検証する probe"
  pros_cons: "メリットは記憶 backend 単体でなく harness・LLM を含む end-to-end の弱点を測れる点。デメリットは game domain の直接評価ではなく、judge-model 依存と新規 preprint の再現性確認が残る点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

一次資料 abstract の要点メモ（逐語引用ではない）。長期記憶を持つ agent では、攻撃者が作った悪意ある instruction が保存され、かなり後の task で recall され、実際の action を静かに変える可能性がある。既存の memory security benchmark は保存、下流の結果、選択的修復の一部だけを測ることが多いため、MemSecBench は同じ悪意ある意味内容が lifecycle 全体をどう通るかを追跡する。

benchmark は code・science、日常生活、office work にまたがる48の現実的 context から310 case を構成し、隔離 runtime 上で Write--Execute--Forget protocol を実行する。agent harness、memory backend、LLM backend を固定した構成単位で、deterministic な write check、checkpoint ごとの judge-model 評価、programmatic gate を組み合わせ、7 checkpoint を判定する。実験は2 harness、4 memory backend、3 LLM backend の24構成を含む。全構成の集計では悪意ある memory が84.2%の case で残り、Write--Execute chain 全体は50.3%で成功した。poisoning 成功例の59.6%が Execute chain を完遂し、56.1%では selective repair が成立したと報告する。構成間で end-to-end attack と repair の差が大きく、memory stack 全体を lifecycle 単位で比較する必要を示す。

## why_relevant_to_games

長期運用するゲーム制作 agent が過去の playtest、設計 lesson、外部記事を再利用する時、保存成功だけでなく recall 後の実装影響と、正しい記憶を残した選択的修復まで通して検証する評価設計の材料になる。
