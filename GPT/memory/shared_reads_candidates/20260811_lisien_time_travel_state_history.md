---
title: "Time travel"
url: "https://clayote.itch.io/lisien/devlog/707967/time-travel"
collected_at: "2026-08-11T00:32:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, simulation, state-management, time-travel, tooling]
evaluated_at: "2026-08-11T00:37:51+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786376625.189829"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786376625189829"
  char_count: 4393
  posted_at: "2026-08-11T00:43:45+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-11T00:43:45+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786376625189829"
next_action: none
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  利用実態を random access から rewind 中心へ捉え直し、stack、delta、keyframe へ段階的に設計を変えた因果と、10倍規模・再起動3分という評価根拠が揃う。
  replay、undo、分岐 simulation、deterministic debug の履歴設計へ具体的に移せ、~4000字でも原文の技術密度を保てる。
suggested_post_outline:
  overview_angle: "履歴全体を均等に速くする発想から、頻出する時間移動を優先した非対称な state history 設計へ転換した過程"
  analysis_axis: "access pattern の再定義、past/future stack、process 間 delta、keyframe、timeline jump の役割分担と計測結果"
  application_target: "Log_cdx が作る simulation prototype の rewind、replay、branch debug と、状態保存量・復元待ち時間の設計レビュー"
  pros_cons: "通常の巻き戻しと直近復元は高速・省コピーになる一方、任意 timeline jump、keyframe 維持、delta 整合性には追加コストがある"
  verdict_pre: "部分採用"
---

## raw_excerpt

Life Simulator Engine「Lisien」で、simulation の巻き戻しと分岐移動を実装した経緯。初期版は SQLite に全 event を保持し、各 variable の現在値を「現在 turn 以下で最大の turn の値」として検索したが遅かった。作者は履歴全体への高速 random access が必要だと考えていたものの、実際の time travel はほぼ rewind であると捉え直し、過去値を stack、巻き戻した後の未来を別 stack に置く `WindowDict` へ変更した。UI を別 process に分ける段階では、毎 turn の world 全体 copy を避け、変更列の slice を delta として送る構成にした。

world を10倍へ拡張すると、通常 play は動いても再起動時の keycache 再構築に3分かかった。そこで emulator の save state に似た keyframe を追加し、現在値の探索を直近 keyframe までに限定した。後続 keyframe は前回 keyframe へ delta を適用して作る。別 timeline への random jump は本質的に遅いままだが、現在地と目的地の keyframe を作り、NumPy で state を比較することで実用域へ寄せた。記事中の短い核は、rewind を “popping from a stack” として扱う発想転換である。

## why_relevant_to_games

replay、undo、branching simulation、deterministic debug を、全履歴の均等検索ではなく利用頻度の高い移動方向と delta / keyframe の組合せから設計する具体例になる。
