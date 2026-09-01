---
title: "Paradox Interactive's Afterworld wants to entice new players to grand strategy with tasty RPG hooks"
url: "https://www.gamedeveloper.com/design/paradox-interactive-s-afterworld-wants-to-entice-new-players-to-grand-strategy-with-tasty-rpg-hooks"
collected_at: "2026-09-01T22:35:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, grand-strategy, onboarding, role-playing, player-goals]
evaluated_at: "2026-09-01T22:40:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-09-02T02:59:12.311599+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788285552311599"
next_action: none
stale_after: "2026-10-01"
supersedes: []
gate_reason: >-
  grand strategy の入口で目標を見失う問題に対し、局所課題、発見、tribe の役割形成から
  player 自身の中期目標を発生させる設計が具体例付きで抽出できる。定量評価はないが、開発者の
  設計意図と限界を分けて扱えば、複雑なゲームの onboarding へ適用可能な約4000字の分析にできる。
suggested_post_outline:
  overview_angle: "説明量を増やすのでなく、物語上の局所課題から自己目標を生成させて複雑な戦略ゲームへ導く設計"
  analysis_axis: "局所課題→発見→idea 獲得→共同体の役割形成→中期目標という導線と、開発者主張・未検証部分の切り分け"
  application_target: "MonoSH や今後の複雑なシステム型プロトタイプで、全機能説明の前に一手で解ける危機と発見イベントを置き、操作学習をプレイヤー固有の攻略方針へ接続する onboarding"
  pros_cons: "利点は学習動機と role-play を同じ出来事から生めること。欠点は発見順や選択肢の偏りで重要機能を学ばない可能性があり、導線の観測と救済が必要なこと"
  verdict_pre: "部分採用"
posted:
  ts: "1788285552.311599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788285552311599"
  char_count: 4039
  posted_at: "2026-09-02T02:59:12.311599+09:00"
---

## raw_excerpt

Paradox Development Studio の Afterworld は、grand strategy の規模、資源配分、領土拡張、外交を残しつつ、genre 未経験者が「何を目標にすればよいか」を見失う入口の難しさを RPG 的な framing で扱う。歴史の途中から始まる Hearts of Iron のような設定ではなく、文明崩壊後に孤立していた tribe が地上へ出て歴史を再開する状況を採用し、player と世界内の共同体の双方が未知を発見する構造にしている。最初から大量の設定項目を調整させるのではなく、tribe の出自を backstory として持たせ、survival、safe haven、resource 確保、他 tribe との接触という局所的な課題から始める。play の途中で出会う survivor や event から、foraging、旧世界技術、cannibalism などの「idea」を獲得・発展させ、それが tribe の知識、能力、価値観、将来像を変える。これにより、player は数値最適化の説明を先に読むのではなく、その場の出来事へ適応するうちに自分の goal を作る。既存 fan 向けの複雑な expansion system と branching choice を維持しながら、story と tribe role-play を genre への入口として配置する設計である。

## why_relevant_to_games

複雑な simulation を tutorial の説明量だけで解決せず、局所課題・発見・役割形成を通じて player 自身に中期目標を発生させる onboarding の参照になる。
