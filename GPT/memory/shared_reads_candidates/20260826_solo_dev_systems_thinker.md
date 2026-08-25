---
title: "From Solo Dev to Systems Thinker: Lessons from Idle Not Idle Games"
url: "https://developer.microsoft.com/en-us/games/articles/2026/06/from-solo-dev-to-systems-thinker-lessons-from-idle-not-idle-games/"
collected_at: "2026-08-26T03:49:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [solo-development, production, systems-design, scope, playtesting, postmortem]
---

## raw_excerpt

Microsoft Game Dev が、南アフリカの solo developer Willem Willemse の制作過程を紹介した記事。本人は coding から始めたが、制作を進めるうちに storytelling、design、art も一人で担うようになり、mechanics 中心の実装から narrative experience を含む system 全体へ仕事が広がったという。roadmap は art update、level design、skill system、story integration、playtesting feedback に分解されている。encounter や enemy の不足という feedback に対しては、単純に配置数を増やすのではなく、より多くの NPC を少ない resource で扱う entity system が必要になったと述べる。

制作資源については、有用な tool が存在しても費用が合わなければ採用できず、別の方法で timeline を保つ必要がある。feedback 獲得にも落差があり、投稿や依頼を1000人以上が見ても、実際に project を開いて遊ぶ人がいなかった例が挙げられる。記事末では、事前計画が手戻りを減らすこと、feature creep は常に起きること、開始より完成が重要なこと、既存 system への後付けより再構築が速い場合があること、単純な tool が複雑な workflow より効く場合があること、技術制約が player experience を形作ることを lesson として列挙する。

## why_relevant_to_games

一人制作で mechanics、content、narrative、tooling、playtest を同時に扱う際、表面上の content 不足を支える system 制約や、閲覧数と実 playtest 数の差を制作計画へ含める材料になる。
