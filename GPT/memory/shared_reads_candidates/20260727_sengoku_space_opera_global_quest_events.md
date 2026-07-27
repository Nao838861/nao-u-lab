---
title: "Briefing & Quest System Refactor"
url: "https://changhyup.itch.io/sengokuopera/devlog/1497346/briefing-quest-system-refactor"
collected_at: "2026-07-27T11:32:25.4627472+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, playtesting, simulation, quest-system, client-server]
evaluated_at: "2026-07-27T11:37:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785120387.288489"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785120387288489"
  char_count: 4445
  posted_at: "2026-07-27T11:46:54.3076947+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-27T11:46:54.3076947+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785120387288489"
next_action: none
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  非表示 UI に simulation 更新を結び付けた共通原因から、global manager、server signal、clock 補正、最早一件だけの予約へ直す因果が具体的である。
  友人 playtest の意外な tab 遷移という発見経路と検証限界も明示でき、複数画面 game の設計・再現テストへ無理なく適用できるため、約4000字の深い分析を支えられる。
suggested_post_outline:
  overview_angle: "三つの別症状を UI lifecycle と simulation clock の誤結合という一つの原因へ束ね、画面外でも進む event 基盤へ直した playtest 起点の refactor"
  analysis_axis: "event ownership、server-authoritative time、signal と state fetch の分離、最早 deadline 一件だけを予約する timer 設計、非 happy path の観察"
  application_target: "複数 scene / tab を持つ Nao_u_BOT の simulation prototype で、表示状態に依存しない quest・enemy・resource event と deterministic な画面外遷移テストを作る"
  pros_cons: "pros は症状横断の単一原因化と feature 間結合の削減。cons は playtest が少数で、timer drift、offline 復帰、重複 signal、server failure の定量検証が未提示"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語採取メモ（原文の長文引用ではなく、収集時の言い換え）。ブラウザ戦略ゲーム『Sengoku Space Opera』では、友人との playtest により、Mothership tab を開くまで quest が完了しない、戦闘後の fleet が timer 0 になっても十秒以上帰還へ移らない、別 tab にいる間に到着した fleet が消えず処理されない、という不具合が見つかった。共通原因は、game event と更新処理が個別画面の lifecycle に埋め込まれ、対象画面が非表示だと simulation 上の時間まで止まっていたことだった。

作者は、quest notification を全画面で生存する background manager へ移し、building・gacha・fleet sortie などの server response に「quest state が変わったので再取得せよ」という小さな signal を同梱した。これにより各 feature が個別に quest refresh を呼ぶ必要をなくした。fleet 到着では、server time を response header で返して端末時計との差を補正し、画面外でも次の到着時刻に backend check を送るよう変更した。百 fleet があっても最も早い一件だけを予約し、発火後に次へ更新する。作者は solo 開発の happy path では見落とし、他人が予想外の tab 遷移で遊ぶ様子を見て初めて問題を実感したと記している。

## why_relevant_to_games

複数画面を持つ simulation / strategy game で、表示中の UI と game state の進行を分離し、画面外 event を playtest と deterministic な時刻検証で確かめる設計に接続できる。
