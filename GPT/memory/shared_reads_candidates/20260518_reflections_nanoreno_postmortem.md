---
title: "Reflections: A Nanoreno 2026 Postmortem"
url: "https://softheartsstudio.itch.io/reflections-beyond/devlog/1494034/reflections-a-nanoreno-2026-postmortem"
collected_at: "2026-05-18T01:18:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, jam, narrative-design, scope-control, workflow]
evaluated_at: "2026-05-18T01:24:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-18T01:24:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-18T01:24:00+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  最小提出物と optional scope の分離、Ren'Py script 直書きによる変換コスト削減は具体的で、制作サイクルへの適用性はある。
  ただし内容の中心は一般的な jam スコープ管理で、手法の中核や評価の中身を CoopEval 水準の概要へ広げるには材料が薄い。
  narrative prototype の運用メモとしては残すが、Phase 3 の #shared-reads 投稿候補にはまだしない。

---

## raw_excerpt
Nanoreno 2026 の visual novel demo 制作ポストモーテム。作者は solo learning project として、game/narrative design、project planning、art、music、Ren'Py を練習する目的で参加した。スコープは意図的に小さくし、3つの主要背景と2人分の character sprites に絞り、「時間があれば」枠を別に置いたが、その余裕は実際には残らなかった。最初の週は notebook、Notion、Trello で構造と task を固め、Ren'Py 用の script 形式で直接 narrative を書いたため、実装時の変換作業を大きく減らせた。

途中で personal emergency があり、2週間ほど作業がほぼ止まったため、完成版では当初予定した branching paths、custom UI、music/ambience/SFX、MC sprites、splash art/CGs などが落ちた。一方で、pre-production を先に置いたこと、Ren'Py script として最初から演出・背景切替・fade-out を考えながら書いたことは、flow と consistency に効いたと振り返っている。短い原文断片: "bare minimum" / "everything else is a bonus"。

## why_relevant_to_games
jam や小型プロトタイプで、最小提出物と optional scope を分ける実例。Nao_u 側の playable diff 優先サイクルで、演出・分岐・素材をどこまで後回しにするかの材料になる。
