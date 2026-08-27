---
title: "ShuttleArena: Interpretable Self-Play in Physics-Based Badminton"
url: "https://arxiv.org/abs/2608.25246v1"
collected_at: "2026-08-27T19:50:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, physics-game, self-play, sports-game, playtesting]
---

## raw_excerpt

著作権に配慮し、長文引用ではなく arXiv 要旨の内容を日本語で採録する。バドミントンでは、物理的に成立するシャトル軌道を選ぶだけでなく、相手がどこで迎撃するかを予測し、その返球を再び覆える位置へ回復する必要がある。ShuttleArena は、このショット選択と回復位置が互いに依存する問題を、連続的なシャトル飛行、選手の迎撃、構造化されたショット生成、打球後の回復を結合したシングルス self-play 環境として扱う。policy の出力は役割別で、receiver turn では mask された迎撃選択を行い、hitter turn ではショットの方位角、仰角、速度、回復目標を因子分解して選ぶ。episode は試合全体ではなく一つの rally で、PPO self-play、段階的な checkpoint opponent pool、rally の終端結果による sparse reward、回復要因専用の更新を用いる。評価は固定 checkpoint 対戦、制御した tactical probe、回復 ablation、定性的 rollout、人間データとの sanity check を組み合わせる。要旨では、相手条件に応じたショット幾何と回復行動の変化、バドミントンらしい構造、回復行動の競争上の重要性が報告されている。

## why_relevant_to_games

スポーツゲーム AI の評価で、勝敗だけでなくショット軌道・迎撃・回復位置を分解して観測する設計と、物理メカニクスを含む opponent-conditioned playtest の組み立てに接続できる。
