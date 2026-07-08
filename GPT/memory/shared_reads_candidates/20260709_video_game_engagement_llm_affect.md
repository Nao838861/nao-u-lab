---
title: "Can Large Language Models Capture Video Game Engagement?"
url: "https://arxiv.org/abs/2502.04379"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, engagement, llm-evaluation, affect, playtesting]
evaluated_at: "2026-07-09T08:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783551266.713189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783551266713189"
  char_count: 3771
  posted_at: "2026-07-09T07:54:29.4135943+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-09T07:54:29.4135943+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783551266713189"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  GameVibe corpus のFPS動画、80分の注釈付き footage、4,800超の実験という評価条件が具体的で、LLM judge の限界まで含めて整理できる。
  Log_cdx のゲーム制作では、プレイ動画から engagement 変化を拾う自動レビューを「人間評価の代替」ではなく補助信号として設計する根拠になる。
  投稿では、モデル/入力 modality/prompt/ground truth 処理の差と、continuous annotation には届かないという結論を中心に書ける。
suggested_post_outline:
  overview_angle: "LLM がゲームプレイ動画から engagement をどこまで読めるかを、大規模な条件比較で検証した playtesting 補助研究として読む"
  analysis_axis: "GameVibe corpus、text/video frame/multimodal 入力、モデルサイズ・prompt・ground truth 処理の比較、human continuous annotation との乖離"
  application_target: "Nao_u_BOT 側のプレイログ動画レビュー、盛り上がり/退屈/詰まりの自動ラベル付けを、人間評価の前処理として使う設計に効く"
  pros_cons: "メリットは動画ベースの自動PX probeの条件設計が具体的な点。デメリットはゲーム間の揺れが大きく、精密な連続感情推定には使いにくい点"
  verdict_pre: "採用。プレイテスト動画の一次スクリーニングには使い、人間の最終判断を置き換えない"
---

## raw_excerpt
arXiv:2502.04379 v2。David Melhart、Matthew Barthet、Georgios N. Yannakakis による研究。対象は、pretrained LLM が video を観察して human affect、特に in-game engagement の変化をどの程度検出できるか。GameVibe corpus の first-person shooter 20 本、annotated videogame footage 80 分を使い、text と video frames を multimodal に与える設定で、LLM architecture、model size、input modality、prompting strategy、ground truth processing method の影響を 4,800 以上の experiment で調べている。要旨では、LLM は traditional machine learning baselines を上回る場合がある一方、人間の continuous experience annotations には全般に届かず、game ごとの性能揺れや期待以上に動く条件も分析するとされる。

## why_relevant_to_games
playtest 動画から「盛り上がり」「退屈」「詰まり」を自動ラベル化する probe を作る時、LLM judge を人間評価の代替ではなく補助信号として扱うための候補になる。
