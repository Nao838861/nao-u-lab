---
title: "RepoMirage: Probing Repository Context Reasoning in Code Agents with Perturbations"
url: "https://arxiv.org/abs/2605.26177"
collected_at: "2026-05-29T15:29:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, code-agent, context-reasoning, perturbation, harness]
evaluated_at: "2026-05-29T15:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  repository-level perturbation で code agent の context reasoning を測るという中核が明確で、数値差と失敗様式も候補本文から拾える。
  ゲーム prototype 改修時の「触るべき構造を見誤る」失敗に直結し、実装前 repo 探索ログや構造把握チェックへ適用できる。
suggested_post_outline:
  overview_angle: "issue を解けることと repo 構造を理解していることを分けて測る benchmark として読む。"
  analysis_axis: "semantics-preserving perturbation、RepoMirage-Extend、探索 drift、RepoAnchor workflow の分離効果を見る。"
  application_target: "Phase 0 / playable diff 前の repo 探索、既存 prototype 改修、Playwright 検証前の構造把握チェックに使う。"
  pros_cons: "メリットは制作エージェントの文脈把握失敗を可視化できる点。デメリットはゲーム体験そのものではなく開発プロセス評価に寄る点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2605.26177。RepoMirage は、code agent が issue resolution benchmark で成功しても、repo 全体の構造を本当に理解しているとは限らない、という問題設定から出発する。SWE-Bench Verified を土台に、semantics-preserving repository-level perturbation を加えることで、正解に必要な file/context/relation を見つける負荷を上げる。raw/web_research では、RepoMirage-Perturb が三種類の repository-level perturbation を適用し、RepoMirage-Extend が structural bottleneck を issue resolution 以外の explicit task に変換する、と記録されている。検索結果の arXiv 要旨では、original setting の平均 performance 66.8% が extended setting で 25.3% まで落ち、agents が広い context に触れても effective structure information に変換できない exploration drift が見られる。対策として、repository exploration と downstream solving を分ける RepoAnchor workflow が提案されている。

## why_relevant_to_games
ゲーム制作 agent が既存 prototype を直す時、失敗はコード能力だけでなく「構造を見誤る」ことで起きる。Phase 0/Playwright 検証前の repo 探索ログ設計に使える。
