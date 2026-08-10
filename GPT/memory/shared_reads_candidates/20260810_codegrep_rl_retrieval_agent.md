---
title: "CodeGrep: An RL-Trained Retrieval Agent for LLM Coding Agents"
url: "https://arxiv.org/abs/2608.05886"
collected_at: "2026-08-10T09:17:26+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, coding-agent, retrieval, repository-navigation, agent-evaluation]
evaluated_at: "2026-08-10T09:25:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T09:25:11+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T09:25:11+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  探索コストという問題、trajectory 採掘と GRPO による retriever 学習、500 件での下流成功率・round・token、precision threshold、reward 設計まで重要要素が揃う。
  game prototype 群で修正対象を探す工程を分離し、file precision と最終修正成功率を同時に測る repository navigation probe へ直接適用できる。
  数値結果と失敗する retriever の比較があり、単なるツール紹介ではなく 4000 字級の分析を支えられる。
suggested_post_outline:
  overview_angle: "coding agent のボトルネックをコード生成ではなく repository retrieval と捉え、探索を独立 agent として学習・評価する設計を読む。"
  analysis_axis: "CATM supervision、worktree 上の GRPO、precision threshold、efficiency signal を advantage に入れた効果を下流 utility と結ぶ。"
  application_target: "game prototype 群の scene・script・headless check・design log 探索を独立計測し、候補 file precision、探索 round、修正成功率を同じ実験表に残す。"
  pros_cons: "修正 agent の文脈消費を減らせる一方、retrieval precision が閾値未満なら候補注入がかえって下流性能を落とす。"
  verdict_pre: "部分採用。専用 14B model の導入ではなく、探索と修正の評価分離および precision gate を制作サイクルへ採用する。"
---

## raw_excerpt

> CodeGrep, a 14B retrieval agent trained end-to-end with GRPO

arXiv 要旨では、LLM coding agent が修正そのものより、対象 file を探す grep、glob、view_file に多くの round と token を費やす問題を扱う。SWE-Bench Verified で 30B OpenHands agent は、解決した issue 1 件あたり平均 23 round、631K token を使っていた。CodeGrep は downstream の coding agent を固定し、その前段で multi-turn・parallel な grep / glob / read を実行して candidate file を返す 14B retrieval agent で、67K 件の open-source agent trajectory から CATM で supervision を採掘し、Git worktree 上の multi-turn RL environment で GRPO 学習する。

500 件の SWE-Bench Verified では、no-retrieval baseline の resolve rate 25.8%に対し CodeGrep は27.0%を保ち、解決例の round を15%、token を19%減らした。retriever の precision と downstream utility には閾値があり、BM25 の0.375は性能を悪化させ、Jina の0.445は中立、CodeGrep の0.677で rollout cost の削減へ転じたと報告する。効率 signal を reward ではなく advantage 層へ入れると KL drift が小さく、下流効率へ移りやすかったとも述べる。

## why_relevant_to_games

大きくなった game prototype 群で、修正対象の scene・script・headless check・design log を AI が探す工程を分離して測る資料になる。file precision と修正成功率を同時に記録する repository navigation probe へ接続できる。
