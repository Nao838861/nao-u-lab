---
title: "\"I Don't Have Faith in the Developers to Use My Feedback\": Understanding Player Values and Expectancy for Reporting Systems in Video Games"
url: "https://arxiv.org/abs/2605.02842"
collected_at: "2026-05-27T10:45:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multiplayer, moderation, player-feedback, trust]
evaluated_at: "2026-05-27T11:22:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T10:58:26+09:00"
last_decision: posted
stale_after: "2026-06-26"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779847094040729"
posted:
  ts: "1779847094.040729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779847094040729"
  char_count: 3520
  posted_at: "2026-05-27T10:58:26+09:00"
next_action: none
gate_reason: |-
  expectancy-value theory、分散アンケート n=98、follow-up interviews n=19 という方法が明確で、問題設定・評価・結論を抽出できる。
  通報だけでなく、プレイヤーからの評価・リアクション・フィードバック UI 全般の信頼設計へ具体的に転用できる。
suggested_post_outline:
  overview_angle: "reporting を単なる入力機能ではなく、プレイヤーが価値と期待を見積もる信頼システムとして扱う研究として書く。"
  analysis_axis: "altruistic/retributive motive、期待される結果、開発者 reputation、透明性、community alignment の関係で分析する。"
  application_target: "ゲーム内フィードバック、評価、通報、リアクション UI で『入力後に何が起きると信じられるか』を設計項目に入れる。"
  pros_cons: "メリットは調査設計が明確で UI 設計に移せること。デメリットは multiplayer moderation 文脈が中心で、ソロ作品には抽象化が必要なこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt

収集メモ。arXiv:2605.02842。Michael Yin、Chenxinran Shen、Robert Xiao による CSCW 2026 採択論文。対象は multiplayer video games の reporting systems。プレイヤーが toxic behavior などに対して report する行為を expectancy-value theory の観点で調べ、分散アンケート n=98 と follow-up interviews n=19 を使って、プレイヤーが reporting にどんな価値を置くか、どんな結果を望むか、その結果が実現されるとどれほど期待しているかを扱っている。

要旨上の発見は、reporting の動機が altruistic と retributive の両方を含むこと。プレイヤーは短期的な revenge や納得を求める一方、長期的にはコミュニティ改善も望む。ただし、reporting が本当に目的を果たすかどうかへの信頼は、開発者の reputation、reporting の透明性、コミュニティとの alignment などに左右される。論文は reporting systems の価値と期待を理解することで、ゲーム内 moderation と今後の reporting design へ示唆を出す。

## why_relevant_to_games

ゲーム内フィードバック UI や通報/評価/リアクション設計で、「入力欄を置く」だけではなく、プレイヤーがその入力の効力を信じられるかを見る材料になる。
