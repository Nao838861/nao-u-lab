---
title: "MemPoison: Uncovering Persistent Memory Threats and Structural Blind Spots in LLM Agents"
url: "https://arxiv.org/abs/2607.14651v1"
collected_at: "2026-07-19T03:30:53+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, security, evaluation, persistent-state, llm-agents]
---

## raw_excerpt

外部 memory を持つ LLM agent では、通常の対話経路から adversarial content が混入し、turn をまたいで保持され、後の行動を歪める可能性がある。MemPoison はこの持続的な攻撃面を測るため、四つの attack type、三つの injection channel、三種類の memory substrate にまたがる 1,227 件の人手検証済み case を用意し、open-weight 七系統と closed-weight 三系統の model family を評価する。

攻撃は、単一 record を直接壊す L1、複数 record が一緒に retrieval された時に害を生む L2、特定 context で dormant corruption が起動する L3 の三段階に整理される。write 時の consistency check は L1 を大きく抑えられる一方、個別には無害に見える記録が retrieval 時に合成されたり trigger 条件で作動したりする L2 / L3 には安定して効かなかった。著者らは mechanistic influence decomposition でこの blind spot を分析し、固定的な書込み filter だけでなく、利用時 context を見た適応的な memory 防御が必要だと述べる。

## why_relevant_to_games

LLM NPC の長期記憶、player feedback の蓄積、自動 playtest の学習履歴では、単一メモの妥当性だけでなく、複数記録の同時 recall や特定 game state でのみ起きる組合せ汚染をテストする観点になる。
