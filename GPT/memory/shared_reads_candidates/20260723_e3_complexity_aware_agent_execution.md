---
title: "Do AI Agents Know When a Task Is Simple? Toward Complexity-Aware Reasoning and Execution"
url: "https://arxiv.org/abs/2607.13034"
collected_at: "2026-07-23T22:00:48.3939255+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-agent, workflow, evaluation, efficiency]
---

## raw_excerpt

arXiv:2607.13034（2026-07-14 submitted）。論文は、LLM agent が multi-step engineering task を実行する際、課題の実際の難しさを見積もらず、既に見た file や dependency まで再読する maximum-context-first の方策を取りやすいと指摘する。小さな一行修正が codebase 全体の調査へ膨らむ原因を、task-aware execution-scope estimation の欠如として定式化する。

著者らは minimum-sufficient execution と Agent Cognitive Redundancy Ratio（ACRR）を定義し、E3（Estimate, Execute, Expand）を提案する。agent は最初に課題に必要な operating point を推定し、minimum viable path を実行し、verification が失敗した時だけ scope を広げる。deterministic simulator 上の 121 editing task からなる MSE-Bench では、最強 baseline と同じ 100% success を保ちながら、cost 85%、token 91%、inspection file 数 92% の削減を報告し、adaptive retrieval baseline を 16% 上回ったとしている。

実モデル用 companion harness の LLM-Case では、gpt-4o agent が実在 open-source library を編集し、各 patch を実際の pytest suite と measured oracle で採点する。ここでも過剰読込みは simulator より弱いが観測され、E3 は同程度の task success で最も少ない読込みと短い実行時間になった。唯一の shortfall は誤修正ではなく provider rate-limit だった。著者らは、これは配備済み agent 全般の測定ではなく execution redundancy の controlled probe だと明記している。

## why_relevant_to_games

ゲーム試作の小修正で、全 scene・全 asset・全設計記憶を毎回読み直さず、最小実行から verification failure に応じて探索範囲を広げる制作 harness の設計候補になる。
