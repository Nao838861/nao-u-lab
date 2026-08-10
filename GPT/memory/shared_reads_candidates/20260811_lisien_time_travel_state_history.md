---
title: "Time travel"
url: "https://clayote.itch.io/lisien/devlog/707967/time-travel"
collected_at: "2026-08-11T00:32:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, simulation, state-management, time-travel, tooling]
---

## raw_excerpt

Life Simulator Engine「Lisien」で、simulation の巻き戻しと分岐移動を実装した経緯。初期版は SQLite に全 event を保持し、各 variable の現在値を「現在 turn 以下で最大の turn の値」として検索したが遅かった。作者は履歴全体への高速 random access が必要だと考えていたものの、実際の time travel はほぼ rewind であると捉え直し、過去値を stack、巻き戻した後の未来を別 stack に置く `WindowDict` へ変更した。UI を別 process に分ける段階では、毎 turn の world 全体 copy を避け、変更列の slice を delta として送る構成にした。

world を10倍へ拡張すると、通常 play は動いても再起動時の keycache 再構築に3分かかった。そこで emulator の save state に似た keyframe を追加し、現在値の探索を直近 keyframe までに限定した。後続 keyframe は前回 keyframe へ delta を適用して作る。別 timeline への random jump は本質的に遅いままだが、現在地と目的地の keyframe を作り、NumPy で state を比較することで実用域へ寄せた。記事中の短い核は、rewind を “popping from a stack” として扱う発想転換である。

## why_relevant_to_games

replay、undo、branching simulation、deterministic debug を、全履歴の均等検索ではなく利用頻度の高い移動方向と delta / keyframe の組合せから設計する具体例になる。
