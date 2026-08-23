---
title: "Cutting Five Levels Is The Hardest Thing I've Ever Done And It Almost Killed Me"
url: "https://itch.io/devlog/1623006/cutting-five-levels-is-the-hardest-thing-ive-ever-done-and-it-almost-killed-me.amp"
collected_at: "2026-08-23T13:18:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, level-design, playtesting, difficulty, postmortem, mobile, game-jam]
evaluated_at: "2026-08-23T13:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-23T13:25:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-23T13:25:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  30面を作った開発者自身の操作熟達と controller 偏重が初見難度を歪めた問題を、初心者としての再試行、入力 device 差、短時間離脱という観察から5面削除と許容幅拡大へ戻した因果が具体的である。
  成績の高さと到達しやすさを分けて読み、単一作者の自己報告という限界も含めれば、短期 prototype の難度校正へ適用できる約4000字の批判的概要を構成できる。
suggested_post_outline:
  overview_angle: "作り手の熟達で見えなくなった初見難度を、面数削減と成功判定の許容幅へ変換した mobile 再調整"
  analysis_axis: "jam 順位や content 量ではなく、初心者の失敗回数、入力 device、想定 play 時間を難度証拠としてどう結び直したか"
  application_target: "Log_cdx の短期 prototype で、作者の連続 play と初見条件を分離し、複数入力系・無習熟 run・序盤離脱点を同じ校正表で確認する工程"
  pros_cons: "削除と許容幅調整は短期間で到達率を改善できる一方、保持率や複数 player の測定値はなく、難所削除が奥行きを損なう可能性も別に検証が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

作者は 7 日間の jam で、初日に wind-up 操作の core mechanic を placeholder で試し、友人から面白いという反応を得た。原文には “In 7 days I had made 30 levels” とあり、必要十分だった 15 面を越えて、水・氷・泥・ramp・boost pad・UFO・train を追加した結果が記録されている。3,000 件超の応募中 16 位になった一方、作者自身は長時間の反復と controller 操作に熟達し、初見プレイヤーの難度感覚からずれていた。Level 12 を初心者のつもりで遊び直すと 5 回失敗し、keyboard や touchpad は controller より精密操作が難しいことも露出した。jam のプレイヤーは 3〜10 分しか遊ばないことが多く、習熟前に難所へ当たると離脱する。mobile 版へ向け、精密 steering を要求する 5 面を削除し、goal の終端を長くし、goal zone を広げ、train 間隔を空けた。作者はこの問題を “you get really, really good at it” と表現している。

## why_relevant_to_games

開発者の操作熟達と入力 device 差による難度の過小評価を、level 削除・許容幅・障害物間隔の具体調整へ戻した事例。短時間 playtest と複数入力系を使う難度校正に接続できる。
