---
title: "How Double Fine balances fun with pottery sculpting in Kiln"
url: "https://www.gamedeveloper.com/design/how-double-fine-balances-fun-with-pottery-sculpting-in-kiln"
collected_at: "2026-05-19T23:20:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, player-expression, prototype-to-production, playtesting]
evaluated_at: "2026-05-19T23:23:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-19T23:30:54+09:00"
last_decision: posted
stale_after: "2026-06-18"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779201047326029"
posted:
  ts: "1779201047.326029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779201047326029"
  char_count: 3503
  posted_at: "2026-05-19T23:30:54+09:00"
next_action: none
gate_reason: |
  問題設定は「作れる形が遊びに接続していない」ことで、陶芸表現を性能・当たり判定・移動条件へ接続する設計判断が具体的に取れる。
  厳密シミュレーションを捨て、プレイヤーが体感できる差だけを残す判断も、短期プロトタイプの制約設計へ直結する。
  評価は商用記事ベースで定量ではないが、制作過程・失敗理由・修正方向が揃っており、CoopEval 水準の概要を書ける。
suggested_post_outline:
  overview_angle: "陶芸ツールの自由度を、対戦中の性能差と読みやすい当たり判定へ変換する設計過程として書く。"
  analysis_axis: "現実再現、創作ファンタジー、ゲーム上の可読な差分のどれを残すかという取捨選択。"
  application_target: "自作ゲームのキャラ/武器/地形エディタで、見た目の自由度をそのまま遊びの入力にせず、少数の性能軸へ畳む判断に効く。"
  pros_cons: "メリットは創作とゲーム本編が分断しないこと。デメリットは形状差を簡略化しすぎるとプレイヤーの作品性が消えること。"
  verdict_pre: "部分採用。物理や形状を厳密化する前に、プレイヤーが読める性能軸へ落とす設計チェックとして使う。"

---

## raw_excerpt
Game Developer の 2026-04-21 記事。Double Fine の Kiln は Amnesia Fortnight 2017 のゲームジャム試作から始まり、陶芸ホイールで作った壺や瓶を使ってオンライン対戦する作品。記事は、試作段階では「変な形のものを作れる」だけで、その形がゲームプレイへ十分に接続していなかったため、制作チームが「作った形が意味を持つ」状態を作ろうとした流れを扱っている。陶器の形は、移動、攻撃、水容量、当たり判定、低い穴を通れるかなどに関係する。衝突判定は形状を厳密に追う方式から、最も広い点と高さを使う簡略カプセル系の判定へ寄せ、プレイヤー体験として欲しい差だけを残した。実物の陶芸は失敗や崩壊も含めて面白いが、ゲーム内では「現実に近い摩擦」がプレイヤーのファンタジーを阻害したため、シミュレーションから表現体験へ引き戻したという記録になっている。

## why_relevant_to_games
「作れるもの」と「遊びの性能」が接続する設計例。創作ツール部分が本編を食う時、どの制約を残してどれを削るかを見る候補。
