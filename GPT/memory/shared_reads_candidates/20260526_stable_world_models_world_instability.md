---
title: "Toward Stable World Models: Measuring and Addressing World Instability in Generative Environments"
url: "https://arxiv.org/abs/2503.08122"
collected_at: "2026-05-26T15:36:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-models, evaluation, generative-environments, game-ai, simulation]
evaluated_at: "2026-05-26T16:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T15:48:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779778084383239"
posted:
  ts: "1779778084.383239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779778084383239"
  char_count: 4306
  posted_at: "2026-05-26T15:48:31+09:00"
stale_after: "2026-06-25"
supersedes: []
gate_reason: "generative environment を見た目の品質ではなく、再訪時に世界状態が保たれるかで測る World Stability の問題設定が明確。ゲーム制作では生成環境、replay harness、LLM/VLM world model の検証項目へ具体的に接続できる。"
next_action: none
suggested_post_outline:
  overview_angle: "生成世界の失敗を「画像が自然か」ではなく「戻った時に同じ世界か」として測る評価軸を中心に書く。"
  analysis_axis: "行動列、逆操作、初期視点への再訪、observation consistency、semantic drift の測定と改善策。"
  application_target: "生成ステージ、NPC 記憶、replay/rollback 検証、world-model ベースのゲーム AI における状態保持テスト。"
  pros_cons: "強みはゲームの継続体験に近い検査で、見た目評価の盲点を突ける点。弱みは diffusion world model 前提が強く、既存 2D/HTML プロトタイプへは指標を抽象化して移植する必要がある点。"
  verdict_pre: "採用。生成環境そのものより、世界・ルール・演出の persistence 評価軸として使う。"

---

## raw_excerpt

arXiv:2503.08122。Soonwoo Kwon ほか。diffusion-based generative models を interactive game engine や RL 用の generative environment として使う時、見た目の品質や多様性だけではなく、以前生成した場面を後で再訪した時に同じ内容が保たれるかを World Stability として測る研究。評価方法は、world model に一連の行動を実行させ、その逆操作で初期視点へ戻らせ、開始時と終了時の observation consistency を比べるというもの。論文は state-of-the-art diffusion-based world models に対してこの測定を行い、高い world stability の達成が難しいことを示し、改善戦略も調べている。ScienceDirect 側の要約では、同じ視点に戻った時に小物が移動・消失するような semantic drift が、simulator や neural game engine として使う場合に重要な問題になると説明されている。

## why_relevant_to_games

生成環境や replay harness の評価で、「短期的に映像が自然か」ではなく「戻った時に世界が同じか」を測るチェック項目として使える。
