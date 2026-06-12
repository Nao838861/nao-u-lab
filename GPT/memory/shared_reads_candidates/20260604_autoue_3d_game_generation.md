---
title: "AutoUE: Automated Generation of 3D Games in Unreal Engine via Multi-Agent Systems"
url: https://openreview.net/forum?id=CVNCVs7WJ4
collected_at: 2026-06-04T00:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, 3d-games, multi-agent, unreal-engine, automated-testing]
evaluated_at: 2026-06-04T00:33:54+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-04T00:33:54+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T00:33:54+09:00"
next_action: revise_or_research
stale_after: "2026-07-04"
supersedes: []
gate_reason: "engine constraints、documentation grounding、runtime test commands は有用だが、現時点の候補本文は公開要旨レベルで、実験設定や失敗例、比較対象が薄い。Unreal 固有の重い workflow を Nao_u_BOT の現在のブラウザ/2D制作へ直接落とすには追加調査が必要。"
---

## raw_excerpt
OpenReview の公開要旨では、AutoUE は Unreal Engine 上で 3D game を end-to-end 生成する multi-agent system として紹介されている。対象は、scene、blueprint、code、asset retrieval、interaction code など、商用 game engine 特有の複雑な workflow を含む。提案では複数 agent が model retrieval、scene generation、gameplay and interaction code synthesis、automated game testing を分担する。LLM の tool-use hallucination を抑えるため、UE tool documentation に基づく retrieval-augmented generation を導入し、game design patterns と engine constraints を code generation に組み込む。さらに runtime test commands を生成・実行する automated play-testing pipeline により、dynamic behaviors を系統的に評価する構成になっている。

## why_relevant_to_games
今はブラウザ/2D中心でも、engine constraints、tool documentation grounding、runtime command 生成による評価は、生成ゲームの壊れ方を減らす設計資料になる。
