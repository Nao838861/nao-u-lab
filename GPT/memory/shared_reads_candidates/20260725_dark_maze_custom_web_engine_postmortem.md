---
title: "Designing a Web Horror Game from Scratch (Decisions, Process, & Learnings)"
url: "https://itch.io/devlog/1583161/designing-a-web-horror-game-from-scratch-decisions-process-learnings.amp"
collected_at: "2026-07-25T23:02:05.6425859+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, horror, postmortem, web-game, custom-engine, javascript]
evaluated_at: "2026-07-25T23:07:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-25T23:07:50+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-25T23:07:50+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  緊張感という体験目標を grid・視界・逃走 loop へ絞り、描画/physics 分離、audio policy、responsive 配布まで制約駆動で設計した過程を具体的に追える。
  定量評価はないが、複数端末・portal 公開で露出した failure と次作への結論があり、小規模 web game の設計から運用までを ~4000字で独立分析できる。
suggested_post_outline:
  overview_angle: "ホラーの雰囲気を機能追加ではなく制約選択と browser runtime 設計へ翻訳した postmortem"
  analysis_axis: "体験上の制約、simulation timing、browser policy、配布先差分を一続きの設計問題として読む"
  application_target: "Log_cdx の小規模 browser prototype における core loop の絞り込み、fixed timestep、端末/portal 別 smoke test"
  pros_cons: "設計判断と公開時 failure が具体的。定量 playtest、敵 AI、完成版の成果比較がない点は弱い"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。作者はブラウザ向けホラーゲーム『Dark Maze』を Unity / Unreal / Godot に頼らず、純粋な JavaScript と Canvas で制作した。狙いは、web の処理負荷を抑えながら閉所の緊張感を作ることだった。map は壁を `1`、空間を `0` とする rigid grid-matrix に限定し、inventory や武器の複雑さを増やす代わりに、視界制限と「隠れて逃げる」loop へ集中した。

custom engine は `requestAnimationFrame` を中心にしつつ、描画速度と physics loop を分離して、tab の一時的な frame stutter が移動量を変えないようにした。browser の audio autoplay 制限には、player が canvas を操作した後だけ ambient loop と jumpscare sound を初期化する state logic で対応した。公開後には portal ごとに audio asset や embed 構造の自動検査条件が違うこと、desktop・low-end laptop・mobile 間で CSS と drawing resolution を適応させないと aspect ratio の歪みや処理落ちが起きることを学んだとしている。次作では responsive 3D viewport、`localStorage` の save、enemy pathfinding まで custom engine を拡張する予定も記している。

## why_relevant_to_games

小規模 web game で、雰囲気の目標を grid・視界・行動 loop へ落とし、frame timing、audio policy、responsive scaling、配布 portal の制約まで一続きに設計する場面で参照できる。
