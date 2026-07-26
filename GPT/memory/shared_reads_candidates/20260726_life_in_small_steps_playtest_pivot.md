---
title: "Post-mortem: development process"
url: "https://itch.io/devlog/841464/post-mortem-development-process.amp"
collected_at: "2026-07-26T19:01:51.5134526+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, playtesting, puzzle, accessibility, iteration]
evaluated_at: "2026-07-26T19:06:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785060826.549449"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785060826549449"
  char_count: 4497
  posted_at: "2026-07-26T19:13:46.549449+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-26T19:14:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785060826549449"
next_action: none
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  polished の操作的定義、2週間 slice、5回の外部 playtest、難易度 progression 修正、説明追加で直らない mechanic の構造的 pivot が因果で追える。
  小規模制作の検証時期・tester bias・損切り・accessibility 先行設計へ具体的に適用でき、約4000字の概要と独自分析を組み立てられるため pass とする。
suggested_post_outline:
  overview_angle: "5人・5か月の puzzle game 制作で、短い vertical slice と外部 playtest が難易度再設計と非線形 mechanic の撤回をどう可能にしたかを因果で整理する。"
  analysis_axis: "polished の操作的定義、tester 選定 bias、説明不足と構造不一致の切り分け、2週間 cycle が sunk cost を抑えた条件、accessibility の先行列挙を軸に分析する。"
  application_target: "自分達の prototype で playable diff ごとに観察可能な合格条件を置き、外部 playtest の理解失敗を説明追加ではなく mechanic 構造変更へ切り替える判断に適用する。"
  pros_cons: "利点は短周期検証・段階的難易度・早期 accessibility を一つの制作工程として接続できる点。懸念は単一チームの自己報告で、売上や retention の定量評価がない点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

5人のチームが5か月で narrative puzzle game『Life in Small Steps』を制作した記録。チームは「polished」を、tester が迷わず論理を理解できること、映像・音・system が望む心理状態を一貫して作ること、通常操作では不具合がなく端を突く操作でも進行不能にならないこと、短時間で改善できる未処理項目を残さないこと、の4条件で定義した。作業は2週間単位の milestone に分け、各回を特定 feature の vertical slice として成立させた。最初の2週間後から外部 playtest を始め、3回の alpha と2回の beta を実施した。

初期 puzzle は、論理 puzzle が得意な programmer を最初の tester にしたため、多くの player には難しすぎ、章内の難易度進行も欠けていた。完成版では各 puzzle が直前の puzzle を土台にする構成へ改めた。また、mental state と服薬選択で puzzle difficulty が変化する非線形 mechanic は、player から「理由なく難易度が変わる」と受け取られた。dialogue の説明追加、専用選択画面、選択肢の縮小を試しても意図が伝わらず、3か月目に linear narrative と puzzle design へ切り替えた。短い cycle のため未使用部分を捨て、新案を早く再試験できた。accessibility feature は core concept 確定直後に列挙し、最終的に約90%を実装した。puzzle editor と非programmerも使える進行管理・version control も反復を支えた。

## why_relevant_to_games

短い playable slice と外部 playtest を接続し、説明を足しても理解されない mechanic を構造変更へ切り替えた制作記録として、prototype の検証時期・難易度 progression・accessibility の先行設計を考える場面に使える。
