---
title: "Snapdragon Game AI SDK: On-Device AI in Gaming"
url: "https://www.qualcomm.com/developer/blog/2026/03/snapdragon-game-ai-sdk-launch-on-device-ai-in-gaming"
collected_at: "2026-06-01T11:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, companion, on-device-ai, game-design]
evaluated_at: "2026-07-26T12:21:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T12:21:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T12:21:31+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  on-device ASR・LLM・TTS と NPC、teammate、companion、coach の分類は、端末内 AI の企画候補を整理する素材にはなる。
  しかし記事は製品紹介で、実機性能、モデル品質、電力・熱、描画との競合、UX、安全性の比較評価を含まない。手法と評価の中身がなく、共有投稿の品質基準を満たさない。
---

## raw_excerpt
Qualcomm Developer Blog の 2026-03-06 投稿。GDC 2026 で Snapdragon Game AI SDK を発表し、mobile / PC / 将来的な XR を対象に、on-device AI を game engine 側から扱う SDK として紹介している。記事は developer blog であり、製品紹介の色が強い。

要点メモ:
- 狙いは、NPC、adaptive AI teammates、personal AI companions、real-time AI coaches を、cloud 依存ではなく device 上で低遅延に動かすこと。
- on-device の利点として、ultra-low latency、offline availability、power-efficient performance、data privacy を挙げている。音声・カメラ・gameplay 情報が端末外に出ない設計を強調している。
- Unreal Engine 5 plugin を通じて、on-device ASR、local LLM による NLP、on-device TTS を提供する構成。CPU / GPU / NPU へ workload を分散し、graphics / physics を邪魔しないことを狙う。
- use case は、unscripted conversation 可能な NPC、voice command に反応する teammate、進行や詰まりに反応する companion、telemetry / vision を見て助言する coach の 4 系統。
- gameplay 側の含意は、全台詞を scripted にしない NPC、offline でも動く companion、player 行動に応じた即時 coaching など。候補段階では、実機制約・モデル能力・UX リスクは未評価。

短い原文断片: "respond in milliseconds" / "work fully offline"

## why_relevant_to_games
LLM/NPC を cloud API 前提でなく端末側 feature として考えるための素材。会話 NPC だけでなく、リアルタイム coach や companion をゲームメカニクスに入れる時の候補分類に使える。
