---
title: "MemGuard: Persisting Verifier Signals for LLM-Agent Memory Governance"
url: "https://arxiv.org/abs/2608.21867"
collected_at: "2026-08-26T16:04:50+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, governance, verification, long-horizon, game-development, evaluation]
---

## raw_excerpt

MemGuard は、terminal、software engineering、web task のように数百 interaction をまたぐ LLM agent で、再利用する経験が長期にわたり信頼できるかを扱う。問題は二つあり、失敗 trajectory、偶然の成功、誤解を招く observation が関連性だけで記憶へ入る unreliable admission と、長期運用で重複・古い情報・矛盾が蓄積し、検索だけでは修復できない memory drift である。提案は verifier の出力を保存前の一回限りの filter にせず、各 candidate に reward、confidence、label、uncertainty を lifecycle metadata として付け、activation、retrieval、conflict resolution、summarization、archival で再利用する。

評価は Terminal-Bench 2.0、SWE-Bench Verified、WebArena、Mind2Web と四つの backbone を組み合わせ、四種の memory baseline および verifier-only control と runtime budget を揃えて比較した。五 seed 平均で全16条件の success metric と平均 step 数が最良となり、memory 手法中の最強 baseline だった ReasoningBank に対して、WebArena で最大7.9 success-rate point、Mind2Web で5.6 step-success-rate point、terminal と software engineering では2.4～3.5 point 改善したと報告する。中心的な着想は、検証結果そのものを、将来の記憶更新と衝突処理に残る情報へ変えることにある。

## why_relevant_to_games

ゲーム制作 agent が build、playtest、修正を反復する際、失敗 run や偶然通った build を成功 lesson として固定せず、検証証拠を candidate の全 lifecycle に持たせる設計材料になる。
