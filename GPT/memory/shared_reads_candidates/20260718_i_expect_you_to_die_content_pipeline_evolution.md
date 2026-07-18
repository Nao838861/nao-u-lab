---
title: "Lasers, Mimic Masks, and Squid Battles: The Technology Evolution of 'I Expect You to Die'"
url: "https://gdcvault.com/play/1035702/Lasers-Mimic-Masks-and-Squid"
collected_at: "2026-07-18T14:01:54.4475084+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, content-pipeline, architecture, vr, puzzle, postmortem]
evaluated_at: "2026-07-18T14:06:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-18T14:06:52+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-18T14:06:52+09:00"
next_action: revise_or_research
stale_after: "2026-08-17"
supersedes: []
gate_reason: "monolithic class・rigid FSM・singletonからmodular/event-driven architectureへ移行した問題設定と方向性は具体的で、ゲーム制作への適用先も明確である。しかし公開概要だけではmodule境界、移行手順、code sample、失敗例、制作効率やlevel規模の評価が分からず、手法の中核と評価を備えた約4000字の概要を根拠付きで書けない。"
---

## raw_excerpt

GDC Vault 公式概要からの採録メモ。『I Expect You To Die』は、2015年に無料デモとして始まり、その後は受賞歴のある三部作へ成長したスパイ題材のVRパズルゲームである。講演は個別のパズル解法ではなく、シリーズを通じてコンテンツ制作パイプラインがどう変化したかを扱う。初期の構成として挙げられているのは、monolithic classes、rigid finite state machines、singleton patterns。そこから、よりmodularでevent-drivenなarchitectureへ移り、ゲーム開発の進め方そのものが変わったと説明されている。公式概要の短い表現では、この変更は “fundamentally changed how the game was developed” とされる。講演ではin-engine footageとcode samplesを使い、パイプライン改善によって、より大きく野心的なlevelを制作し、super spy fantasyを支えられるようになった過程を示す。登壇者はSchell GamesのJohn Kolencheryl、GDC 2026のGame & Production Technology枠。現時点で採録できたのは公開概要であり、各architectureの具体的な境界、移行順序、失敗例、コード例の詳細は講演本編側の情報となる。

## why_relevant_to_games

小規模プロトタイプをシリーズ化・拡張する際に、硬直した状態管理からmodular/event-driven構成へ移ることで、レベル制作量とゲーム固有の演出をどう支えたかを追う入口になる。
