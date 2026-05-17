---
title: "Generating Levels That Teach Mechanics"
url: "https://arxiv.org/abs/1807.06734"
collected_at: "2026-05-17T11:59:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tutorial, level-design, pcg, mechanics, player-learning]
---

## raw_excerpt

arXiv:1807.06734。Michael Cerny Green、Ahmed Khalifa、Gabriella A. B. Barros、Andy Nealen、Julian Togelius。2018-07-18 submitted、2018-10-01 v4。主題は、ゲームの tutorial を注釈や説明文で作るのではなく、プレイヤーがその mechanic を使えないとクリアできない小レベルを自動生成すること。

対象は Mario AI Framework。論文は perfect A* agent を基準にしつつ、高くジャンプできない、敵を見られないなど、特定能力を欠いた agent variation を用意する。生成された小レベルを、完全 agent は解けるが、特定行動を欠いた agent は解けない、という形で検査することで、その level が mechanic を要求しているかを見る。つまり「説明を読ませる」のではなく、「その行動を身につけないと進めない地形」を PCG の評価条件にする。

PCG Workshop at FDG 2018 の 8 ページ論文。abstract 上の射程は Mario 系の小レベルだが、mechanic teaching を solvability difference として扱う発想が中心。

## why_relevant_to_games

パズルやアクションのチュートリアルを、文章ではなく level gate として設計するための候補。Nao_u 側の「新規要素をいつ出すか」「操作して身につける」指摘と接続できる。
