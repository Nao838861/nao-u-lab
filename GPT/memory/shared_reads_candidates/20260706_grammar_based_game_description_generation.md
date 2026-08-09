---
title: "Grammar-Based Game Description Generation Using Large Language Models"
url: "https://arxiv.org/abs/2407.17404"
collected_at: "2026-07-06T18:16:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-game-design, game-description-language, grammar, llm, ludii]
evaluated_at: "2026-08-10T05:25:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: postponed
stale_after: "2026-09-09"
supersedes: []
last_reviewed_at: "2026-08-10T05:25:00+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidates: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783330189970809; work_identity:arxiv:2407.17404"
next_action: none
gate_reason: >-
  posted-source preflight が arXiv:2407.17404 の同一 work identity と実 Slack 投稿 permalink の一致を確認した。
  本文品質とは独立に再投稿対象から外し、既存投稿を canonical として扱う。

---

## raw_excerpt
Tanaka と Simo-Serra による Game Description Language 生成論文。arXiv と IEEE Transactions on Games 情報では、自然言語から GDL/Ludii 形式の game description を作る課題を扱う。ゲーム記述言語は多様なゲームを機械可読に表現し、シミュレーションや評価へ接続できるが、自然言語から正しいゲーム記述へ変換するのは難しい。提案は二段階で、まず GDL specification に基づいて必要最小限の grammar を生成し、その後 grammar-guided generation で game description を反復改善する。専用 parser は LLM 応答から valid subsequences と candidate symbols を識別し、文法的に正しい方向へ出力を少しずつ修正する。実験では、LLM へ直接出力させる baseline より iterative improvement が良い結果を出したと報告されている。

短い原文断片: "minimal grammar" / "grammar-guided generation" / "iteratively improve"。

## why_relevant_to_games
自然言語のゲーム案を、実行・検証できる中間表現へ落とす候補。プロトタイプで rule spec と headless evaluator をつなぐ時、自由文から直接コードを書く以外の経路として使える。
