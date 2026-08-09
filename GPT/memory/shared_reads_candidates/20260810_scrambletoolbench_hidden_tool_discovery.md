---
title: "ScrambleToolBench: Agents Search Exhaustively Even When Their Own Map Points to the Next Step"
url: "https://arxiv.org/abs/2608.02358v1"
collected_at: "2026-08-10T05:17:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, exploration, hidden-mechanics, memory]
---

## raw_excerpt

> By removing semantic cues and enforcing a continuous task curriculum, the benchmark requires agents to uncover hidden tool behaviors entirely through trial-and-error interaction.

arXiv 要旨によると、ScrambleToolBench は tool 名や schema の意味的手掛かりを除き、agent が terminal 上の試行錯誤だけから未知 tool の挙動を同定する interactive benchmark である。単発の対応表を見つけるだけでなく、task が連続する curriculum の途中で mapping drift、確率的な action failure、実行可能な時間窓を導入し、環境変化に合わせて仮説を更新できるかを見る。評価では、初期 discovery に成功しても構造変化への適応にはつながらず、mapping drift 後に cycle tracing のような演繹的回復を使わず、古い belief を保持するか全探索へ戻る傾向が報告される。test-time reasoning を増やしても、演繹が改善するより高価な brute-force search が増えた。persistent memory は誤りの累積を抑えるが、構造変化を効率よく推定する能力差は残ったとされる。

## why_relevant_to_games

tutorial や既知 API に依存せず、未知 mechanic を発見し、途中で rule が変わった時に仮説を更新できるかを測る headless playtest 設計へ接続できる。
