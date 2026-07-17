---
title: "Mining Workflow Graphs for Black-Box Boundary Testing of Conversational LLM Agents"
url: "https://arxiv.org/abs/2607.06873"
collected_at: "2026-07-18T06:29:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, black-box-testing, workflow-graph, game-testing, stateful-dialogue]
evaluated_at: "2026-07-18T06:45:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-18T06:45:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-18T06:45:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  隠れた stateful boundary を workflow graph の採掘、境界直前までの replay、入力 perturbation、会話だけによる oracle という再現可能な手順へ分解しており、white-box 比較と ablation まで含む。分岐 NPC、quest、tutorial、確認付き行動の playtest に具体的に移植でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "単発プロンプトでは届かない複数ターン境界を、会話 workflow graph から列挙して直前 replay で検査する black-box testing 手法として整理する"
  analysis_axis: "graph mining が boundary coverage、重複、false alarm をどう改善したかを white-box 比較と prompt-only ablation から検討する"
  application_target: "会話 NPC、分岐 quest、tutorial、購入や不可逆操作の確認境界を、到達経路の採掘と境界直前 perturbation による回帰 playtest へ落とす"
  pros_cons: "利点は内部実装なしで深い状態境界をテスト資産化できること。欠点は採掘した graph の網羅性、会話出力だけの oracle 精度、非会話的なゲーム状態への拡張が未保証なこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

会話型 LLM agent の state-dependent failure を、内部実装を見ずに探索する AgentEval の提案。標準的な単発テストでは、本人確認や最終確認のような critical boundary が複数ターンの前提条件の奥に隠れ、到達できない。AgentEval は agent と対話しながら conversational workflow graph を採掘し、graph 上の guard と prerequisite を具体的な test target として列挙する。各テストでは boundary 直前まで会話経路を replay し、そこで入力を perturb して、会話 turn だけから pass / fail を判定する。

4 種の τ³-bench agent を対象に、source code を読める white-box auditor と比較した。AgentEval は agent ごとに 23〜38 個の異なる boundary を覆うテストを生成した。ablation では graph structure を使う方式が 23 boundary、prompt-only baseline が 12 boundary で、重複と false alarm も graph 方式の方が少ないと報告される。原文の中心表現は “replaying the conversational path to a boundary before applying a perturbation”。

## why_relevant_to_games

会話 NPC、分岐 quest、tutorial、確認付き行動など、複数 state を経て初めて現れる境界不具合を、固定シナリオの総当たりではなく「経路を採掘して境界直前を揺さぶる」black-box playtest として扱う材料になる。
