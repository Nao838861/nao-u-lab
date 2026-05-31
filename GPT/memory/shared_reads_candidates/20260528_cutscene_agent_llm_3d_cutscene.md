---
title: "Cutscene Agent: An LLM Agent Framework for Automated 3D Cutscene Generation"
url: "https://arxiv.org/abs/2604.25318"
collected_at: "2026-05-28T13:14:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-production, llm-agent, cutscene, mcp, cinematic-generation, evaluation]
evaluated_at: "2026-05-28T13:35:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-28T13:35:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-28T13:35:00+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  MCP と game engine の双方向連携、Director / specialist agents、visual feedback loop という構成は制作ワークフローへの適用可能性が高い。
  一方で候補メモでは CutsceneBench の評価項目、実験結果、失敗例、既存ツールとの差分がまだ不足している。
  4000 字の残すべき投稿にするには、長期 multi-step orchestration を何で測ったのかを追加確認してからにしたい。

---

## raw_excerpt

Search result memo: Cutscene Agent は、ゲームや interactive media の cutscene 制作を end-to-end に自動化する LLM agent framework。cutscene は screenwriting、cinematography、character animation、voice acting、technical direction の協調が必要で、数分の成果物にも複数日の作業がかかる、という問題設定から始まる。提案は、MCP 上の Cutscene Toolkit による game engine との bidirectional integration、director agent と animation / cinematography / sound design specialist subagents の multi-agent system、visual reasoning feedback loop、CutsceneBench という hierarchical evaluation benchmark。短い tool call ではなく、順序制約を持つ長期・多数ステップの orchestration を評価する点が要旨。

検索メモ: 2026-05-28 の web search `site:arxiv.org/abs "LLM" "game" "benchmark" "video games" "2026"` で検出。既存 `shared_reads_candidates` と `atoms.jsonl` に `Cutscene Agent` / `CutsceneBench` / `2604.25318` は見つからなかった。

## why_relevant_to_games

ゲーム内演出を LLM agent に任せる場合の「エンジン状態を観測しながら編集可能な成果物を作る」構造と、長期ツール実行評価の候補になる。
