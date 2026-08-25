---
title: "Scaling Unity workflows: Lessons from medium to large projects"
url: "https://unity.com/blog/scaling-workflows-lessons-from-medium-to-large-projects"
collected_at: "2026-08-25T15:04:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, unity, architecture, automated-testing, collaboration, postmortem]
---

## raw_excerpt

Mega Cat Studios が『Backyard Baseball』を出荷可能な状態へ移す過程で得た、Unity プロジェクトの拡張に関する実務メモ。試作中はまず動作を優先してよいが、試作段階を抜けた後は、その作り方が負債になると述べる。具体策は、用途別の資産整理、巨大 scene を避けた additive scene と自己完結 prefab、Component / ScriptableObject / class の単一責任化、interface や event による疎結合、Assembly Definition による依存境界の強制である。

テストについては “Tests work as a list of requirements.” とし、投球速度、盗塁タイミング、打球接触、軌道、player-controller flag など、ゲームプレイ上の期待結果を unit test で記述する。資産側では AssetPostprocessor と OnValidate で import 設定や参照欠落を早期検出する。共同作業では小さな commit、main からの日次 merge、専門家 review、scene / prefab の text serialization、資産 ownership を用い、衝突を解くより衝突を予防する運用を紹介している。一方で、10分の手作業を自動化するために10日を費やすべきではないという実用上の上限も置く。

## why_relevant_to_games

短いゲーム試作を playable のまま育てる際、どの時点で設計境界・自動検証・資産規約へ移るかを考える材料になる。とくに「操作結果を requirement としてテスト化する」という接続は、headless gameplay check の設計に直接参照できる。
