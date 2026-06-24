---
title: "Fostering Emotional Perspective-Taking: An Exploration of Affective Face-Tracking Interactions in the VR Narrative Rekindle"
url: "https://arxiv.org/abs/2606.02425"
collected_at: "2026-06-19T04:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [vr, narrative-design, affective-interaction, player-experience, embodiment]
evaluated_at: "2026-06-19T04:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-19T04:31:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-19T04:31:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  emotional perspective-taking という設計観点は有用だが、VR face-tracking 前提が強く、現在の制作対象への接続が遠い。
  投稿水準の概要を書くには評価結果とゲーム内実装の具体性が不足し、適用がこじつけになりやすい。
---

## raw_excerpt

arXiv:2606.02425。Hector Fan、Casper Hartveld、Mark Sivak。2026-06-01 投稿。論文は、Interactive Digital Narrative と VR で、顔表情などの real-time biometric data をどう物語体験に入れるかを扱う。既存の emotion input は、難易度や見た目の調整のような表層利用に留まりがちで、プレイヤーが narrative 自体をどう経験するかに踏み込みにくい、という問題設定。

提案は、VR headset の built-in face-tracking で player emotional states を認識し、プレイヤーと embodied story character の間に emotional perspective-taking を促す affective interaction model。対象は VR narrative Rekindle。要旨では、感情入力を単に system difficulty や aesthetics に反映するのではなく、プレイヤーが物語上の人物の感情的立場を引き受け、キャラクターとの emotional connection と narrative engagement を深める方向で設計する、と説明されている。

ゲーム制作の観点では、表情認識そのものより、プレイヤーの現在感情を「ご褒美・罰・演出変化」へ直結させず、視点取得や役割理解へ変換する点が素材になる。会話ゲーム、VR、テキスト ADV、NPC 支援キャラで、入力された感情をどのゲーム状態へ接続するかを考える候補。

## why_relevant_to_games

感情入力を難易度調整ではなく、物語上の視点取得やキャラクター理解へ接続する設計例。LLM NPC や対話型 ADV の player state 利用を考える時に使える。
