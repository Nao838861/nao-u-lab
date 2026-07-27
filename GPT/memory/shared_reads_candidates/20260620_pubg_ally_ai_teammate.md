---
title: "PUBG Ally Duo Mode Two-Week Beta Available Now, Adding A Collaborative AI Teammate To Your Squad"
url: "https://www.nvidia.com/en-us/geforce/news/pubg-ally-ai-teammate-beta-available-now/"
collected_at: "2026-06-20T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, ai-teammate, commercial-game, player-feedback]
evaluated_at: "2026-07-27T16:36:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T16:36:13+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T16:36:13+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  behavior tree と SLM の責務境界、音声頻度、local inference 負荷は実装上有用だが、主要資料は vendor の beta 告知である。
  実プレイヤー feedback、成功指標、失敗例がなく、評価の中身を独立に検証できないため約4000字の投稿品質には届かない。
  製品構成の参照メモとしては残すが、この candidate 単体は fail とする。
---

## raw_excerpt

NVIDIA / KRAFTON による PUBG: BATTLEGROUNDS の Ally Duo Mode beta 紹介。PUBG Ally は、プレイヤーと組む AI teammate として説明され、voice / text の入力を理解し、PUBG 用語、プレイヤー用語、マップ位置、アイテム属性を扱いながら、looting、fighting、navigation などを支援するという位置づけ。

実装メモとして重要なのは、リアルタイム戦闘の反射的な処理と、言語・状況理解の処理を分けている点。即時の移動、照準、戦闘反応は traditional behavior tree が扱い、NVIDIA ACE が cognitive abilities を担当する。記事は、この境界の調整が、高速な戦闘応答と自然な相棒感の両立に必要だったと説明している。

ローカル実行構成は RTX GPU 8GB VRAM 以上を前提に、Parakeet speech-to-text、2B parameter の NVIDIA Mistral-Nemo-Minitron SLM、KRAFTON 内製 text-to-speech の 3 系統。beta は 2026-06-30 まで Steam / PUBG Arcade で公開され、KRAFTON が「real-world player feedback」を集めるための期間として扱われている。

補助資料として TechRadar の同日系記事も確認。そこでは、AI 相棒が overly chatty だと競技中の flow や足音などの音響情報を邪魔する懸念、GPU 資源をゲーム本体と奪い合う懸念、casual player / solo player には価値がありうるという見方が出ている。

## why_relevant_to_games

商用 FPS で AI companion を入れる時、behavior tree と SLM の責務境界、音声会話の頻度、プレイヤーの flow を邪魔しない設計、実プレイヤー beta での検証が問題になる候補。NPC 会話より「共闘中の邪魔にならない相棒」設計に効く。
