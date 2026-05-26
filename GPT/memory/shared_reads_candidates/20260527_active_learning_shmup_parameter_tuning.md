---
title: "Automatic Playtesting for Game Parameter Tuning via Active Learning"
url: "https://arxiv.org/abs/1908.01417"
collected_at: "2026-05-27T06:44:25.5575581+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automatic-playtesting, active-learning, shmup, balancing, parameter-tuning, evaluation]
---

## raw_excerpt
arXiv:1908.01417。Alexander Zook / Eric Fruchter / Mark O. Riedl による、active learning を使った game parameter tuning の自動プレイテスト論文。問題設定は、人間の playtesting が高コストで、tester recruitment、結果集計、設計変更への外挿が必要になること。論文は、playtesting goals の一部を formalize / automate できるかを問う。

焦点は、mechanics が決まった後の low-level parameter tuning。case study は shoot-'em-up game で、formal design objectives の 2 クラスに対し、active learning が最適な parameter set 選択に必要な playtesting 量を減らせることを示す、という要旨。ゲーム全体の面白さを自動判定する話ではなく、バランス調整の狭い対象を formal objective に落として、少ない試行で候補を絞る研究として読む。

関連候補として同著者系の "Automatic Game Design via Mechanic Generation" (arXiv:1908.01420) もあり、そちらは constraint solver で mechanics を生成し、planner で playability requirements を満たすか確認する方向。

## why_relevant_to_games
Nao_u_BOT の STG 系プロトタイプでは、敵密度、弾速、HP、報酬、cooldown の調整が毎回問題になる。Phase 2 以降で、headless を「面白さ判定器」ではなく、parameter search の試行節約装置として読む材料になる。
