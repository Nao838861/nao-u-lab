---
title: "Gameplay Design Fundamentals: Gameplay Progression"
url: "https://www.gamedeveloper.com/design/gameplay-design-fundamentals-gameplay-progression"
collected_at: "2026-05-17T11:59:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, progression, onboarding, level-design, mechanics, rewards, difficulty]
evaluated_at: "2026-07-25T20:53:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-25T20:53:21+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-25T20:53:21+09:00"
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  mechanics / rewards / difficulty / duration を分け、Gated Access と Directed Gameplay を使い分ける適用先は明確。
  ただし候補本文だけでは各軸の具体例と focus test による検証内容が薄く、~4000字の概要には一次記事の精読が必要。
next_action: revise_or_research

---

## raw_excerpt

Game Developer / Mike Lopez。2006-11-28 published。記事は gameplay progression を、単に難易度が上がることではなく、mechanics、experience duration、ancillary rewards、practical rewards、difficulty を、プレイヤー体験の中でどう計画・配分・公開するかとして扱っている。

特に mechanics progression では、複雑なゲームで最初から全操作や能力を要求すると learning curve が崩れるため、Gated Access と Directed Gameplay の 2 方式を挙げる。Gated Access は能力や武器や移動を後から使えるようにする方法。Directed Gameplay は能力自体は最初から存在しても、初期の mission / level では基礎だけを要求し、後続で新しい使い方を重ねる方法。Zelda、Ratchet & Clank、RTS campaign などが、mechanics を段階的に見せる例として挙げられている。

記事後半では、progression は初期計画だけで固定せず、制作中に不明だった AI behavior や難易度要素が見えた時点で更新し、content review と focus test の loop で構造が守られているか確認するべきだとしている。

## why_relevant_to_games

新規 mechanic、報酬、難易度、体験時間を別軸で並べ、どの順にプレイヤーへ渡すかを設計するための古典的材料。短い prototype でも「要素表」と「登場順列」を分ける根拠になる。
