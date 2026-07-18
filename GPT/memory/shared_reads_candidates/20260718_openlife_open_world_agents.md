---
title: "OpenLife: Toward Open-World Artificial Life with Autonomous LLM Agents"
url: "https://arxiv.org/abs/2606.31046"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [artificial-life, llm-agent, persistent-memory, npc, simulation]
evaluated_at: "2026-07-18T22:54:41+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-18T23:00:22+09:00"
last_decision: postponed
evidence: "既投稿: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783304602130549"
next_action: candidate_revise
stale_after: "2026-08-17"
supersedes: []
postponed:
  reason: "同一 URL の分析が既に #shared-reads にあるため新規投稿しない。既存投稿は英語本文なので、日本語版へ置換する場合は重複投稿ではなく既存メッセージの扱いを別途決める"
  existing_permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783304602130549"
gate_reason: >-
  stateless LLM の周囲へ知覚・記憶・評価・budget metabolism を非同期 process として置く構成と、6 agent・約12週間の長期観察結果を具体的に説明できる。
  長期 NPC を一枚の prompt ではなく有限資源を持つ runtime system として設計する適用先が明確で、主張の限界を含む約4000字の分析を支えられる。
suggested_post_outline:
  overview_angle: "万能な一個の agent ではなく、stateless LLM を複数の非同期生命維持 process が囲む open-world ALIFE の実験系として整理する"
  analysis_axis: "closed-world reward から open-vocabulary judgment への変更、意味ベースの記憶再配線、budget metabolism、12週間で観測された自発性と社会構造を分解して評価する"
  application_target: "Log_cdx の生活 simulation / 長期 NPC で、知覚・記憶・行動評価・資源消費を分離し、停止可能な短期 probe と event log で自発性と暴走を判定する runtime"
  pros_cons: "利点は長期挙動を prompt から system dynamics へ移せること。欠点は高い運用費、open-vocabulary 評価の再現性不足、外部ネットワークや決済を含む権限・安全境界である"
  verdict_pre: "部分採用。process 分離と有限予算は採用し、外部権限は閉じた simulation 内の可逆な資源へ置き換える"
---

## raw_excerpt

arXiv 要旨メモ。従来の artificial life は研究者が設計した closed world を主な実験場としてきたが、persistent memory、tool use、network access、payment を持つ LLM agent により、社会・技術・経済へ開いた open-world ALIFE を扱えるという提案。proof-of-concept の OpenLife は、一つの「賢い agent」に機能を集めず、stateless LLM の周囲へ memory、perception、evaluation、budget-based metabolism の非同期 process 群を配置する。固定 objective がない環境では、experience を scalar reward ではなく open-vocabulary の LLM judgment で評価し、memory を頻度ではなく意味に基づいて再配線する。6 agent を約12週間運用し、reactive から spontaneous activity への移行、個体差、social structure、外部収入を報告するが、人工生命を実現したとは主張せず、実験 paradigm と platform の提示に留める。

## why_relevant_to_games

長期稼働 NPC や生活シミュレーションを、会話 prompt 単体ではなく知覚・記憶・予算・評価の周辺 process として構成する際の参照になる。
