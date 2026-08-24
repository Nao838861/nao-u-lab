---
title: "Augmentations for Robust and Efficient Imitation Learning in Streamed Video Games"
url: "https://arxiv.org/abs/2607.14200"
collected_at: "2026-08-24T20:20:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, imitation-learning, automated-playtesting, streaming, robustness]
evaluated_at: "2026-08-24T20:24:22.6307426+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-24T20:24:22.6307426+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-24T20:24:22.6307426+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  時間相関を持つ streaming 劣化を4種の連続 perturbation として再現する着想、学習条件、
  milestone による評価、通常時と lag 時の定量結果が揃い、約4000字の概要へ展開できる。
  画面入力型の自動テストプレイヤーに対する観測経路 robustness probe へ直接適用できる。
suggested_post_outline:
  overview_angle: "少数 demonstration の imitation learning を、時間相関する配信映像劣化に耐えさせるデータ augmentation の設計と検証"
  analysis_axis: "静止画単位のノイズ付与ではなく、50〜100 frame の連続性をモデル化したことが汎化性能と lag 耐性へどう効いたか"
  application_target: "Log_cdx の画面入力型自動テストプレイヤーで、連続 frame の欠損・圧縮・残像を再現する観測 robustness probe と milestone 評価を組み込む"
  pros_cons: "少数の実演データと既存映像から導入しやすく、配信条件外でも改善が見える一方、2ゲーム3 task の手動注釈評価であり、一般化範囲と各 augmentation の寄与分離は限定的"
  verdict_pre: 部分採用
---

## raw_excerpt

arXiv 本文からの採取メモ（日本語パラフレーズ）: 複雑な 3D ゲームを操作する agent を、人間の demonstration から画面入力と action の対応として学習させる offline imitation learning を扱う。実運用では、熟練者の demonstration が少数しか集められず、さらに remote streaming の遅延・帯域変動・圧縮によって、学習時にはない時間相関を持つ映像ノイズが生じる。提案手法は、縦方向の scrub、局所的な macroblock pixelation、画面全体の fuzziness、前 frame の残像を混ぜる ghosting の4種類を、各 frame へ独立に加えるのではなく、50〜100 frame の連続 chunk 内で位置や強度が滑らかに変わる perturbation として生成する。predictive inverse dynamics model を基盤に、2本の modern 3D game にある3 task、各 task 30本の人間 demonstration で学習し、agent は 30 Hz の streaming 環境で操作する。評価は navigation、jump、crouch、object interaction、attack などの milestone 完了率を、人手で匿名化動画へ注釈して測る。安定した streaming 条件でも augmentation なしより最大41%高い評価値を報告し、network lag を加えた条件では通常データのみの agent が元性能から49.82%低下したのに対し、提案 augmentation ありでは7.45%の低下だった。

## why_relevant_to_games

画面だけを入力にする自動テストプレイヤーや remote game 操作 agent を作る際、単発の画像ノイズではなく連続 frame に残る観測経路の乱れまで学習データへ入れる具体例として参照できる。
