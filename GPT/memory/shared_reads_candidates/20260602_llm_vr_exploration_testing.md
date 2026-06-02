---
title: Harnessing large language models for virtual reality exploration testing: a case study
url: https://link.springer.com/article/10.1007/s10515-025-00535-3
collected_at: 2026-06-02T10:00:16+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, vr, llm-agent, spatial-understanding, headless-eval]
---

## raw_excerpt
Springer / Automated Software Engineering の open access 論文。対象は VR アプリの GUI exploration testing で、GPT-4o に FOV 画像を読ませ、テスト対象 entity の検出、特徴記述、シーン認識、空間関係理解、複数視点で同一 entity を追跡できるかを調べている。

短い原文抜粋: "field of view (FOV) analysis in VR exploration testing"

主要な数値メモ:
- prompt engineering で entity detection の平均精度が 41.67% から 71.30% に上がった。
- entity の特徴記述では color / placement / shape が中核特徴として扱われ、各特徴の記述精度は少なくとも 94.8%。
- scene recognition は 83.12%、spatial relationship understanding は 92.86%。
- ただし bounding box や座標ラベルのような entity labeling は弱く、黒箱圧縮や画像内座標化が制約として残る。
- 複数 FOV で同一 entity を判定する時、color + shape + placement の組み合わせが F1 0.70 で最良。

## why_relevant_to_games
3D/VR ゲームの headless 評価を「画面が見えているか」だけで終わらせず、FOV 内の対象識別、視点移動後の同一物追跡、空間関係のログ化へ広げる候補。特に一人称/3D探索ゲームで、LLM 視覚評価を座標操作へ直結させる前に何が得意で何が危ないかを切り分ける材料になる。
