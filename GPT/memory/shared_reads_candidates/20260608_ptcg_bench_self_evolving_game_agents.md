---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-06-08T22:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-agent, evaluation, card-game, self-evolution, harness]
evaluated_at: "2026-06-08T22:47:08+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-08T22:47:08+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-08T22:47:08+09:00; duplicate_of:memory/shared_reads_candidates/20260530_ptcg_bench_self_evolving_game_agents.md"
next_action: keep_for_reference
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  問題設定、2層評価、harness ablation、self-evolution の結論は抽出でき、単体なら投稿水準に届く素材。
  ただし同一URLの先行 candidate が 2026-05-30 に #shared-reads 投稿済みで、新規差分がないため重複投稿として fail。
---

## raw_excerpt

arXiv 2605.29653。2026-05-28 submitted。Dongdong Hua, Yifei Sun, Renhong Huang, Feng Gao, Chunping Wang, Yang Yang。

原文の短い抜粋: "strategic and evolving decision-making scenarios"

論文概要メモ: PTCG-Bench は Pokemon Trading Card Game を題材に、LLM agent を 2 つの水準で測るベンチマークとして提示されている。1 つ目は単一の複雑なゲーム環境内での意思決定性能、2 つ目はプレイ経験を蓄積した後の自己進化能力。さらに modular harness ablation を入れ、モデル能力と harness 設計由来の差を混同しないようにしている。実験では、LLM agent は非自明なゲームプレイ性能を出せる一方、安定した長期的自己進化は難しく、性能が harness design に敏感だと報告されている。

## why_relevant_to_games

ヘッドレス評価や自動プレイ改善で、単発スコアだけでなく「経験蓄積で本当に上達したか」と「harness が結果を作っていないか」を分けて見る材料になる。
