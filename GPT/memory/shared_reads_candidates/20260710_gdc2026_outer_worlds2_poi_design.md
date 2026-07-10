---
title: "Designing POIs (Points of Interest) for 'The Outer Worlds 2'"
url: "https://gdcvault.com/play/1035724/Designing-POIs-%28Points-of-Interest%29"
collected_at: "2026-07-10T16:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, worldbuilding, navigation, production-talk]
evaluated_at: "2026-07-10T16:35:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-10T16:35:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-10T16:35:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  POI を worldbuilding / gameplay systems / player progression の交点として扱い、spatial design / navigation まで分解する軸が明確。
  Nao_u_BOT の探索型プロトタイプで、説明文ではなく視線誘導・進行状態・ギミック露出で「行きたくなる場所」を作る評価軸に直結する。
  公式概要だけでも問題設定、着想、設計分解、production examples の射程があり、CoopEval 水準の概要に展開可能。
suggested_post_outline:
  overview_angle: "POI を単なる配置物ではなく、世界観・進行・ゲームシステム・ナビゲーションを束ねる設計単位として読む。"
  analysis_axis: "4 側面への分解、交点としての POI、プレイヤー心理と affordance / shape language / environmental cue の接続。"
  application_target: "探索型小規模プロトタイプのマップ設計で、次に行く場所をテキスト誘導ではなく報酬予感・視線誘導・進行差分で伝えるチェックリストに落とす。"
  pros_cons: "メリットはマップ密度と進行理解を同時に扱えること。デメリットは大作 RPG 事例のため小規模制作では抽象化しすぎる危険があること。"
  verdict_pre: "部分採用。POI 分解軸を小規模探索ゲーム用の設計レビュー項目として採用する。"
---

## raw_excerpt
GDC Vault / GDC 2026 の公式セッション概要。Obsidian Entertainment の Dan Qiao による Design トラックの講演で、The Outer Worlds 2 の Points of Interest を題材にする。短い原文断片では、POI は "worldbuilding, gameplay systems, and player progression intersect" する場所と説明される。セッションは POI design を worldbuilding / progression / spatial design / navigation の 4 側面へ分解し、それらを揃えることで、読みやすく、関与しやすく、プレイヤーの進行に合わせて変化する空間を作る、という構成になっている。GDC agenda 側の説明では、role-playing game における POI を、早期アイデア、反復、実際に機能した解決策まで、具体的な production examples で扱うとされる。関連する IGDA ページでは、視覚誘導、player-centric level、player psychology、design affordance、shape language、narrative support、mechanics reinforcement、environmental cues / visual motifs という語も出ている。

## why_relevant_to_games
Nao_u_BOT の探索型・小規模プロトタイプで、マップ上の「行きたくなる場所」を説明文ではなく視線誘導、進行、ギミック、物語手がかりで作る時の参照候補。
