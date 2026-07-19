---
title: A Memory-Driven Action Selection Framework for Scalable Ambient NPC Behavior
url: https://www.csd.uwo.ca/~ebuitron/
collected_at: 2026-07-19T21:32:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, npc, open-world, behavior-selection, memory, performance]
---

## raw_excerpt

Western University の Eric Buitron Lopez と Roberto Solis-Oba による、IEEE Conference on Games 2026 採択予定の研究。対象は、open-world game で多数の ambient NPC に多様かつ文脈に合う行動をさせながら、厳しい frame budget を超えないための action selection である。NPC の振る舞いを action の有向グラフとして定義し、bounded memory が未試行または最も長く使われていない遷移を優先することで、online planning や search を毎回実行せずに行動の変化を作る。実装は engine-agnostic な C++ shared library、公開 C API、JSON の behavior configuration から成る。Unity と Unreal Engine の両方へ統合され、50〜200 NPC の範囲で sub-linear な性能 scaling と frame budget 内の実行を報告している。補足ページには Unity の市場デモ、Unreal のダンスクラブデモ、framework source、project report、両 engine の sample project が公開されている。

## why_relevant_to_games

大量 NPC の「賢い最適計画」ではなく、有限記憶と遷移履歴で安価に行動のばらつきを作る実装例として、群衆・背景キャラクター・反復行動の設計に使える。
