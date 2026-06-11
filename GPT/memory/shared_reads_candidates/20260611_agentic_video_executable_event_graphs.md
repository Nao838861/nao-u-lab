---
title: "Agentic Video Generation: From Text to Executable Event Graphs via Tool-Constrained LLM Planning"
url: "https://arxiv.org/abs/2604.10383"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tool-use, simulation, narrative-design, validation]
evaluated_at: "2026-06-11T20:18:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-11T20:18:55+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-11T20:18:55+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-11"
supersedes: []
gate_reason: "LLM に直接ピクセルや自由文を作らせず、actors/actions/objects/temporal constraints を持つ executable event graph に落として 3D engine で deterministic に実行する中核が明確。validated tool calls と simulator constraints により、生成物を実行可能仕様として扱う点がゲーム制作のイベント設計・NPC 行動脚本・検証 gate に直結する。評価観点も narrative quality と physical/semantic consistency まであり、4000字級の投稿に展開できる。"
suggested_post_outline:
  overview_angle: "text-to-video ではなく、LLM planning を実行可能な時空間イベント仕様へ変換する設計として読む。"
  analysis_axis: "GEST/event graph、tool-constrained planning、validated calls、deterministic engine execution、neural generator との比較評価。"
  application_target: "Nao_u_BOT の小型ゲームで、wave、チュートリアル、NPC 行動脚本、カットシーンを自由文から validator 付き event graph に落とす制作補助。"
  pros_cons: "実行可能性と検証性は強いが、表現力は engine/tool schema に制約され、面白さ評価は別 gate が必要。"
  verdict_pre: "部分採用"
---

## raw_excerpt
原文短句:
- "Graph of Events in Space and Time"
- "executed deterministically in a 3D game engine"
- "validated tool calls"
- "executable by construction"

抄録メモ: arXiv:2604.10383。動画生成を pixels から直接作るのではなく、LLM が actors/actions/objects/temporal constraints を含む GEST という形式仕様を組み、それを 3D game engine で deterministic に実行する設計。staged LLM refinement は 50 回中 0 回しか executable specification を作れなかったため、natural language reasoning と programmatic state backend を分離し、backend が simulator constraints を強制する。評価では agentic narratives と neural generator を比較し、物理的妥当性や意味整合性を測る。

## why_relevant_to_games
LLM にゲーム演出やステージイベントを自由記述させる時、直接コード化せず「実行可能なイベントグラフ + validator」に落とす発想が使えそう。敵 wave、チュートリアル、NPC 行動脚本の破綻検出候補。
