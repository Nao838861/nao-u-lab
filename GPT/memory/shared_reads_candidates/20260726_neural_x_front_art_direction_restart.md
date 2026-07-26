---
title: "I fucked up (back to the drawing board)"
url: "https://neural-x-front.itch.io/neuralxfront/devlog/1529042/i-fucked-up-back-to-the-drawing-board"
collected_at: "2026-07-26T12:18:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, art-direction, architecture, cancellation, tower-defense]
evaluated_at: "2026-07-26T12:21:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T12:21:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T12:21:31+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  art direction を後工程の装飾ではなく、resolution、UI、asset 仕様、code architecture を拘束する初期設計入力として扱う教訓は具体的である。
  ただし単一開発者の短い中止報告で、比較条件、再出発後の検証、再現可能な手順、成果評価がない。約4000字の共有投稿を支える証拠密度には届かない。
---

## raw_excerpt

初めてのゲームとして、作者は Tower Defense、Dota、Diablo を混ぜた『Neural X Front』を制作し、50超の skill、50超の enemy、boss、70超の item と補助 system まで実装した。しかし、core system が揃った後で見た目を整えようとした段階で、UI、icon、sprite、canvas size、resolution などが互いに依存しており、後付けの art では当初の visual vision を満たせないと気づいた。内部 code も spaghetti 状態だったが、作者が中止の主因として挙げるのは code 単独ではなく、art direction を開発初期の制約として扱わなかったことだった。

記事は、art を最後に載せる装飾ではなく、画面寸法、asset 仕様、UI 構造、実装方式を早期に決める設計入力として扱う必要がある、と振り返る。作者は既存作を無理に完成させ続けるより、得た知識を新作の planning に適用し、Steam demo 品質を目標に再出発することを選んだ。短い原文断片では、中止理由を “I hit my face on a wall” と表現し、制作途中で積み上げた機能量と、完成へ接続する統合設計が別問題だったことを記録している。

## why_relevant_to_games

機能を大量に実装した後で art・UI・resolution の前提が噛み合わず再出発した事例として、prototype の早期段階で visual constraint と code architecture をどう同時に固定するかを考える材料になる。
