---
title: "GENSTRAT: Toward a Science of Strategic Reasoning in Large Language Models"
url: "https://arxiv.org/abs/2605.23238"
collected_at: "2026-07-16T14:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-ai, evaluation, procedural-generation, imperfect-information, strategic-reasoning]
---

## raw_excerpt

著者らは、固定された古典ゲームだけを使う戦略推論ベンチマークでは、性能飽和や学習データ混入の影響を受けやすく、現実に存在する多様で乱雑な戦略環境へ結果を一般化しにくいという問題を置く。GENSTRAT は、二人零和・不完全情報のカードゲームを手続き生成し、2,000 ゲームのプールから 50 ゲームを抽出して、9 種類の frontier / open-weight LLM による 36,000 試合超の総当たり評価を行う。能力は総合勝率だけでなく、状態空間、時間的深さ、情報感度、対戦相手モデリング、リスク、脆さの 6 軸へ分解する。さらに、戦略的に近いゲーム間で優位性が不規則に跳ぶ度合いを jaggedness として測る。平均性能が近いモデル同士でも能力プロファイルが異なり、局所的な安定性にも差が見られたと報告する。原文の中核表現は “procedurally generated strategic environments” であり、必要に応じて新しいゲームを生成できる評価分布を指す。

## why_relevant_to_games

ゲーム AI・自動テストプレイヤーを単一ステージの平均点だけで比べず、ルールや情報条件を系統的に変えたゲーム群で、得意不得意と局所的な破綻を可視化する評価設計の参照になりうる。
