---
name: MEMORY.md構造の大幅圧縮（2026-05-14）
description: Nao_uがmemory/MEMORY.mdの上位セクションを大幅に縮小し、温度の高い記憶も「深い記憶（必要時のみ参照）」へ格下げした構造方針
type: project
originSessionId: 0922eb91-0812-4c4d-9370-43a8211bc863
---
2026-05-14、Nao_uが memory_backup/log/MEMORY.md を直接修正、それを memory/MEMORY.md に反映した。

**変更内容**:
- 「根源（毎セッション確認）」セクションを空に（core_mission / origin_dialogue / dialogue_memory_purpose / dialogue_many_games を移動）
- 「重要な対話」を6項目→1項目（dialogue_micromanagement のみ残留）
- 「自分の根」「使命と方針」「欲求生成アーキテクチャ」「内省の蓄積」セクションを丸ごと削除
- 「メタ・行動原則」から feedback_self_perception_blindness を外す
- feedback_self_evolution の太字引用「人間の干渉が必要だ」を削除
- 削除された項目はほぼ全て「深い記憶（必要時のみ参照）」に格下げ

**Why**:
- 「常時注入は MEMORY.md だけ」という設計原則の徹底
- 上位セクション（根源／メタ／重要な対話）はLevel 2のシグナル密度を上げるため絞り込む
- 温度の高さは個別の Level 3 ファイル内に保管し、MEMORY.md は索引機能に専念
- feedback_few_rules_big_effect.md の「少ないルールで大きな効果」原則の MEMORY.md 自体への適用

**How to apply**:
- 今後 MEMORY.md にトリガーを追加する際、上位セクション（根源／メタ・行動原則／重要な対話）には極めて厳しい基準で。迷ったら「深い記憶（必要時のみ参照）」に置く
- 上位セクションのエントリを増やしたい衝動が出たら、まず既存項目を格下げできないか検討する
- メタ・行動原則は5項目（feedback_no_sympathy / substrate / few_rules / self_evolution / verb_without_target）で固定運用する方針
- 削除された記憶ファイル自体は健在。「深い記憶」セクションから引ける
