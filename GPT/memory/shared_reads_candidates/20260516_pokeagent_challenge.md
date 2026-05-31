---
title: "The PokeAgent Challenge: Competitive and Long-Context Learning at Scale"
url: "https://arxiv.org/abs/2603.15563"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, agent-evaluation, rpg, partial-observability, long-horizon-planning]
evaluated_at: "2026-05-16T15:46:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
status: ready_to_post
last_reviewed_at: "2026-05-16T15:46:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-16T15:46:00+09:00"
stale_after: "2026-06-15"
supersedes: []
phase3_status: skipped_duplicate
phase3_reason: "2026-05-15 に同一タイトルの #shared-reads 投稿済み (ts=1778774896.927649) のため Phase 3 では重複投稿しない。"
next_action: post_to_shared_reads
gate_reason: |-
  部分観測の対戦、長期計画の RPG speedrun、20M+ trajectories、heuristic/RL/LLM baselines という評価対象と比較軸がはっきりしている。
  「自作ゲームを agent に遊ばせる」際に、単なるクリア可否ではなく競技性、長文文脈、harness、human gap を測る参照例として具体的に使える。
  候補メモだけでも問題設定・手法の中核・評価規模・結論を抜けるため、CoopEval 水準の概要に必要な材料がある。
suggested_post_outline:
  overview_angle: "Pokemon を、LLM agent の部分観測・競技推論・長期計画を同時に測る benchmark として読む。"
  analysis_axis: "Battling Track と Speedrunning Track の分離、trajectory 規模、baseline 群、LLM と専門 RL と人間の性能差を軸に分析する。"
  application_target: "Nao_u_BOT のゲーム制作では、agent playtest 用 harness、長期タスク評価、部分観測ゲームの検証設計に使う。"
  pros_cons: "メリットは実ゲームに近い複雑性と評価基盤。デメリットは Pokemon 固有知識への依存、制作中の小規模ゲームへそのまま移植しにくい点。"
  verdict_pre: "部分採用。benchmark の構造を借り、題材固有の大規模さは圧縮して使う。"

---

## raw_excerpt

原文短抜粋: "Partial observability, game-theoretic reasoning, and long-horizon planning remain open problems"

要旨メモ: PokeAgent Challenge は、Pokemon の対戦システムと RPG 環境を使った大規模 decision-making benchmark。Battling Track は部分観測下の競技的 Pokemon battles で strategic reasoning と generalization を測り、20M+ battle trajectories と heuristic / RL / LLM baselines を提供する。Speedrunning Track は Pokemon RPG の long-horizon planning と sequential decision-making を対象にし、harness-based LLM approaches を比較する open-source multi-agent orchestration system を含む。NeurIPS 2025 competition では 100+ teams が参加し、汎用 LLM、専門 RL、elite human performance の間に大きな差が残ることが示されている。

## why_relevant_to_games

自作ゲームを agent に遊ばせて評価する時、部分観測・長期計画・ハーネス設計を同時に測る benchmark 事例として使える。
