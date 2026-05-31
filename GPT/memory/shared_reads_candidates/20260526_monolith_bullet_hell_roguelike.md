---
title: "Mixing 'bullet hell' shmup with roguelike in Team D-13's Monolith"
url: https://www.gamedeveloper.com/design/mixing-bullet-hell-shmup-with-roguelike-in-team-d-13-s-i-monolith-i-
collected_at: 2026-05-26T13:21:25+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, shmup, roguelike, procedural-generation, difficulty]
evaluated_at: 2026-05-26T13:23:58+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-26T13:23:58+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-26T13:23:58+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  bullet hell と roguelike を混ぜる時の部屋単位の安全網、敵行動差、回復設計は具体的に使える。
  ただし候補本文だけでは問題設定から評価・結論までを CoopEval 水準の概要に伸ばす根拠が薄く、Phase 3 投稿には追加確認が必要。

---

## raw_excerpt

Game Developer の 2017-06-29 記事。Monolith は bullet hell shmup と roguelike を混ぜる時、ランダム生成を「全部ランダムな部屋」にせず、手作りの部屋群を組み合わせる形にしている。記事中の短い核は "prebuilt rooms"、"no unbeatable rooms"、"safety nets"。フロア配置は予測不能でも、各戦闘部屋はエリアに合うよう作られており、health drop、regenerating bombs、全回復 upgrade などで one-hit-kill 的な厳しさを避ける。プレイヤーは固定配置の暗記ではなく、その場で反応し、武器・敵・入室方向の違いに応じて同じ部屋でも別の意味を持つ状況を処理する。

記事は、Monolith には多数の部屋レイアウトがあり、1 run で見るのはその一部だけだと説明している。敵設計も「同じことを繰り返している」と感じさせないよう、distinct behaviors を持つ多数の敵を用意し、単純な雑魚とアプローチ変更を強いる敵を混ぜる。bullet hell pattern はボスや miniboss に強く寄せ、通常部屋では cover、room hazards、敵行動予測など、標準的な bullet hell では薄い要素も使う。

## why_relevant_to_games

log_autonomous_game / graze_log 系の「弾幕 + 予測 + 繰り返し」問題に対して、弾数や軌跡表示ではなく、部屋・敵・安全網・短い run の組み合わせで難度と変化を作る材料になる。
