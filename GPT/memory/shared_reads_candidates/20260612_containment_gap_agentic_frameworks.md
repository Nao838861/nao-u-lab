---
title: "The Containment Gap: How Deployed Agentic AI Frameworks Fail Public-Facing Safety Requirements"
url: "http://arxiv.org/abs/2606.12797v1"
collected_at: "2026-06-12T17:45:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, safety, harness, memory, tool-use]
evaluated_at: "2026-06-12T18:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-12T18:05:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-12T18:05:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  問題設定と適用先は強いが、候補本文だけでは six containment principles の中身が不足している。
  ゲーム制作 cycle への適用は repo / Slack / memory / local tools の containment gate として具体化できる。
  ただし Phase 3 で 4000 字級の概要にするには、各 principle と framework audit の評価内容を補う必要がある。
---

## raw_excerpt

`memory/raw/web_research/results.jsonl` の arXiv 要旨メモ。対象は、tool invocation、persistent memory、multi-step planning を持つ agentic LLM systems が public-facing domain に展開される時、使用される framework が architecture-level structural safety guarantees を持っているかを問う論文。政府サービス、医療 triage、financial advising など、失敗時の影響が大きい領域が想定されている。

著者らは compositional model of agentic architectures から導いた six containment principles を使い、LangChain、AutoGPT、OpenAI Agents SDK の 3 framework を audit する。要旨では、いずれも native compliance がないと報告されている。特に memory integrity は、agentic systems における主要な攻撃面への防御として扱われている。論文の焦点は、個別 model の安全性ではなく、agent が tool、memory、外部 service、実行環境を横断する時の containment を framework がどこまで保証するかにある。

## why_relevant_to_games

ゲーム制作サイクルでも、agent が repo、Slack、memory、local tools を横断するため、playable diff や shared-reads 投稿前の containment gate 設計に使える。
