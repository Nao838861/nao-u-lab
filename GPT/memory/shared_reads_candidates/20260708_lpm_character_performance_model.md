---
title: "LPM 1.0: Video-based Character Performance Model"
url: "https://arxiv.org/abs/2604.07823"
collected_at: "2026-07-08T19:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, character-animation, multimodal-ai, evaluation]
---

## raw_excerpt

arXiv 要旨メモ。LPM 1.0 は、会話中のキャラクター表現を「話す」「聞く」「反応する」「感情を出す」「同一人物として長く保つ」を同時に扱う video-based character performance model として提案されている。問題設定は、既存の video model が表現力、リアルタイム推論、長時間の identity stability を同時に満たしにくいという performance trilemma。手法は、厳格にフィルタした multimodal human-centric dataset、speaking/listening の audio-video pairing、identity-aware multi-reference extraction を使い、17B parameter Diffusion Transformer を訓練する。さらに causal streaming generator に蒸留し、低遅延で長時間の相互作用に使える Online LPM を作る。入力は character image、identity-aware references、user audio、合成音声、motion control 用 text prompt で、出力は listening / speaking video。著者らは game NPC や conversational agent の visual engine として使えると述べ、評価用に LPM-Bench も提案している。

## why_relevant_to_games

LLM NPC を「自然な台詞」だけでなく、聞いている間の姿勢、表情、話し出し、同一性維持まで含めて評価する候補。会話型 NPC の見た目の破綻や反応遅延を検査する軸に使える。
