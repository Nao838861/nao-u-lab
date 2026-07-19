---
title: A Memory-Driven Action Selection Framework for Scalable Ambient NPC Behavior
url: https://www.csd.uwo.ca/~ebuitron/
collected_at: 2026-07-19T21:32:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, npc, open-world, behavior-selection, memory, performance]
evaluated_at: "2026-07-19T21:38:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-19T21:38:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-19T21:38:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  frame budget 下で多数の ambient NPC に変化を作る問題設定、action graph と bounded memory による選択則、engine-agnostic 実装、Unity/Unreal と50〜200 NPCでの評価まで抽出できる。
  高価な online planning を避けつつ背景 NPC の反復感を減らす具体策としてゲーム制作へ直結し、手法・評価・限界を分けた4000字級の概要を構成できる。
suggested_post_outline:
  overview_angle: "ambient NPC の賢さを深い計画ではなく、action graph と有限な遷移記憶で低コストに多様化する実装研究として整理する。"
  analysis_axis: "行動グラフ、未試行または最長未使用遷移を優先する選択則、bounded memory、C API/JSON 構成、Unity・Unreal での50〜200 NPC評価を軸に見る。"
  application_target: "Log_cdx の群衆・背景キャラクター実装で、個体ごとの履歴を小さく保ちながら同じ行動の連続を避け、frame budget と見た目の変化を同時に計測する層。"
  pros_cons: "探索器なしで多数 NPC を安価に変化させられる一方、目的志向の長期計画や意味のある社会行動は保証せず、グラフ設計の質に振る舞いが強く依存する。"
  verdict_pre: "部分採用。ambient 層の反復抑制に限定し、重要 NPC の意思決定系とは分離する。"
---

## raw_excerpt

Western University の Eric Buitron Lopez と Roberto Solis-Oba による、IEEE Conference on Games 2026 採択予定の研究。対象は、open-world game で多数の ambient NPC に多様かつ文脈に合う行動をさせながら、厳しい frame budget を超えないための action selection である。NPC の振る舞いを action の有向グラフとして定義し、bounded memory が未試行または最も長く使われていない遷移を優先することで、online planning や search を毎回実行せずに行動の変化を作る。実装は engine-agnostic な C++ shared library、公開 C API、JSON の behavior configuration から成る。Unity と Unreal Engine の両方へ統合され、50〜200 NPC の範囲で sub-linear な性能 scaling と frame budget 内の実行を報告している。補足ページには Unity の市場デモ、Unreal のダンスクラブデモ、framework source、project report、両 engine の sample project が公開されている。

## why_relevant_to_games

大量 NPC の「賢い最適計画」ではなく、有限記憶と遷移履歴で安価に行動のばらつきを作る実装例として、群衆・背景キャラクター・反復行動の設計に使える。
