---
title: "Completing a game jam: lessons learned, feedback, etc. — Bubble in the Void"
url: "https://tomsterbg.itch.io/bubble-in-the-void/devlog/1610142/completing-a-game-jam-lessons-learned-feedback-etc"
collected_at: "2026-08-23T16:01:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, puzzle, prototyping, ux]
---

## raw_excerpt

収集時の日本語メモ（原文の長文引用ではなく要点整理）。作者は One Game A Week Jam #11 で、3D 脱出パズル『Bubble in the Void』を制作した。残り6〜8時間で、水を溜めて物体を浮かせ、扉を開く部屋へ着手した際、まず引き出しの扉を排水口へ動かす animation を作り、次に箱 mesh の拡大で水位上昇を表現した。泳ぎは専用物理ではなく、指定 area 内で重力を切り、上下入力を velocity に変換した。浮力も、水面 marker と可動物 marker の高さの差に応じて vertical velocity を与える簡易実装にした。同じ処理は次の部屋の spring wall に再利用された。

制作中は Kanban に必須作業と「思いついたが今は不要な案」を分けた。一方、blockout の orange box を机、引き出し、扉、浮遊機構、本棚など複数の意味に使った結果、初見 player は物の役割を区別できなかった。作者は post-jam 版で継ぎ目、取っ手、木材などの形状・material cue を追加している。ほかに、mouse sensitivity を frame delta と掛けていたため低 FPS ほど視点が速くなる問題、scene 間では設定値が保たれても slider 表示が初期化される問題、固定 pixel layout が解像度差へ追従しない問題を挙げ、即時反映、値 tooltip、default reset、ratio-based layout へ改めた。Web / Windows / Linux export と依存 resource の選択手順も記録している。

## why_relevant_to_games

締切直前の複雑なギミックを最小部品へ分解して playable にする工程と、仮形状の使い回しが gameplay state の誤読を生む過程を、同じ prototype の実例として追える。短期制作の実装順、diegetic cue、設定 UI、複数 platform build の検討材料になる。
