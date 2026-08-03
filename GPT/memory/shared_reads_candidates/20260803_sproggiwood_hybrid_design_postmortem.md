---
title: "Design Postmortem: Story-Driven Roguelike, Sproggiwood"
url: "https://www.gamedeveloper.com/design/design-postmortem-story-driven-roguelike-sproggiwood"
collected_at: "2026-08-03T09:32:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, roguelike, postmortem, hybrid-design, playtesting]
---

## raw_excerpt

著作権に配慮し、記事の重要箇所を日本語で忠実に採録する。Freehold Games は当初、15分単位の dungeon crawl と town builder を組み合わせ、「町そのものが character」という mobile 向け構想を進めた。dungeon で得た資源を町へ持ち帰り、村人の仕事や建物へ投資する設計だったが、町と dungeon はそれぞれ独自の複雑さを持ち、両者の橋渡しが弱いまま「直交する二つのゲームを重ねた」状態になった。IAP も望む progression と噛み合わず、最終的には dungeon 側へ焦点を戻した。

成功点として、短い modular encounter の組合せが挙げられる。数ターン以内に踏まないと slime を生む puddle と、近くの対象を tongue で引き寄せる frog を同じ procedural dungeon に置くと、単体規則から予想外の tactical situation が生じる。また、後期に導入した survey では gameplay の compelling 評価が約6.5/10に留まり、playtester から dungeon 内の即時報酬不足を指摘された。そこで level-up と power 選択を各 run 内へ移し、短い session の中で報酬 loop も閉じた。反省点には、均整の取れた enchantment が似た印象になったこと、物語上の問いが mechanics に浸透せず大半の player に届かなかったことが含まれる。

## why_relevant_to_games

複数 loop を組み合わせる prototype で、単に両方が面白いかではなく相互作用が成立しているかを点検し、短い play session に合わせて報酬周期・survey 指標・theme の mechanics 化を設計する場面に使える。
