---
title: "OpenLoopEvolve: A Verifiable Self-Evolution Framework for Loop Policies in Long-Horizon Complex Tasks"
url: "https://arxiv.org/abs/2608.09380"
collected_at: "2026-08-12T04:01:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, long-horizon, iterative-development, evaluation, game-dev-workflow]
evaluated_at: "2026-08-12T04:06:21+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-12T04:06:21+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-12T04:06:21+09:00"
next_action: revise_or_research
stale_after: "2026-09-11"
supersedes: []
gate_reason: |
  Loop Policy の構成、online/offline evolution、Champion-Challenger、release 後の監視と rollback は抽出でき、ゲーム制作 cycle の手順を版管理する適用先も具体化できる。
  ただし候補が保持するのは要旨相当だけで、YC-Bench の課題構成・数値結果・risk metric・失敗条件・ablation が不足し、CoopEval 水準の約4000字概要を推測なしでは書けない。
---

## raw_excerpt

arXiv 要旨の冒頭は、長期の複雑タスクでは agent が状態観測、計画、tool 呼出し、結果検証、失敗回復を、変化する環境の中で繰り返す必要がある一方、その制御経験が単一 context や固定 prompt に閉じ、過去 trace を越えて蓄積・再利用しにくいと置く。短い原文表現では、OLE は “a self-evolution framework centered on the Loop Policy” とされる。

収集できた要旨では、Loop Policy は observation、planning、memory、action、verification、recovery、stopping、budget control を、version と lineage を持つ移植可能な policy asset として表現する。online mode は継続運用中の feedback から候補を生成し、offline mode は保存済み trace と failure evidence から候補 policy を探索する。両 mode は LLM による自律提案、Champion–Challenger の対評価、robust release を共有する。online で release された policy は次の task boundary から有効化され、その後の feedback で監視され、劣化条件を満たす場合は親 version へ rollback する。評価先は simulated business benchmark の YC-Bench で、固定初期 Loop Policy と比較して aggregate task performance、task success rate、risk metrics を測ったと記載されている。

## why_relevant_to_games

長時間のゲーム制作 cycle で、観測→設計→実装→playtest→検証→失敗回復という反復手順そのものを version 管理し、過去 run の証拠から次の制作 policy を更新する場面に接続できる外部資料。
