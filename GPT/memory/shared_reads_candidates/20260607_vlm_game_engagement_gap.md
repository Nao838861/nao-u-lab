---
title: "Do Vision Language Models Understand Human Engagement in Games?"
url: "https://arxiv.org/abs/2603.18480"
collected_at: "2026-06-07T21:59:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, ai-evaluation, vlm, playtesting, game-user-research]
evaluated_at: "2026-06-07T22:04:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780837923.934419"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780837923934419"
  char_count: 4518
  posted_at: "2026-06-07T22:12:23+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-07T22:12:23+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780837923934419"
next_action: none
stale_after: "2026-07-07"
supersedes: []
gate_reason: "GameVibe Few-Shot、9本のFPS、3つのVLM、6種類のprompting、pointwise/pairwise prediction という評価設計が明確。結論も「VLMは画面特徴を見ても engagement 推定は弱い」という失敗知としてゲーム制作のAI評価設計に直結する。Nao_u環境の動画・スクショ評価を deterministic 指標や人間評価とどう併用するかの警告として、CoopEval水準の概要を書ける。"
suggested_post_outline:
  overview_angle: "gameplay video から心理状態を読むVLM評価の限界を、GameVibe実験の設計と失敗結果から説明する。"
  analysis_axis: "zero-shot、理論誘導prompt、retrieval/memory prompt、pointwise/pairwise prediction のどこで崩れるかを見る。"
  application_target: "Nao_u の headless / AI playtest / screenshot-video 評価で、VLMを感性判定器として単独採用せず、人間フィードバックと決定的ログに接続する判断軸。"
  pros_cons: "メリットは失敗結果が具体的で評価設計の戒めになること。デメリットはFPS中心で、制作中プロトタイプへの直接指標化には追加検証が必要なこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

Inferring human engagement from gameplay video is important for game design and player-experience research, yet it remains unclear whether vision-language models can infer such latent psychological states from visual cues alone. The paper uses the GameVibe Few-Shot dataset across nine first-person shooter games and evaluates three VLMs under six prompting strategies: zero-shot prediction, theory-guided prompts grounded in Flow, GameFlow, Self-Determination Theory, and MDA, plus retrieval-augmented prompting. It considers both pointwise engagement prediction and pairwise prediction of engagement change between consecutive windows.

The reported result is that zero-shot VLM predictions are generally weak and often fail to outperform simple per-game majority-class baselines. Memory- or retrieval-augmented prompting improves pointwise prediction in some settings, but pairwise prediction remains consistently difficult. Theory-guided prompting alone does not reliably help and can reinforce surface-level shortcuts. The authors frame this as a perception-understanding gap: current VLMs can recognize visible gameplay cues, but still struggle to robustly infer human engagement across games.

## why_relevant_to_games

Nao_u 環境の headless / AI 評価で「画面を見れば面白さが分かる」と短絡しないための材料。動画・スクショ評価を導入する時、engagement 推定を deterministic 指標や人間フィードバックとどう分担するかを考える候補になる。
