---
title: "Playing With AI: How Do State-Of-The-Art Large Language Models Perform in the 1977 Text-Based Adventure Game Zork?"
url: https://arxiv.org/abs/2602.15867
collected_at: 2026-05-15T19:29:21+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, evaluation, text-adventure, llm, planning]
evaluated_at: "2026-07-25T18:50:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-25T18:50:06+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-25T18:50:06+09:00"
stale_after: "2026-08-24"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  Zork を長期探索の検査場にする問題設定と「説明量を増やしても改善しない」という観察は参考になるが、候補資料は position paper の要旨範囲を越えない。
  モデル別条件、試行数、失敗分類、再現可能な評価手順がなく、CoopEval 水準の概要では既知の LLM 限界を膨らませる形になるため fail とする。

---

## raw_excerpt
arXiv:2602.15867。2026-01-27 submitted。Berry Gerrits による position paper。1977 年の text-based adventure game である Zork を、現代 LLM の problem-solving / reasoning capabilities を測る controlled environment として使っている。

abstract 要旨: ChatGPT、Claude、Gemini などの proprietary models を、minimal instructions と detailed instructions の両方でテストし、Zork の得点を進捗指標として測る。全モデルの平均達成率は 10% 未満で、最良モデルでも 350 点中およそ 75 点。詳細なゲーム説明や extended thinking は改善につながらなかった。質的分析では、失敗行動の反復、戦略の持続性の弱さ、会話履歴があっても前試行から学べないことが観察され、text-based games における metacognitive / problem-solving limits が示される。

## why_relevant_to_games
LLM をプレイヤー代替・自動テスト・攻略 AI として使う時の限界事例。特に「説明を増やしても解けない」「履歴があっても学習しない」は headless playtest 設計の注意点になる。
