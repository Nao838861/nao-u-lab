---
title: "COvolve: Adversarial Co-Evolution of Large-Language-Model-Generated Policies and Environments via Two-Player Zero-Sum Game"
url: "https://arxiv.org/abs/2603.28386"
collected_at: "2026-06-28T22:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, agent-evaluation, curriculum, llm, reinforcement-learning]
evaluated_at: "2026-07-28T03:21:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-28T03:21:03+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T03:21:03+09:00"
next_action: revise_or_research
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  environment / policy の共進化、mixed-strategy meta-policy、3 評価領域は抽出でき、敵・level の adversarial playtest へ直接接続できる。
  ただし baseline 別の改善幅、生成環境の妥当性検査、破綻例が不足し、4000 字概要の評価節を支えられないため追加読解まで postpone とする。
---

## raw_excerpt

短い原文引用: "environments expose policy weaknesses"

arXiv:2603.28386。GECCO 2026 accepted。Alkis Sygkounas ほかによる、LLM に環境と policy の両方を executable Python code として生成させ、二人零和ゲームとして共進化させる framework。問題設定は、continual learning agent の訓練環境が静的または手作業で、分布外への一般化が伸びにくいこと。COvolve は environment designer と policy designer の相互作用を adversarial co-evolution として扱い、環境が policy の弱点を露出させ、policy がそれに適応する automated curriculum を作る。過去環境を忘れないために mixed-strategy Nash equilibrium から meta-policy を作る。実験領域は urban driving、symbolic maze-solving、geometric navigation。

## why_relevant_to_games

敵パターンやレベル生成を「agent が失敗する環境を作る」方向で回す候補。自動プレイテスト、難度カリキュラム、過去ステージ忘却の検査に接続できる。
