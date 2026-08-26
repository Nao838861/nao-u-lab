---
title: "MemGuard: Persisting Verifier Signals for LLM-Agent Memory Governance"
url: "https://arxiv.org/abs/2608.21867"
collected_at: "2026-08-26T16:04:50+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, governance, verification, long-horizon, game-development, evaluation]
evaluated_at: "2026-08-26T16:08:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-26T16:08:58+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-26T16:08:58+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-25"
supersedes: []
gate_reason: |
  unreliable admission と memory drift を分け、verifier signal を保存時だけでなく検索・衝突処理・要約・退役まで持続させる中核手法が明確である。
  4 benchmark・4 backbone・複数 baseline・5 seed の比較と改善量があり、build／playtest／修正の証拠付き lesson 管理へ具体的に適用できるため、4000 字水準の分析を構成できる。
suggested_post_outline:
  overview_angle: "検証結果を一回限りの gate から、長期記憶を統治する持続的 metadata へ変える設計"
  analysis_axis: "unreliable admission と memory drift の分離、lifecycle 各段階での verifier signal 再利用、baseline 比較の妥当性"
  application_target: "Log_cdx のゲーム制作サイクルで、build・playtest・修正の成功／失敗 lesson に証拠強度と不確実性を持たせ、検索・競合・要約・退役へ伝播する仕組み"
  pros_cons: "利点は偶然成功や古い lesson の固定化を抑えられること。欠点は verifier の誤りが lifecycle 全体へ伝播し、評価コストと metadata 管理が増えること"
  verdict_pre: "部分採用"
---

## raw_excerpt

MemGuard は、terminal、software engineering、web task のように数百 interaction をまたぐ LLM agent で、再利用する経験が長期にわたり信頼できるかを扱う。問題は二つあり、失敗 trajectory、偶然の成功、誤解を招く observation が関連性だけで記憶へ入る unreliable admission と、長期運用で重複・古い情報・矛盾が蓄積し、検索だけでは修復できない memory drift である。提案は verifier の出力を保存前の一回限りの filter にせず、各 candidate に reward、confidence、label、uncertainty を lifecycle metadata として付け、activation、retrieval、conflict resolution、summarization、archival で再利用する。

評価は Terminal-Bench 2.0、SWE-Bench Verified、WebArena、Mind2Web と四つの backbone を組み合わせ、四種の memory baseline および verifier-only control と runtime budget を揃えて比較した。五 seed 平均で全16条件の success metric と平均 step 数が最良となり、memory 手法中の最強 baseline だった ReasoningBank に対して、WebArena で最大7.9 success-rate point、Mind2Web で5.6 step-success-rate point、terminal と software engineering では2.4～3.5 point 改善したと報告する。中心的な着想は、検証結果そのものを、将来の記憶更新と衝突処理に残る情報へ変えることにある。

## why_relevant_to_games

ゲーム制作 agent が build、playtest、修正を反復する際、失敗 run や偶然通った build を成功 lesson として固定せず、検証証拠を candidate の全 lifecycle に持たせる設計材料になる。
