---
title: "StructureClaw: Traceable LLM Agents and an Executable Benchmark for Structural Engineering Workflows"
url: "https://arxiv.org/abs/2607.14896"
collected_at: "2026-07-26T21:47:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, executable-evaluation, traceability, workflow-testing, game-development]
evaluated_at: "2026-07-26T21:52:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-26T22:03:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785070978821379"
next_action: none
stale_after: "2026-08-25"
posted:
  ts: "1785070978.821379"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785070978821379"
  char_count: 4279
  posted_at: "2026-07-26T22:03:02+09:00"
supersedes: []
gate_reason: |-
  流暢な最終回答ではなく相互依存する artifact chain を assertion で検証する問題設定、workbench 構成、150 scenario・10 configuration・成功率差・残存失敗まで揃う。
  playable build、設計条件、playtest trace、テスト結果、変更記録の整合性を一 run で判定するゲーム制作 harness へ具体的に写像でき、4000 字級で限界も含めて分析できる。
suggested_post_outline:
  overview_angle: "agent 評価の単位を最終回答から、requirements から report まで実行可能で追跡可能な artifact chain へ移した点を軸にする"
  analysis_axis: "artifact-level と execution-level の全 assertion 合格を success とする厳格さが、56.8% から 88.6% の差と残存失敗をどう可視化したか"
  application_target: "ゲーム制作 cycle の設計条件・playable build・headless playtest trace・テスト・変更記録を共有 state として検査する completion gate"
  pros_cons: "内部矛盾と実行不能を発見できるのが利点。構造工学 fixture 依存、全 assertion 成功の硬さ、遊びの質を直接測らない点が制約"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv abstract の内容を忠実に日本語で抜粋・再構成: 構造工学の依頼に答えるには単一の最終回答だけでなく、解釈済み requirements、計算可能な model、validation records、solver outputs、code-check records、final report という相互依存した artifact chain が必要になる。question answering や script generation を中心にした評価は、この連鎖全体を検証しないため、workflow が不完全・内部矛盾・実行不能でも流暢な出力を評価してしまう。StructureClaw は、governed engineering skills、typed tools、shared artifact state、local analysis backends を通して agent が作業する artifact-centered workbench。StructureClaw-Bench は standard workflow execution、interactive robustness、multimodal structural-model reconstruction にまたがる 150 の controlled scenario を持ち、必要な artifact-level assertion と execution-level assertion が単一 run ですべて通った時だけ成功とする。10 種の agent-model configuration を同じ 50 standard case で比較した結果、平均 Success Rate は generic-skill baseline の 56.8% から full automatic workflow の 88.6% へ上昇した。残る課題として invalid numerical input の安全な処理と、fixture と整合する structural model reconstruction が挙げられている。

## why_relevant_to_games

ゲーム制作 agent の評価を「最終的に画面が出たか」だけでなく、設計条件、playable build、検証 trace、テスト結果、変更記録が整合しているかへ広げる実行可能な benchmark 設計の参考になる。level generator や自動 playtest pipeline の途中 artifact を型付き state として検査する場面に接続できる。
