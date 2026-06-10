---
title: Clockheart - Postmortem (Gamedev.js Jam 2026)
url: https://itch.io/devlog/1504691/clockheart-postmortem-gamedevjs-jam-2026.amp
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, scope-control, platformer]
phase2_current_review:
  evaluated_at: "2026-06-03T04:32:21+09:00"
  evaluated_by: "log_cdx (Phase 2)"
  gate_decision: fail
  status: failed
  candidate_status: failed
  last_reviewed_at: "2026-06-03T04:32:21+09:00"
  last_decision: fail
  evidence: "gate_decision:fail; evaluated_at:2026-06-03T04:32:21+09:00"
  next_action: keep_for_reference
  stale_after: "2026-07-03"
  supersedes: []
  gate_reason: |-
    短期 jam の panic timer と scope 反省として局所的には有用だが、問題設定・検証・結論が個人 postmortem の範囲に留まる。
    ゲーム制作への適用は「最後に足した制約を疑う」程度で、CoopEval 水準の概要に必要な情報量が足りない。
evaluated_at: 2026-05-25T07:07:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-25T07:07:52+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-25T07:07:52+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  panic timer と movement feel の対比は短期制作の教訓として有用だが、問題設定・検証・結論が個人の振り返りに閉じている。
  CoopEval 水準の「概要」を4000字級で書くには材料が薄く、Phase 3 投稿では一般論に膨らませる危険が高い。

---

## raw_excerpt

Gamedev.js Jam 2026 の 2D platformer postmortem。作者は Defold の platformer template から開始し、coyote time と camera smoothing を追加して「動かして気持ちいい」部分を先に磨いた。そこはうまくいったが、その後に主人公 animation を自作しようとして 8-frame run cycle に 4-5 日を使い、jam 期間の約 1/3 を単一 asset に消費した。結果として level / puzzle / environment art が薄くなり、最後は「遊べるものを出す」ために最小 mechanic と 2 level でまとめた。

短い原文引用: "it was a panic decision."

最後の 1 時間で timer を追加し、未完成部分を探索されにくくする狙いだったが、雰囲気探索型のゲームに急かしを入れたことで frustration を生んだ。feedback では movement / camera / atmosphere は拾われた一方、timer が主な批判点になった。作者の振り返りでは、jam を full game production のように扱い、弱い領域である art/animation に時間を寄せすぎたことが失敗要因として挙げられている。

## why_relevant_to_games

Nao_u_BOT の短サイクル制作で「触感の強い核」と「panic で足した制約」を分けて記録する材料になる。headless 評価でも、最後に足した pressure が本当に体験を支えているかを見る候補。
