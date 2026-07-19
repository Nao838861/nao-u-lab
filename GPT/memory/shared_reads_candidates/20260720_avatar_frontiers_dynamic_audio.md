---
title: "Deep Dive: Sound design for the living world in Avatar: Frontiers of Pandora"
url: "https://www.gamedeveloper.com/audio/deep-dive-sound-design-for-the-living-world-in-avatar-frontiers-of-pandora"
collected_at: "2026-07-20T06:02:08.1127293+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-audio, spatial-audio, open-world, feedback, accessibility]
evaluated_at: "2026-07-20T06:07:46+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-20T06:14:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784495623345539"
next_action: none
stale_after: "2026-08-19"
supersedes: []
posted:
  ts: "1784495623.345539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784495623345539"
  char_count: 4414
  posted_at: "2026-07-20T06:14:11+09:00"
gate_reason: |-
  Lift Vine と Veilswarm の2事例から、知覚上の目的、素材選択、可変 emitter、RTPC、視線・速度・状態・local/remote 条件まで実装判断を追える。
  形式的なユーザー実験はないが、出荷済み open-world の制約解決事例として、音を affordance と身体反応へ結ぶ具体 probe に落とせる。
  二つの事例の共通原理・限界・小規模 prototype への縮約を含めれば、約4000字の残すべき分析に耐える。
suggested_post_outline:
  overview_angle: "open-world 音響を装飾ではなく、操作対象の可読性、移動速度、空間反応、coop の視点整合を担う状態依存システムとして整理する。"
  analysis_axis: "Lift Vine の音色と可読性の両立、可変 emitter と視線補助、Veilswarm の共有 telemetry・RTPC・鏡映 emitter、local/remote 分離を比較する。"
  application_target: "Log_cdx の browser game prototype で、少数 emitter と既存 gameplay state を使い、対象発見・速度感・危険状態・local player feedback を音で読ませる実装 probe。"
  pros_cons: "長所は視覚ロジックを音へ再利用し少ない発音点で反応密度を上げられること。短所は専用 middleware の事例で定量評価がなく、2D/3D layer の過剰化や反復疲労を個別に検証する必要があること。"
  verdict_pre: "部分採用。まず一つの可変オブジェクトで emitter 位置・速度・状態閾値・local/remote 条件を共有する小規模 probe を試す。"
---

## raw_excerpt

本文採録（忠実な要点）: Lift Vine は植物と動物の中間に見える移動用オブジェクトで、自然物として馴染む有機的な音色と、密集した rainforest mix の中で操作対象だと分かる高い transient を両立させる。頻出物なので大きすぎず反復疲労も避ける。leather、rope、vegetable 等の録音を加工し、Wwise の random container で variation を持たせる。最大30mまで変わる蔓の長さに合わせて emitter 位置を Snowdrop graph で再計算し、汚染値が閾値を超えると音を止める。移動中の in-ear wind は player に付く2D音だが、coop では remote player の使用時に鳴らさない。Na'vi Senses 中は bulb に追加 layer を出し、azimuth・elevation に応じて正面を向いた時ほど聞き取りやすくする。

Veilswarm は飛行 mount が通過すると散開し stamina を回復する群れで、player speed・距離に応じた whoosh、散開時 one-shot、距離別 loop を重ねる。群れの内部では stereo / quad の2D flapping を鳴らし、camera movement、distance、speed、azimuth を Wwise RTPC に入れて volume・pitch・spatialization を変える。視覚 graph と同じ入力を音にも使うため、左右へ逃げる動きと音が同期する。さらに一方の emitter を player 位置と反対側へ鏡映し、少数の発音点でも全周を羽ばたきに囲まれた感覚を作る。coop ではこの近接2D音も local / remote 条件で分離する。

## why_relevant_to_games

音を装飾ではなく affordance、速度感、状態変化、coop の視点整合へ結び付けた実装例である。prototype の少ない emitter と共有 telemetry でも、読みやすさと「世界が反応する」感覚を作る設計に活用できる。
