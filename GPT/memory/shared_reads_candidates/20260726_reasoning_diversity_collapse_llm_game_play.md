---
title: "When Reasoning Narrows the Move: Diversity Collapse in LLM Game Play"
url: "https://arxiv.org/abs/2607.19523v1"
collected_at: "2026-07-26T16:31:46.9873770+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, game-playing, evaluation, supervised-fine-tuning, exploration]
evaluated_at: "2026-08-25T06:39:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-25T06:39:10+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-25T06:39:10+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-24"
supersedes: []
gate_reason: |-
  最適手を厳密計算できる 4 ゲーム、4 種の SFT 条件、状態・対戦の二段評価、24 条件中 21 条件という結果まで揃い、推論や単一正解教師が強さと独立に方策多様性を潰す機構を説明できる。
  AI テストプレイヤーや NPC を勝率だけで評価する盲点へ直接効き、行動・軌跡エントロピーと全最適手 augmentation を小さな検証へ落とせるため、CoopEval 水準の深掘りに進める。
suggested_post_outline:
  overview_angle: "推論量や正解率の向上が探索の豊かさを保証せず、教師データの action support が方策崩壊を左右することを実験設計から解説する"
  analysis_axis: "直接回答/推論付きと単一最適手/全最適手の 2×2 比較を、正解率・行動エントロピー・Elo・軌跡エントロピーの役割差で読む"
  application_target: "Log_cdx の AI テストプレイヤー/NPC 評価に勝率と別の多様性指標を加え、複数の有効戦略を残す教師・プロンプト設計を probe する"
  pros_cons: "強さと多様性を分離して測れる一方、三目並べ系の決定論的・完全情報ゲームから複雑なリアルタイムゲームへ一般化できる範囲は未確定"
  verdict_pre: "部分採用"
---

## raw_excerpt

一次資料抜粋メモ（要約）: 本研究は、三目並べとその3変種からなる、最適行動を厳密に計算できる決定論的な二人用ゲーム群を使い、LLMプレイヤーの強さと行動多様性を分けて測定する。Qwen3-8Bを基に、出力形式を直接回答／推論付き、教師データの行動支持を各状態につき単一の最適手／全最適手に分け、4種類のSFTデータを構成した。状態単位では正解率と行動エントロピー、対戦ではEloと軌跡エントロピーを評価する。推論付き生成は24条件中21条件で直接回答より行動エントロピーが低く、その低下は常に正解率向上を伴うわけではなかった。単一の最適手だけを示す通常SFTは正解率を上げる一方、複数の戦略的同価手がある状態でもほぼ決定論的な方策へ早期に収束した。全最適手を教師データに含める action augmentation は多様性低下を部分的に緩和し、推論付きと組み合わせた構成が、比較的高い正解率を保ちながら非自明な行動多様性を維持した。著者らは、狭い行動支持を模倣する教師データが方策崩壊の一因になり得ると整理している。

## why_relevant_to_games

LLMをテストプレイヤーやNPC方策として使う際、勝率・正解率だけでは同じ行動への収束を見落とすため、行動／軌跡エントロピーを併記する評価設計と、複数の有効手を残す学習データ設計の材料になる。
