---
title: "Design and Preliminary Evaluation of a Smart Orthotic Videogame Controller Dedicated to Children"
url: https://link.springer.com/article/10.1007/s10439-026-04035-7
collected_at: 2026-05-17T16:59:44+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [accessibility, controller-design, haptics, rehabilitation-game, input-design]
---

## raw_excerpt

Springer Nature / Annals of Biomedical Engineering 掲載。Playcuff という wearable device を、上肢に運動障害のある子ども向けの videogame controller 兼 dynamic orthosis として設計・試験した論文。記事ページの abstract では、対象は motor disabilities を持つ子どもで、ゲームにアクセスし楽しめるようにすることが目的だと説明されている。入力は device 上の 2 つの inertial sensors から特徴を取り、firmware 内の two-tiered Fine Tree classifier で forearm / wrist の姿勢・動作を 22 classes に分類する構成。分類精度は 94% 超、子ども 19 名の試験では回答が appreciation 側に強く寄り、controller classes と game input の対応は browser configuration interface で設定する。

実装上の細部として、Xbox Adaptive Controller を PC 側の videogame suite へ接続する橋渡しに使い、Playcuff から受けた分類結果を conventional joystick buttons / analogue sticks へ変換する。入力の安定化では、直近 6 classes を見て 3 つ以上が一致した時だけ command を受け入れる 0.3 秒 window を使い、classification noise と motor uncertainty をならす。ゲームごとの gesture selection では、できるだけ in-game action と意味的につながる動作を選んだ、と書かれている。

短い原文メモ: "wireless wearable controller" / "semantically tied to the in-game action" / "filters out classification noise"。

## why_relevant_to_games

アクセシブル入力を「既存ゲームへ後付けする装置」ではなく、gesture 分類、ノイズ平滑化、ゲーム側アクション意味との対応まで含めて設計しているため、独自操作系や身体入力プロトタイプの候補材料になる。
