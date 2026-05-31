---
title: "Playing With AI: How Do State-Of-The-Art Large Language Models Perform in the 1977 Text-Based Adventure Game Zork?"
url: https://arxiv.org/abs/2602.15867
collected_at: 2026-05-15T19:29:21+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, evaluation, text-adventure, llm, planning]
evaluated_at: 2026-05-15T19:32:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T19:32:29+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T19:32:29+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  Zork を使った LLM の探索・計画限界という問題設定と、headless playtest への注意点は具体的で有用。
  ただし candidate 情報だけでは position paper の評価条件、失敗分類、モデル比較の厚みを 4000字級の概要にするには薄く、
  Phase 3 投稿には本文確認後の再評価が必要。

---

## raw_excerpt
arXiv:2602.15867。2026-01-27 submitted。Berry Gerrits による position paper。1977 年の text-based adventure game である Zork を、現代 LLM の problem-solving / reasoning capabilities を測る controlled environment として使っている。

abstract 要旨: ChatGPT、Claude、Gemini などの proprietary models を、minimal instructions と detailed instructions の両方でテストし、Zork の得点を進捗指標として測る。全モデルの平均達成率は 10% 未満で、最良モデルでも 350 点中およそ 75 点。詳細なゲーム説明や extended thinking は改善につながらなかった。質的分析では、失敗行動の反復、戦略の持続性の弱さ、会話履歴があっても前試行から学べないことが観察され、text-based games における metacognitive / problem-solving limits が示される。

## why_relevant_to_games
LLM をプレイヤー代替・自動テスト・攻略 AI として使う時の限界事例。特に「説明を増やしても解けない」「履歴があっても学習しない」は headless playtest 設計の注意点になる。
