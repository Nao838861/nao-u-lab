---
title: "Do Agent Optimizers Compound? A Continual-Learning Evaluation on Terminal-Bench 2.0"
url: "https://arxiv.org/abs/2607.14004"
collected_at: "2026-08-10T11:45:21+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, continual-learning, evaluation, regression-control, game-development]
---

## raw_excerpt

論文は、固定 benchmark に対する一度きりの agent 最適化で得た改善を、その手法の安定した性質として扱う従来の評価設定を問題にする。著者らの中心的な問いは、最適化済み agent に新しい失敗例や課題が到着した後、以前の改善を損なわずに再び改善できるかである。Terminal-Bench 2.0 の難しい課題から二段階の continual-learning 評価を構成し、同一の最適化予算で GEPA、Meta Harness、RELAI-VCL の三手法を比較している。原要旨の短い表現では、必要なのは “without eroding the gains” を満たす反復である。

静的な単一 phase では三手法すべてが baseline を上回ったが、新しい課題を導入すると結果が分かれた。GEPA は未最適化 baseline を下回る転移となり、Meta Harness は転移できても二度目の予算で追加改善できなかった。RELAI-VCL だけが未知課題への正の転移と、その課題を目的へ組み込んだ後の継続改善を両立し、lifelong average pass rate は 76.4% だった（GEPA 66.0%、Meta Harness 64.6%、baseline 58.7%）。要旨は、改善が積み上がった条件を、shortcut solution の一般化失敗を抑える regression control が最適化 loop に組み込まれていたことと結びつけている。

## why_relevant_to_games

ゲーム制作 agent を playable diff ごとに改善する際、直近の評価だけを上げて過去の操作感・既存機能・bad-policy 耐性を壊していないかを、複数サイクルにまたがる regression suite として設計する観点に接続できる。
