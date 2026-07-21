---
title: "Post-Jam Retrospective: A Strong Idea That Needed More Time"
url: "https://itch.io/devlog/1573537/post-jam-retrospective-a-strong-idea-that-needed-more-time"
collected_at: "2026-07-22T05:01:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, game-jam, controls, onboarding, feedback]
---

## raw_excerpt

原文の要点を日本語で採録する。『Stripped』は Mini Jam 212 のテーマ「Control」と制約「You Are The Enemy」に対し、敵から入力キーそのものを奪って自分の能力にする仕組みを核にしたブラウザゲームである。プレイヤーはほぼ何もできない状態で始まり、guard を追って能力を奪うと Godot の InputMap に対応する操作が登録される。被弾時には所持している control の一つがランダムに失われ、物理 pickup として world に戻るため、moveset がプレイ中に増減する。

72時間の jam では、runtime の input 登録、player と複数 guard 間の ability state 管理、control の受け渡し実装に大半の時間を費やし、polish、level design、仕組みを遊びながら教える工程が不足した。playtest では、能力を使う前に奪う必要があることが伝わらず、guard を捕まえた位置によって二つの能力が同時に得られたり反対側では何も起きなかったりして、挙動の一貫性も崩れた。被弾で control をランダムに失う処理は、視覚・音響 feedback が弱いため、意図的なルールではなく壊れた挙動や不公平さとして受け取られた。

作者は core concept 自体は記憶に残り、feedback でも可能性を確認できたとしている。再制作するなら、最初の level を短く絞って「奪ってから使う」関係を操作の中で教え、guard behavior を一貫させ、key の獲得・喪失に強い feedback を付けるとしている。177作品中 rating は5件だけで、jam 内の可視性には最初の screenshot と説明文も影響したと記録している。

## why_relevant_to_games

入力そのものを資源化する独自 mechanic で、ルールの一貫性、獲得・喪失 feedback、最初の level による onboarding が体験理解をどう左右するかを検討する材料になる。
