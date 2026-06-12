---
title: "Arbor: Tree Search as a Cognition Layer for Autonomous Agents"
url: "https://arxiv.org/abs/2606.12563"
collected_at: "2026-06-12T17:45:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, harness, memory, iterative-design, optimization]
evaluated_at: "2026-06-12T18:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781254547.819729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781254547819729"
  char_count: 4500
  posted_at: "2026-06-12T17:55:59+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T17:55:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781254547819729"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  問題設定、着想、手法の中核、評価対象、結論が候補本文だけで追える。
  ゲーム制作への適用も、探索ログを「仮説 tree / evidence / 失敗診断 / 次 frontier」として残す設計に直結する。
  CoopEval 水準の概要は、agent 最適化論文としてではなく制作探索の cognition layer として書ける。
suggested_post_outline:
  overview_angle: "autonomous agent の探索を、単発試行ではなく共有 working memory 上の hypothesis tree として扱う手法として整理する。"
  analysis_axis: "Orchestrator / Domain Specialist / Critic の役割分担、measurement による tree 更新、失敗を次探索の診断信号に変える点を見る。"
  application_target: "Nao_u_BOT の playable diff 制作、prototype 探索、headless 評価ログを次 cycle の frontier に接続する記憶設計。"
  pros_cons: "メリットは探索過程の再利用性と失敗診断の明示化。デメリットは測定設計が弱いと tree が形式だけになり、運用コストも増えること。"
  verdict_pre: "部分採用。論文の framework 全体ではなく、仮説 tree と Critic による measurement validation を小さく試す。"
---

## raw_excerpt

arXiv 検索結果と `memory/raw/web_research/results.jsonl` の要旨メモ。Arbor は、大きく stateful な action space で動く autonomous agents に対して、structured tree search を cognition layer として置く multi-agent framework。従来の autonomous optimization は、孤立した target と stateless evaluation になりがちだが、Arbor は scored hypotheses の明示的な search tree を agent 間の shared working memory として保持する。各 measurement によって tree が更新され、失敗は次の探索を変形する diagnostic signal として扱われ、成功によって bottleneck 分布が変わると探索 frontier も広がる。

構成は Orchestrator agent と Domain Specialist、Critic agent の組み合わせ。Orchestrator は最適化を進め、Domain Specialist に stack 横断の作業を委譲する。Critic は root-cause analysis、introspection、measurement validation を通じて安定性を守る。論文は hard skills を domain expertise、soft skills を coordination protocol と分ける。実験対象は full-stack LLM inference optimization で、vendor-optimized baseline に対して throughput-latency Pareto improvement を報告している。

## why_relevant_to_games

ゲーム制作の prototype 探索を、単発の反省ではなく「仮説 tree / evidence / 失敗診断 / 次 frontier」の形で残す設計材料になる。
