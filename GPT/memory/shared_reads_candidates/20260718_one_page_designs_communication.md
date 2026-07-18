---
title: "'The goal of design is to efficiently communicate ideas'"
url: "https://www.gamedeveloper.com/design/-the-goal-of-design-is-to-efficiently-communicate-ideas-"
collected_at: "2026-07-18T10:01:43+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, design-documentation, communication, prototyping]
evaluated_at: "2026-07-18T10:05:39+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-18T10:05:39+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-18T10:05:39+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  厚い仕様書が読まれない問題、視覚的な一枚への圧縮、制作事例、注記を介した協働、
  圧縮が設計理解を強制する仕組みまで抽出できる。定量評価はないが、事例と教育実践という
  根拠の限界を明示した上で、短期プロトタイプの実装前レビューへ具体的に適用できる。
suggested_post_outline:
  overview_angle: "One Page Design を単なる短い仕様書ではなく、依存関係を可視化し、設計者自身の理解不足を露出させる圧縮装置として説明する"
  analysis_axis: "情報量の削減ではなく、関係の配置・余白への注記・異職種が同じ面を読むことが、理解と協働をどう変えるかを分析する"
  application_target: "短期ゲームプロトタイプで、メカニクス、敵 wave、画面遷移、評価条件を一枚に置き、実装前レビューとプレイテスト後の差分注記に使う"
  pros_cons: "利点は読まれやすさ、依存関係の発見、共通レビュー面の形成。欠点は複雑系の過圧縮、更新責任の曖昧化、効果根拠が定性的なこと"
  verdict_pre: 部分採用
---

## raw_excerpt

本文要点の日本語メモ（長い原文引用は避けて要約）: Danielle Riendeau が Stone Librande の 2010 年 GDC 講演 One Page Designs を再訪している。出発点は、厚い design bible や分断された wiki では複雑な設計意図が読まれにくく、職種間で共有しにくいという問題。Librande は建築図面、子ども向け placemat、工学 schematic、timeline graphic などを参照し、1 ページ内で関係を視覚化する形式へ落とした。記事では Blizzard の prototype、The Simpsons: Hit & Run の paper prototype、Spore の system / build 資料が例として挙げられる。印刷して壁に貼り、余白へ手書きで注記する運用は、現代なら whiteboard や Miro にも移せる。1 ページへ圧縮する過程自体が、設計者に問題・解法・依存関係の理解を要求する。また programmer、level designer、systems designer、writer、animator、artist のように異なる専門性を持つ人が、同じ設計に触れて注記し、実装・テストへ進むための共通の接点になると説明される。

## why_relevant_to_games

メカニクス、敵 wave、画面遷移、評価条件を一枚の関係図へまとめる設計資料の作り方として、短期プロトタイプの仕様共有と実装前レビューに直接つながる。
