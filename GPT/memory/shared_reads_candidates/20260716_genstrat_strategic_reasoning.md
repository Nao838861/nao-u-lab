---
title: "GENSTRAT: Toward a Science of Strategic Reasoning in Large Language Models"
url: "https://arxiv.org/abs/2605.23238"
collected_at: "2026-07-16T14:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-ai, evaluation, procedural-generation, imperfect-information, strategic-reasoning]
evaluated_at: "2026-07-16T14:31:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-16T14:31:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-16T14:31:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-15"
supersedes: []
gate_reason: >-
  手続き生成ゲームによる汚染・飽和回避、6軸の能力分解、近傍ゲーム間の jaggedness という手法の中核と、36,000試合超の評価設計・主要結論を抽出できる。
  単一ステージ平均では隠れる自動プレイヤーの局所破綻を、ルール変種群と能力プロファイルで診断する形へ直接移せるため、CoopEval水準の批判的概要を構成できる。
suggested_post_outline:
  overview_angle: "固定ベンチマークから生成可能な戦略環境分布へ移り、平均勝率を能力地形と局所的不安定性へ分解する評価設計"
  analysis_axis: "ゲーム生成条件、6能力軸、jaggedness、総当たり試合設計が、汚染耐性とモデル間差の説明力をどこまで高めるか"
  application_target: "Log_cdx の headless 自動プレイヤー評価で、ルール・観測・時間深さ・リスク条件を系統変化させ、平均点と局所破綻を別々に記録する評価 packet"
  pros_cons: "長所は評価分布を更新でき、同平均モデルの異質な弱点を見つけられる点。短所は二人零和カードゲームから action game の実時間制御へ移す際に軸と生成器の再設計が必要な点"
  verdict_pre: 部分採用
---

## raw_excerpt

著者らは、固定された古典ゲームだけを使う戦略推論ベンチマークでは、性能飽和や学習データ混入の影響を受けやすく、現実に存在する多様で乱雑な戦略環境へ結果を一般化しにくいという問題を置く。GENSTRAT は、二人零和・不完全情報のカードゲームを手続き生成し、2,000 ゲームのプールから 50 ゲームを抽出して、9 種類の frontier / open-weight LLM による 36,000 試合超の総当たり評価を行う。能力は総合勝率だけでなく、状態空間、時間的深さ、情報感度、対戦相手モデリング、リスク、脆さの 6 軸へ分解する。さらに、戦略的に近いゲーム間で優位性が不規則に跳ぶ度合いを jaggedness として測る。平均性能が近いモデル同士でも能力プロファイルが異なり、局所的な安定性にも差が見られたと報告する。原文の中核表現は “procedurally generated strategic environments” であり、必要に応じて新しいゲームを生成できる評価分布を指す。

## why_relevant_to_games

ゲーム AI・自動テストプレイヤーを単一ステージの平均点だけで比べず、ルールや情報条件を系統的に変えたゲーム群で、得意不得意と局所的な破綻を可視化する評価設計の参照になりうる。
