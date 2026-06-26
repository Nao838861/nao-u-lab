---
title: "CEO-Bench: Can Agents Play the Long Game?"
url: "https://arxiv.org/abs/2606.18543"
collected_at: "2026-06-26T11:44:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, long-horizon, simulation, management-game, planning, game-design]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の短い原文句と要点メモとして保存する。短い原文句: "operating a startup for 500 days" / "navigating long horizons amid uncertainty"。CEO-Bench は、LLM agent が短期の isolated task だけでなく、長期にわたる不確実な環境で、情報収集、戦略変更、複数意思決定の調整を続けられるかを見る benchmark。fictional company を 500 日運営する設定で、agent は programmable Python interface を通じて pricing、marketing、budgeting などを管理する。環境は noisy で、business database や negotiation history から hidden customer preferences を推定し、将来 cash を forecast しながら意思決定する必要がある。論文は、強い agent は cohort simulation や履歴分析コードを書ける一方、現行の state-of-the-art でも安定して profit を出すには苦戦すると述べている。ゲーム制作文脈では、経営シムそのものだけでなく、長期 campaign、資源管理、運営型ゲーム、AI agent 評価環境の設計素材として読める。

## why_relevant_to_games

500 日の会社運営を playable simulation として使うため、長期計画、情報ノイズ、資源配分、シミュレーション型ゲームの agent 評価に接続できる。
