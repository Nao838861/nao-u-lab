---
title: "Beyond Technical Debt: How AI-Assisted Development Creates Comprehension Debt in Resource-Constrained Indie Teams"
url: "https://arxiv.org/abs/2512.08942"
collected_at: "2026-08-19T13:45:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, indie-games, ai-assisted-development, production, technical-debt, team-process]
---

## raw_excerpt

Yujie Zhang による研究。分散・パートタイムで働く経験の浅いインディーゲーム開発者には、その条件に合う制作フレームワークが不足しているという問題から出発し、AI ツールを開発工程へ組み込む CIGDI（Co-Intelligence Game Development Ideation）Framework を提示する。対象は 3 人チームが 2D narrative game『The Worm's Memoirs』を制作した 3 か月間の reflective practice / autoethnographic study。分析対象として Jira task 157 件、GitHub commit 333 件、Miro board 13 件以上、reflection session 8 回を挙げ、Priority Criteria と Timeboxing という human-in-the-loop decision point を含む 7 段階の反復プロセスを記述している。

報告では、AI 支援が知識へのアクセスを広げ、認知負荷を軽減した一方、チーム自身が独力では作成・保守できない複雑さの system を構築できてしまう状態を “comprehension debt” と呼ぶ。動作する system を所有していても、その仕組みをチームが十分に理解していないため、変更時の脆弱性と AI 依存が残るという整理で、従来の code quality を中心とする technical debt とは区別している。論文は、AI 支援が skill acquisition の learning ladder になる場合と、dependency trap になる場合の境界を、資源制約の強いゲームチームの制作過程から検討対象にしている。

## why_relevant_to_games

少人数・短期間のゲーム制作で AI にコードや設計を任せる場面に対し、完成速度だけでなく「チームが後から理解・修正できるか」を工程記録から追う観点として使える。
