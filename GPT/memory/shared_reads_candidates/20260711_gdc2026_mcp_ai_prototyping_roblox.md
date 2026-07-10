---
title: "Build Faster, Iterate More: AI-Powered Prototyping with the Model Context Protocol (MCP)"
url: "https://schedule.gdconf.com/session/build-faster-iterate-more-ai-powered-prototyping-with-the-model-context-protocol-mcp/915811"
collected_at: "2026-07-11T00:14:55+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-production, tools, ai-agent, mcp, prototyping, gdc2026]
evaluated_at: "2026-07-11T00:18:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-11T00:18:30+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-11T00:18:30+09:00"
next_action: revise_or_research
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  MCP を game engine functionality / content creation / QA / build pipeline へ接続する着想は適用性が高い。
  ただし現状は講演要旨中心で、server/client 境界、操作 API、検証ログ、失敗時の制約が不足しており、CoopEval 水準の概要を書くには追加一次情報が必要。
---

## raw_excerpt

短い原文断片: "universal middleware"

GDC 2026 の Machine Learning Summit 講演。Roblox の Brent Vincent と Lynn Gong が、Model Context Protocol servers / clients を使い、LLM と game engine functionality の間をつなぐ実装原理と応用例を示す内容。講演概要では、MCP を content creation、quality assurance、複雑な build pipelines の自動化に使う実例を扱い、game engine 向け MCP server の設計と実装、asset pipeline 管理、rapid prototyping に接続する takeaways が明記されている。

この候補で拾うべき点は、AI 開発支援を「チャットでコードを出す」ではなく、エンジン機能やビルド・アセット処理に到達できる middleware として扱うところ。ゲーム制作では、LLM が自然言語で意図を理解しても、実際の editor、asset import、scene mutation、test run、build job に触れなければ iteration は速くならない。MCP server を engine/tool 側に立てる発想は、AI が作業を代行するというより、制作環境の操作面を構造化し、同じ操作を再実行・検証・ログ化できるようにする方向に見える。

## why_relevant_to_games

Nao_u_BOT のゲーム制作で、Playwright や headless harness だけでなく、エンジン/ビルド/アセット操作を tool 化する設計の入口になる。Phase 2 では、MCP を入れる価値そのものではなく、どの操作を構造化すれば反復が短くなるかの候補として読む。
