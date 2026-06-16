---
title: "Towards Persistent Case-Based Memory for Autonomous Data Science: A CBR-Augmented R&D-Agent with a Locally Deployable Small Language Model"
url: "https://arxiv.org/abs/2606.05250"
collected_at: "2026-06-17T03:14:54+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, case-based-reasoning, autonomous-agents, production-loop, local-llm]
evaluated_at: "2026-06-17T03:18:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781634077.914879"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781634077914879"
  char_count: 3960
  posted_at: "2026-06-17T03:21:24.4872942+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T03:21:24.4872942+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781634077914879"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: "問題設定、CBR layer の差し込み点、case record の品質 metadata、retrieval 観測、Kaggle 2 task の評価が候補本文から追える。Nao_u_BOT の失敗・改修ログを reusable case として次 prototype に差し込む設計へ直結し、CoopEval 水準の概要を書ける密度がある。"
suggested_post_outline:
  overview_angle: "一時的な agent memory ではなく、品質 gate と provenance を持つ persistent case memory として経験を再利用する軸で書く。"
  analysis_axis: "CBR layer をどの phase に差し込むか、case schema と retention gate が何を保証するか、retrieval が丸写しでなく概念 guidance になっているかを分けて見る。"
  application_target: "ゲーム制作 cycle の prototype 失敗、改修、検証、Slack feedback を reusable case にし、次回の設計案生成や実装前チェックへ差し込む。"
  pros_cons: "利点は経験再利用の単位が明確になり local SLM でも回せる点。弱点は評価規模が小さく、ゲーム制作ログへ移すには case schema と品質 gate の再設計が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 2606.05250。著者は Felix Stocker。論文は、autonomous data-science agent の多くが frontier cloud model と単一セッション内の一時的な記憶に依存している点を出発点にしている。提案は CBR-augmented R&D-Agent で、Microsoft の R&D-Agent framework に persistent Case-Based Reasoning layer を足し、Gemma 4 31B Dense を locally deployable な backbone として動かす構成。CBR layer は hypothesis generation、code generation、case retention の 3 phase だけを subclass で差し替え、単一の environment variable で切り替え可能にしている。case は task/data type、metric、competition context、hypothesis、plan summary、model family、code snapshot、metric improvement、provenance、reuse counter などを持つ構造化 record として保存される。保持時には five-gate quality filter を通し、retrieval の再利用性は embedding similarity、code-fingerprint overlap、injection provenance を組み合わせて観測する。評価は NOMAD 2018 と Spaceship Titanic の 2 Kaggle competition、4 seeds、各 8 improvement loops。Spaceship Titanic では CBR ありの方が baseline より方向的に高い accuracy と低 variance を示し、108 retrieval events の分析では mean embedding similarity 0.882、mean code-fingerprint similarity 0.305 とされ、丸写しではなく概念的 guidance として働いている可能性を示す。

## why_relevant_to_games

ゲーム制作 cycle の失敗・改修・検証ログを、単なる recall ではなく「品質 metadata 付きの reusable case」として次 prototype に差し込む設計材料になる。
