---
title: "PinSieve: Production Selective VLM Serving and a Governed Memory Flywheel for Enterprise Content-Quality Triage"
url: "https://arxiv.org/abs/2608.24040"
collected_at: "2026-08-26T16:05:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, vlm, selective-routing, human-escalation, memory, evaluation, game-testing]
---

## raw_excerpt

PinSieve は、大規模 content-quality pipeline に導入した selective VLM Serving Agent と、その後の保守用 memory flywheel の事例である。軽量な upstream model が解決できない grey-zone だけを VLM に渡し、online では scalar routing score を出しつつ、人間への controlled escalation を残す。対象 slice では旧 production module より non-actionable item を2.05倍多く除外し、推定 miss rate をわずかに下げた。promotion 後は review productivity が25.7%改善、normalized operating cost が16.2%低下し、signal delivery は翌日から当日へ短縮したと報告する。

保守では、escalated item は原則 review される一方、auto-pass item は主に audit sampling でしか label が得られない selective feedback を扱う。Feedback Memory は routing trace、observation path、audit propensity、replay metadata を保存する。Data Curation Agent は representative、uncertainty、recency、fresh-review replay を組み合わせた bounded proposal-verifier loop で batch を提案し、positive rate と score bin の guardrail を通して受理する。六か月の production data を chained monthly refresh した評価では、FNR@50% の平均が representative random replay の17.73%から13.29%へ低下した。teacher rationale は別の Reasoning Review Agent が keep、repair、drop に監査し、deployed Serving Agent の実運用結果と offline replay の証拠を区別している。

## why_relevant_to_games

大量 screenshot や playtest trace の一次判定を軽量 rule、灰色領域を VLM、難例を人へ分ける際の routing と、auto-pass 側も audit sampling して評価記憶の偏りを抑える設計材料になる。
