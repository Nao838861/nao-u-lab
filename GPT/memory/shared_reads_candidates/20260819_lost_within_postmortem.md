---
title: "Into the asylum: A postmortem of Human Head Studios' Lost Within"
url: "https://www.gamedeveloper.com/business/into-the-asylum-a-postmortem-of-human-head-studios-i-lost-within-i-"
collected_at: "2026-08-19T07:30:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, prototyping, input-design, horror]
evaluated_at: "2026-08-19T07:34:53+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787092837.757679"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787092837757679"
  char_count: 4145
  posted_at: "2026-08-19T07:40:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-19T07:40:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787092837757679"
next_action: none
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  prototype が設計上の依存へ変わる過程と、stress 時の入力失敗を trace から局所補正した過程に、問題設定・施策・再テスト結果が揃っている。
  playable diff の昇格判定と入力救済へ具体的に適用でき、利点だけでなく技術的負債や過補正の限界まで含めて約4000字で分析できる。
suggested_post_outline:
  overview_angle: "『捨てる試作』が本番の依存へ変わる境界と、stress 下だけ入力を救済する診断手順を一つの制作 postmortem として追う"
  analysis_axis: "prototype の速度と置換コストの非対称性、表面上の操作不満を入力 trace と再テストで分解する因果推論"
  application_target: "短期 playable diff の production 化チェックと、追跡・戦闘など高負荷場面に限定した hit box・入力 lockout の評価 probe"
  pros_cons: "早期に代表体験を検証し局所修正できる一方、仮実装の依存化、隠れた保守費、入力補正による意図しない吸着や操作無視が生じうる"
  verdict_pre: 部分採用
---

## raw_excerpt

※長い逐語引用を避け、記事中の該当箇所を内容保持した日本語メモとして記録する。原文の節名は “Prototypes Became Systems”。

Human Head Studios は、移動、敵行動、物体探索、扉操作などを、企画が成立するか早く確かめるための prototype として実装した。承認後に本番向け system へ書き直す想定だったが、制作速度を優先して prototype を使い続けた結果、扉などが level design と game design の前提へ組み込まれた。後から置換すると他部門へ広く影響し、残る bug に対して programmer の時間も足りず、視点が扉を貫通する約5%の不具合を残すことになった。

記事は user test で表面上「追跡中の操作が不満」と報告された例も述べる。通常時には tap 移動と virtual stick が好評だったため、control scheme 全体ではなく stress 下の入力 trace を調べた。追われた player は locker や door を正確に tap できず、連打した後続入力が先に成功した行動を上書きしていた。そこで追跡時だけ対象の hit box を少し広げ、locker や door へ走る入力を受けた直後は短時間ほかの入力を無効にした。次回 test では control score が上がり、不満コメントが減ったと記録されている。

同じ記事では、高品質な数分間を作る vertical slice より、代表的体験と設計上の強弱を早期に確認できる proof of concept を採用したこと、物語変更が cinematic・level・game design の手戻りへ波及したことも報告されている。

## why_relevant_to_games

短期 prototype を playable diff へ育てる際の「捨てる試作」と「本番基盤」の境界、および stress 時だけ入力判定を補正する局所的な操作救済を検討する材料になる。
