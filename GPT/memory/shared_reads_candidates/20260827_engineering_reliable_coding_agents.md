---
title: "Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model"
url: "https://arxiv.org/abs/2608.13867v1"
collected_at: "2026-08-27T06:59:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [coding-agents, game-development, harness, evaluation, observability]
---

## raw_excerpt

AI coding agent は model として評価される一方、実運用では harness、execution state、retrieval、memory / state management、permission、review interface、resource allocation を含む system として動く、という境界を扱う monograph。164件の scholarly work、100件の practitioner record、29件の benchmark record、17件の author-system case record を、structured multivocal review、targeted update audit、software-engineering coverage analysis、distributed-systems evidence synthesisで統合している。

抄録は、model failureに見える事象の多くがsystemの別層から生じ、一層の改善がend-to-end outcomeへ伝播しないことがあると述べる。evaluationとoperationをdependency chainとして扱い、task construction、execution environment、retrieval、state management、verification、observabilityの弱点が下流の結論を無効にし得るとする。成果物には、206件のversioned reliability record（193 gated practice、そのうち56件を詳細化、13 research lead）、evidence ledger、agent lifecycle上のdependency / repair asymmetry framework、運用agentの測定とfailure case、実行可能な評価・信頼性protocol、evidence map付きの5 reusable agent skillが含まれる。対象はstructuredだが網羅的ではなく、topicごとのevidence strengthやworkload・configuration依存も明記されている。

## why_relevant_to_games

ゲーム制作 agent の失敗を生成modelだけに帰属せず、build環境、asset / state取得、memory、visual・headless検証、review経路のどこで壊れたかを分けて記録する際の参照になる。
