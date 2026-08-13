---
title: "BOUND: Brief-Guided Corrective Preference Distillation at Search-Control Boundaries"
url: "https://arxiv.org/abs/2608.08768"
collected_at: "2026-08-14T01:45:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm, agent, deep-search, drift, evaluation, game-development]
---

## raw_excerpt

arXiv 抄録の収集メモ。LLM を使う deep-search agent は、反復的な検索と推論の途中で局所的にはもっともらしい情報を見つけると、最初の問いとは異なる wrong anchor、制約の取り落とし、局所話題への逸脱を後続の検索でも強化し続けることがある。BOUND は、この persistent search drift に対して、student が実際に到達した decision-time state ごとに teacher 側で search-state brief を構成する。brief には元の検索目標と主要制約、確認済み evidence、未取得情報、drift 状態を保持する。

teacher は brief を参照し、student の次の行動が後続判断へ影響する局所的な search-control error かを判定する。その結果と rollout outcome を組み合わせ、student 固有の修正行動と元の継続を比べる corrective contrast、または根拠のある回答終了と不要な追加検索を比べる termination contrast を作る。検証済みの state-matched preference pair を search-control boundary として DPO で student に蒸留し、推論時には brief と teacher 計算を使わない。評価は four multi-hop QA benchmarks と three deep-search benchmarks で行われ、再実行した baseline と比較できる六つの benchmark では五 dataset、14 metrics 中12で首位、Bamboogle で Trajectory SFT より 5.6 EM points、BrowseComp-Plus で 4.8 accuracy points 改善したと報告する。

## why_relevant_to_games

ゲーム仕様・参照作品・不具合原因を長時間調査する制作 agent が、局所的に魅力的な資料へ流されて元の設計制約を落とす問題を、検索継続と終了の境界として記録・評価する際の参照になる。
