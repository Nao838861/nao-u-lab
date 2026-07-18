---
title: "ChartGenEval: Corruption-Tested Multi-Dimensional Feedback for Rhythm-Game Chart Generation"
url: "https://arxiv.org/abs/2607.12857"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rhythm-game, procedural-content, evaluation, music-game]
---

## raw_excerpt

arXiv:2607.12857、2026-07-14 submitted。リズムゲームの自動生成譜面では、同じ曲・同じ難度にも複数の妥当なノート列があり、公式譜面との一致率は「再構成」を測っても設計全体を測らない、という問題設定から始まる。ChartGenEval は評価を六つの問いに分け、公式譜面からは target notes ではなく authored timing map だけを参照する。各自動指標が本当に意図した欠陥へ反応するかを、量を制御して注入した corruption で検査する。80 の held-out song groups に対し、7 output axes が事前指定した sensitivity / invariance 条件を9つの非重複テストで満たしたと報告する。追加 stress test では、15 / 30 / 60 ms の全体 timing shift を phase estimate が回収する一方、chart-only outputs はほぼ変化しない。common-pattern rewriting で language-model perplexity が平均37%低下し、loop collapse で self-similarity が平均62%上昇した。単一総合点ではなく、役割の異なる信号を分離して generator の比較・反復へ返す構成である。原文の核は “reports separate, role-specific signals instead of one proxy or total score.”

## why_relevant_to_games

生成コンテンツの評価指標を一つの代理点へ潰さず、意図的に欠陥を注入して感度と不変性を確かめる手順は、譜面生成だけでなく level / enemy pattern / pacing の自動評価設計に関係する。
