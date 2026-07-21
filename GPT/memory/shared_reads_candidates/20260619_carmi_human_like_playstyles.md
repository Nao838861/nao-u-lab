---
title: "Automated Play-Testing Through RL Based Human-Like Play-Styles Generation"
url: "https://arxiv.org/abs/2211.17188"
collected_at: "2026-06-19T21:25:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, player-modeling, reinforcement-learning, balancing]
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-06-21T05:25:00+09:00"
last_decision: postponed
lifecycle_backfill_reason: postpone_lifecycle_backfill
evidence: "Phase 4c lifecycle backfill from ISS-4A-20260621-001"
next_action: evaluate_in_phase2
stale_after: "2026-07-19"
supersedes: []
gate_reason: |
  Phase 4c では lifecycle 欠損の補完だけを行う。CARMI / human-like play-style は headless playtest と player-modeling に関係するため、
  投稿可否は次の Phase 2 で本文密度と既存 posted 候補との重複を確認して判定する。

---

## raw_excerpt
原文短句: "play-styles needs to be anticipated by designers" / "summary data" / "little human data"

arXiv:2211.17188。AAAI AIIDE 2022 掲載。著者は Pierre Le Pelletier de Woillemont, Remi Labory, Vincent Corruble。現代ゲームでは、同じゲームでも複数の遊び方が出るため、デザイナーはプレイヤーの play-style の幅を制作中に想定する必要がある、という問題設定。提案は CARMI。Reinforcement Learning agent を、単に高得点を取るプレイヤーではなく、プレイヤーらしい play-style を再現する automated play-testing agent として使う。特徴は、完全な trajectory ではなく summary data を入力として使えること、必要な人間データが少ないこと、未知レベルでも play-style をエミュレートすること。制作現場で現実的な学習時間とデータ量の範囲で、挙動やバランスの調査に使うことを狙っている。

## why_relevant_to_games
ヘッドレス評価や自動プレイテストを「勝てる AI」ではなく「遊び方の偏りを再現する AI」として設計する材料になる。
