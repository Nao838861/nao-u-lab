---
title: "Player Modeling via Multi-Armed Bandits"
url: "https://arxiv.org/abs/2102.05264"
collected_at: "2026-07-18T12:00:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, adaptive-games, multi-armed-bandits, simulation]
---

## raw_excerpt

原文を基にした非逐語メモ: 論文は adaptive game の選択肢を multi-armed bandit の arm、プレイヤー反応から得る指標を reward とみなし、プレイヤーを理解する探索と、その人に合う体験を選ぶ活用を同じ逐次意思決定ループで扱う。事前の大量学習データがない状態から、適応案を提示し、反応を観測し、内部モデルを更新して次の選択へ進む。実例は social comparison orientation を対象とし、上方比較と下方比較を異なる割合で提示し、歩数と自己申告 motivation を reward に用いる。実ユーザー試験の前には、公開歩数データから日ごとの変動を再現する step model、比較方向の選好と強度を表す SCO data model、それらから反応を生成する behavioral model を組み合わせた simulated players で複数戦略を比較する。simulation で選んだ短期探索向け戦略を実試験へ持ち込み、motivation change では統計的に有意な差を報告する一方、simulation は人間試験を置き換えず、低費用で設定を絞る前段として位置づけられている。

## why_relevant_to_games

難易度、ヒント、敵構成、物語提示などを少ないプレイ回数で個人適応させる設計と、実プレイテスト前に simulated player で探索戦略を絞る場面に使える。
