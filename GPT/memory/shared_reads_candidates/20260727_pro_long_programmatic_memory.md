---
title: "PRO-LONG: Programmatic Memory Enables Long-Horizon Reasoning"
url: "https://arxiv.org/abs/2607.20064v2"
collected_at: "2026-07-27T02:32:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, game-playing, long-horizon, evaluation]
---

## raw_excerpt

Alexis Fox、Junlin Wang、Paul Rosu、Bhuwan Dhingra による 2026-07-22 公開、翌日 v2 改訂の論文。長時間の探索課題で agent が何を保存し、後の context へどう戻すかに注目し、情報を多く残すほど関連箇所の検索が難しくなる trade-off を問題にする。PRO-LONG は、環境との interaction を完全な structured log として保持し、coding agent が必要時に programmatic search する最小構成の context-management framework である。短い要約へ逐次圧縮する代わりに、観測と行動の履歴を失わず、code を使った検索で必要な過去状態へ降りる。評価対象は継続学習型のゲーム benchmark ARC-AGI-3 の公開 game set。abstract では、base coding agent 比で frontier model 平均 18.0 percentage points 改善し、専用 harness と同等以上の最大 76.1% pass@1 を、4.2～5.8倍少ない token で達成したと報告する。Fable 5 条件では total cost 1,750ドルで 97.4% best@2 とされ、関連 code と log も公開されている。

## why_relevant_to_games

長いゲーム playtrace や制作 cycle を要約だけで持たず、完全ログから失敗場面・状態遷移・過去の試行を code 検索する headless agent / game-making agent の記憶設計候補になる。
