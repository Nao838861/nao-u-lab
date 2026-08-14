---
title: "Rules of the Game 2026"
url: "https://media.gdcvault.com/gdc2026/Slides/Rouse_Richard_RulesOfTheGame.pdf"
collected_at: "2026-08-14T14:17:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, production, player-trust, innovation, narrative-choice, iteration]
evaluated_at: "2026-08-14T14:22:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-14T14:22:27+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-14T14:22:27+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-13"
supersedes:
  - memory/shared_reads_candidates/20260527_rules_of_game_2026_microtalks.md
gate_reason: |
  player trust の収支、innovation の配置、iteration の停止判断、illusion choice の効用を、制作事例と適用条件まで含めて抽出できる。
  旧 candidate に欠けていた各 rule の中核が PDF で補われ、既存 prototype の変更審査へ具体化できるため、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "5人の rule を列挙せず、期待を外す自由を得る trust と、変更コストを制御する制作判断の共通系として整理する"
  analysis_axis: "trust の蓄積と支出、innovation の局所化、iteration が改善か単なる差分かを分ける停止条件、illusion choice の感情的価値を比較する"
  application_target: "Nao_u_BOT の prototype で、変更案ごとに player expectation、検証範囲、state 分岐コスト、実現したい cool action を記録する設計・playtest 判断"
  pros_cons: "複数領域を同じ判断表へ接続できる一方、各 rule は講演者の経験則であり、定量評価や全ジャンルへの一般化は資料単体では保証されない"
  verdict_pre: "部分採用。trust budget と『better か merely different か』の停止質問を優先し、illusion choice は narrative prototype で限定検証する"
---

## raw_excerpt

GDC 2026 のセッション資料。Richard Rouse III が導入し、Theresa Duringer、Steve Meretzky、Joel Burgess、Ashley Ruhl、Xalavier Nelson Jr. が、それぞれ制作で使う counter-intuitive な rule を提示する。Duringer は player trust を通貨に見立てる。明確な rule、正確な UI、undo、refund、account recovery、accessibility などで trust を蓄え、jump scare、二段階 boss、randomization、厳格な turn timer のように期待を外す仕掛けへ支出する。Meretzky は新作を clone から未知の作品までの innovation spectrum 上に置き、player 層、platform、business model など、どこに新規性を置くかを考える。Burgess は iteration の際に「game を良くしているのか、単に違うものにしているのか」を一度止まって問う。BloodRayne 2 で追加案に過剰投資した失敗と、Oblivion の dungeon 改修を限定範囲で実証してから展開した例を挙げる。Ruhl は narrative choice を、後続 state が分岐する diverging choice と、直後の反応は違っても同じ state に戻る illusion choice に分ける。後者も roleplay、player 自身による character 解釈、選択した瞬間の感情的意味を作れるとする。最終一覧では Nelson の rule を “Let Your Players Do the Cool Thing” とまとめ、5つの rule を counter-intuitive game の設計材料として並べる。

## why_relevant_to_games

新規 mechanic、反復改修、narrative 分岐、UI の予測可能性を別々の話にせず、player trust と制作コストを含む trade-off として記述する時に参照できる。既存 prototype の変更理由や playtest 観点を言語化する場面に接続しやすい。
