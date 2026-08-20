---
title: "Flavors of Challenge: The 8 Flavors of Difficulty and How They Can Be Combined to Make Better Difficult Games"
url: "https://media.gdcvault.com/gdc2026/Slides/Moody_Brett_FlavorsOfChallenge.pdf"
collected_at: "2026-08-20T21:16:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, difficulty, challenge-design, player-engagement, gdc-2026]
evaluated_at: "2026-08-20T21:21:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-20T21:28:25.427089+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787228905427089"
next_action: none
stale_after: "2026-09-19"
supersedes: []
gate_reason: |-
  公式スライドから8種の challenge の定義、0-10 profile による3作品の比較、離脱を抑える momentum・learning・purpose の設計策まで抽出できている。
  難度を一軸の数値ではなく負荷の配合として診断し、ボス・ステージ・retry loop の具体的な評価表へ落とせるため、CoopEval 水準の概要と独立した適用分析を構成できる。
suggested_post_outline:
  overview_angle: "難易度を8種の challenge profile として分解し、配合と提示方法が継続意欲をどう左右するかを3作品の比較で説明する"
  analysis_axis: "分類の有用性と主観的0-10採点の限界を分け、難度量ではなく負荷の種類・retry cost・成長実感・意味づけの関係を検討する"
  application_target: "Log_cdx のボス・ステージ評価で、認知、実行、乱数、ゲーム内外資源、表現負荷、持久、対人の各要求と retry friction を別欄で記録する"
  pros_cons: "設計会話と比較評価を具体化できる一方、数値は測定値ではなく診断用の仮説であり、playtest結果と混同すると精密さを装う危険がある"
  verdict_pre: "部分採用"
posted:
  ts: "1787228905.427089"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787228905427089"
  char_count: 4467
  posted_at: "2026-08-20T21:28:25.427089+09:00"
---

## raw_excerpt

GDC 2026 で Brett Moody が提示した difficulty 分解のスライド。長い逐語引用を避け、公式資料の重要部分を日本語で採取する。講演は、難しいゲームの差を単一の「難易度」量ではなく、Reasoning、Physicality、Randomness、Out-Game Resources、Representation、Endurance、Interpersonal Skills、In-Game Resources という8種の challenge の配合と提示方法として扱う。Reasoning は明示・暗黙の問いや批判的思考、演繹、pattern recognition、Physicality は計画に対する実行技能、Randomness は行動前の input randomness と行動後の output randomness に分ける。Out-Game Resources には金銭だけでなく setup、play、tedium、waiting として消費される時間や、ゲーム外知識も含める。Representation は題材や表現が要求する情動的負荷、Interpersonal Skills は相手理解、交渉、teamwork、欺き、明確な伝達などを含む。

各 challenge は 0-10 の profile として Getting Over It、Sekiro の Guardian Ape、Titan Souls の Eye Cube へ当てはめられる。後半では、困難から離脱させない設計として、現実の skill growth とゲーム内 growth を組み合わせる、並行 challenge を用意する、challenge の種類を変える、reward に次の方向を持たせる、勝利だけでなく努力も報いる、大きな challenge を早く予告する、quit より retry を容易にする、run-back のような time-tax を避ける、再開時に完全なゼロへ戻さない、苦労に意味を与える、共同の敵や narrative stakes を作る、という観点を列挙する。まとめでは、momentum、learning、purpose を最大化し、勝利の記憶へ接続することが中心に置かれる。

## why_relevant_to_games

ボス、ステージ、ゲーム全体の「難しい」を一軸で扱わず、どの負荷を混ぜているかを profile 化する入口になる。headless 評価で physical execution、retry cost、resource accumulation などを別指標へ分ける場面にもつながる。
