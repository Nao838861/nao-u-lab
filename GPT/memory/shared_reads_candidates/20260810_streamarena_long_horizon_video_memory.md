---
title: "StreamArena: Toward Continuous, Interactive, and Long-Horizon Agentic Streaming Video Understanding"
url: "https://arxiv.org/abs/2608.05703"
collected_at: "2026-08-10T09:17:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-playtesting, multimodal-agent, video-understanding, long-horizon-memory, evaluation]
---

## raw_excerpt

> a benchmark for hour-scale, interactive streaming video understanding

arXiv 要旨では、continuous な audio-visual stream を扱う agent の評価が短い clip と multiple-choice に偏り、最後の4 frame だけを見る最小 baseline でも複雑な streaming model と同等以上になり得る問題を指摘する。StreamArena は、平均88.8分の full-length video 243本と、open-ended question-answer 3,646件を収録し、real-time perception、過去場面の retrospection、proactive interaction、multimodal tool utilization の4能力を評価する benchmark である。

比較では、recent frame だけを残す方式は遠い出来事を回収できず、過去観測を text 化する方式は visual evidence を失い、visual memory を繰り返し圧縮する方式は細部を保てないという緊張関係が示された。提案する StreamMind は二層構成で、latency-critical な interaction と proactive monitoring を独立 schedule の frontend worker に割り当て、backend worker が非同期に persistent multimodal memory の構築、過去検索、external search を行う。要旨は、4能力すべてで既存 streaming baseline を上回り、persistent state の再利用で query-to-answer latency も減らしたと報告する。

## why_relevant_to_games

長時間の gameplay 動画を headless telemetry だけでは拾えない視覚証拠として扱い、直近反応と過去 event の検索を分離する playtest agent 設計へ使える。死亡原因・UI誤読・演出の見落としを frame 根拠付きで遡る評価場面に接続できる。
