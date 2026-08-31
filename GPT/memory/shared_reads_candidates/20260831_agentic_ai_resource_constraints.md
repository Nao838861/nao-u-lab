---
title: "Resource Constraints and Performance in Agentic AI Systems"
url: "https://arxiv.org/abs/2608.27886"
collected_at: "2026-08-31T23:51:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agentic-game-development, evaluation, resource-budget, benchmark, provenance]
---

## raw_excerpt

arXiv abstract / HTML からの採取メモ。LLM、tool、memory、state management、multi-step execution を組み合わせた agentic system について、OpenClaw と NanoBot を complete system として paired benchmark で比較する。primary benchmark の full task completion は OpenClaw 31%、NanoBot 25%で、差は 6 percentage point、95% task-bootstrap interval は -3 から 15 point であり、どちらか一方の優位は統計的に確立されなかった。詳細計測層では両者の full completion は 26%。partial completion 以上は NanoBot 43%、OpenClaw 26%だった。OpenClaw は prompt の 83% で実行時間が長く、全 prompt で peak memory 記録値が高かった。geometric mean ratio は wall time 2.98、peak memory 19.44。少なくとも一方が partial / full completion した 10 prompt のうち 8 件では NanoBot が weakly dominate した一方、全 23 prompt で見ると NanoBot の dominance 18 件中 10 件は、より安価だが双方失敗したケースだった。著者らは、capability と resource measurement を attempt-level execution と scoring provenance に結び、verified completion・observed resource use・結果を生んだ実行記録を合わせて評価すべきだとまとめる。

## why_relevant_to_games

coding agent にゲーム試作を任せる時、完成率だけでなく partial progress、wall time、memory、失敗 attempt の安さを分け、playable build の証拠と同じ単位で記録する評価設計の資料になり得る。
