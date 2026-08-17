---
title: "Postmortem: Digital Chocolate's Tower Bloxx"
url: "https://www.gamedeveloper.com/design/postmortem-digital-chocolate-s-i-tower-bloxx-i-"
collected_at: "2026-08-18T06:17:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, prototyping, mobile]
---

## raw_excerpt

Digital Chocolate / Sumea の Mikko Kodisoja が、2005年の mobile puzzle game『Tower Bloxx』を4か月で制作した過程を振り返る。one-button の action mode では、風で揺れる crane から floor を落として tower を積み、配置精度と速度で住民数が変わる。city mode では高さの異なる tower を配置条件に従って限られた区画へ置く。出発点は brainstorming 中の一枚絵と、単純な graphics の throw-away prototype「drop the box」だった。試遊者から phone を取り上げにくいほど反応が強かったため、都市 theme を与えて production に進んだ。

production 後、prototype は10分ほどで「ほかに何があるのか」と聞かれる浅さを残していた。team は city mode を足して覆うのではなく、block dropping 自体を繰り返したくなる core にするため、senior designer と senior programmer を隣席に置き、30分から3時間の iteration を3週間続けた。physics、collision、必要な graphics を即座に変更し、lead designer も週に数回、局所調整に埋没していないかを確認した。長期側の city rule は paper と Excel で試した。

一方、city UI の animation と sprite は事前に Flash や GIF で試さず、programmer が実装後に何度も調整したため、city feature を削る結果になった。schedule も、新規性の高い作品なのに過去の one-button sequel と同程度に見積もり、physics tuning と city mode の拡張を十分に織り込めなかった。producer と lead designer を一人が兼任し、完成度を上げる判断と予算・納期を守る判断の区別が team から見えにくくなった点も記録している。

## why_relevant_to_games

core mechanic の弱さを周辺 mode で隠さず短周期 tuning に戻す工程と、code を書く前に rules と graphical UI を別々の低コスト prototype で検証する制作設計の材料になる。
