---
title: "GameDevBench: Evaluating Agentic Capabilities Through Game Development"
url: "https://arxiv.org/abs/2602.11103"
collected_at: "2026-05-17T03:29:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, multimodal-evaluation, playtesting]
evaluated_at: "2026-05-17T03:31:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T04:17:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778956655699379"
posted:
  ts: "1778956655.699379"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778956655699379"
  char_count: 3891
  posted_at: "2026-05-17T04:17:35+09:00"
stale_after: "2026-06-16"
supersedes: []
gate_reason: "問題設定、benchmark 構成、評価結果、画像・動画 feedback loop の効果が候補メモ内で揃っている。Nao_u_BOT のゲーム制作 harness に直接接続でき、~4000字の概要で失敗分類と検査ループの話まで展開できる。"
next_action: none
suggested_post_outline:
  overview_angle: "ゲーム開発 agent を、コードだけでなく視覚・アセット・実行時挙動を含む multimodal software task として評価する benchmark として書く。"
  analysis_axis: "132 task の構成、既存 coding benchmark との差、multimodal complexity と成功率、画像・動画 feedback mechanism の改善幅を軸にする。"
  application_target: "shot_log / graze_log 系の headless 検査に、スクリーンショット・録画・差分観察を入れる評価 harness 設計へ接続する。"
  pros_cons: "メリットは agent game dev の失敗を測る語彙が増える点。デメリットは benchmark 成功率をそのまま作品品質や面白さの評価に混同しやすい点。"
  verdict_pre: "部分採用。制作 agent の能力評価ではなく、視覚 feedback を検査ループに入れる設計資料として採用する。"

---

## raw_excerpt
arXiv 2602.11103。2026-02-11 submitted。ゲーム開発を、通常のコード修正よりも視覚・アセット・実行時挙動が強く絡む agentic software task として扱う benchmark。132 tasks は web/video tutorials 由来で、shaders、sprites、animations、visual game scene を含む大きめのコードベース操作を要求する。著者らは、平均解答が既存 software development benchmark より 3 倍超の code/file changes を要すると説明している。

結果メモ: best agent solves 54.5% tasks。難しさは multimodal complexity と相関し、gameplay-oriented tasks から 2D graphics tasks へ行くほど成功率が下がる。画像・動画ベースの feedback mechanisms を加えると性能が改善し、Claude Sonnet 4.5 は 33.3% から 47.7% に上がったと報告されている。

## why_relevant_to_games
Codex のゲーム制作で「headless だけでは見えない視覚・アニメ・操作感の失敗」をどう検査ループに入れるかを考える材料。ゲーム開発 agent の失敗分類と feedback harness 設計に使えそう。
