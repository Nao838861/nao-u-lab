---
title: "Human-on-the-Bridge: Scalable Evaluation for AI Agents"
url: "https://arxiv.org/html/2606.16871v1"
collected_at: "2026-06-16T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, playtesting, harness, red-team, human-feedback]
evaluated_at: "2026-06-16T18:20:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781602512.760549"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781602512760549"
  char_count: 4500
  posted_at: "2026-06-16T19:35:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T19:35:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781602512760549"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  問題設定、human expert の事前設計、ProofAgent Harness、juror persona、証拠リンク付き report、検出 failure が候補メモから抽出できる。
  ゲーム制作では LLM/bot playtest の評価 policy、trap、証跡ログ、失敗分類へ直接落とせるため、こじつけではなく運用改善に接続できる。
suggested_post_outline:
  overview_angle: "agent を単発回答ではなく、複数 turn・tool call・policy following を持つ行動システムとして評価する枠組みとして整理する。"
  analysis_axis: "人間を実行中レビューではなく評価設計者に置く点、traps・juror personas・audit rules・evidence-linked reports の分業を見る。"
  application_target: "ゲーム制作の bot/LLM playtest harness、レビュー観点の事前定義、ログ付き失敗再現、手動レビュー負荷の削減に適用する。"
  pros_cons: "網羅的な失敗検出と再現性が利点。一方で評価 policy と trap 設計の初期コスト、harness LLM 依存、評価者 persona の品質管理が弱点。"
  verdict_pre: "部分採用。Phase 3b/4a の小さな probe として、既存 playtest ログに juror persona と evidence rule を足すのが現実的。"
---

## raw_excerpt

arXiv / web_research から拾った候補メモ。Human-on-the-Bridge は、AI agent を isolated response generator ではなく、turn をまたいで reasoning、tool call、context preservation、policy following、不確実性下の action を行う behavioral system として評価する枠組みとして提示されている。既存手法は static benchmark、Human-in-the-Loop review、LLM-as-judge、red teaming、trace auditing などに分かれているが、それぞれ scale、設計依存、episodic、evidence rule の明示性などに課題がある、という問題設定。

HOB は human expert を各評価 run の内部に置くのではなく、評価前に domain context、Red-Team Traps、Juror Personas、scoring guidelines、audit rules、fallback policies を整える役割に置く。実行時は ProofAgent Harness が Agent Under Test と相互作用し、Harness LLM を使って adversarial trials、trace capture、Juror Persona 適用、evidence-linked reports を回す。検索結果の要旨では、phantom tool-call claims、mandatory tool call の欠落、policy drift、manipulation paths、safe だが解決しない refusals など、単発 benchmark や単一 evaluator scoring で見逃されやすい failure を表面化させると説明されている。

## why_relevant_to_games

ゲーム制作では、人間の主観レビューを毎回手動で回す代わりに、事前に「見るべき失敗」「評価人格」「証拠ログ」を定義して bot / LLM playtest を反復実行する設計の参考になる。
