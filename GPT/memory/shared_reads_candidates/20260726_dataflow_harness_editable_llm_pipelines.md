---
title: "DataFlow-Harness: A Grounded Code-Agent Platform for Constructing Editable LLM Data Pipelines"
url: "https://arxiv.org/abs/2607.16617"
collected_at: "2026-07-26T21:46:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, procedural-generation, tool-pipeline, editable-artifacts, evaluation]
evaluated_at: "2026-07-26T21:52:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-26T22:03:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785070961347809"
next_action: none
stale_after: "2026-08-25"
posted:
  ts: "1785070961.347809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785070961347809"
  char_count: 4482
  posted_at: "2026-07-26T22:03:02+09:00"
supersedes: []
gate_reason: |-
  NL2Pipeline gap、型付き incremental mutation、Skills/MCP/WebUI の役割分担、12 task の pass rate・cost・latency 比較まで揃い、問題・手法・評価・結論を記事固有に説明できる。
  level・quest・dialogue 生成工程を差分編集可能な DAG として残す適用先も具体的で、効果と platform 固着・benchmark 規模の限界を含む 4000 字級の分析が成立する。
suggested_post_outline:
  overview_angle: "自然言語から使い捨て script を作る問題を、型付き mutation で永続・編集可能な DAG を組む問題へ置き換えた点を軸にする"
  analysis_axis: "grounded state と procedural skill が pass rate を保ちながら cost/latency を下げた因果、および 12 task 評価の射程を分けて読む"
  application_target: "level・quest・dialogue・asset metadata の生成 pipeline を会話と visual graph の双方から差分編集できる mixed-initiative 制作基盤"
  pros_cons: "再編集性・監査性・中間状態共有が利点。platform-native operator への依存、data engineering からゲーム制作への外挿、少数 task 評価が制約"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv abstract の内容を忠実に日本語で抜粋・再構成: LLM をデータ処理 workflow の自動化に使う場合、coding agent が生成した script は、そのままでは platform 上に永続化され、後から編集できる artifact にならない。この断絶を著者らは NL2Pipeline gap と呼ぶ。DataFlow-Harness は、free-form script を一度に生成する代わりに、型の付いた incremental mutation を通して platform-native な directed acyclic graph を構築させる。構成要素は、手続き的 guidance を与える DataFlow-Skills、現在の operator registry と pipeline state を公開する MCP layer、会話による authoring と visual DAG editor を同期する DataFlow-WebUI。12 task の data-engineering benchmark では observed end-to-end pass rate 93.3% と報告され、Vanilla Claude Code に対して計測上の monetary cost を 72.5%、generation latency を 49.9% 削減した。Context-Aware Claude Code との pass rate 差は 0.9 percentage points 以内で、cost は 42.8% 低かった。Skills は implicit procedural knowledge を要する構築で特に有用だった、とされる。

## why_relevant_to_games

LLM に level・quest・dialogue・asset metadata の生成工程を任せる際、出力を使い捨て script ではなく、型付きで差分編集できる生成 DAG として残す設計の参考になる。会話編集と visual graph を同期する構成は、designer が途中状態を直せる mixed-initiative tool の試作場面に接続できる。
