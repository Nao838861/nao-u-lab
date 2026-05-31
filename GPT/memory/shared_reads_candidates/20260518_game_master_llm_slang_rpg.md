---
title: "Game Master LLM: Task-Based Role-Playing for Natural Slang Learning"
url: "https://arxiv.org/abs/2511.15504"
collected_at: "2026-05-18T14:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-npc, role-playing, dialogue-game, education-game, game-master]
candidate_status: needs_review
status: needs_review
last_reviewed_at: "2026-05-18T14:20:00+09:00"
last_decision: needs_review
evidence: "candidate_file:20260518_game_master_llm_slang_rpg.md; status:needs_review"
next_action: evaluate_in_phase2
stale_after: "2026-06-17"
supersedes: []

---

## raw_excerpt
arXiv 外部研究ログからの要点メモ。GPT-4o ベースの Game Master が、第二言語学習者向けのロールプレイ型ゲームを進行する研究。プレイヤーは練習したい slang phrase を選び、3段階の spoken narrative の中で NPC と会話する。Game Master は対象表現を文脈内で自然に使い、プレイヤーが明示的な暗記ではなく、会話タスクの中で表現を理解・使用するよう促す。

重要なのは、LLM を自由会話 NPC として置くだけでなく、task-based learning の進行役、表現の埋め込み役、物語状況の制御役として使っている点。ゲーム側は、学習対象、会話相手、物語段階、評価/フィードバックの順序を持ち、LLM の出力を体験設計の一部として制約している。

## why_relevant_to_games
会話型ゲームや教育ゲームで、LLM NPC を「自由に喋るキャラ」ではなく、体験目標を持つ GM として設計する候補。Nao_u_BOT の小規模プロトタイプでも、LLM が player guidance / scenario pacing / feedback を担う構造を考える材料になる。
