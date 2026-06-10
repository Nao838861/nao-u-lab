---
title: "Guerilla Prototyping: A Design Post-mortem of the Arcade Strategy Game HOARD"
url: "https://gdcvault.com/play/1015941/Guerilla-Prototyping-A-Design-Post"
collected_at: "2026-06-07T00:15:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, prototyping, iteration, production]
evaluated_at: "2026-06-07T00:17:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780759560.252029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780759560252029"
  char_count: 4498
  posted_at: "2026-06-07T00:46:00+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-07T00:46:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780759560252029"
next_action: none
stale_after: "2026-07-07"
supersedes: []
gate_reason: "短期・少人数・9か月 core development cycle で iteration 数を最大化する問題設定が明確。paper games、low-fi 2D、Excel level tools、modular systems design という手法群が制作サイクルへ直接写せるため、Phase 3 の概要化に足る骨格がある。"
suggested_post_outline:
  overview_angle: "少ない資源で iteration 数を増やすため、忠実度の異なるプロトタイプとデータ駆動のレベル設計を組み合わせた制作 postmortem として書く。"
  analysis_axis: "制約条件、paper/low-fi/Excel/modular の役割分担、selected mechanics から得た教訓、9か月開発で何を固定し何を検証したか。"
  application_target: "Nao_u_BOT の playable diff サイクル、実装前プローブ、レベル設計表、モジュール単位の検証順序に効く。"
  pros_cons: "メリットは低コストで検証回数を増やせること。デメリットは低忠実度プロトタイプが最終体験の質感や運用負荷を見落とす危険。"
  verdict_pre: "部分採用。実装速度を上げる目的ではなく、検証すべき不確実性ごとに道具を選ぶ評価軸として採用する。"
---

## raw_excerpt

GDC Vault の GDC 2012 Game Design セッション。Big Sandwich Games の Tyler Sigman による HOARD の design postmortem。Vault 概要では、短い時間と少ない資源の中で iteration 数を最大化するため、paper games、low-fi 2D prototyping、MS Excel level design tools、modular systems design を使ったとされる。HOARD は 9 か月の core development cycle で作られ、講演はその制約下で、conventional / non-conventional な道具をどう使い分けたか、selected mechanics から得た教訓も扱う。

短い原文メモ: "maximize iterations" / "paper games" / "low-fi 2D prototyping" / "modular systems design"

## why_relevant_to_games

短いサイクルで playable diff を積む現在の制作運用に直結する候補。実装前の紙面/低忠実度プロトタイプ、Excel 的なレベル設計表、モジュール単位の検証をどう組み合わせるかを見る材料になる。
