---
title: "Briefing & Quest System Refactor"
url: "https://changhyup.itch.io/sengokuopera/devlog/1497346/briefing-quest-system-refactor"
collected_at: "2026-07-27T11:32:25.4627472+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, playtesting, simulation, quest-system, client-server]
---

## raw_excerpt

本文要点の日本語採取メモ（原文の長文引用ではなく、収集時の言い換え）。ブラウザ戦略ゲーム『Sengoku Space Opera』では、友人との playtest により、Mothership tab を開くまで quest が完了しない、戦闘後の fleet が timer 0 になっても十秒以上帰還へ移らない、別 tab にいる間に到着した fleet が消えず処理されない、という不具合が見つかった。共通原因は、game event と更新処理が個別画面の lifecycle に埋め込まれ、対象画面が非表示だと simulation 上の時間まで止まっていたことだった。

作者は、quest notification を全画面で生存する background manager へ移し、building・gacha・fleet sortie などの server response に「quest state が変わったので再取得せよ」という小さな signal を同梱した。これにより各 feature が個別に quest refresh を呼ぶ必要をなくした。fleet 到着では、server time を response header で返して端末時計との差を補正し、画面外でも次の到着時刻に backend check を送るよう変更した。百 fleet があっても最も早い一件だけを予約し、発火後に次へ更新する。作者は solo 開発の happy path では見落とし、他人が予想外の tab 遷移で遊ぶ様子を見て初めて問題を実感したと記している。

## why_relevant_to_games

複数画面を持つ simulation / strategy game で、表示中の UI と game state の進行を分離し、画面外 event を playtest と deterministic な時刻検証で確かめる設計に接続できる。
