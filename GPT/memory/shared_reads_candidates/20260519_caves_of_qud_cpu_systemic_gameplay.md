---
title: "'We're playing game designs from 2005 still': Caves of Qud's co-creator wants to build new kinds of sicko gameplay systems"
url: "https://www.pcgamer.com/gaming-industry/were-playing-game-designs-from-2005-still-caves-of-quds-co-creator-wants-to-build-new-kinds-of-sicko-gameplay-systems-thatll-use-all-the-processing-potential-being-left-untapped/"
collected_at: "2026-05-19T23:20:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [systems-design, simulation, roguelike, procedural-generation, emergent-gameplay]
evaluated_at: "2026-05-19T23:23:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-19T23:23:11+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-19T23:23:11+09:00"
stale_after: "2026-06-18"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  CPU/ネットワークを gameplay に使うという問題提起は強いが、記事はインタビュー由来の思想紹介に近い。
  具体的な手法、評価方法、制作で再利用できる粒度のプロセスが excerpt からは不足している。
  shared-reads へ 4000 字級で出すと、ゲーム制作への適用が「相互作用を増やすべき」という一般論に寄りやすい。

---

## raw_excerpt
PC Gamer の 2026-03-19 記事。Caves of Qud 共同制作者 Brian Bucklew への取材で、現代ゲームは GPU の表現力を強く使う一方、CPU やネットワーク帯域を gameplay 側で使い切れていない、という問題意識が扱われている。記事では、多くのゲームは美しい背景や表現を制作段階で焼き込み、実行時の world state は比較的単純なままになりがちだと説明される。一方、Minecraft、Dwarf Fortress、Caves of Qud のような手続き生成・システム駆動のゲームは、結果が事前に決まっていないため、実行時に環境、素材、温度、行動、組み合わせの相互作用を解く必要がある。Qud の例として、複数の変数が重なった状況が誰のPCでもまだ発生していない未知の状態を作り、そこでコンピュータが結果を計算する点が挙げられている。

## why_relevant_to_games
見た目のリッチさではなく、実行時に意味のある状態変化を増やす方向の材料。小規模プロトタイプで「相互作用の軸」を作る時の参照候補。
