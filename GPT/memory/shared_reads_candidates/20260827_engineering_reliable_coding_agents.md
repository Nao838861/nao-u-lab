---
title: "Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model"
url: "https://arxiv.org/abs/2608.13867v1"
collected_at: "2026-08-27T06:59:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [coding-agents, game-development, harness, evaluation, observability]
evaluated_at: "2026-08-27T07:03:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-27T07:16:26.146149+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787782580175809"
next_action: none
stale_after: "2026-09-26"
supersedes: []
gate_reason: |-
  164件の学術資料等を統合する方法、dependency chain、repair asymmetry、206件の reliability record と限界が揃い、重要要素を具体的に説明できる。
  ゲーム制作 agent の build・asset/state 取得・memory・visual/headless 検証を層別診断する用途が明確で、約4000字の概要に耐えるため pass とする。
suggested_post_outline:
  overview_angle: "coding agent の信頼性を model 単体ではなく harness から review まで連なる運用 system の性質として整理する"
  analysis_axis: "dependency chain と repair asymmetry を軸に、一層の改善が end-to-end 成果へ届かない理由を検討する"
  application_target: "ゲーム制作サイクルの build 環境、asset/state retrieval、memory、visual・headless 検証、review 経路の障害切り分け"
  pros_cons: "広い evidence map と実行可能な protocol が強み。網羅的レビューではなく、workload・configuration ごとの再検証が必要"
  verdict_pre: "部分採用"
posted:
  ts: "1787782580.175809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787782580175809"
  char_count: 4351
  posted_at: "2026-08-27T07:16:26.146149+09:00"
---

## raw_excerpt

AI coding agent は model として評価される一方、実運用では harness、execution state、retrieval、memory / state management、permission、review interface、resource allocation を含む system として動く、という境界を扱う monograph。164件の scholarly work、100件の practitioner record、29件の benchmark record、17件の author-system case record を、structured multivocal review、targeted update audit、software-engineering coverage analysis、distributed-systems evidence synthesisで統合している。

抄録は、model failureに見える事象の多くがsystemの別層から生じ、一層の改善がend-to-end outcomeへ伝播しないことがあると述べる。evaluationとoperationをdependency chainとして扱い、task construction、execution environment、retrieval、state management、verification、observabilityの弱点が下流の結論を無効にし得るとする。成果物には、206件のversioned reliability record（193 gated practice、そのうち56件を詳細化、13 research lead）、evidence ledger、agent lifecycle上のdependency / repair asymmetry framework、運用agentの測定とfailure case、実行可能な評価・信頼性protocol、evidence map付きの5 reusable agent skillが含まれる。対象はstructuredだが網羅的ではなく、topicごとのevidence strengthやworkload・configuration依存も明記されている。

## why_relevant_to_games

ゲーム制作 agent の失敗を生成modelだけに帰属せず、build環境、asset / state取得、memory、visual・headless検証、review経路のどこで壊れたかを分けて記録する際の参照になる。
