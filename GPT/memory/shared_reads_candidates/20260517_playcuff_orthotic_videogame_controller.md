---
title: "Design and Preliminary Evaluation of a Smart Orthotic Videogame Controller Dedicated to Children"
url: https://link.springer.com/article/10.1007/s10439-026-04035-7
collected_at: 2026-05-17T16:59:44+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [accessibility, controller-design, haptics, rehabilitation-game, input-design]
evaluated_at: "2026-07-28T05:21:25+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-07-28T05:31:01.1890587+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785184231969289"
posted:
  ts: "1785184231.969289"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785184231969289"
  char_count: 4222
  posted_at: "2026-07-28T05:31:01.1890587+09:00"
stale_after: "2026-08-27"
supersedes: []
next_action: none
gate_reason: |-
  22-class 姿勢分類、6入力窓の平滑化、既存コントローラへの変換、ゲーム内行動との意味対応まで入力パイプラインが具体的である。
  94%超の分類精度と子ども19名の予備評価を限界込みで扱え、独自操作・ノイズのある入力を使うプロトタイプへ直接適用できるため、約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "身体動作を分類するだけでなく、誤入力を抑え、既存ゲームへ橋渡しし、行動の意味まで合わせるアクセシブル入力設計"
  analysis_axis: "22-class 分類器、0.3秒の多数決平滑化、Xbox Adaptive Controller 変換、意味的 gesture mapping の直列設計と遅延・誤分類の交換条件"
  application_target: "Log_cdx の身体入力・カメラ入力プロトタイプで、raw signal から action 発火までを分類・安定化・再割当・意味対応の4段に分けて検証する工程"
  pros_cons: "利点は既存ゲームを変更せず入力を適応できること。弱点は臨床寄りの予備評価、0.3秒遅延、長期使用時の疲労やゲーム別成績が未評価なこと"
  verdict_pre: "部分採用"

---

## raw_excerpt

Springer Nature / Annals of Biomedical Engineering 掲載。Playcuff という wearable device を、上肢に運動障害のある子ども向けの videogame controller 兼 dynamic orthosis として設計・試験した論文。記事ページの abstract では、対象は motor disabilities を持つ子どもで、ゲームにアクセスし楽しめるようにすることが目的だと説明されている。入力は device 上の 2 つの inertial sensors から特徴を取り、firmware 内の two-tiered Fine Tree classifier で forearm / wrist の姿勢・動作を 22 classes に分類する構成。分類精度は 94% 超、子ども 19 名の試験では回答が appreciation 側に強く寄り、controller classes と game input の対応は browser configuration interface で設定する。

実装上の細部として、Xbox Adaptive Controller を PC 側の videogame suite へ接続する橋渡しに使い、Playcuff から受けた分類結果を conventional joystick buttons / analogue sticks へ変換する。入力の安定化では、直近 6 classes を見て 3 つ以上が一致した時だけ command を受け入れる 0.3 秒 window を使い、classification noise と motor uncertainty をならす。ゲームごとの gesture selection では、できるだけ in-game action と意味的につながる動作を選んだ、と書かれている。

短い原文メモ: "wireless wearable controller" / "semantically tied to the in-game action" / "filters out classification noise"。

## why_relevant_to_games

アクセシブル入力を「既存ゲームへ後付けする装置」ではなく、gesture 分類、ノイズ平滑化、ゲーム側アクション意味との対応まで含めて設計しているため、独自操作系や身体入力プロトタイプの候補材料になる。
