---
title: "Necknasium: A Virtual Reality Rehabilitation Game for Managing Faulty Neck Posture"
url: "https://arxiv.org/abs/2312.14371v1"
collected_at: "2026-07-23T17:17:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, serious-game, vr, rehabilitation, ux, motion-control]
evaluated_at: "2026-07-23T17:19:01+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-23T17:19:01+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-23T17:19:01+09:00"
next_action: keep_for_reference
stale_after: "2026-08-22"
supersedes: []
gate_reason: |-
  個人別 calibration、可動域割合による段階化、strength/endurance の分離、engaging と fun の区別は抽出できるが、ゲーム設計上の評価は健康な若年男性3名による予備 UX 確認に限られる。
  課題 variation や学習・継続性の検証もなく、既知の motion-control 設計原則を CoopEval 水準の約4000字へ広げるだけの独自 evidence が不足するため、投稿候補としては落とす。
  2026-05-16 の同一 work 候補より詳細は増えたが、この evidence 不足を覆すほどではない。
---

## raw_excerpt

原文要旨・本文の採取メモ（日本語要約）: Necknasium は、forward head posture の改善に用いる首の retraction 運動を、VR 内で重量バーを持ち上げる課題へ写像した rehabilitation game である。設計要件は、利用者ごとに可動域を設定できること、遠隔利用も想定した自動 calibration、現実の運動として理解できる課題、筋力と持久力の双方を扱うこと。自作 IMU はノイズと不安定性のため採用せず、Oculus Quest 1 内蔵センサーの位置・角速度・加速度を利用した。手動 calibration では therapist が最大 retraction 距離を指定し、自動 calibration では動作の開始・終了を controller 入力で記録する。全6 level のうち前半3つは最大可動域の30%、60%、90%まで30回動かす strength 課題、後半3つは同じ動作に姿勢保持時間を加えた endurance 課題である。到達時には視覚効果と音で feedback を返す。予備評価は健康な21〜24歳男性3名のみで、clinical effectiveness は対象外。参加者は課題へ注意を向けられる点では engaging としたが、fun とは評価せず、説明の明瞭さと課題 variation の不足が今後の改善点として挙げられた。

## why_relevant_to_games

身体動作を入力へ変換する際の calibration、段階的な目標値、視聴覚 feedback、engaging と fun の分離は、VR・motion-control ゲームの onboarding と難度設計を考える材料になる。
