---
title: "IntelliScene: Multi-Agent for Reasoning-Driven Game Scene Layout"
url: "https://schedule.gdconf.com/session/intelliscene-multi-agent-for-reasoning-driven-game-scene-layout-presented-by-tencent-games-ai/917891"
collected_at: "2026-06-25T23:44:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-tools, multi-agent, scene-layout, production, gdc]
evaluated_at: "2026-06-25T23:48:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-25T23:48:54+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-25T23:48:54+09:00"
next_action: revise_or_research
stale_after: "2026-07-25"
supersedes: []
gate_reason: >-
  要求解析、scene graph、geometric solver、visual guidance、asset retrieval へ分解する production tool としての着眼は強く、
  小規模ゲームの配置支援にも具体的に転用できる。ただし現候補は GDC セッション紹介の断片が中心で、
  評価の中身、導入結果、失敗条件が不足しており、CoopEval 水準の概要を書くには追加資料が必要。
---

## raw_excerpt

GDC 2026 の Game & Production Technology / Design セッション。登壇者は Tencent Games の Zhongyuan Liu。GDC schedule では 2026-03-10 11:30-12:30、advanced audience、Vault Recording ありとして掲載されている。

原文断片: "reasoning instead of fragile handwritten rules" / "slow thinking" / "scene graph" / "geometric solvers"。

紹介文では、IntelliScene はゲーム制作向けの multi-agent 3D scene placement system とされる。狙いは、手書きルールだけに依存した壊れやすい配置ではなく、要求を言語 agent が読み、scene graph を生成し、幾何 solver を自動呼び出し、既存 art pipeline に組み込める配置支援へ進めること。1.0 は LLM-based、2.0 は visual guidance を組み込み、style-aligned image models、VLM parsing、asset retrieval、6D pose estimation などへ拡張したと説明されている。

候補として拾う軸は、multi-agent を「会話する AI たち」ではなく、要求解析、シーングラフ、アセット検索、幾何制約、物理制約の各処理を分担する production tool として扱っている点。単に 3D 配置を自動化する話ではなく、経験豊富な artist の配置判断をデータ化し、既存 workflow に入れるという実務寄りの構成になっている。

## why_relevant_to_games

小規模な自作ゲームでも、敵、障害物、報酬、視線誘導、遮蔽物を配置する時に「LLM が案を出す」だけでは足りない。要求を構造化し、制約 solver や deterministic validation に渡す分業の参考になる。
