---
title: "Deep Dive: Sound design for the living world in Avatar: Frontiers of Pandora"
url: "https://www.gamedeveloper.com/audio/deep-dive-sound-design-for-the-living-world-in-avatar-frontiers-of-pandora"
collected_at: "2026-07-20T06:02:08.1127293+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-audio, spatial-audio, open-world, feedback, accessibility]
---

## raw_excerpt

本文採録（忠実な要点）: Lift Vine は植物と動物の中間に見える移動用オブジェクトで、自然物として馴染む有機的な音色と、密集した rainforest mix の中で操作対象だと分かる高い transient を両立させる。頻出物なので大きすぎず反復疲労も避ける。leather、rope、vegetable 等の録音を加工し、Wwise の random container で variation を持たせる。最大30mまで変わる蔓の長さに合わせて emitter 位置を Snowdrop graph で再計算し、汚染値が閾値を超えると音を止める。移動中の in-ear wind は player に付く2D音だが、coop では remote player の使用時に鳴らさない。Na'vi Senses 中は bulb に追加 layer を出し、azimuth・elevation に応じて正面を向いた時ほど聞き取りやすくする。

Veilswarm は飛行 mount が通過すると散開し stamina を回復する群れで、player speed・距離に応じた whoosh、散開時 one-shot、距離別 loop を重ねる。群れの内部では stereo / quad の2D flapping を鳴らし、camera movement、distance、speed、azimuth を Wwise RTPC に入れて volume・pitch・spatialization を変える。視覚 graph と同じ入力を音にも使うため、左右へ逃げる動きと音が同期する。さらに一方の emitter を player 位置と反対側へ鏡映し、少数の発音点でも全周を羽ばたきに囲まれた感覚を作る。coop ではこの近接2D音も local / remote 条件で分離する。

## why_relevant_to_games

音を装飾ではなく affordance、速度感、状態変化、coop の視点整合へ結び付けた実装例である。prototype の少ない emitter と共有 telemetry でも、読みやすさと「世界が反応する」感覚を作る設計に活用できる。
