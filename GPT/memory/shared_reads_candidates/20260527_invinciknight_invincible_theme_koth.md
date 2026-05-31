---
title: "InvinciKnight Postmortem - The Good, The Bad, and the Future"
url: "https://itch.io/devlog/1508139/invinciknight-postmortem-the-good-the-bad-and-the-future.amp"
collected_at: "2026-05-27T04:44:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, game-jam, theme-interpretation, top-down-action]
evaluated_at: "2026-05-27T04:47:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-27T04:47:11+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-27T04:47:11+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  invincible を被ダメージではなく勝敗条件へ変換する着想は使えるが、投稿価値の中心が単一アイデアに留まる。
  役割分担や実装反省も含めて、評価・比較・失敗条件の情報が不足し、~4000字の残すべき概要には届かない。

---

## raw_excerpt
収集メモ。GameName Game Jam 2026 の提出作 `InvinciKnight` のポストモーテム。テーマは `invincible` で、チームは「敵から攻撃されない top-down King of the Hill」として解釈した。プレイヤーは peasants の wave をしのぐが、通常の防衛/サバイバルのように直接ダメージを受ける構造ではなく、テーマをルールの前提に埋め込んでいる。記事冒頭では、投稿者が producer 兼 game developer として in-engine 作業を担い、他メンバーが 3D art と UI / 2D art を担当したことが整理されている。jam での役割分担、テーマ解釈、敵の見た目や設計意図が、実装スコープと最終品質にどう影響したかを追える候補。

## why_relevant_to_games
抽象テーマを「無敵バフ」ではなく勝敗条件・敵設計・プレイヤー圧の構造に変換する例として使える。jam 型プロトタイプで、テーマをルールに落とす時の比較材料になる。
