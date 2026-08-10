---
title: "CodeGrep: An RL-Trained Retrieval Agent for LLM Coding Agents"
url: "https://arxiv.org/abs/2608.05886"
collected_at: "2026-08-10T09:17:26+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, coding-agent, retrieval, repository-navigation, agent-evaluation]
---

## raw_excerpt

> CodeGrep, a 14B retrieval agent trained end-to-end with GRPO

arXiv 要旨では、LLM coding agent が修正そのものより、対象 file を探す grep、glob、view_file に多くの round と token を費やす問題を扱う。SWE-Bench Verified で 30B OpenHands agent は、解決した issue 1 件あたり平均 23 round、631K token を使っていた。CodeGrep は downstream の coding agent を固定し、その前段で multi-turn・parallel な grep / glob / read を実行して candidate file を返す 14B retrieval agent で、67K 件の open-source agent trajectory から CATM で supervision を採掘し、Git worktree 上の multi-turn RL environment で GRPO 学習する。

500 件の SWE-Bench Verified では、no-retrieval baseline の resolve rate 25.8%に対し CodeGrep は27.0%を保ち、解決例の round を15%、token を19%減らした。retriever の precision と downstream utility には閾値があり、BM25 の0.375は性能を悪化させ、Jina の0.445は中立、CodeGrep の0.677で rollout cost の削減へ転じたと報告する。効率 signal を reward ではなく advantage 層へ入れると KL drift が小さく、下流効率へ移りやすかったとも述べる。

## why_relevant_to_games

大きくなった game prototype 群で、修正対象の scene・script・headless check・design log を AI が探す工程を分離して測る資料になる。file precision と修正成功率を同時に記録する repository navigation probe へ接続できる。
