---
title: "Coachable agents for interactive gameplay"
url: "https://arxiv.org/abs/2607.00642"
collected_at: "2026-07-09T05:44:26+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, reinforcement-learning, npc, playstyle, accessibility, qa]
evaluated_at: "2026-07-09T05:47:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T05:49:13+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "既投稿重複: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399097181689"
next_action: none
duplicate_of: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399097181689"
stale_after: "2026-08-08"
supersedes: []
gate_reason: "問題設定、手法の中核、Gran Turismo / Horizon Forbidden West / humanoid domain での評価、QA・NPC・accessibility への適用が candidate 内で揃っている。成功率と style adherence の trade-off を Nao_u_BOT の headless policy 評価へ移せるため、Phase 3 の概要を十分な密度で書ける。"
suggested_post_outline:
  overview_angle: "タスク達成だけでなく、実行時に指定された playstyle に従う agent を作るという二軸制御の論文として書く。"
  analysis_axis: "universal value function approximators、training scenarios、style rewards、data augmentation が style adherence と performance の Pareto 調整をどう作るか。"
  application_target: "Nao_u_BOT の headless bot policy、NPC 行動設計、QA 用代理プレイヤーで、成功率とは別に撮影向き・控えめ・部位狙い・支援寄りなどの style 指標を持つ評価へ適用する。"
  pros_cons: "メリットは agent 行動を実用的な制作要求へ寄せられる点。デメリットは style reward 設計と大量評価環境が重く、小規模プロトタイプでは簡略版に落とす必要がある点。"
  verdict_pre: "部分採用。RL 全体ではなく、style weight と成功率を分けて測る評価設計を採用する。"
---

## raw_excerpt
arXiv:2607.00642v1。Sony AI ほかの論文。要旨では、強化学習 agent は通常、試行錯誤を通じてタスクを解く 1 つの近最適行動を学ぶが、実利用では「タスクを達成するか」だけでなく「どのように達成するか」を実行時に制御したい場合が多い、と問題設定している。論文は、この二次的な行動特性を styles と呼び、universal value function approximators、training scenarios、learning algorithms、data augmentation を組み合わせて、複雑な領域でも style request に従う coachable agents を作る枠組みを示す。

実証対象は Gran Turismo、Horizon Forbidden West、open-source humanoid domain。Horizon Forbidden West では、近接、罠、複数武器、属性、部位破壊などの style reward を設計し、19 種の敵、3 地点、20 styles、5 seed、計 57,000 battles を評価したと説明されている。結果では、要求 style と実際の damage type / behavior が対応し、勝率との Pareto trade-off を style weight で調整できる。結論部では、ゲーム QA、NPC 強化、難しい場面で agent が代行する accessibility feature への応用が挙げられている。

## why_relevant_to_games
NPC や自動プレイヤーを「強い/弱い」だけでなく、攻撃的、慎重、部位狙い、支援寄りなどの playstyle で制御する設計資料になりそう。Nao_u_BOT の headless bot policy でも、成功率と style adherence を分ける候補として使える。
