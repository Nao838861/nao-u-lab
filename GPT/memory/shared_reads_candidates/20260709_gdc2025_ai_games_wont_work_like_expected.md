---
title: "AI in Games Won't Work Like You Expect"
url: "https://gdcvault.com/play/1035393/AI-in-Games-Won-t"
collected_at: "2026-07-09T21:30:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-game-development, production, latency, cost, reliability, on-device-ai]
evaluated_at: "2026-08-10T06:55:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T06:55:24+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-10T06:55:24+09:00"
next_action: keep_for_reference
stale_after: "2026-09-09"
supersedes: []
gate_reason: |-
  latency、cost、reliability、on-device AI は重要だが、candidate は講演紹介の主張と利用規模だけで、手法・比較条件・実測の内訳がない。
  制作への示唆も一般的な運用制約に留まり、~4000 字で検証可能な概要を構成できないため投稿対象から外す。
---

## raw_excerpt
GDC Vault の 2025 講演ページ。説明は、現在の AI ecosystem は game developers のために作られたものではなく、controlled demo では印象的でも real-world conditions では latency、cost、reliability bottlenecks で壊れやすい、という問題設定から始まる。事例として、Little Umbrella の Death by AI が 3 か月で 2,000 万 player、Wishroll の Status が 2 週間で 100 万 user に達したとされ、AI-powered games を scale する上で low latency、quality、profitability を保ちながら AI cost を大幅に下げた実例を扱う。

講演ページでは、Kylan Gibbs が on-device の scalable future を扱うとされ、AI hardware は one-size-fits-all ではないこと、hardware 間で consistent performance を確保することが accessibility と cost efficiency の両方に重要だと説明されている。補助的に The Toolsmiths の紹介文では、遠い未来の endless worlds より、cost、quality、reliability、local logic and inference、open-source ecosystems、affordable DRAM、active learning といった実装上の制約が焦点だとされている。

## why_relevant_to_games
LLM / AI NPC / 生成要素をゲーム内に入れる時、面白さ以前に latency、運用費、fallback、端末差で詰まる。Nao_u_BOT の小型 AI game prototype で「動く demo」と「繰り返し遊べる設計」を分ける材料になる。
