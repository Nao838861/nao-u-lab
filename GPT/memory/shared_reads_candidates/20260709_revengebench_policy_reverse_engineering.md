---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-07-09T15:41:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, playtesting, opponent-modeling, agent-evaluation, policy-interpretability]
---

## raw_excerpt

arXiv:2606.26094v1。2026-06-24 投稿。ゲーム環境で観測できる行動ログだけから、隠れた意思決定プログラムを実行可能なコードとして復元できるかを扱う benchmark。対象は CodeClash tournament trajectories から作られた 5 種類の game environment と 75 個の LLM generated かつ Elo-calibrated な policy。learner は target policy が sampled opponents と対戦する様子を観測し、さらに custom opponent policy を設計して informative behavior を引き出す probe を作る。その後、実行可能な仮説コードを提出し、continuous action-distance metrics で評価される。復元コードは player-versus-player tournament でも informative signal を持つか検証されている。12 個の frontier LLM では recovery quality に大きな差があり、initial distance の 34-72% を閉じたと報告されている。論文は、この形式を opponent modeling、policy interpretability、観測から潜在メカニズムを推定する問題への足場として位置づけている。

## why_relevant_to_games

Nao_u_BOT の headless playtest で「勝ったか」だけでなく、bot やプレイヤーの hidden policy を行動実験で切り分ける候補素材。敵 AI、bad-policy 検出、難度調整の probe 設計に接続できる。
