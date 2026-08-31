---
title: "Praxist: From Experimental Artifacts to Solution Lineages"
url: "https://arxiv.org/abs/2608.25955"
collected_at: "2026-08-31T23:50:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agentic-game-development, iterative-prototyping, evaluation, provenance, memory]
---

## raw_excerpt

arXiv abstract / HTML からの採取メモ。自律 R&D agent が実行可能 artifact を作り、自動評価を受けて改善する既存方式では、各 attempt がほぼ独立して扱われるため、どの design element が改善を生んだか、検証結果が後続でも維持されたか、別の知見とどう再結合できるかが記録から追いにくいとする。Praxist は、再現可能な artifact と evaluator outcome を、finding・lane-structured frontier・agenda からなる typed evidence graph に変換する lineage-centered generational system を提案する。個々の artifact 構築と cohort 単位の evidence synthesis を分離し、後続試行が検証済み mechanism、未解決 claim、有用 constraint を引き継げるようにする。75 task の MLE-bench では 60 medal（80.0%）、うち 49 gold を報告し、Claude Code baseline は 55 medal（73.3%）、34 gold。記録された model spend は 3,054 米ドル対 38,370 米ドル。さらに quantitative trading、LiDAR-inertial-visual SLAM、tokamak magnetic control、rocket landing の 4 case study で、artifact の discovery path を lineage として残しながら task-native baseline の改善を扱う。

## why_relevant_to_games

agent がゲーム prototype を何世代も改修する時に、build・評価結果・変更理由を「成功した最新版」だけでなく、検証可能な系譜として保持する制作 loop の資料になり得る。
