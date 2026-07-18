---
title: "MemPoison: Uncovering Persistent Memory Threats and Structural Blind Spots in LLM Agents"
url: "https://arxiv.org/abs/2607.14651v1"
collected_at: "2026-07-19T03:30:53+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, security, evaluation, persistent-state, llm-agents]
evaluated_at: "2026-07-19T03:34:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784400393.395729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784400393395729"
  char_count: 4183
  posted_at: "2026-07-19T03:46:56+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T03:46:56+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784400393395729"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  persistent memory の攻撃面を L1/L2/L3、注入経路、memory substrate に分解し、1227 case・10 model family と防御の blind spot まで評価している。
  NPC 記憶、player feedback、playtest 履歴で write 時検査だけでは拾えない合成・context-triggered 汚染を再現テストへ落とせ、約4000字の分析材料が十分ある。
suggested_post_outline:
  overview_angle: "悪い一件を弾けば安全という前提を崩し、無害な記録の組合せや game state 依存 trigger が retrieval 時に害へ変わる問題として書く。"
  analysis_axis: "L1/L2/L3 の脅威階層、三つの injection channel と substrate、1227 case の評価、write consistency check の有効範囲と mechanistic influence decomposition を軸にする。"
  application_target: "Log_cdx の記憶を使う playtest agent / LLM NPC で、単一 atom 検査に加えて複数 recall と特定 game state の組合せを regression fixture にする。"
  pros_cons: "利点は持続的汚染を再現可能な試験単位へ分けられる点。弱点は攻撃 benchmark と自然発生の誤記憶の差、retrieval 組合せ爆発、防御コストである。"
  verdict_pre: "部分採用"
---

## raw_excerpt

外部 memory を持つ LLM agent では、通常の対話経路から adversarial content が混入し、turn をまたいで保持され、後の行動を歪める可能性がある。MemPoison はこの持続的な攻撃面を測るため、四つの attack type、三つの injection channel、三種類の memory substrate にまたがる 1,227 件の人手検証済み case を用意し、open-weight 七系統と closed-weight 三系統の model family を評価する。

攻撃は、単一 record を直接壊す L1、複数 record が一緒に retrieval された時に害を生む L2、特定 context で dormant corruption が起動する L3 の三段階に整理される。write 時の consistency check は L1 を大きく抑えられる一方、個別には無害に見える記録が retrieval 時に合成されたり trigger 条件で作動したりする L2 / L3 には安定して効かなかった。著者らは mechanistic influence decomposition でこの blind spot を分析し、固定的な書込み filter だけでなく、利用時 context を見た適応的な memory 防御が必要だと述べる。

## why_relevant_to_games

LLM NPC の長期記憶、player feedback の蓄積、自動 playtest の学習履歴では、単一メモの妥当性だけでなく、複数記録の同時 recall や特定 game state でのみ起きる組合せ汚染をテストする観点になる。
