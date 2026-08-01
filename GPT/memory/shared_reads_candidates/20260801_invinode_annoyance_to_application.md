---
title: "From annoyance to a full application"
url: "https://drawfleshgames.itch.io/invinode/devlog/1579245/from-annoyance-to-a-full-application"
collected_at: "2026-08-01T21:32:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, visual-novel, tooling, workflow, postmortem, renpy]
evaluated_at: "2026-08-01T21:37:35.8269182+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-01T21:37:35.8269182+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-01T21:37:35.8269182+09:00"
next_action: keep_for_reference
stale_after: "2026-08-31"
supersedes: []
gate_reason: >-
  個人の反復的不便から自用 tool、別作品 import、友人試用、共同開発、製品化へ進む経路と、tool 開発がゲーム本体を圧迫する逆転は具体的で、内製 editor の境界を考える参照価値がある。
  ただし評価は単発の import 成功と友人の要望という事例記述に留まり、設計手法、比較条件、失敗の分析が薄い。CoopEval 水準の約4000字にすると一次資料を越えた補作が必要になるため投稿候補としては閉じる。
---

## raw_excerpt

一次資料の要点メモ（逐語引用ではない）。作者は Ren'Py で visual novel を制作する際、label や choice の流れを追いにくく、Twine のように story flow を視覚化したいという不満から、当初 Unity で個人用 tool を作り始めた。しかし実装負担が大きく一度中断し、その後 Django / React を扱う仕事で得た知識をきっかけに、2025年に自作 script の variable や choice を遡る苦痛へ再び直面して prototype を作り直した。初期版は本人の特殊な Ren'Py class / method の使い方には問題を抱えたものの、story flow の確認には実際に使えた。

2026年には本来の visual novel 2 chapter を完成させる目標と並行して tool を育てたため、game より application 開発へ時間を使う逆転も起きた。6月に import・確認・更新・export が通る状態となり、友人の別作品を読み込ませると error なく動作した。友人による試用と要望の往復を経て、個人用だった RVE は他者にも使える tool へ変化し、有料化の意見を得た。共同開発者が repository に参加して実装を担い、名称も InViNode へ変更され、itch.io で販売し website も公開した。現在は backlog を上回る機能要望が届き、共同開発者へ coding を寄せることで、作者自身は visual novel 制作へ戻る計画だという。

## why_relevant_to_games

制作中の反復的な不便を最小 tool で解き、別作品での import と他者の試用を境に製品化した一方、tool 開発が本体制作を奪う危険も示すため、内製 editor の着手・検証・委譲を考える材料になる。
