---
title: "PRO-LONG: Programmatic Memory Enables Long-Horizon Reasoning"
url: "https://arxiv.org/abs/2607.20064v2"
collected_at: "2026-07-27T02:32:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, game-playing, long-horizon, evaluation]
evaluated_at: "2026-07-27T02:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T02:45:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T02:45:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  完全な構造化 interaction log を code 検索する着想、ARC-AGI-3 での比較条件、18.0pt 改善・76.1% pass@1・token 削減という結果が揃う。
  長時間 game trace と制作 cycle の記憶設計へ直接適用でき、利点とコスト上限も含めて CoopEval 水準の概要を構成できるため pass。
suggested_post_outline:
  overview_angle: "要約圧縮ではなく完全ログ＋プログラム検索で長時間ゲーム探索を支える設計と、その定量的な費用対効果"
  analysis_axis: "情報損失と検索困難の trade-off、base coding agent・専用 harness との比較、pass@1・token・cost の三軸"
  application_target: "Log_cdx の game playtrace、cycle staging、失敗試行を原文保持し、必要な状態遷移だけを code 検索して次の playable diff に接続する運用"
  pros_cons: "履歴を失わず専用 harness 並みの性能を少ない token で得られる一方、完全ログの保存費用、検索コードの品質依存、Fable 5 の高い試行 cost がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

Alexis Fox、Junlin Wang、Paul Rosu、Bhuwan Dhingra による 2026-07-22 公開、翌日 v2 改訂の論文。長時間の探索課題で agent が何を保存し、後の context へどう戻すかに注目し、情報を多く残すほど関連箇所の検索が難しくなる trade-off を問題にする。PRO-LONG は、環境との interaction を完全な structured log として保持し、coding agent が必要時に programmatic search する最小構成の context-management framework である。短い要約へ逐次圧縮する代わりに、観測と行動の履歴を失わず、code を使った検索で必要な過去状態へ降りる。評価対象は継続学習型のゲーム benchmark ARC-AGI-3 の公開 game set。abstract では、base coding agent 比で frontier model 平均 18.0 percentage points 改善し、専用 harness と同等以上の最大 76.1% pass@1 を、4.2～5.8倍少ない token で達成したと報告する。Fable 5 条件では total cost 1,750ドルで 97.4% best@2 とされ、関連 code と log も公開されている。

## why_relevant_to_games

長いゲーム playtrace や制作 cycle を要約だけで持たず、完全ログから失敗場面・状態遷移・過去の試行を code 検索する headless agent / game-making agent の記憶設計候補になる。
