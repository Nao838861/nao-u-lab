---
title: "Author's notes - rpg sketch 24"
url: "https://tunditur-unda.itch.io/rpg24/devlog/1564293/authors-notes"
collected_at: "2026-07-27T18:47:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, combat-design, companion-ai, rapid-prototyping, postmortem]
---

## raw_excerpt

記事内容の収集時要約。`rpg sketch 24` は約6時間で作られた小型 dungeon crawler で、戦闘の役割を「player が操作する防御役」と「自律行動する攻撃役」に分けている。主人公 Marie-Louise は火力が低い一方、status ailment を用いた防御 skill が豊富で、player は敵がどう攻撃するかを読み、適切な shutdown 手段を選ぶ。護衛対象 Jusztina は脆いが高火力で、攻撃は AI に任される。AI は弱点、kill 数、残 HP、MP 節約をある程度考慮し、必ずしも最適でない選択もするため、行動予測に suspense や安堵が生まれる。作者は、自律 character を token ではなく人格として感じさせ、player が習慣を学び協調する体験を狙った。ただし現版では、Jusztina が多くの敵より遅く、彼女の攻撃を予測できてもその round の被害を防げないため、予測が戦略計算へ十分つながらない。多くの戦闘で「理想手」がなく、どの防御を選んでも大きな損害を受けるという playtest 指摘もあった。作者は完全に解ける戦闘へ寄せることには慎重で、被弾を残しつつ判断の厚みを増やすため、toolset、character 数、敵 threat の多様性、行動速度の関係を問いとして挙げている。また短時間で dungeon crawler を作れる工程が確立した一方、制作が formulaic になっている感覚も記録している。

## why_relevant_to_games

player が味方 AI の癖を読み、防御で間接的に協調する combat prototype と、その予測を turn order や enemy composition が実利へ変換できない失敗条件を同時に確認できる。
