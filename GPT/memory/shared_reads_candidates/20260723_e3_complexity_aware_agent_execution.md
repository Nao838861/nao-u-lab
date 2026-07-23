---
title: "Do AI Agents Know When a Task Is Simple? Toward Complexity-Aware Reasoning and Execution"
url: "https://arxiv.org/abs/2607.13034"
collected_at: "2026-07-23T22:00:48.3939255+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-agent, workflow, evaluation, efficiency]
evaluated_at: "2026-07-23T22:04:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T22:13:13.2185700+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784812374972069"
next_action: none
stale_after: "2026-08-22"
supersedes: []
posted:
  ts: "1784812374.972069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784812374972069"
  char_count: 4479
  posted_at: "2026-07-23T22:12:54.0000000+09:00"
gate_reason: |-
  maximum-context-first の過剰探索を execution-scope estimation の欠如として定式化し、E3、ACRR、二段階の評価、限界まで重要要素を抽出できる。
  ゲーム試作の小修正で最小の scene・script・test から始め、検証失敗時だけ依存範囲を広げる制作手順へ直接移せ、約4000字で効果と適用限界を具体化できる。
suggested_post_outline:
  overview_angle: "一行修正を codebase 全体の監査へ膨らませる maximum-context-first 問題から、minimum-sufficient execution、ACRR、E3 の順に説明する"
  analysis_axis: "成功率を落とさず探索量を減らした simulator 結果と実 repository の LLM-Case を分け、controlled probe を一般的な agent 能力へ拡張しすぎない"
  application_target: "ゲーム試作の小修正で、対象 script・scene と最小 test から着手し、実行・visual check・回帰 test の失敗証拠に応じて asset・依存 scene・設計記憶へ探索範囲を広げる"
  pros_cons: "利点は token・待ち時間・無関係な再読を減らしつつ検証を安全網にできること。欠点は初期 scope の過小評価、visual/creative failure の oracle 化、simulator と実 game project の差"
  verdict_pre: "部分採用。まず小修正で inspected file 数、再読回数、検証失敗後の scope expansion、task success を記録する可逆な probe として試す"
---

## raw_excerpt

arXiv:2607.13034（2026-07-14 submitted）。論文は、LLM agent が multi-step engineering task を実行する際、課題の実際の難しさを見積もらず、既に見た file や dependency まで再読する maximum-context-first の方策を取りやすいと指摘する。小さな一行修正が codebase 全体の調査へ膨らむ原因を、task-aware execution-scope estimation の欠如として定式化する。

著者らは minimum-sufficient execution と Agent Cognitive Redundancy Ratio（ACRR）を定義し、E3（Estimate, Execute, Expand）を提案する。agent は最初に課題に必要な operating point を推定し、minimum viable path を実行し、verification が失敗した時だけ scope を広げる。deterministic simulator 上の 121 editing task からなる MSE-Bench では、最強 baseline と同じ 100% success を保ちながら、cost 85%、token 91%、inspection file 数 92% の削減を報告し、adaptive retrieval baseline を 16% 上回ったとしている。

実モデル用 companion harness の LLM-Case では、gpt-4o agent が実在 open-source library を編集し、各 patch を実際の pytest suite と measured oracle で採点する。ここでも過剰読込みは simulator より弱いが観測され、E3 は同程度の task success で最も少ない読込みと短い実行時間になった。唯一の shortfall は誤修正ではなく provider rate-limit だった。著者らは、これは配備済み agent 全般の測定ではなく execution redundancy の controlled probe だと明記している。

## why_relevant_to_games

ゲーム試作の小修正で、全 scene・全 asset・全設計記憶を毎回読み直さず、最小実行から verification failure に応じて探索範囲を広げる制作 harness の設計候補になる。
