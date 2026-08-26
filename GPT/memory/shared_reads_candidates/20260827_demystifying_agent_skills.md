---
title: "Demystifying Agent Skills: Why They Work-Until They Don't"
url: "https://arxiv.org/abs/2608.14036v1"
collected_at: "2026-08-27T06:59:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-skills, game-development, workflow, evaluation, retrieval]
---

## raw_excerpt

LLM agent の推論時能力を、知識や手順をまとめた structured package で補う「skill」について、集約された task success だけでなく、いつ助けになり、なぜ機能し、どこで失敗するかを調べた研究。複数の benchmark、agent harness、LLM をまたぐ controlled experiment から、表現形式、outcome annotation、retrieval difficulty、cross-framework robustness の影響を分離している。8,135 trial record と、open coding した240 record のうち有効な238 labelを統合し、3つの上位 categoryと12のskill-use modeへ整理した。

抄録では、skill の主作用を不足知識の注入よりも「procedural anchors」として noisy trajectory の実行を安定させることに置く。matched comparison では Workflow Memory より6.06 points改善し、skill事例の65.7%がprocedural anchoring、explicit knowledge injectionは4.5%だった。一方でretrievalは独立したbottleneckで、poolが5件から100件へ増えるとactual-use precisionは29.6%から3.3%へ低下した。紛らわしいdistractorはoffline identificationを損なうが、downstream successは安定する場合があり、正解skillの厳密な呼び出しは成功の必要条件でも十分条件でもなかった。brittle assumption、incompatible context、適応不足ではskillが失敗すると報告する。

## why_relevant_to_games

ゲーム制作 agent に mechanic 実装、playtest、headless 検証などの skill を渡す際、知識量ではなく手順の固定化、候補pool増大時の検索精度、別engine・別prototypeへの適応失敗を観察する材料になる。
