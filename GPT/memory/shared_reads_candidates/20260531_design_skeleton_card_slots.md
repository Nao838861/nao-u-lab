---
title: "043 - How to create a Design Skeleton in 7 Steps"
url: "https://nerdlab-games.com/043-how-to-create-a-design-skeleton-in-7-steps/"
collected_at: "2026-05-31T06:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, card-game, design-skeleton, content-planning, mechanics]
evaluated_at: "2026-05-31T07:02:33+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-30"
supersedes: []
gate_reason: "問題設定、骨格表を先に作る着想、rarity/color/type/slot/faction/mechanic を段階配置する中核、living document として戻る結論が明確。カードゲーム記事だが、敵 wave、報酬分布、mechanic 出現頻度の割り当て表へ具体的に転用でき、Phase 3 の概要密度まで展開可能。"
suggested_post_outline:
  overview_angle: "個別コンテンツを作る前に、slot / faction / rarity / mechanic の割り当て表で作品全体の設計空間を固定しすぎず可視化する手法として書く。"
  analysis_axis: "design skeleton が、発想支援ではなく不足・偏り・役割重複を検出する content planning tool として機能する点を軸にする。"
  application_target: "Nao_u_BOT の shooter/action prototype で、wave ごとの敵種、弾種、報酬、gimmick、learned mechanic の出現順を実装前に配置する表へ適用する。"
  pros_cons: "メリットはコンテンツ制作前に分布と役割を検査できる点。デメリットは表が設計を固定する危険と、action game では card slot より時間軸・難度曲線への変換が必要な点。"
  verdict_pre: "部分採用。カード制作手順そのものではなく、prototype の encounter/content allocation skeleton として採る。"
---

## raw_excerpt
Nerdlab Games の design skeleton 記事。Magic: The Gathering の set design を例に、カード全体をいきなり個別デザインするのではなく、rarity、color、card type、slot identifier、creature 比率、faction identity、set-specific mechanic などを段階的に配置する骨格表を作る方法を説明している。特に、色や faction ごとの playstyle 差を、カードタイプの分布や core values / keywords の粗い割り当てとして先に置く点が重要。

記事は「skeleton は designer を閉じ込めるものではなく、何を割り当てる必要があるかを意識させるためのもの」と説明している。後半では、共通の proven structure を再利用しつつ、set-specific keyword や effect を最後に足してテストする流れが示される。個別カードや spreadsheet の詳細に入りすぎると大局を見失うため、skeleton を living document として戻って見る、という扱いも明記されている。カードゲームだけでなく、敵 wave、武器 tier、ステージ gimmick、報酬分布にも転用できる素材として保存する。

## why_relevant_to_games
Nao_u_BOT の shooter / action prototype で、wave ごとの敵種・弾種・報酬・mechanic 出現頻度を「個別実装前の割り当て表」として設計する時の参照になる。
