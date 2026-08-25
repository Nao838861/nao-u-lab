---
title: "Scaling Unity workflows: Lessons from medium to large projects"
url: "https://unity.com/blog/scaling-workflows-lessons-from-medium-to-large-projects"
collected_at: "2026-08-25T15:04:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, unity, architecture, automated-testing, collaboration, postmortem]
evaluated_at: "2026-08-25T15:08:58+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T15:18:29.465249+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787638709465249"
next_action: none
posted:
  ts: "1787638709.465249"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787638709465249"
  char_count: 4474
  posted_at: "2026-08-25T15:18:29.465249+09:00"
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  試作優先から継続開発向け構造へ切り替える問題設定に対し、scene / prefab 分割、依存境界、gameplay test、資産検証、競合予防を一つの実務フローとして具体化している。
  統制実験ではなく出荷経験に基づく報告という限界を明示すれば、短期 prototype の昇格ゲートと headless gameplay check への適用まで含めて CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "『動けばよい試作』を、速度を殺さず出荷可能な Unity project へ移す五つの境界設計として整理する"
  analysis_axis: "architecture・test・asset validation・version-control hygiene・automation ROI が、障害修正より早期検出と競合予防へどう接続するかを分析する"
  application_target: "短期 playable prototype を継続開発へ昇格させる判定、headless gameplay requirement、asset / scene の機械検査、small commit 運用に適用する"
  pros_cons: "具体的で段階導入しやすい一方、Unity 固有 API が多く、効果の定量比較ではなく一社の出荷経験に依存する"
  verdict_pre: "部分採用。原則と昇格ゲートは採用し、Unity 固有の実装は各 prototype の engine と規模に合わせて翻訳する"
---

## raw_excerpt

Mega Cat Studios が『Backyard Baseball』を出荷可能な状態へ移す過程で得た、Unity プロジェクトの拡張に関する実務メモ。試作中はまず動作を優先してよいが、試作段階を抜けた後は、その作り方が負債になると述べる。具体策は、用途別の資産整理、巨大 scene を避けた additive scene と自己完結 prefab、Component / ScriptableObject / class の単一責任化、interface や event による疎結合、Assembly Definition による依存境界の強制である。

テストについては “Tests work as a list of requirements.” とし、投球速度、盗塁タイミング、打球接触、軌道、player-controller flag など、ゲームプレイ上の期待結果を unit test で記述する。資産側では AssetPostprocessor と OnValidate で import 設定や参照欠落を早期検出する。共同作業では小さな commit、main からの日次 merge、専門家 review、scene / prefab の text serialization、資産 ownership を用い、衝突を解くより衝突を予防する運用を紹介している。一方で、10分の手作業を自動化するために10日を費やすべきではないという実用上の上限も置く。

## why_relevant_to_games

短いゲーム試作を playable のまま育てる際、どの時点で設計境界・自動検証・資産規約へ移るかを考える材料になる。とくに「操作結果を requirement としてテスト化する」という接続は、headless gameplay check の設計に直接参照できる。
