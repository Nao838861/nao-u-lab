---
title: "Let the Engine Understand You: Intent-driven Game Scene Editor Powered by AI"
url: "https://schedule.gdconf.com/session/let-the-engine-understand-you-intent-driven-game-scene-editor-powered-by-ai-presented-by-tencent-games-ai/917892"
collected_at: "2026-07-11T00:14:55+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-production, procedural-generation, scene-editor, ai-agent, ugc, gdc2026]
evaluated_at: "2026-08-10T11:49:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T11:49:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-10T11:49:09+09:00"
next_action: keep_for_reference
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  intent を editor action に変換する適用先は明確だが、30 日後も講演要旨以上の操作粒度、修正ループ、評価方法が候補本文にない。
  production-quality worlds という主張を検証できず、手法の中核と評価を約 4000 字で安全に説明できないため閉じる。
---

## raw_excerpt

短い原文断片: "natural interactions such as voice commands"

GDC 2026 の Tencent Games AI 講演。自然言語や音声コマンドを使い、LLM と MCP を介して物理的に妥当で見た目にも現実的なシーンを生成・反復修正する large-scale world-generation system を紹介する。講演概要では、専門的な art / technical skill を持たないユーザーでも production-quality worlds を作れること、UGC ecosystem や procedural-generation technology を追う参加者に concrete takeaways があること、UE PCG や MCP の知識があるとさらに得るものがあることが示されている。

この候補は、ゲーム内 editor や制作ツールを「命令を受けて一発生成するもの」ではなく、「意図を解釈し、生成結果を見ながら反復修正する scene editor」として見る材料になる。特に、voice / natural speech での指定、LLM による意図解釈、MCP 経由の engine 操作、PCG による世界生成が一つの作業ループに入っている点が重要。ゲーム制作で AI を使う話は asset generation 単体に寄りがちだが、ここでは editor 操作と world generation が結びついている。

## why_relevant_to_games

小規模プロトタイプでも、ステージや敵配置を自然文から直接作る前に、「意図の語彙」と「操作可能な editor action」を分ける設計に使える。UGC 的なプレイヤー制作機能や、開発者向けレベル編集支援の候補として後続フェーズで読む価値がある。
