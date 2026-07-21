---
title: "AIDG: A Formal Decomposition of Information Extraction and Containment Asymmetries in Multi-Turn LLM Dialogue"
url: "https://arxiv.org/abs/2602.17443"
collected_at: "2026-07-16T17:45:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, adversarial-game, llm-evaluation, partial-observability, dialogue]
evaluated_at: "2026-07-16T17:47:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-16T17:47:16+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "posted_url_match; canonical_path:memory/shared_reads_candidates/20260528_aidg_information_deduction_game.md; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779942387259629; matched_title_key:aidg a formal decomposition of information extraction and containment asymmetries in multi turn llm dialogue"
next_action: none
stale_after: "2026-08-15"
supersedes: []
gate_reason: >-
  canonicalize 後の arXiv URL が、2026-05-28 に投稿済みの candidate と一致する。
  既投稿は Seeker / Holder、439 games、失敗モード、ゲーム制作への部分採用まで扱っており、独立した追加価値がないため本文評価へ進めない。
---

## raw_excerpt

複数ターンの LLM 評価を単一の勝率にまとめると、異なる能力が混同されるという問題設定から、AIDG（Adversarial Information Deduction Game）を二人用の部分観測確率ゲームとして定式化している。役割は、情報を引き出す Seeker と情報を守る Holder に分かれ、抽出と封じ込めを別々に測る。著者らは失敗を cooperative-prior leakage、constraint-reasoning interference、inefficient hypothesis-space traversal の三つに分解する。

6 種の frontier LLM による 439 ゲームでは、防御性能のばらつきが小さい一方、攻撃性能は大きく異なった。確認を装う framing は、手掛かりのない推論と比べて抽出成功の odds を 7.75 倍にし、推論失敗の 41.3% は制約違反に由来したと報告されている。論文は、この非対称性を「局所的に解ける防御判断」と「全体が結合した攻撃計画」の差として扱い、turn-decay weighting と Bradley–Terry rating model を含む設計上の仮定を明示している。

## why_relevant_to_games

非対称役割・部分観測・複数ターンの駆け引きを、総合勝率ではなく役割別能力と失敗型へ分解する例。対話ゲームや hidden-information mechanics の設計・テストで、何をログとして分離すべきかを考える素材になる。
