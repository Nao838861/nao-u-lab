---
title: "Hunyuan-GameCraft-2: Instruction-following Interactive Game World Model"
url: "https://arxiv.org/abs/2511.23429"
collected_at: "2026-06-26T13:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [world-model, interaction-design, generative-video, game-ai, benchmark]
evaluated_at: "2026-06-26T13:49:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-26T13:49:44+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-26T13:49:44+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-26"
supersedes: []
gate_reason: >-
  fixed keyboard input だけでは扱えない player-driven dynamics を、自然言語、keyboard、mouse の instruction-following world model として扱う問題設定が明確。
  InterBench の camera / character / environment 応答評価は、ゲーム内インタラクション生成の評価設計へ具体的に転用できる。
suggested_post_outline:
  overview_angle: "自然言語と操作入力を同じ制御面に載せる interactive game world model として読む"
  analysis_axis: "causally aligned dataset 構築、text-driven interaction injection、InterBench の自由形式 instruction 評価"
  application_target: "プロトタイプの NPC / 環境イベント / カメラ演出を、固定 action schema ではなく instruction response として評価する設計"
  pros_cons: "長所は自由形式操作の評価軸が明確な点、短所は video world model でありゲームロジック整合性は別途必要な点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2511.23429。Hunyuan-GameCraft-2 は、generative world model が static scene synthesis から dynamic interactive simulation へ進む中で、fixed keyboard inputs と高い annotation cost が多様な in-game interaction / player-driven dynamics を制限している、という問題設定を置く。提案は instruction-driven interaction で、自然言語プロンプト、keyboard、mouse signals によって generated worlds 内の game video contents を制御できるようにする。要旨では、large-scale unstructured text-video pairs から causally aligned interactive datasets を自動構築し、14B image-to-video MoE foundation model に text-driven interaction injection mechanism を入れる。評価は InterBench で、camera motion、character behavior、environment dynamics が "open the door" や "trigger an explosion" のような free-form instructions に応答するかを見る。

## why_relevant_to_games

「入力 schema を固定しない game interaction」を生成モデルで扱う資料。プレイヤー行動、自然言語指示、環境変化の因果対応をどう評価するかの候補になる。
