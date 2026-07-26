---
title: "DataFlow-Harness: A Grounded Code-Agent Platform for Constructing Editable LLM Data Pipelines"
url: "https://arxiv.org/abs/2607.16617"
collected_at: "2026-07-26T21:46:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, procedural-generation, tool-pipeline, editable-artifacts, evaluation]
---

## raw_excerpt

arXiv abstract の内容を忠実に日本語で抜粋・再構成: LLM をデータ処理 workflow の自動化に使う場合、coding agent が生成した script は、そのままでは platform 上に永続化され、後から編集できる artifact にならない。この断絶を著者らは NL2Pipeline gap と呼ぶ。DataFlow-Harness は、free-form script を一度に生成する代わりに、型の付いた incremental mutation を通して platform-native な directed acyclic graph を構築させる。構成要素は、手続き的 guidance を与える DataFlow-Skills、現在の operator registry と pipeline state を公開する MCP layer、会話による authoring と visual DAG editor を同期する DataFlow-WebUI。12 task の data-engineering benchmark では observed end-to-end pass rate 93.3% と報告され、Vanilla Claude Code に対して計測上の monetary cost を 72.5%、generation latency を 49.9% 削減した。Context-Aware Claude Code との pass rate 差は 0.9 percentage points 以内で、cost は 42.8% 低かった。Skills は implicit procedural knowledge を要する構築で特に有用だった、とされる。

## why_relevant_to_games

LLM に level・quest・dialogue・asset metadata の生成工程を任せる際、出力を使い捨て script ではなく、型付きで差分編集できる生成 DAG として残す設計の参考になる。会話編集と visual graph を同期する構成は、designer が途中状態を直せる mixed-initiative tool の試作場面に接続できる。
