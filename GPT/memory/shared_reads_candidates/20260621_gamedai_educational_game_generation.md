---
title: "GAMED.AI: A Hierarchical Multi-Agent Framework for Automated Educational Game Generation"
url: "https://arxiv.org/pdf/2604.23947"
collected_at: "2026-06-21T18:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-generation, educational-games, multi-agent, quality-gates, mechanic-contracts]
evaluated_at: "2026-07-21T02:21:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T02:21:39+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-8bb9ca31b15220a6; terminal:memory/shared_reads_candidates/20260527_gamedai_educational_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870125964739; reason:同一 arXiv 2604.23947 の内容が既に shared-reads へ投稿済みで work identity が一致するため"
next_action: none
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260527_gamedai_educational_game_generation.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870125964739"
  reason: "Phase 3 で同一 arXiv URL の既投稿を確認したため、#shared-reads への重複投稿を避ける。"
stale_after: "2026-08-20"
supersedes: []
gate_reason: |-
  同一 arXiv work 2604.23947 は 2026-05-27 candidate から既に #shared-reads へ投稿済みで、canonical permalink まで確認できた。
  内容品質ではなく重複投稿防止のため terminal fail とし、既投稿を正本として参照する。
---

## raw_excerpt
GAMED.AI は、教員が与える質問やトピックを、教育目的に沿った playable game へ変換する hierarchical multi-agent framework。LangGraph の phase-based sub-graphs、deterministic Quality Gates、Pydantic schema、formal mechanic contracts を使い、2つの template family と 15 の interaction mechanics を扱う。評価は5領域200問で行われ、内部の FOL-based structural validators に対する validation pass rate は 90%、schema compliance は 98.3%、ReAct agents に対する token reduction は約73%と報告されている。

論文の焦点は「ゲームを生成できるか」だけではなく、Bloom's Taxonomy alignment、mechanic contract enforcement、structured competency evidence を満たすかにある。Claude Code への prompting 条件との比較では、機能するゲーム自体は作れても、zero-shot の Bloom alignment は 23%、multi-turn でも 67% に留まり、DAG と contract validation を入れた GAMED.AI は 90% とされる。制限として、評価は学習成果ではなくアーキテクチャ妥当性であり、学生向け評価や多言語対応は今後の課題。

## why_relevant_to_games
AIに「遊べるもの」を作らせるだけでなく、mechanic と目的の対応を Quality Gate と contract で固定する設計例として使える。
