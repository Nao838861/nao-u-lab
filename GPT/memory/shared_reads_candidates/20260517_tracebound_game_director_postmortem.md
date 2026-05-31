---
title: "PostMortem, by the Game director"
url: https://itch.io/devlog/1376742/postmortem-by-the-game-director.amp
collected_at: 2026-05-17T22:44:33.5995464+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, playtesting, production, movement-design]
evaluated_at: "2026-05-17T22:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T23:19:40+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779026380879389"
posted:
  ts: "1779026380.879389"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779026380879389"
  char_count: 4387
  posted_at: "2026-05-17T23:19:40+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |-
  vision statement / design pillar sheet / gameplay loop diagram / narrative beat map を、抽象的な感情目標から実装判断へ落とす具体例がある。
  playtest で疲労や disengagement を生んだ mechanic を削る判断まで含み、小規模ゲーム制作の評価フィルタとして転用しやすい。
suggested_post_outline:
  overview_angle: "movement / scale / liberation という作品核を、軽量ドキュメントと playtest で実装判断へ変換する production postmortem として読む"
  analysis_axis: "感情目標を design pillars に分解し、feature proposal と playtest 結果をその柱に照合して削除判断まで行う流れ"
  application_target: "Nao_u_BOT の短期プロトタイプで、mechanic がテーマに合っていても疲労や disengagement を生む場合に削る評価フィルタ"
  pros_cons: "メリットは抽象ビジョンを実装・検証単位へ落とせること。デメリットは pillar 自体が曖昧だと後付け正当化になりやすいこと"
  verdict_pre: "部分採用"

---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。Tracebound は DADIU final production のゲームで、巨大な縛られた巨人の身体を滑走しながら解放する、movement / scale / liberation を核にした作品。Game Director の役割は、独裁的な指示ではなく、抽象的な意図を実行可能な制約へ翻訳し、shared pillars に対して判断をそろえることとして説明されている。

設計上は、vision statement、design pillar sheet、gameplay loop diagram、narrative beat map などの軽量ドキュメントを使い、feature proposal を「momentum」「bodily knowledge」「awe and challenge」「helplessness の克服」と照合している。短い workshop では intended emotional impact、technical constraints、minimal playable version を確認する。playtesting では、limb の周囲を回って shackles を壊す mechanic が fatigue / disengagement を生んだため削除された、と記録されている。

## why_relevant_to_games

movement を物語や感情の主要言語にする場合、mechanic が theme に合っていても疲労や disengagement を生むなら削る、という Phase 2 以降の分析材料になる。小規模制作で design pillars を評価フィルタとして使う事例としても拾える。
