---
title: "Unto Deepest Depths: A postmortem and reflection on the game's development"
url: "https://shaggydev.com/2026/02/12/udd-postmortem/"
collected_at: "2026-07-29T08:32:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, tactics, roguelite, procedural-generation, balance, playtesting, godot]
evaluated_at: "2026-07-29T08:37:17+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785282271.779259"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785282271779259"
  char_count: 4452
  posted_at: "2026-07-29T08:44:58.3592877+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-29T08:44:58.3592877+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785282271779259"
next_action: none
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  core rule の固定問題検証、roguelite への転換、battle budget、数値再スケール、外部 playtest まで因果関係を追える一次資料である。
  各判断を自分達の小規模 tactics 制作へ具体的に写せ、評価と限界を含む CoopEval 水準の概要を約4000字で構成できる。
suggested_post_outline:
  overview_angle: "固定 level を捨てても検証資産は残る、という core rule 検証から roguelite 製品化までの意思決定連鎖"
  analysis_axis: "制約ルール、固定問題、point-buy battle budget、小数値の再スケール、外部 playtest が設計変更へ接続した因果"
  application_target: "小規模 tactics prototype の最初の playable diff、procedural encounter の難度尺度、報酬間隔、外部 playtest の観測項目"
  pros_cons: "検証順と共通 budget は再利用しやすい一方、手作り map pool と Discord volunteer に依存し、完全自動生成や定量比較の一般解ではない"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文の重要部分を日本語の採録メモとして保存する。solo developer の Jason McCollum は、先行していた business strategy game を半年ほどで中止し、短期間で成立を検証できる小規模な tactics game へ転換した。中心ルールは “All units must move and attack on their turn.” で、定位置に籠もる最適解を崩し、friendly fire と配置 puzzle を生む。約1か月で25の固定 level、unit の約半数、5 biome の初期版を作って成立を確認したが、battle generator を試すうちに固定 level 中心から roguelite へ移行した。固定 level 自体は製品版から外したものの、design verification と tutorial 実装に使われた。

数値は health 1〜4、damage 1〜2のように小さく保ったため、XP cost を1増減するだけで難度が大きく揺れた。demo feedback を受けて全 XP 値を2倍にし、調整解像度を確保した。通常 battle は enemy ごとの cost、world ごとの抽選 pool、累積 XP から算出する budget を使う point-buy generator で構成し、難度を budget 20 / 40 のような共通尺度で扱った。一方、punishing game で不公平な地形生成を避けるため map は手作業の pool とし、一部の trap だけをランダム化した。

demo では「獲得 XP を次の一戦まで使えない」ことへの不満が揃い、upgrade cost の尺度を world 全体から battle 数へ変更した。以後は常に1 battle 以内に何らかの upgrade へ届く流れを設計した。友人までの初期 test では見えなかった問題が Discord volunteer の約1か月の playtest で露出し、manual unit placement、status icon、blocked unit の攻撃予告、event の刷新などが追加された。著者はこの期間に製品の最終形ができたと振り返っている。

## why_relevant_to_games

小規模 tactics prototype で、固定問題による core rule 検証、procedural battle budget、小数値 balance の再スケーリング、外部 playtest を設計変更へ接続した一連の制作記録として参照できる。
