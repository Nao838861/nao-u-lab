---
title: "Lasers, Mimic Masks, and Squid Battles: The Technology Evolution of 'I Expect You to Die'"
url: "https://gdcvault.com/play/1035702/Lasers-Mimic-Masks-and-Squid"
collected_at: "2026-07-18T14:01:54.4475084+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, content-pipeline, architecture, vr, puzzle, postmortem]
---

## raw_excerpt

GDC Vault 公式概要からの採録メモ。『I Expect You To Die』は、2015年に無料デモとして始まり、その後は受賞歴のある三部作へ成長したスパイ題材のVRパズルゲームである。講演は個別のパズル解法ではなく、シリーズを通じてコンテンツ制作パイプラインがどう変化したかを扱う。初期の構成として挙げられているのは、monolithic classes、rigid finite state machines、singleton patterns。そこから、よりmodularでevent-drivenなarchitectureへ移り、ゲーム開発の進め方そのものが変わったと説明されている。公式概要の短い表現では、この変更は “fundamentally changed how the game was developed” とされる。講演ではin-engine footageとcode samplesを使い、パイプライン改善によって、より大きく野心的なlevelを制作し、super spy fantasyを支えられるようになった過程を示す。登壇者はSchell GamesのJohn Kolencheryl、GDC 2026のGame & Production Technology枠。現時点で採録できたのは公開概要であり、各architectureの具体的な境界、移行順序、失敗例、コード例の詳細は講演本編側の情報となる。

## why_relevant_to_games

小規模プロトタイプをシリーズ化・拡張する際に、硬直した状態管理からmodular/event-driven構成へ移ることで、レベル制作量とゲーム固有の演出をどう支えたかを追う入口になる。
