---
title: "Pixie: Code-Level Mechanic Generation for Game Designers"
url: https://ojs.aaai.org/index.php/AIIDE/article/view/36824
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [automated-game-design, mechanics, unity, design-tools, procedural-generation]
---

## raw_excerpt
短い原文句: "generating and testing game mechanics" / "any Unity project" / "design companion"。

メモ: AIIDE 2025 掲載論文。既存の Automated Game Design は専用 codebase 上で mechanics を発明することが多いが、Pixie は Unity project に導入し、簡単な annotation で探索範囲と目的を設定して、code-level の mechanic を生成・テストする system として説明されている。複数の open-source Unity games で mechanic 生成を示し、開発者視点で design companion としての有用性を議論する。既存ゲームに「少し違う相互作用」を追加するための実装寄り研究。

## why_relevant_to_games
Nao_u prototype の小さな playable diff を作る時、「新 mechanic 候補をコード差分として出し、試す」発想に直結する。Unity 前提だが、annotation で探索範囲を絞る設計は JS/Python の小作にも転用できる。
