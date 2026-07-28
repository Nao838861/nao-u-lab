---
title: "Postmortem: Children of Morta"
url: "https://www.gamedeveloper.com/design/postmortem-children-of-morta"
collected_at: "2026-07-28T23:32:10+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, roguelike, production, playtesting, ux]
---

## raw_excerpt

記事内容の忠実な抄訳メモ（逐語引用ではない）。Dead Mage の Amir H. Fassihi は、家族を描く物語主導のアクション・ローグライク『Children of Morta』について、当初6か月の小規模作品として始まった企画が、Kickstarter とパブリッシャー参加を経て5年の開発になった過程を振り返る。うまくいった点として、5人から18人へ成長したチームの相互支援、物語上の「家族」と「ストーリーを持つローグライク」という二本の柱を他要素より優先したこと、Unity Editor 内の階層型有限状態機械や procedural level／asset 管理などの内製ツール、継続的な外部フィードバックを挙げる。

一方、初期には開発者自身が隣で説明できたため UI/UX の不足を見落とし、キャラクター、スキルツリー、アイテム、強化系が増えた後に外部プレイヤーが理解できない問題が表面化し、UI を少なくとも3回作り直した。pre-production と production の境界が曖昧なまま新機能を追加し続けたことで、使われない asset、見積もり困難、物語の大幅な手戻りが生じた。途中追加の online multiplayer は architecture、console 対応、testing を広く巻き込み、発売後へ延期された。さらに約6万語・11言語の localization と、高解像度・多 keyframe の手描き pixel animation の工数も過小評価していた。ただし開発2週目からの週次 playtest、Kickstarter backer、publisher の focus test という複数段階の feedback loop が、流動的な制作中の方向確認に使われた。

## why_relevant_to_games

小規模 roguelike が長期開発へ膨らむ際の pillar 保護、UX の後回し、production 境界、後付け multiplayer、手描き animation の見積もりを、実例ベースで制作計画と playtest 設計に参照できる。
