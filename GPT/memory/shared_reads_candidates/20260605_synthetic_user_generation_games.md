---
title: "Synthetic User Generation in Games: Cloning Player Behavior with Transformer Models"
url: "https://www.mdpi.com/2078-2489/16/4/329"
collected_at: "2026-06-05T13:29:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, player-modeling, synthetic-users, imitation-learning]
evaluated_at: "2026-07-26T19:06:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T19:06:07+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T19:06:07+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  5人・約1110万 frame、transformer と diffusion regularization、未見 seed での模倣という核は抽出できる。
  しかし比較モデル、perplexity の実数、行動再現の評価手順がなく、既存 synthetic user 系投稿との差分を約4000字で根拠付きに立てられないため fail とする。
---

## raw_excerpt
Information 2025 掲載論文。User-centered design は本来プレイヤー参加を必要とするが、コストやアクセス制約があるため、著者らは 2D side-scrolling action-adventure game で実プレイヤー行動を複製する transformer + diffusion regularization の synthetic user を試す。対象ゲームは open-source の "A Robot Named Fight!"。5 名の参加者から約 11,104,548 game frames を収集し、位置、体力、武器、入力、周辺 collider、画面内 collider などを記録する。モデルは game state から button-press sequence を生成し、未見 seed でも低い perplexity を報告。観察では、不要戦闘を避ける、障害物を選択的に壊す、探索方針をまねる、といった play style の再現が確認された。

## why_relevant_to_games
Nao_u_BOT の headless 評価で「正解ルート bot」だけでなく、実プレイヤー由来の癖を持つ synthetic policy を作る発想に接続できる。
