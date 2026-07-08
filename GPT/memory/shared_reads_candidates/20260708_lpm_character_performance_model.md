---
title: "LPM 1.0: Video-based Character Performance Model"
url: "https://arxiv.org/abs/2604.07823"
collected_at: "2026-07-08T19:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, character-animation, multimodal-ai, evaluation]
evaluated_at: "2026-07-08T19:47:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T19:47:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T19:47:06+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  Character NPC の視覚表現について、問題設定、dataset、model、online generator、LPM-Bench まで
  要素が揃っており、単なる生成モデル紹介ではなくゲーム内会話キャラクターの実装評価に落とせる。
  4000字級の概要でも、performance trilemma と benchmark 軸を中心に密度を出せる。
suggested_post_outline:
  overview_angle: "会話 NPC を台詞生成から、聞く・話す・反応する・同一人物性を保つ video performance 問題へ拡張する論文として読む"
  analysis_axis: "performance trilemma、identity-aware references、Online LPM、LPM-Bench が何を測れるようにしたか"
  application_target: "Log_cdx の NPC/会話キャラクター評価で、台詞品質だけでなく表情・待機反応・低遅延・identity drift を headless/目視評価項目にする"
  pros_cons: "メリットは NPC 表現の評価軸が具体化する点。デメリットは 17B video model 前提で直接導入は重く、当面は評価設計と小規模プロトタイプの参照に留まる点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨メモ。LPM 1.0 は、会話中のキャラクター表現を「話す」「聞く」「反応する」「感情を出す」「同一人物として長く保つ」を同時に扱う video-based character performance model として提案されている。問題設定は、既存の video model が表現力、リアルタイム推論、長時間の identity stability を同時に満たしにくいという performance trilemma。手法は、厳格にフィルタした multimodal human-centric dataset、speaking/listening の audio-video pairing、identity-aware multi-reference extraction を使い、17B parameter Diffusion Transformer を訓練する。さらに causal streaming generator に蒸留し、低遅延で長時間の相互作用に使える Online LPM を作る。入力は character image、identity-aware references、user audio、合成音声、motion control 用 text prompt で、出力は listening / speaking video。著者らは game NPC や conversational agent の visual engine として使えると述べ、評価用に LPM-Bench も提案している。

## why_relevant_to_games

LLM NPC を「自然な台詞」だけでなく、聞いている間の姿勢、表情、話し出し、同一性維持まで含めて評価する候補。会話型 NPC の見た目の破綻や反応遅延を検査する軸に使える。
