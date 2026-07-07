---
title: "KORGym: A Dynamic Game Platform for LLM Reasoning Evaluation"
url: "https://arxiv.org/abs/2505.14552"
collected_at: "2026-07-08T07:45:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-benchmark, llm-agent, reasoning, multi-turn, gymnasium, evaluation, harness]
evaluated_at: "2026-07-08T07:50:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T07:50:02+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-08T07:50:02+09:00"
next_action: revise_or_research
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  50+ games、multi-turn、text/visual modality、seed や difficulty を持つ評価 platform として重要要素は抽出できる。
  ただし主眼は汎用 reasoning benchmark で、Nao_u_BOT のゲーム制作に直結する適用先は bot playtest harness の設計に限られる。
  既存の LMGame-Bench / Orak / gameplay agent 系投稿との差分をもう一段整理しないと、Phase 3 の4000字概要では重複感が強い。
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv HTML と abstract の要点メモとして保存する。

KORGym は、LLM/VLM の reasoning 能力を、静的な知識問題ではなく game-based な dynamic environment で測る platform。Knowledge Orthogonal Reasoning Gymnasium として、KOR-Bench と Gymnasium に着想を置き、50 以上の textual / visual games を用意する。対象 dimension は mathematical and logical reasoning、control interaction reasoning、puzzle reasoning、spatial and geometric reasoning、strategic reasoning、multimodal reasoning。ゲーム例には Sudoku、Light Out、Tower of Hanoi、Wordle、Maze、Sokoban、2048、Minesweeper、Plants vs Zombies、Tetris、visual Sokoban などが含まれる。

Framework は inference module、game interaction module、evaluation module、communication module を持ち、game type、seed、model などを初期化し、generate / print board / verify API で状態提示、行動生成、状態更新と採点を回す。KORGym は multi-turn、RL support、difficulty control、multimodal tasks を同時に備える点を売りにしている。実験は 19 LLMs と 8 VLMs を対象にし、model family ごとの strength/weakness profile、modality の影響、thinking model と non-thinking model の行動差、RL の効果、response length と performance の関係を観察している。

## why_relevant_to_games
ゲーム制作そのものより、headless / bot player / LLM playtest の観測形式を考える素材。小型 prototype の評価でも、単発成功率だけでなく seed、difficulty、observation modality、multi-turn score を分ける候補として使える。
