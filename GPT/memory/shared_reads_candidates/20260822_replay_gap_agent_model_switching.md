---
title: "The Replay Gap: Static Evaluation of Model Switching in LLM Agents Scores the Wrong World"
url: "https://arxiv.org/abs/2608.08239"
collected_at: "2026-08-22T08:30:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, model-routing, replay, headless-playtesting, game-development]
---

## raw_excerpt

arXiv:2608.08239（2026-08-08投稿、COLM 2026 採択）。Ashritha Gonuguntla。要旨の原文断片は “Replay-based benchmarks score the wrong world for agentic routing.”。論文は、multi-step agent の途中で model を切り替える router を、記録済み trajectory に別 model の出力だけ差し込む static replay で評価すると、その後の観測・action・環境状態が元のまま続くという仮定を置いてしまう、と問題設定する。

検証では SWE-bench の live agent trajectory を途中で fork し、環境を再構築して別 model で継続する branching rollout と、同じ model のまま fork する control を比較した。6組・約900 rollout で、model swap 後の action の61〜94%が書き換わり、早期 swap の74〜77%は fork 直後の最初の action から分岐した。replay された state のうち有効だったものは3%と報告される。観測された5件の outcome flip はすべて swap 側で起き、log-stitching evaluator は success に関わる判定をすべて外した。temperature 0 の control でも serving configuration によって分岐率が異なり、強い model が tight step budget を使い切って提出できない例も記録されている。一次資料: https://arxiv.org/abs/2608.08239

## why_relevant_to_games

game-playing／coding agent の model を途中で差し替えて比較する時、固定 replay ではなく同一 checkpoint から環境込みで分岐実行し、同一 model control で自然な揺れを測る評価設計の資料になる。
