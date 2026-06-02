---
title: CA2: Code-Aware Agent for Automated Game Testing
url: https://arxiv.org/abs/2605.13918
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, qa, reinforcement-learning, code-coverage, instrumentation]
---

## raw_excerpt
arXiv 2605.13918。CA2 は Code Aware Agent の略で、ゲーム状態だけでなく current function call trace / call stack を観測に入れる自動ゲームテスト手法。背景は、manual testing は edge cases を逃しやすく、従来の automated methods は full code coverage に届きにくいという問題。CA2 は game state と call trace を受け取り、特定の target functions に到達する testing strategies を学習する。環境は state-based と image-based の 2 種を instrument し、efficient call stack extraction をサポートする。実験では code signals を使わない baseline に対して一貫した改善が報告されている。ゲームの外見上の到達だけでなく、内部関数の到達を目的化する点が特徴。

## why_relevant_to_games
headless 評価が「勝てたか」「死んだか」に偏る時、特定の spawn / collision / scoring 関数へ到達したかをテスト目標に変える候補になる。
