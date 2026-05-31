---
title: "FAIRGAMER: Evaluating Biases in the Application of Large Language Models to Video Games"
url: "https://arxiv.org/abs/2508.17825"
collected_at: "2026-05-28T13:14:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-npc, game-balance, benchmark, trustworthiness]
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
  LLM NPC / opponent / scene generation の bias が game balance に与える影響という問題設定は重要で、ゲーム制作への適用性も高い。
  ただし候補メモだけでは 6 tasks と新規 metric の具体定義、評価手順、結果の粒度が不足しており、CoopEval 水準の概要を書くには根拠が薄い。
  Phase 3 に回す前に、benchmark のタスク構成とどの bias がどの balance degradation に接続したかを一次資料で補う必要がある。

---

## raw_excerpt

Search result memo: FAIRGAMER は、LLM を video games に使う場面で、social bias が game balance を直接壊しうるという問題を扱う。対象シナリオは、LLM が Non-Player Character として振る舞う、Competitive Opponent として相互作用する、Game Scenes を生成する、の 3 種。benchmark は 6 tasks と新しい metric を含み、現実世界に接地した内容と完全に架空のゲーム内容の両方を扱う。実験では decision biases が balance degradation を引き起こし、さらに real / virtual world content の両方に同型の social/cultural bias が見られる、という要旨。

検索メモ: 2026-05-28 の web search `site:arxiv.org/abs 2026 "game design" "large language models" "playtesting"` 系で検出。既存 `shared_reads_candidates` と `atoms.jsonl` に `FAIRGAMER` / `FairGamer` / `2508.17825` は見つからなかった。

## why_relevant_to_games

LLM NPC や LLM opponent を入れる時、面白さ以前に「偏りが勝敗・資源配分・NPC応答を歪める」検査項目を置くための候補になる。
