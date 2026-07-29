---
title: "Comparative Analysis of GAT and BERT for Human-Like Playtesting"
url: "https://arxiv.org/abs/2607.11501"
collected_at: "2026-07-29T15:01:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, automated-playtesting, player-modeling, puzzle-game, graph-neural-network]
---

## raw_excerpt

論文は、パズルゲームの player experience を扱うため、過去の実プレイデータから人間の選択を模倣する predictive playtesting model を学習する。対象は Candy Crush Saga で、human-like behavior を「履歴中の人間の手と一致する move prediction accuracy」と「モデルの攻略成績が集約された人間の成功率とどれだけ整合するか」の二軸で測る。従来の CNN は盤面を固定的な画像状テンソルとして表すため、盤面サイズの変化、新しい game element、離れた tile を結ぶ portal のような関係が増えるたびに feature engineering や architecture 修正が必要になる。

比較対象は CNN、盤面を text sequence または行列として読む二種の BERT、tile を node、隣接・portal 接続を edge として扱う二種の GAT。約 400K samples / game mode、10 game modes で学習し、別時間帯の約 1M samples で move prediction を検証する。difficulty estimation では level 1000〜15000 から約 300 levels を取り、各 model が level ごとに 1,000 rounds を実行し、Attempts Per Success (APS) を実プレイヤー値と比較する。Top-1 move accuracy は CNN 0.5333、full GAT 0.5437、text-based BERT 0.2220。hard levels の APS MedianAE は CNN 14.00 に対して full GAT 10.03 で、portal edge を含む graph representation が複雑な盤面で使われている。本文は “move prediction accuracy results do not directly translate to the simulation performance” と記し、単手一致率と level 全体の difficulty 再現を分けて報告する。

## why_relevant_to_games

実プレイヤーログから自動 playtester を作る際の state representation と、単手予測・通し攻略・難易度推定を分離した評価設計の具体例として参照できる。
