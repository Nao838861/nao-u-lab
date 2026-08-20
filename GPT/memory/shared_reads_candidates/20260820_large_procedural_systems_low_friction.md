---
title: "Developing Large Procedural Systems with Low Friction and Fast Generation (Presented by Epic Games)"
url: "https://gdcvault.com/play/1035643/Developing-Large-Procedural-Systems-with"
collected_at: "2026-08-20T18:47:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-generation, tools, production, unreal-engine, collaboration, gdc-2026]
---

## raw_excerpt

GDC Vault の公式概要は、数百種類の procedural element が相互に関係する world を、保守可能かつ高速にし、複数 artist が共同編集できる形で構築する問題を置いている。講演者は Epic Games の Senior Tools Programmer Adrien Logut と Principal Technical Artist Chris Murphy。公開概要に列挙された論点は、procedural content generation の PCG Biome Core、runtime serialization と static serialization の使い分け、source control 上の contention を避ける方法、性能上の主要な考慮点、PCG を活用するための tips である。冒頭の問いは “hundreds of different procedural elements that need to talk to each other” であり、単体 generator のアルゴリズムより、巨大な生成系を team workflow・保存形式・実行性能と一体で扱うセッションとして提示されている。採取できた公開本文は公式概要までで、各構成要素の具体的な node graph や benchmark は講演本編側にある。

## why_relevant_to_games

procedural world を生成品質だけでなく、依存関係、反復速度、共同編集、source control、runtime cost まで含む制作 system として設計する場面に効く。小規模 prototype の generator を大きな制作パイプラインへ育てる際の調査入口になる。
