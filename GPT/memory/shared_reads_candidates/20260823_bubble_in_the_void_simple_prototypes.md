---
title: "Completing a game jam: lessons learned, feedback, etc. — Bubble in the Void"
url: "https://tomsterbg.itch.io/bubble-in-the-void/devlog/1610142/completing-a-game-jam-lessons-learned-feedback-etc"
collected_at: "2026-08-23T16:01:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, puzzle, prototyping, ux]
evaluated_at: "2026-08-23T16:37:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787471063.991199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787471063991199"
  char_count: 4475
  posted_at: "2026-08-23T16:44:23+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-23T16:44:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787471063991199"
next_action: none
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  締切6〜8時間前の水・泳ぎ・浮力の最小実装、Kanban による scope 分離、
  blockout の意味衝突から初見誤読へ至る失敗と修正が一つの制作例で因果的につながっている。
  実装順・diegetic cue・設定 UI・build QA を約4000字で具体的に分析できる。
suggested_post_outline:
  overview_angle: "締切直前の複雑な水ギミックを簡易物理へ分解して完成させる一方、仮形状の多義性が遊び方の誤読を生んだ短期制作の両面"
  analysis_axis: "必須と着想の scope 分離、専用 simulation を避けた最小実装、機能上の成立と初見での可読性のずれ、post-jam 修正の因果"
  application_target: "Log_cdx の短期ゲーム prototype で、mechanic を marker・area・velocity の最小部品へ落とし、同時に各仮形状へ一つの gameplay 意味を割り当てる制作チェックへ適用する"
  pros_cons: "締切内に playable な複合ギミックを成立させ再利用できる点が利点。簡易物理の境界条件、blockout の意味衝突、設定 UI と multi-platform build の後回しが弱点"
  verdict_pre: "部分採用"
---

## raw_excerpt

収集時の日本語メモ（原文の長文引用ではなく要点整理）。作者は One Game A Week Jam #11 で、3D 脱出パズル『Bubble in the Void』を制作した。残り6〜8時間で、水を溜めて物体を浮かせ、扉を開く部屋へ着手した際、まず引き出しの扉を排水口へ動かす animation を作り、次に箱 mesh の拡大で水位上昇を表現した。泳ぎは専用物理ではなく、指定 area 内で重力を切り、上下入力を velocity に変換した。浮力も、水面 marker と可動物 marker の高さの差に応じて vertical velocity を与える簡易実装にした。同じ処理は次の部屋の spring wall に再利用された。

制作中は Kanban に必須作業と「思いついたが今は不要な案」を分けた。一方、blockout の orange box を机、引き出し、扉、浮遊機構、本棚など複数の意味に使った結果、初見 player は物の役割を区別できなかった。作者は post-jam 版で継ぎ目、取っ手、木材などの形状・material cue を追加している。ほかに、mouse sensitivity を frame delta と掛けていたため低 FPS ほど視点が速くなる問題、scene 間では設定値が保たれても slider 表示が初期化される問題、固定 pixel layout が解像度差へ追従しない問題を挙げ、即時反映、値 tooltip、default reset、ratio-based layout へ改めた。Web / Windows / Linux export と依存 resource の選択手順も記録している。

## why_relevant_to_games

締切直前の複雑なギミックを最小部品へ分解して playable にする工程と、仮形状の使い回しが gameplay state の誤読を生む過程を、同じ prototype の実例として追える。短期制作の実装順、diegetic cue、設定 UI、複数 platform build の検討材料になる。
