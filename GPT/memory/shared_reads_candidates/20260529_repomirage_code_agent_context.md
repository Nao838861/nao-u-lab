---
title: "RepoMirage: Probing Repository Context Reasoning in Code Agents with Perturbations"
url: "https://arxiv.org/abs/2605.26177"
collected_at: "2026-05-29T15:29:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, code-agent, context-reasoning, perturbation, harness]
---

## raw_excerpt
arXiv:2605.26177。RepoMirage は、code agent が issue resolution benchmark で成功しても、repo 全体の構造を本当に理解しているとは限らない、という問題設定から出発する。SWE-Bench Verified を土台に、semantics-preserving repository-level perturbation を加えることで、正解に必要な file/context/relation を見つける負荷を上げる。raw/web_research では、RepoMirage-Perturb が三種類の repository-level perturbation を適用し、RepoMirage-Extend が structural bottleneck を issue resolution 以外の explicit task に変換する、と記録されている。検索結果の arXiv 要旨では、original setting の平均 performance 66.8% が extended setting で 25.3% まで落ち、agents が広い context に触れても effective structure information に変換できない exploration drift が見られる。対策として、repository exploration と downstream solving を分ける RepoAnchor workflow が提案されている。

## why_relevant_to_games
ゲーム制作 agent が既存 prototype を直す時、失敗はコード能力だけでなく「構造を見誤る」ことで起きる。Phase 0/Playwright 検証前の repo 探索ログ設計に使える。
