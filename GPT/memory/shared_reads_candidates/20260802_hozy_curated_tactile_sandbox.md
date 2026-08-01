---
title: "Breakdown: Come On Studio on Creating the Cozy Sandbox Game Hozy"
url: "https://80.lv/articles/breakdown-come-on-studio-on-creating-the-cozy-sandbox-game-hozy"
collected_at: "2026-08-02T08:02:34.2220306+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, cozy-game, sandbox, game-feel, environment-design]
evaluated_at: "2026-08-02T08:09:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-02T08:09:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-02T08:09:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-01"
supersedes: []
gate_reason: >
  低緊張度を「何も起きないこと」ではなく、反応・音・配置制約・非強制の選択で成立させる問題設定と手法が具体的で、player 反応による設計変更まで抽出できる。
  操作感 prototype、所有感を壊さない環境改変、見せない設定と制作工数の切り分けへ直接適用でき、限界を含む ~4000字の概要を無理なく構成できる。
suggested_post_outline:
  overview_angle: "cozy を timer や失敗の除去としてではなく、反復操作の触覚的 feedback と選択を強制しない curated sandbox の設計として説明する"
  analysis_axis: "mop・家具の反応設計、物理制約、環境 R&D、player の所有感を傷つけた初期案の修正、内部設定と可視 content の分離"
  application_target: "Log_cdx の小規模 prototype で、移動・掃除・配置など反復 micro-action の game feel を先に検証し、プレイヤーが残したい状態を壊さない環境改変ルールを設計する場面"
  pros_cons: "メリットは低緊張度でも操作密度と自己決定感を作れる点。デメリットは反応作りの実装コスト、触られない content の増加、物理制約が自由度を狭める危険。"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語採録（逐語引用ではない）。Come On Studio は『Hozy』を、掃除、修理、家具配置を現実のような反応と音で行う、timer のない neighborhood restoration game として始めた。各操作そのものを楽しくするため、mop は移動方向へ向き、速度で傾き、濡れ跡を残し、潰れ方と音も変わる。家具も大きさに応じて cursor 追従と傾きを変え、絵は壁へ自動的に向き、object は壁を貫通せず、大型家具同士は積めない。score、失敗状態、「正しい」配置を要求せず、object を多く捨てる選択も許す構成を、開発中は curated sandbox experience と呼んでいた。

環境制作では camera angle に合う間取り、複数階、階段と掃除 mechanic の相性、部屋間の壁、汚れと不快感の境界を R&D した。初期には散らかった状態から environmental story を強く語ろうとしたが、player が残したい物を捨てたり、気に入った落書きを塗り潰したりすることを嫌がったため、より直接的な構成へ変更した。背景は level より目立たず、どの背景でも level が自立することを原則にした。外の詳細環境は Unreal Engine 上の工数を理由に見送り、各 location の人物史や気分など大量の裏設定は asset 制作を支える内部資料として使い、player へ全部は見せない。開発側によれば、各 level の隠れた content や mechanic のうち player が触るのは通常30〜40%程度だった。

## why_relevant_to_games

低い緊張度を「何もない状態」ではなく、物理反応・音・配置制約・選択の非強制で作る事例として、cozy gameのgame feelやsandboxの自由度を試作する場面に活用できる。
