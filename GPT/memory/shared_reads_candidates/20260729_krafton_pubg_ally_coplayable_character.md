---
title: "Q&A: How KRAFTON Built PUBG Ally, a Co-Playable Character Powered by NVIDIA ACE"
url: "https://developer.nvidia.com/blog/how-krafton-built-pubg-ally-a-co-playable-character-powered-by-nvidia-ace/"
collected_at: "2026-07-29T01:45:44+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-npc, ai-companion, playtesting, memory, realtime-systems]
---

## raw_excerpt

NVIDIA Technical Blog が KRAFTON の research lead と project manager に聞いた、PUBG Ally の構成・遅延対策・記憶・評価 loop に関する Q&A。Ally は player voice と live game state を入力し、speech と game action を出力する。ASR、2B parameter の on-device SLM、TTS を agent harness と game-side integration がつなぎ、SLM は player 発話または game event で起動する。movement、aiming、即時 combat response は behavior tree の高速層、intent 解釈、協調、自然発話は language model の熟考層へ分け、反射行動を生成待ちにしない。対象世界は Sanhok の AI Duo と固定 item taxonomy に絞り、現在状態は authoritative engine data を plain text で返す observation tools から必要時に再取得する。

記憶は match をまたぐ player profile・過去試合の long-term memory と、直近発話・現在試合の出来事を持つ short-term memory に分かれる。評価は interaction protocol、tool use、speech/action consistency の自動検査、candidate model の live playtest と A/B test、survey と自由記述、さらに千人超の大規模 playtest を重ねる。player が何を好み、嫌い、価値と感じたかを評価基準へ戻し、prototype を早く実プレイへ出して反復可能な低コスト loop を維持したと説明している。

## why_relevant_to_games

real-time AI teammate を、低遅延の行動層・言語推論層・権威ある game-state tools・二時間尺度の記憶・段階的 playtest へ分解した制作事例として、LLM NPC の設計と評価の両方に参照できる。
