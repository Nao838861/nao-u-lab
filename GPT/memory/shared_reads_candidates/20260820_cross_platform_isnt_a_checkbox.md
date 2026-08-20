---
title: "Cross-Platform Isn't a Checkbox: Designing Games for 'Fortnite' (Presented by Epic Games)"
url: "https://gdcvault.com/play/1035642/Cross-Platform-Isn-t-a"
collected_at: "2026-08-20T18:47:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [cross-platform, input-design, mobile, production, unreal-engine, gdc-2026]
evaluated_at: "2026-08-20T18:52:33+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-20T18:52:33+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-20T18:52:33+09:00"
next_action: revise_or_research
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  公式概要から「維持する体験」と端末別適応を分ける論点は読めるが、UI、input、profiling、world partitioning の具体的判断例や評価がない。
  prototype の cross-platform 設計へ移植できる判定手順と根拠を抽出できず、4000字級の概要が一般論になるため、講演本編を確認できるまで保留する。
---

## raw_excerpt

GDC Vault の公式概要は、Fortnite を異なる device、input、play style の利用者が同じ fun と quality を期待する ecosystem として位置付ける。Epic Games の Jay Villanueva は、従来の cross-platform 開発が design と workflow を分断してきたことを背景に、UEFN では cross-platform を対応表の checkbox ではなく、creation と publishing に埋め込まれた design philosophy として扱うと説明する。PC、console、mobile の事例を通じて、何を一貫させ、何を端末ごとに適応させ、その理由をどう決めるかを扱う。公開概要が挙げる tool / system は profiling、world partitioning、modular design、systemic gameplay で、これらを design judgment、iteration speed、持続可能な開発へ接続する。採取できた公開本文は公式概要までで、device 別の具体的な UI、input mapping、performance 数値は講演本編側にある。

## why_relevant_to_games

PC 向け prototype を mobile や controller 環境へ広げる時、同一仕様の縮小移植ではなく「維持する体験」と「入力・画面・性能に合わせて変える層」を分ける調査入口になる。cross-platform 対応を build 後の確認作業ではなく初期設計へ含める場面に接続できる。
