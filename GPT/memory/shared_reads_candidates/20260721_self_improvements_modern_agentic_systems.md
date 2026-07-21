---
title: "Self-Improvements in Modern Agentic Systems: A Survey"
url: "https://arxiv.org/abs/2607.13104"
collected_at: "2026-07-21T13:15:45.7380231+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent, self-improvement, memory, evaluation, strategic-reasoning]
---

## raw_excerpt

arXiv の要旨と本文からの取得メモ（抄訳・要約）。本 survey は self-improving agent を、経験を累積能力へ変える adaptive system として整理する。現代の agent は foundation model 単体ではなく、prompt、memory、tool、control logic を組み合わせた operational scaffold との構成として表し、自己改善を model parameter または scaffold component へ更新を取得・commit する self-induced update operator として定式化する。既存手法は、更新対象が foundation model か scaffold か、また改善信号がどこから来るかで分類される。scaffold 側は prompt、memory、tool、full scaffolding に分かれ、model parameter 更新より速く可逆な適応経路として扱われる。

games and strategic reasoning 節では、ゲームは反復可能な interaction、明確な objective、拡張可能な feedback を備え、self-play で経験を生成できるため、自己改善 agent の testbed になるとする。改善経路は、self-play と outcome feedback で model / policy parameter を更新するものと、curriculum logic、planning routine、reusable skill を保存する memory structure など scaffold を進化させるものに分けられる。評価では static zero-shot score ではなく、固定 budget 下の learning trajectory、training signal 外への transfer、overhead cost、時間経過に伴う regression indicator を追う必要があると整理している。

## why_relevant_to_games

ゲーム agent の self-play、playtest、memory / skill 再利用を、model 更新と可逆な scaffold 更新に分けて収集・評価する際の用語と観測軸につながる。
