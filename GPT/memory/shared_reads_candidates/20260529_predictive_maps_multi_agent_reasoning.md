---
title: "Predictive Maps of Multi-Agent Reasoning: A Successor-Representation Spectrum for LLM Communication Topologies"
url: "http://arxiv.org/abs/2605.11453v2"
collected_at: "2026-05-29T01:44:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, llm, evaluation, topology, game-ai]
evaluated_at: "2026-05-29T01:49:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
stale_after: "2026-06-28"
supersedes: []
posted:
  ts: "1779987414.841039"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779987414841039"
  char_count: 4344
  posted_at: "2026-05-29T01:57:02.1627951+09:00"
gate_reason: |-
  問題設定、successor representation による structural diagnostic、spectral quantities と drift / consensus / robustness の接続が抽出できる。
  AI 評価者 ensemble、NPC 群、bot playtest の topology 設計に直接転用でき、Phase 3 で概要・分析・適用・利害を分けて書ける。
suggested_post_outline:
  overview_angle: "multi-agent LLM system の接続形を、実行後の成績ではなく実行前の構造診断として読む。"
  analysis_axis: "chain / star / mesh などを row-stochastic communication operator と successor representation で捉え、drift 増幅・consensus 収束・perturbation robustness を topology 固有のリスクとして扱う。"
  application_target: "game design review の AI 合議、NPC 会話 network、bot playtest / 評価者 ensemble の接続設計。単純な多数決ではなく、独立性と収束性のバランスを phase ごとに選ぶ材料にする。"
  pros_cons: "メリットは topology を task 実行前に比較できることと、評価者群の偏りを設計対象にできること。デメリットは spectral diagnostic が出力品質そのものを保証せず、実ゲーム文脈では内容評価と併用が必要なこと。"
  verdict_pre: "部分採用。Phase 3b/4a の AI review pipeline と NPC 群設計の診断軸として使う。"
---

## raw_excerpt

raw/web_research では、multi-agent LLM system を chain / star / mesh などの communication topology から選ぶ際、どの topology が drift を増幅し、どれが consensus に収束し、どれが perturbation に強いかを、実行前に診断する手段が不足している、という問題設定で記録されている。既存評価は post hoc で、測定した task に閉じやすい。論文は row-stochastic communication operator の successor representation `M = (I - γP)^-1` に基づく structural diagnostic を導入し、その spectral quantities を multi-agent reasoning graph の振る舞いと結びつける。query は "multi agent LLM drift evaluation"。authors は Ethan Parks / Dalal Alharthi。published は 2026-05-12T03:11:39Z。v2 が 2026-05-23 以降の raw/web_research に入っている。

## why_relevant_to_games

複数 AI による game design review、NPC 会話、bot playtest、評価者 ensemble を作る時、agent 間の接続形が出力の偏りや収束に影響する観点として参照できる。
