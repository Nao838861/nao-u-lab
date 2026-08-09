---
title: "BayesEvolve: Explicit Belief States for Autonomous Scientific Discovery"
url: "https://arxiv.org/abs/2606.30335"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, experimentation, uncertainty, optimization, evaluation]
evaluated_at: "2026-07-18T22:54:41+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T03:14:12+09:00"
last_decision: failed
evidence: "group_handoff:gha-6f10c5e7e832ff92; terminal:memory/shared_reads_posted_source_index.jsonl: arxiv:2606.30335; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783428279451079; reason:posted-source preflight が arxiv:2606.30335 の実 Slack 投稿を URL 一致で確認した"
next_action: none
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  archive ではなく uncertainty-aware belief から次試行を選ぶ着想は、parameter tuning と prototype probe に具体的に適用できる。
  ただし現候補には belief state の構築・更新法、baseline 条件、数値結果、shift 条件が不足し、BBOB からゲーム制作へ移す限界まで約4000字で根拠付けできないため保留する。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt

arXiv 要旨メモ。LLM を使う autonomous discovery system の多くは、高得点候補の archive や直近 trial の heuristic summary を experimental memory として次の仮説生成に使う。BayesEvolve は、履歴を並べるだけでなく hypothesis quality に対する uncertainty-aware belief を明示的に保持し、experimental evidence を predictive belief state へ変換して次の experiment を選ぶ framework を提案する。評価は shifted BBOB-style black-box optimization task に限定し、program discovery や laboratory discovery は future work とする。固定 evaluation budget 下で memory-guided / archive-guided LLM baseline より sample efficiency を改善し、belief state が held-out candidate pool でも予測力を持つこと、annealed uncertainty bonus を含む selection が ablation で支持されること、後半に無差別探索ではなく有望領域へ集中することを報告する。

## why_relevant_to_games

ゲームの parameter tuning や prototype probe で、過去の最高 score だけを再利用せず、不確実性を残したまま次に試す候補を選ぶ設計へ応用できる。
