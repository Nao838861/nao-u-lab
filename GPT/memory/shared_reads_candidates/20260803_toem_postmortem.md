---
title: "Postmortem: TOEM"
url: "https://www.gamedeveloper.com/production/postmortem-toem"
collected_at: "2026-08-03T11:46:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, prototyping, photography-game, indie-development]
evaluated_at: "2026-08-04T01:05:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-04T01:05:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-04T01:05:06+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-03"
supersedes: []
gate_reason: >-
  四度の方向転換と中断を経て、「何をするゲームか」を説明できるcamera操作へ核を置き直し、mechanicと白黒aestheticが一致するまでの検証過程が具体的である。
  prototype、custom tool、制作体制と資金面まで評価材料があり、制作サイクルへの適用を含む約4000字の概要を無理なく構成できる。
suggested_post_outline:
  overview_angle: "説明不能だったadventure prototypeが、写真を撮る動詞を核にmechanicとaestheticを一致させるまでの五版の変遷を整理する"
  analysis_axis: "見た目や設定ではなく、playerが繰り返す行為でconceptを検証し、専用toolで小さな反応を量産可能にした制作判断"
  application_target: "新規game prototypeの早期評価で、中心動詞を一文で説明できるか、操作が狙う観察速度を自然に生むかをbuildごとに確認する"
  pros_cons: "大幅な捨て直しがmechanicとaestheticの整合を生む一方、長い探索期間と資金・外部協力への依存を許容する条件整理が必要"
  verdict_pre: "採用"
---

## raw_excerpt

Game Developer に掲載された、Something We Made の Lucas Gullbo と Niklas Mikkelsen による開発ポストモーテム。TOEM は最初から写真ゲームだったのではなく、mobile 向け point-and-click puzzle として始まり、Android demo の反応では puzzle game と受け取られた。チームは adventure game を望んでいたが、GDC などで見せても “we could never explain WHAT you do in it” という状態が続き、見た目・雰囲気・設計を4回変えた末、2019年初頭に一度開発を止めた。

再始動時には、過去版の telescope が top-down から一人称へ視点を変えた体験を拾い直し、camera、photo album、bus travel、登場人物、cassette tape を組み合わせた第5版へ全面転換した。数週間の prototype は、camera を閉じた時に登場人物が “Great photo!” と反応するなど挙動を仮実装したものだったが、写真を撮るために速度を落とし、白黒の景観を観察する遊びが初めて aesthetic と一致した。その後は、視線に反応する NPC や一定時間見ると起こる event を素早く試せる custom tool を作り、地域ごとの小さな出来事を追加した。記事は二人の中核開発、外部協力者、incubator、資金と為替、port 費用を含む完成までの経緯も記録している。

## why_relevant_to_games

prototype の見た目ではなく「何をするゲームか」を説明できる操作へ核を置き直した制作例として、game concept の再構成と mechanic／aesthetic の接続を調べる場面に使える。
