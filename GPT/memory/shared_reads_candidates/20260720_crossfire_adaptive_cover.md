---
title: "How That's No Moon's Crossfire evolves the cover-based shooter"
url: "https://www.gamedeveloper.com/design/how-that-s-no-moon-s-crossfire-evolves-the-cover-based-shooter"
collected_at: "2026-07-20T22:18:14.6907512+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, third-person-shooter, animation, environment-design]
evaluated_at: "2026-07-20T22:24:00.2392337+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-20T22:24:00.2392337+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-20T22:24:00.2392337+09:00"
next_action: revise_or_research
stale_after: "2026-08-19"
supersedes: []
gate_reason: >-
  adaptive cover の問題設定、地形読解という着想、Nanite / Lumen と motion matching が支える実装条件は抽出できる。
  ただし公開前インタビュー由来で、遭遇設計やプレイテストによる評価の中身が薄く、現状から約4000字の概要を書くと推測で補う比率が高いため保留する。
---

## raw_excerpt

Game Developer が That's No Moon の Taylor Kurosaki と Jacob Minkoff に取材した記事。新作 Crossfire は、胸高の壁や大きな箱が戦闘場所を明示する従来の「rectilinear」なカバーシューターから離れ、斜面・短い障害物・荒れた地形などをその場の防御位置として使う「adaptive cover」を中核に置く。プレイヤーは地形と敵配置を見て有効な遮蔽を探し、キャラクター側も障害物の高さや傾きに合わせて姿勢・構えを変える。Minkoff は、複雑な地形を描画できる Unreal Engine 5 の Nanite / Lumen と、motion matching に連なる第三者キャラクターの移動・アニメーション技術が合流したことで、この発想が成立したと説明する。設計目標は写実性だけではなく、固定されたカバーポイントを辿るのではなく、同じ遭遇でも地形の読み方と接近経路によって複数の対応を生むことにある。記事は、二人の対立陣営の主人公、survival-lite な資源管理、連続した world map、物語と gameplay を切り離さない方針も併記している。

## why_relevant_to_games

地形・移動・姿勢制御を別々に設計せず、技術基盤の変化から新しい戦闘verbを組み立てる事例として、3Dアクションのカバー設計や遭遇プロトタイプに参照できる。
