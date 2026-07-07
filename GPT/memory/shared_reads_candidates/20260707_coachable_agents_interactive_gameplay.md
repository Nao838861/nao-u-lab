---
title: "Coachable agents for interactive gameplay"
url: "https://arxiv.org/abs/2607.00642"
collected_at: "2026-07-07T13:29:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-control, reinforcement-learning, gameplay-style, evaluation]
evaluated_at: "2026-07-07T13:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783399097.181689"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399097181689"
  char_count: 3502
  posted_at: "2026-07-07T13:43:07+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-07T13:43:07+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399097181689"
next_action: none
stale_after: "2026-08-06"
supersedes: []
gate_reason: "問題設定が、RL agent の単一最適行動ではなく runtime style request と task satisfaction の両立として明確。Horizon Forbidden West、Gran Turismo、humanoid domain という複数ゲーム寄り実験があり、敵/NPC/bot の成功率と挙動スタイルを分けて評価する具体場面に直結する。CoopEval 水準の概要は、UVFA と scenario/data augmentation の役割、style coherence 評価、制作側 control surface への転用軸で十分に書ける。"
suggested_post_outline:
  overview_angle: "ゲーム AI を最適化された black box ではなく、プレイヤー/制作者が実行時に挙動スタイルを指定できる control surface として再定義する軸。"
  analysis_axis: "main task 達成と style adherence の二目的評価、UVFA による条件付き policy、実ゲーム領域での domain transfer の限界を中心に読む。"
  application_target: "NPC/敵 bot/自動プレイ検証で、勝率・到達率だけでなく『慎重』『攻撃的』『見栄え重視』などの演出意図を評価項目に分離する設計。"
  pros_cons: "メリットは game production の調整語彙を AI policy に接続できる点。デメリットは style request の設計と評価が domain ごとに重く、汎用 NPC 制御へ直ちに一般化しにくい点。"
  verdict_pre: "部分採用。大規模 RL 実装そのものより、成功率と style adherence を分離する評価設計を先に取り込む。"
---

## raw_excerpt
arXiv:2607.00642。2026-07-01 submitted。Sony AI の Roberto Capobianco らによる、対話的 gameplay の中でプレイヤーやユーザーが agent の解き方を runtime に制御できるようにする研究。論文は、通常の reinforcement learning agent が trial-and-error により単一の near-optimal behavior を学ぶ一方、実用的なゲーム AI では「勝つ」だけでなく、慎重に走る、攻撃的に戦う、見栄えのする挙動をする、といった style をユーザーがその場で指定したい場面がある、と置く。

手法は Universal Value Function Approximators、選ばれた training scenarios、learning algorithms、data augmentation を組み合わせ、main task を満たしながら style request に沿う coachable agent を作るもの。適用例は Horizon Forbidden West、Gran Turismo、open-source humanoid test domain。領域は racing、stylized combat、humanoid walking と異なるが、各 agent は style request への coherence と task satisfaction を両立したとされる。短い原文断片: "choose the final behavior at run time"。

## why_relevant_to_games
ゲーム AI を「最適に動く敵/味方」ではなく、プレイヤーや制作者が挙動の味付けを指定できる runtime control surface として見る候補。敵パターン、NPC、bot policy 評価で、成功率だけでなく style adherence を測る軸に使えそう。
