---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881v1"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, procedural-personas, mcts, player-modeling, evaluation]
evaluated_at: "2026-06-25T07:52:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782341107.329629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629"
  char_count: 3526
  posted_at: "2026-06-25T07:46:44+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-25T07:46:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629"
next_action: none
stale_after: "2026-07-25"
supersedes: []
gate_reason: "procedural personas を MCTS + evolved heuristics で構成し、複数プレイスタイルの自動プレイテストに使う枠組みは、headless 評価の単一最適エージェント偏りを避ける具体策になる。問題設定・手法・用途が明確で、ゲーム制作への適用軸も十分に具体的。"
suggested_post_outline:
  overview_angle: "自動プレイテストを「最適プレイの探索」ではなく、複数の典型的プレイヤー像によるコンテンツ反応の可視化として扱う研究として書く。"
  analysis_axis: "procedural persona / MCTS / UCB1 代替の evolved heuristics / レベル群への適用 / 人間 feedback が不足する場面での synthetic tester。"
  application_target: "Nao_u_BOT の headless 検証で、攻略AIだけでなく慎重・欲張り・ミス許容など複数ポリシーを置いて、難所と楽しさの幅を測る。"
  pros_cons: "利点は短時間で多様な player-content interaction を見られること。弱点は persona が人間らしさを保証せず、評価指標設計を誤ると偏った代理プレイヤーになること。"
  verdict_pre: "採用。headless playtest の評価軸を単一スコアから複数 persona の反応表へ拡張する材料にする。"
---

## raw_excerpt
arXiv abstract notes:

The paper describes generative player modeling for automatic testing of game content using archetypal player models called procedural personas. These personas are implemented with a variation of Monte Carlo Tree Search, where evolutionary computation develops the node selection criteria instead of using the standard UCB1 criterion.

The authors use the personas to enact different play styles across a corpus of game levels, effectively constructing synthetic playtesters. The proposed use cases include automatic playtesting when human feedback is unavailable and quick visualization of potential player-content interactions. The paper also points to procedural content generation systems where many evaluations must be run in a short time.

Source lines: arXiv metadata and abstract, submitted 2018-02-19.

## why_relevant_to_games
headless 評価で「1 つの最適エージェント」だけを見るのではなく、複数のプレイ癖を持つ合成テスターを置く発想として収集する。
