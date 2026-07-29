---
title: "CAST: Game Solvers as Turn-Level Teachers for LLM Agents"
url: "https://arxiv.org/abs/2607.25308"
collected_at: "2026-07-30T08:01:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, llm-agent, reinforcement-learning, credit-assignment]
---

## raw_excerpt

抄録からの採取メモ（長い原文引用は避け、日本語で内容を保持）: 長期手順を必要とするゲームで LLM agent を訓練する場合、verifiable な最終結果だけを reward にする RLVR は、成功や失敗を決めた途中の一手を特定できない。CAST（Credit Assignment from Solver Teachers）は、game solver が各 state に与える value の変化を使い、ある action が成功へ近づけたかを solver advantage として表し、turn-level の学習信号として RLVR に追加する。teacher の全 action logits を取得する方式ではなく、state ごとの scalar value を利用する構成になっている。

著者らは soft-optimal solver の仮定の下で、solver advantage の最大化が solver からの on-policy distillation と等価になることを示す。評価対象は Sokoban、Minesweeper、Rush Hour で、in-domain と unseen-difficulty の双方において trained baseline を上回ったと報告する。さらにゲーム以外の長期 decision task である ALFWorld と WebShop でも average zero-shot performance が最も高かったとしている。game solver を最終正解生成器として置くのではなく、長い trajectory のどの decision が状態を改善したかを細かい credit に変換する点が中心である。

## why_relevant_to_games

ゲーム agent の勝敗や clear 率だけでは見えない中間判断を、solver value の差分で turn-level feedback に変える例として、headless playtest の失敗箇所特定や段階的な bot policy 学習に接続できる。
