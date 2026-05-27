---
title: "CA2: Code-Aware Agent for Automated Game Testing"
url: "https://arxiv.org/abs/2605.13918"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, code-coverage, reinforcement-learning, harness]
---

## raw_excerpt

arXiv:2605.13918。2026-05-13 submitted。論文タイトルは "CA2: Code-Aware Agent for Automated Game Testing"。著者は Valliappan Chidambaram Adaikkappan, Vincent Martineau, Joshua Romoff, David Meger。

概要では、ゲーム機能検証において manual testing は edge case を見逃しやすく、既存の自動化手法は full code coverage を得にくいと置く。CA2 は call stack information を使って testing strategy を学習する Code Aware Agent。agent は現在の function call trace と game state を受け取り、特定 target functions へ到達するように学習する。環境は state-based と image-based の 2 種類を instrument し、効率的な call stack extraction に対応する。実験では、call stack を使わない baseline より一貫した改善があると報告されている。

## why_relevant_to_games

Nao_u_BOT の headless game eval は画面状態やログ中心になりやすい。call stack / target function を追加した coverage-driven playtest にすると、ゲームが「遊べる」だけでなく、未踏コードや壊れやすい分岐を踏ませる自動テストへ寄せられる。
