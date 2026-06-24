---
title: "The Impact of Configuring Agentic AI Coding Tools on Build-vs-Buy Decisions: A Study Protocol"
url: "https://arxiv.org/abs/2606.03907"
collected_at: "2026-06-13T05:59:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-coding, tool-policy, dependency, game-production]
evaluated_at: "2026-06-13T06:16:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-13T06:16:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-13T06:16:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-13"
supersedes: []
gate_reason: |
  AGENTS.md / Skills / MCP / permission が build-vs-buy 判断へ与える影響という問題設定は、ゲーム実装時の依存導入判断に接続できる。
  しかし study protocol であり、現時点の candidate からは実験結果・観察された効果・実務上の結論が抽出できないため、#shared-reads の残すべき投稿には届かない。
---

## raw_excerpt

arXiv abstract excerpt:

> Agentic AI coding tools write code with increasing autonomy and in doing so decide when to import a library and when to implement functionality from scratch. These decisions, whether to build functionality from scratch or buy into an external library, hereafter build-versus-buy, carry direct consequences for software security, licensing compliance, performance, and long-term maintainability.
>
> We present a pre-registered protocol to study how configuration mechanisms alter build-versus-buy behavior in two popular agentic AI coding tools: Claude Code and OpenAI Codex.
>
> We will execute controlled programming tasks drawn from a benchmark of staged projects, each constructed around identifiable build-versus-buy points, and will manipulate the configuration supplied to each tool, ranging from no configuration, through context files with soft preferences and explicit prohibitions, to Skills, MCP-enabled library discovery tools, and permission controls.

Submitted: 2026-06-02. Authors: Jai Lal Lulla, Matthias Galster, Jie M. Zhang, Sebastian Baltes, Christoph Treude.

## why_relevant_to_games

ゲーム prototype 実装時に「既存エンジンやライブラリを使うか、自作するか」を agent がどう選ぶかを、AGENTS.md / skill / MCP / permission の設定差として観測する候補になる。
