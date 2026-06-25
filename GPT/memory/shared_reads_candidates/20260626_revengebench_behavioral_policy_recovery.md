---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-06-26T01:44:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, game-ai, behavioral-probes, opponent-modeling, headless]
---

## raw_excerpt

arXiv:2606.26094v1。2026-06-24 submitted。対象は、ゲーム環境内で観測される行動トレースだけから、隠れた agent policy の意思決定プログラムを実行可能コードとして復元できるかを扱う benchmark。著者らは、CodeClash tournament trajectories 由来の 5 種類の game environment と 75 個の LLM-generated / Elo-calibrated policy を用意し、学習側 agent が対象 policy の対戦ログを観測するだけでなく、情報を引き出す custom opponent policy を設計して behavioral probe を行える設定にしている。

原文の核は、"given only behavioral traces of an agent in a game environment" から underlying decision program を reconstruct する問い、custom opponent policies で informative behavior を elicitation する設計、そして executable hypothesis を continuous action-distance metrics と downstream PvP tournament signal で評価する点にある。12 frontier LLMs の比較では、initial distance の 34-72% を閉じる範囲で recovery quality に差が出ると説明されている。

## why_relevant_to_games

headless評価で「botが通った/失敗した」だけを見るのではなく、相手やプレイヤーの方策を引き出すprobeを設計し、行動ログから隠れたpolicyを復元する観点として使える。
