---
title: "Mining Workflow Graphs for Black-Box Boundary Testing of Conversational LLM Agents"
url: "https://arxiv.org/abs/2607.06873"
collected_at: "2026-07-18T06:29:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, black-box-testing, workflow-graph, game-testing, stateful-dialogue]
---

## raw_excerpt

会話型 LLM agent の state-dependent failure を、内部実装を見ずに探索する AgentEval の提案。標準的な単発テストでは、本人確認や最終確認のような critical boundary が複数ターンの前提条件の奥に隠れ、到達できない。AgentEval は agent と対話しながら conversational workflow graph を採掘し、graph 上の guard と prerequisite を具体的な test target として列挙する。各テストでは boundary 直前まで会話経路を replay し、そこで入力を perturb して、会話 turn だけから pass / fail を判定する。

4 種の τ³-bench agent を対象に、source code を読める white-box auditor と比較した。AgentEval は agent ごとに 23〜38 個の異なる boundary を覆うテストを生成した。ablation では graph structure を使う方式が 23 boundary、prompt-only baseline が 12 boundary で、重複と false alarm も graph 方式の方が少ないと報告される。原文の中心表現は “replaying the conversational path to a boundary before applying a perturbation”。

## why_relevant_to_games

会話 NPC、分岐 quest、tutorial、確認付き行動など、複数 state を経て初めて現れる境界不具合を、固定シナリオの総当たりではなく「経路を採掘して境界直前を揺さぶる」black-box playtest として扱う材料になる。
