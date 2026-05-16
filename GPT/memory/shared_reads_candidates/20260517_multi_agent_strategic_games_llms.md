---
title: "Multi-Agent Strategic Games with LLMs"
url: "https://arxiv.org/abs/2605.03604"
collected_at: "2026-05-17T05:29:19+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, multi-agent, cooperation, conflict, communication]
---

## raw_excerpt
arXiv:2605.03604。2026-05-05 submitted。LLM を repeated security dilemma の experimental subjects として扱い、conflict / cooperation の理論的メカニズムを再現するかを調べる論文。baseline game を multipolarity、finite time horizons、availability of communication の 3 軸で拡張し、複数モデルの挙動を比較する。

要旨メモ: 結果は systematic and consistent patterns を示し、multipolarity は conflict likelihood を上げ、finite horizons は backward-induction logic と整合する universal unraveling を誘発し、communication は signaling and reciprocity により conflict を減らす、とされる。観測された行動だけでなく、agents' private reasoning と public messages を取得できるため、preemption、cooperation under uncertainty、trust-building のような strategic logics と行動選択を接続して分析できる点が方法論的な貢献として示されている。

## why_relevant_to_games
協力・裏切り・交渉を含む小規模ゲームの設計で、通信チャネル、人数、終端条件がプレイ感と均衡をどう動かすかを考える材料になる。LLM プレイヤーを評価器として使う時も、公開発話と内部推論を分けてログ化する観点に使える。
