---
title: "Cattle Trade: A Multi-Agent Benchmark for LLM Bluffing, Bidding, and Bargaining"
url: "https://arxiv.org/abs/2605.14537"
collected_at: "2026-05-17T07:44:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, benchmark, bargaining, hidden-information, agent-evaluation]
evaluated_at: "2026-05-17T07:48:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T07:54:07.387869+09:00"
last_decision: posted
stale_after: "2026-06-16"
supersedes: []
gate_reason: "不完全情報の経済ゲームを使い、bluffing / bidding / bargaining / opponent modeling / resource discipline を統合評価する問題設定と手法が明確。評価も 7 種の LLM と 3 種の deterministic code agents、242 games、行動ログ分析まであり、勝敗以外の失敗様式を説明できる。Nao_u 側の multiplayer / 経済 / 交渉系 prototype と headless 評価 harness の観測項目へ直接転用できる。"
suggested_post_outline:
  overview_angle: "Cattle Trade を、単なるゲームスコア benchmark ではなく、長期の不完全情報交渉で agent の資源規律・相手適応・フェーズ適応をログから読む評価環境として紹介する。"
  analysis_axis: "最終勝敗ではなく、bid / offer / counteroffer / card selection の時系列ログから strategic coherence と失敗様式を分解する設計に注目する。"
  application_target: "Nao_u 側の multiplayer / 経済 / 交渉プロトタイプ、および headless 評価 harness の観測項目設計。特に overbidding、破産誘発、相手状態適応、phase-adaptive bidding を見る。"
  pros_cons: "メリットはゲーム内行動ログを評価単位にでき、LLM と heuristic agent の差を説明しやすい点。デメリットは Cattle Trade 固有の経済ルールに寄るため、アクションゲームや短尺プロトタイプへは直接移植しにくい点。"
  verdict_pre: "部分採用。交渉ゲームそのものではなく、評価 harness のログ設計と失敗分類を採る。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778972047387869"
next_action: none
posted:
  ts: "1778972047.387869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778972047387869"
  char_count: 4475
  posted_at: "2026-05-17T07:54:07.387869+09:00"

---

## raw_excerpt

arXiv:2605.14537。2026-05-14 submitted。Robert Muller / Clemens Muller による multi-agent benchmark。対象は、LLM agent が不完全情報、敵対的相互作用、資源制約のある長期ゲームで、bluffing、bidding、bargaining、opponent modeling、resource allocation を統合して使えるかを見るもの。Cattle Trade は 50-60 turn の競争的な経済ゲームで、auction、hidden-offer trade challenge、counteroffer、card selection などを一つの環境にまとめる。論文は最終スコアや勝率だけでなく、全ての bid、offer、counteroffer、card selection を記録して行動分析できる点を強調している。評価は 7 種の cost-efficient language models と 3 種の deterministic code agents、合計 242 games。結果メモとして、rank には spending volume や単一 subskill より、spending efficiency、resource discipline、phase-adaptive bidding のような strategic coherence が強く関係する。2 種の heuristic code agents は多くの LLM より上で、LLM には overbidding、self-bidding、bankrupt TC initiation、opponent-state adaptation の弱さなどが出る。

## why_relevant_to_games

ゲームを agent 評価環境として使う時、最終勝敗ではなく「いつ・なぜ資源を使いすぎたか」「相手状態へ適応したか」をログから読む設計例になる。Nao_u 側の multiplayer / 経済 / 交渉系プロトタイプや headless 評価 harness の観測項目づくりに使える。
