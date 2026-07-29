---
title: "CAST: Game Solvers as Turn-Level Teachers for LLM Agents"
url: "https://arxiv.org/abs/2607.25308"
collected_at: "2026-07-30T08:01:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, llm-agent, reinforcement-learning, credit-assignment]
evaluated_at: "2026-07-30T08:06:50+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-30T08:06:50+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-30T08:06:50+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  sparse な最終報酬の問題、solver cost-to-go 差分による turn-level credit、signal shaping、
  controlled baseline・ablation・OOD・近似 value network の評価まで一貫している。
  headless bot の勝敗を途中の改善・悪化へ分解する設計に具体適用でき、約4000字の概要と批判的分析を支えられる。
suggested_post_outline:
  overview_angle: "solver を正解 action の教師ではなく、各 action がゴールまでの距離を縮めたかを測る turn-level 評価器として使う"
  analysis_axis: "cost-to-go 差分と logit-free distillation の関係、asinh/RMS shaping、outcome objective との重み、exact solver 依存と learned value の代替可能性"
  application_target: "graze_log / Pulse Relay の route・camper・lane-holder bot に状態価値または設計 proxy を付け、clear/fail だけでなく各 turn の改善・悪化点を trace 化する headless 評価と bot policy 改善"
  pros_cons: "利点は失敗 trajectory の局所診断、学習効率、solver logits 不要。欠点は信頼できる state value の設計コスト、重み過大時の目的逸脱、主観的な面白さを単一 value に圧縮する危険"
  verdict_pre: "部分採用"
---

## raw_excerpt

抄録からの採取メモ（長い原文引用は避け、日本語で内容を保持）: 長期手順を必要とするゲームで LLM agent を訓練する場合、verifiable な最終結果だけを reward にする RLVR は、成功や失敗を決めた途中の一手を特定できない。CAST（Credit Assignment from Solver Teachers）は、game solver が各 state に与える value の変化を使い、ある action が成功へ近づけたかを solver advantage として表し、turn-level の学習信号として RLVR に追加する。teacher の全 action logits を取得する方式ではなく、state ごとの scalar value を利用する構成になっている。

著者らは soft-optimal solver の仮定の下で、solver advantage の最大化が solver からの on-policy distillation と等価になることを示す。評価対象は Sokoban、Minesweeper、Rush Hour で、in-domain と unseen-difficulty の双方において trained baseline を上回ったと報告する。さらにゲーム以外の長期 decision task である ALFWorld と WebShop でも average zero-shot performance が最も高かったとしている。game solver を最終正解生成器として置くのではなく、長い trajectory のどの decision が状態を改善したかを細かい credit に変換する点が中心である。

## why_relevant_to_games

ゲーム agent の勝敗や clear 率だけでは見えない中間判断を、solver value の差分で turn-level feedback に変える例として、headless playtest の失敗箇所特定や段階的な bot policy 学習に接続できる。
