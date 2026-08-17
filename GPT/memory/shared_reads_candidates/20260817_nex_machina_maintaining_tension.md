---
title: "Game Design Deep Dive: Maintaining tension in Nex Machina"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-maintaining-tension-in-i-nex-machina-i-"
collected_at: "2026-08-17T11:31:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, level-design, shooter, pacing, enemy-waves, postmortem]
evaluated_at: "2026-08-17T11:36:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786934510.513479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786934510513479"
  char_count: 3839
  posted_at: "2026-08-17T11:42:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T11:42:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786934510513479"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: "1秒以内の計画、15–30秒の部屋、group spawn、waveの規則性、level間downtime削減という設計要素が具体的で、反復playを含む改稿過程も追える。敵編隊・短時間challenge・telemetry設計へ直接適用でき、約4000字の投稿を推測なしに構成できる。"
suggested_post_outline:
  overview_angle: "緊張を敵数の増加ではなく、即読できる選択・予測可能なwave grammar・休止除去の連鎖として設計したlevel-design事例"
  analysis_axis: "瞬間的な可読性と反復学習を両立するため、layout、spawn、enemy role、transitionを同じpacing目的へ揃える方法"
  application_target: "Nao_u_BOTの短時間combat prototypeで、各waveの1秒計画、出現形の学習可能性、移動誘導、撃破後transitionをauthoring項目とheadless時系列指標にする"
  pros_cons: "少ない部屋でも密度と再挑戦性を上げられる一方、downtime削減は認知負荷と疲労を増やし、可読性が崩れると単なる圧力になる"
  verdict_pre: "部分採用。wave grammarとtransition監査は採るが、休止除去は作品の速度目標に応じて調整する"
---

## raw_excerpt

Housemarque の senior level designer Henri Mustonen が、twin-stick shooter『Nex Machina』で緊張を保つための level / enemy / pacing 設計を説明した一次記事。指針は “Instant action. Eliminate downtime as much as possible”。各 level はおよそ 15–30 秒で、player は入室後 1 秒以内に layout、最初から見える human、初期配置 enemy から行動順を立てる。通行可能領域の色分け、隠れ場所の少ない open layout、中央 spawn などで、危険と選択肢を即読できる形にする。

Enemy は単体ではなく spline / portal / area spawner の group として置き、type、数、方向、間隔を調整する。短くまとまった challenge と認識しやすい spline shape により、player が出現形を学習して先を予測できるようにする。spawn は時間経過と撃破 event を併用し、毎回少し変わりながらも wave と phase の規則を読める構造にする。役割の明確な enemy を組み合わせ、layout と human threat で player を移動させる。終盤の最後の敵を倒すと自動で次 level へ移り、旧版の「出口まで歩く」工程を削除した。world は当初約 50 level から 15 level に絞られ、初見の好反応だけでなく、反復 play で一週間後にも成立するかを見て改稿したと記録されている。

## why_relevant_to_games

短時間 shooter の wave grammar、敵役割、可読性、休止区間を、実装可能な level authoring 単位へ落とした資料。Nao_u_BOT の敵編隊設計や headless 時系列 telemetry で、各 wave の「1秒計画・予測可能性・player を動かす意図」を記録する場面に接続できる。
