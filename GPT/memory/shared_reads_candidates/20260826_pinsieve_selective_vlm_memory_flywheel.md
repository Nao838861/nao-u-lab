---
title: "PinSieve: Production Selective VLM Serving and a Governed Memory Flywheel for Enterprise Content-Quality Triage"
url: "https://arxiv.org/abs/2608.24040"
collected_at: "2026-08-26T16:05:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, vlm, selective-routing, human-escalation, memory, evaluation, game-testing]
evaluated_at: "2026-08-26T16:08:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T16:19:12.8530106+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787728736441879"
next_action: none
stale_after: "2026-09-25"
supersedes: []
gate_reason: |
  軽量判定・grey-zone の VLM routing・人への escalation と、選択的にしか得られない label を補う audit sampling／replay memory の構造が具体的である。
  production 指標と 6 か月の chained refresh 評価があり、大量 screenshot・playtest trace の triage と評価記憶の偏り対策へ接続できるため、4000 字水準の分析を構成できる。
suggested_post_outline:
  overview_angle: "高価な VLM を難例だけに使い、偏った feedback を監査可能な memory flywheel で補正する production 設計"
  analysis_axis: "selective routing、controlled escalation、auto-pass audit、proposal-verifier loop、online 成果と offline replay の証拠分離"
  application_target: "Log_cdx の大量 screenshot・playtest trace 評価で、軽量 rule／grey-zone VLM／人手確認を段階化し、auto-pass 側を audit sampling して見逃し学習を防ぐ仕組み"
  pros_cons: "利点は精度を保ちながら review 費用と待ち時間を下げられること。欠点は routing score の校正、audit propensity の管理、少数 slice の結果をゲーム全体へ外挿する危険があること"
  verdict_pre: "部分採用"
posted:
  ts: "1787728736.441879"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787728736441879"
  char_count: 4464
  posted_at: "2026-08-26T16:19:12.8530106+09:00"
---

## raw_excerpt

PinSieve は、大規模 content-quality pipeline に導入した selective VLM Serving Agent と、その後の保守用 memory flywheel の事例である。軽量な upstream model が解決できない grey-zone だけを VLM に渡し、online では scalar routing score を出しつつ、人間への controlled escalation を残す。対象 slice では旧 production module より non-actionable item を2.05倍多く除外し、推定 miss rate をわずかに下げた。promotion 後は review productivity が25.7%改善、normalized operating cost が16.2%低下し、signal delivery は翌日から当日へ短縮したと報告する。

保守では、escalated item は原則 review される一方、auto-pass item は主に audit sampling でしか label が得られない selective feedback を扱う。Feedback Memory は routing trace、observation path、audit propensity、replay metadata を保存する。Data Curation Agent は representative、uncertainty、recency、fresh-review replay を組み合わせた bounded proposal-verifier loop で batch を提案し、positive rate と score bin の guardrail を通して受理する。六か月の production data を chained monthly refresh した評価では、FNR@50% の平均が representative random replay の17.73%から13.29%へ低下した。teacher rationale は別の Reasoning Review Agent が keep、repair、drop に監査し、deployed Serving Agent の実運用結果と offline replay の証拠を区別している。

## why_relevant_to_games

大量 screenshot や playtest trace の一次判定を軽量 rule、灰色領域を VLM、難例を人へ分ける際の routing と、auto-pass 側も audit sampling して評価記憶の偏りを抑える設計材料になる。
