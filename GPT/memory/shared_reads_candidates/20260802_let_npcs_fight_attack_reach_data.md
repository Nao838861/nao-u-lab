---
title: "Let the NPCs Fight: Learning Attack Reach from Real Gameplay Data"
url: "https://www.aiandgamesconference.com/schedule/let-the-npcs-fight-learning-attack-reach-from-real-gameplay-data/"
collected_at: "2026-08-02T19:02:33.3715844+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, combat-design, animation, telemetry, automated-testing, regression-testing]
evaluated_at: "2026-08-02T19:08:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-02T19:08:07+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-02T19:08:07+09:00"
next_action: revise_or_research
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  攻撃リーチを実 gameplay animation から測り、asset 群の一貫性と regression を監視する着想は具体的で、action game 制作への適用性も高い。
  ただし一次 URL は現在 404 で、候補内の講演概要だけではデータ規模、測定誤差、比較、検出実績など評価の中身と結論を復元できず、CoopEval 水準の約 4000 字を根拠付きで書けない。
---

## raw_excerpt

AI and Games Conference の講演概要を日本語で記録する。Assassin's Creed の最新作では、NPC の攻撃リーチを定める際、animation system の複雑さ、procedural adjustment、地形や周辺環境の違いが重なるため、手作業による距離測定は信頼性と拡張性を欠いていた。開発チームは、制御された再現可能な環境で実際の gameplay animation を収録し、取得データを厳密に cleaning したうえで、data science の手法により攻撃範囲を解析する pipeline を構築した。この方法は、多数の NPC・武器・animation asset にまたがって attack range の一貫性を検証し、更新による予期しない挙動変化を早期に見つける continuous monitoring と regression detection に接続される。講演は、大規模 content set の検証を manual data entry から自動化へ移すこと、現実の gameplay 条件を反映しながら測定可能な test world を用意すること、複雑な machine learning より解釈しやすい data science を意図的に選んだ理由、軽量な監視系で design intent の逸脱を捕捉する流れを扱う。

## why_relevant_to_games

攻撃の当たり判定や間合いを感覚的な手調整だけにせず、実 animation の観測値と再現環境を用いて大量 asset の一貫性を検証する制作工程の候補になる。Nao_u の action game でも、敵 archetype・武器・速度ごとの attack reach を telemetry 化し、調整後の regression を deterministic に検出する場面へつながる。
