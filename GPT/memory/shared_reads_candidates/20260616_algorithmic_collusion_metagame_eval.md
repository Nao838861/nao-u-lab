---
title: "Algorithmic Collusion at Test Time: A Meta-game Design and Evaluation"
url: "https://arxiv.org/abs/2602.17203"
collected_at: "2026-06-16T02:14:38+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, game-theory, test-time-adaptation, evaluation, strategy]
evaluated_at: "2026-06-16T02:19:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-16T02:19:24+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-16T02:19:24+09:00"
next_action: revise_or_research
stale_after: "2026-07-16"
supersedes: []
gate_reason: "meta-game design、empirical best-response graphs、test-time constraints は重要だが、候補本文は algorithmic collusion risk 側の文脈が強い。対戦ゲームAI評価へ転用するには、具体的なゲーム制作シナリオと指標の翻訳を追加確認してからの方がよい。"
---

## raw_excerpt

arXiv:2602.17203v2。2026-02-19 投稿、2026-03-09 改訂。対象は algorithmic collusion risk だが、方法は multi-agent game evaluation として読める。既存評価が長い学習 horizon、相手の rational adoption、対称な hyperparameter や経済設定に依存しがちな点を問題にし、test-time constraints のもとで algorithmic behavior を分析する meta-game design を導入する。

agent は competitive、naively cooperative、robustly collusive など異なる pretrained policy を持つものとしてモデル化され、初期 policy と in-game adaptation rule を組み合わせた meta-strategy を選ぶ。評価では meta-strategy profile 上の normal-form empirical games をサンプリングし、個別相手への payoff、equilibrium mixture に対する regret、empirical best-response graphs などを使って戦略関係を調べる。実験は repeated pricing games で、RL、UCB、LLM-based strategies を扱う。

短い原文引用: "test-time constraints" / "empirical best-response graphs"

## why_relevant_to_games

対戦・協力ゲームの AI 挙動評価で、固定 opponent への勝率だけでなく、policy と適応 rule の組み合わせを meta-game として見る材料になりそう。複数 bot を入れたプロトタイプで、意図しない協調や exploit が出るかを収集する時の参照候補。
