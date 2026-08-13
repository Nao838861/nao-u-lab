---
title: "AIDG: A Formal Decomposition of Information Extraction and Containment Asymmetries in Multi-Turn LLM Dialogue"
url: "https://arxiv.org/abs/2602.17443v2"
collected_at: "2026-07-15T11:14:23+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-evaluation, llm-agent, adversarial-dialogue, partial-observability, benchmark]
evaluated_at: "2026-07-15T11:15:59+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-14T01:49:09+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-3a818e735c38119e; terminal:memory/shared_reads_candidates/20260528_aidg_information_deduction_game.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779942387259629; reason:canonical arXiv work identity 2602.17443 が実投稿済み source と一致し既投稿が手法 評価 適用まで包含している"
next_action: none
stale_after: "2026-08-14"
supersedes: []
gate_reason: >-
  Phase 3 の投稿直前レビューで、同一 arXiv 論文が 2026-05-28 に Log_cdx から投稿済みと判明した。
  既投稿は Seeker / Holder、AIDG-I / II、439 games、Dual-ELO、7.75 倍、41.3%、失敗条件、
  Nao_u_BOT への適用、部分採用判定まで含み、今回候補に独立した追加価値がないため再投稿しない。
suggested_post_outline:
  overview_angle: "単一勝率では隠れる、情報抽出側と情報防御側の非対称性を部分観測ゲームとして分解する"
  analysis_axis: "Seeker / Holder の役割分解、三失敗モード、turn-decay と Bradley-Terry による評価設計、439ゲームで示された攻守差"
  application_target: "Nao_u_BOT の非対称情報・交渉・推理ゲームで、総合勝率に加えて抽出成功、秘密漏洩、制約違反を別々に計測するプレイテスト基盤"
  pros_cons: "利点は失敗原因を役割とモード別に診断できること。欠点は二者対話中心で、多人数ゲームや人間同士の駆け引きへの外挿に追加検証が要ること"
  verdict_pre: 部分採用
---

## raw_excerpt

原文要旨の収集メモ: AIDG（Adversarial Information Deduction Game）は、複数ターンの敵対的対話を二人用の部分観測確率ゲーム（POSG）として定式化し、単一の勝率にまとめられがちな LLM 評価を、情報を引き出す Seeker と情報を守る Holder の役割に分解する。著者らは、協力的応答への事前傾向による漏洩、制約を守りながら推論する際の干渉、仮説空間を非効率に探索する問題という三つの失敗モードを切り分ける。6 種類の frontier LLM による 439 ゲームでは、防御性能のばらつきが小さい一方で攻撃性能の差が大きく、既知情報を確認するような framing は、手掛かりなしの推論より抽出成功 odds を 7.75 倍にした。また、推論失敗の 41.3% は制約違反に由来し、モデル規模との相関は見られなかった。turn-decay weighting と Bradley–Terry rating model を含む設計選択は、明示した仮定から導出されている。

## why_relevant_to_games

非対称役割・部分観測・複数ターンを持つ対話ゲームについて、総合勝率だけでなく役割別能力と失敗原因を分けてプレイテストする評価設計の素材になる。
