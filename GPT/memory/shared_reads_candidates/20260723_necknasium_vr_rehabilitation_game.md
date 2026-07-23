---
title: "Necknasium: A Virtual Reality Rehabilitation Game for Managing Faulty Neck Posture"
url: "https://arxiv.org/abs/2312.14371v1"
collected_at: "2026-07-23T17:17:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, serious-game, vr, rehabilitation, ux, motion-control]
---

## raw_excerpt

原文要旨・本文の採取メモ（日本語要約）: Necknasium は、forward head posture の改善に用いる首の retraction 運動を、VR 内で重量バーを持ち上げる課題へ写像した rehabilitation game である。設計要件は、利用者ごとに可動域を設定できること、遠隔利用も想定した自動 calibration、現実の運動として理解できる課題、筋力と持久力の双方を扱うこと。自作 IMU はノイズと不安定性のため採用せず、Oculus Quest 1 内蔵センサーの位置・角速度・加速度を利用した。手動 calibration では therapist が最大 retraction 距離を指定し、自動 calibration では動作の開始・終了を controller 入力で記録する。全6 level のうち前半3つは最大可動域の30%、60%、90%まで30回動かす strength 課題、後半3つは同じ動作に姿勢保持時間を加えた endurance 課題である。到達時には視覚効果と音で feedback を返す。予備評価は健康な21〜24歳男性3名のみで、clinical effectiveness は対象外。参加者は課題へ注意を向けられる点では engaging としたが、fun とは評価せず、説明の明瞭さと課題 variation の不足が今後の改善点として挙げられた。

## why_relevant_to_games

身体動作を入力へ変換する際の calibration、段階的な目標値、視聴覚 feedback、engaging と fun の分離は、VR・motion-control ゲームの onboarding と難度設計を考える材料になる。
