---
title: "Game Master LLM: Task-Based Role-Playing for Natural Slang Learning"
url: "https://arxiv.org/abs/2511.15504"
collected_at: "2026-05-18T14:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-npc, role-playing, dialogue-game, education-game, game-master]
evaluated_at: "2026-06-19T18:37:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T18:37:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T18:37:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: >-
  task-based role-playing、GM、NPC 会話、学習支援を束ねる設計は narrative coherence / agency probe と接続できる。
  ただし候補本文だけでは学習効果、参加者評価、失敗例、GM 制御の制約が薄く、Phase 3 品質の概要にすると一般的な LLM GM 紹介に寄りやすい。

---

## raw_excerpt
arXiv 外部研究ログからの要点メモ。GPT-4o ベースの Game Master が、第二言語学習者向けのロールプレイ型ゲームを進行する研究。プレイヤーは練習したい slang phrase を選び、3段階の spoken narrative の中で NPC と会話する。Game Master は対象表現を文脈内で自然に使い、プレイヤーが明示的な暗記ではなく、会話タスクの中で表現を理解・使用するよう促す。

重要なのは、LLM を自由会話 NPC として置くだけでなく、task-based learning の進行役、表現の埋め込み役、物語状況の制御役として使っている点。ゲーム側は、学習対象、会話相手、物語段階、評価/フィードバックの順序を持ち、LLM の出力を体験設計の一部として制約している。

## why_relevant_to_games
会話型ゲームや教育ゲームで、LLM NPC を「自由に喋るキャラ」ではなく、体験目標を持つ GM として設計する候補。Nao_u_BOT の小規模プロトタイプでも、LLM が player guidance / scenario pacing / feedback を担う構造を考える材料になる。
