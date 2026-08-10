---
title: "StreamArena: Toward Continuous, Interactive, and Long-Horizon Agentic Streaming Video Understanding"
url: "https://arxiv.org/abs/2608.05703"
collected_at: "2026-08-10T09:17:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-playtesting, multimodal-agent, video-understanding, long-horizon-memory, evaluation]
evaluated_at: "2026-08-10T09:25:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T09:41:33+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786322485344499"
next_action: none
stale_after: "2026-09-09"
supersedes: []
posted:
  ts: "1786322485.344499"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786322485344499"
  char_count: 4599
  posted_at: "2026-08-10T09:41:33+09:00"
gate_reason: >-
  短尺 benchmark の欠陥、243 本・3,646 QA・4 能力の評価、既存 memory 方式の三つの失敗、非同期二層 architecture、latency 結果まで重要要素が揃う。
  長時間 gameplay の死亡原因・UI 誤読・演出見落としを frame 根拠付きで遡る playtest agent に、直近監視と過去検索を分ける設計として具体的に適用できる。
  benchmark 批評と制作 probe の双方に十分な材料があり、CoopEval 水準の独立した概要と分析を構成できる。
suggested_post_outline:
  overview_angle: "長時間動画理解を最後の数 frame の認識問題に縮退させず、知覚・回顧・先回り・tool 利用を同時に測る benchmark として読む。"
  analysis_axis: "recent-frame、text memory、圧縮 visual memory の各損失と、frontend / backend の非同期分離が latency と証拠保持をどう両立するかを整理する。"
  application_target: "長時間 gameplay playtest で、即時の異常検知と過去 event の frame 検索を別 worker にし、死亡・迷い・UI 誤読へ timestamp 付き根拠を返す probe に落とす。"
  pros_cons: "telemetry だけでは見えない視覚的原因を残せる一方、動画保存コストと圧縮時の細部喪失、誤った proactive alert の管理が必要になる。"
  verdict_pre: "部分採用。persistent multimodal memory 全体ではなく、直近監視と非同期回顧を分ける評価 architecture を playtest に採用する。"
---

## raw_excerpt

> a benchmark for hour-scale, interactive streaming video understanding

arXiv 要旨では、continuous な audio-visual stream を扱う agent の評価が短い clip と multiple-choice に偏り、最後の4 frame だけを見る最小 baseline でも複雑な streaming model と同等以上になり得る問題を指摘する。StreamArena は、平均88.8分の full-length video 243本と、open-ended question-answer 3,646件を収録し、real-time perception、過去場面の retrospection、proactive interaction、multimodal tool utilization の4能力を評価する benchmark である。

比較では、recent frame だけを残す方式は遠い出来事を回収できず、過去観測を text 化する方式は visual evidence を失い、visual memory を繰り返し圧縮する方式は細部を保てないという緊張関係が示された。提案する StreamMind は二層構成で、latency-critical な interaction と proactive monitoring を独立 schedule の frontend worker に割り当て、backend worker が非同期に persistent multimodal memory の構築、過去検索、external search を行う。要旨は、4能力すべてで既存 streaming baseline を上回り、persistent state の再利用で query-to-answer latency も減らしたと報告する。

## why_relevant_to_games

長時間の gameplay 動画を headless telemetry だけでは拾えない視覚証拠として扱い、直近反応と過去 event の検索を分離する playtest agent 設計へ使える。死亡原因・UI誤読・演出の見落としを frame 根拠付きで遡る評価場面に接続できる。
