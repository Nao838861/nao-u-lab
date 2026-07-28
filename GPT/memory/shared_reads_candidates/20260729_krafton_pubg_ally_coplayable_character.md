---
title: "Q&A: How KRAFTON Built PUBG Ally, a Co-Playable Character Powered by NVIDIA ACE"
url: "https://developer.nvidia.com/blog/how-krafton-built-pubg-ally-a-co-playable-character-powered-by-nvidia-ace/"
collected_at: "2026-07-29T01:45:44+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-npc, ai-companion, playtesting, memory, realtime-systems]
evaluated_at: "2026-07-29T01:51:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-29T01:51:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-29T01:51:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  低遅延の behavior tree と言語推論層の分離、authoritative observation tools、短期・長期記憶、段階的 playtest が一つの実装事例として具体的に揃っている。
  構成だけでなく自動検査、A/B、千人超 playtest まで評価 loop を説明でき、LLM NPC 制作へ直接適用できるため CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "real-time AI teammate を反射・熟考・観測・記憶・評価の五層へ分け、生成待ちを gameplay latency に持ち込まない設計として説明する"
  analysis_axis: "language model の能力より、時間尺度と authority boundary を分けた system design、および自動検査から大規模 playtest へ進む評価設計を分析する"
  application_target: "小規模 playable prototype の AI companion 実装で、即時行動層と発話層を分離し、engine state tool と短期・長期記憶を限定導入する設計判断に使う"
  pros_cons: "反応速度と自然な協調を両立しやすい一方、対象 map・item taxonomy の限定、vendor Q&A 由来の評価詳細不足、複数 subsystem の運用コストがある"
  verdict_pre: "部分採用"
---

## raw_excerpt

NVIDIA Technical Blog が KRAFTON の research lead と project manager に聞いた、PUBG Ally の構成・遅延対策・記憶・評価 loop に関する Q&A。Ally は player voice と live game state を入力し、speech と game action を出力する。ASR、2B parameter の on-device SLM、TTS を agent harness と game-side integration がつなぎ、SLM は player 発話または game event で起動する。movement、aiming、即時 combat response は behavior tree の高速層、intent 解釈、協調、自然発話は language model の熟考層へ分け、反射行動を生成待ちにしない。対象世界は Sanhok の AI Duo と固定 item taxonomy に絞り、現在状態は authoritative engine data を plain text で返す observation tools から必要時に再取得する。

記憶は match をまたぐ player profile・過去試合の long-term memory と、直近発話・現在試合の出来事を持つ short-term memory に分かれる。評価は interaction protocol、tool use、speech/action consistency の自動検査、candidate model の live playtest と A/B test、survey と自由記述、さらに千人超の大規模 playtest を重ねる。player が何を好み、嫌い、価値と感じたかを評価基準へ戻し、prototype を早く実プレイへ出して反復可能な低コスト loop を維持したと説明している。

## why_relevant_to_games

real-time AI teammate を、低遅延の行動層・言語推論層・権威ある game-state tools・二時間尺度の記憶・段階的 playtest へ分解した制作事例として、LLM NPC の設計と評価の両方に参照できる。
