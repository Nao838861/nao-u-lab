---
title: "MINDGAMES: A Live Arena for Evaluating Social and Strategic Reasoning in Multi-Agent LLMs"
url: "https://arxiv.org/abs/2605.29512"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, multi-agent, social-deduction, telemetry]
evaluated_at: "2026-05-30T08:55:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1780098001.052659"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780098001052659"
  char_count: 3986
  posted_at: "2026-05-30T08:40:12+09:00"
stale_after: "2026-06-29"
supersedes: []
gate_reason: |-
  問題設定、live arena という着想、TextArena/TrueSkill/full trajectory logging、4 環境・大規模 competition cycle、error-survival confound まで抽出できる。
  対戦・協力・欺きがあるゲームのヘッドレス評価で、勝敗だけでなく turn-level telemetry と rule adherence を分けて見る具体策に落とせる。
suggested_post_outline:
  overview_angle: "静的設問ではなく複数ゲームの live arena で社会的・戦略的推論を測る評価設計として書く。"
  analysis_axis: "評価対象能力、環境構成、ログ粒度、leaderboard validity、error confound の扱いを軸に読む。"
  application_target: "Nao_u_BOT の対戦/協力ゲーム制作で、ヘッドレス playtest のログ設計と環境バグ混入検出に使う。"
  pros_cons: "メリットは評価ログが厚く再現可能なこと。デメリットは scaffolding 依存と環境ごとの妥当性差が残ること。"
  verdict_pre: "部分採用。arena そのものより、turn-level logging と confound 分離を先に取り込む。"
---

## raw_excerpt

原文要旨メモ。MINDGAMES は、LLM agent の社会的・戦略的推論を、静的な設問ではなく複数ゲームの live arena で測る評価環境。対象にする能力は、hidden information 下での belief attribution、反復相互作用での opponent modeling、知識非対称下の cooperative inference、social deduction での sustained deception。TextArena 上に統一 interface、TrueSkill-based rating、full trajectory logging を置き、Colonel Blotto、Iterated Prisoner's Dilemma、Codenames、Secret Mafia の 4 環境で 2025 competition cycle を実施した。944 agents / 76 teams / 29,571 multi-agent games の turn-level observations、actions、rewards を残し、MG-Ref という deterministic offline tournament protocol も提供する。分析では、rule adherence の脆さ、構造的 scaffolding 依存、environment ごとの leaderboard validity の差、Secret Mafia における error-survival confound が報告されている。

## why_relevant_to_games

ヘッドレス評価で「勝った/負けた」だけでなく、ターン単位の観測・行動・報酬・エラー要因を残す設計例として使える。対戦/協力/欺きが絡むゲームを作る時、評価ログが能力と環境バグを混同しないための材料になる。
