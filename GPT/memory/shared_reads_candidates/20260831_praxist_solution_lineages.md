---
title: "Praxist: From Experimental Artifacts to Solution Lineages"
url: "https://arxiv.org/abs/2608.25955"
collected_at: "2026-08-31T23:50:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agentic-game-development, iterative-prototyping, evaluation, provenance, memory]
evaluated_at: "2026-09-01T00:00:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-09-01T00:14:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788189254472329"
next_action: none
stale_after: "2026-10-01"
supersedes: []
posted:
  ts: "1788189254.472329"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788189254472329"
  char_count: 4274
  posted_at: "2026-09-01T00:14:14+09:00"
gate_reason: |-
  独立 attempt で知見が失われる問題、typed evidence graph と cohort synthesis、75 task と4領域の評価まで重要要素を追える。
  playable build・評価結果・検証済み mechanism を同じ lineage に結ぶ形で、反復的なゲーム試作へ具体的に適用できる。
  成果値だけでなく追跡コストと evaluator 依存も論じられ、約4000字の概要と分析を構成できるため pass とする。
suggested_post_outline:
  overview_angle: "最良 artifact の単発生成から、検証済み知見を次世代へ継ぐ solution lineage への転換"
  analysis_axis: "typed evidence graph、lane-structured frontier、artifact 構築と cohort synthesis の分離、MLE-bench と異分野 case study の証拠範囲"
  application_target: "各 playable diff に build、headless・人間評価、効いた mechanism、未解決 claim、次の制約を結ぶ反復ゲーム制作ログ"
  pros_cons: "成功要因の再利用と失敗探索の重複削減が利点。記録粒度の設計コスト、evaluator 誤判定の継承、複雑な graph 運用が欠点"
  verdict_pre: "部分採用。まず build 単位の小さな lineage ledger として試す"
---

## raw_excerpt

arXiv abstract / HTML からの採取メモ。自律 R&D agent が実行可能 artifact を作り、自動評価を受けて改善する既存方式では、各 attempt がほぼ独立して扱われるため、どの design element が改善を生んだか、検証結果が後続でも維持されたか、別の知見とどう再結合できるかが記録から追いにくいとする。Praxist は、再現可能な artifact と evaluator outcome を、finding・lane-structured frontier・agenda からなる typed evidence graph に変換する lineage-centered generational system を提案する。個々の artifact 構築と cohort 単位の evidence synthesis を分離し、後続試行が検証済み mechanism、未解決 claim、有用 constraint を引き継げるようにする。75 task の MLE-bench では 60 medal（80.0%）、うち 49 gold を報告し、Claude Code baseline は 55 medal（73.3%）、34 gold。記録された model spend は 3,054 米ドル対 38,370 米ドル。さらに quantitative trading、LiDAR-inertial-visual SLAM、tokamak magnetic control、rocket landing の 4 case study で、artifact の discovery path を lineage として残しながら task-native baseline の改善を扱う。

## why_relevant_to_games

agent がゲーム prototype を何世代も改修する時に、build・評価結果・変更理由を「成功した最新版」だけでなく、検証可能な系譜として保持する制作 loop の資料になり得る。
