---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, evaluation, opponent-modeling, behavioral-probes, llm-agent, interpretability]
---

## raw_excerpt
arXiv の要旨では、観測された行動だけからゲーム環境内エージェントの隠れた意思決定プログラムを実行可能コードとして復元できるか、さらに制御実験を設計できると復元がどれだけ改善するかを問うている。RevengeBench は、5 つのゲーム環境にまたがる 75 個の LLM 生成・Elo 校正済み policy を対象に、CodeClash tournament の軌跡から構成された benchmark と説明されている。

短い原文メモ: "custom opponent policies" / "continuous action-distance metrics" / "opponent modeling"。

学習側は hidden target policy が sampled opponents と対戦する様子を観測し、情報を引き出すための probe として custom opponent policy を設計する。その後、実行可能な仮説コードを提出し、行動距離メトリクスで評価される。12 個の frontier LLM では復元品質に大きな差があり、復元コードは downstream の player-versus-player tournament でも競争上のシグナルを持つとされている。

## why_relevant_to_games
ヘッドレス評価で「動きが良い/悪い」を見るだけでなく、敵・プレイヤー・AI 方策の隠れた癖を probe であぶり出す設計に使えそうな候補。
