---
title: Grounding Natural Language Prompts in Expressive Super Mario Level Generation
url: https://openreview.net/forum?id=IlJMxS25fv
collected_at: "2026-08-18T02:01:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, pcg, level-generation, llm, evaluation]
---

## raw_excerpt

論文は、自然言語で制御する procedural content generation では、モデル性能だけでなく、言葉を対応づける構造表現とデータセットの意味的な細かさが結果を制約すると述べる。既存の Super Mario Bros. レベル生成ベンチマークでは、意味の異なる tile が同じ記号へまとめられ、gameplay に関係する tile が省かれることがある。そのため、自然言語では区別できる概念を出力表現では明示できず、grounding の失敗と表現自体の限界が混同される。

著者らは、意味的な範囲を広げた高 fidelity データセット MARIOPCG を導入し、複数の decoder-only language model を統制条件下で比較する。粗い表現では見えなかった instruction-following の制御失敗が、表現粒度を上げると小規模モデルで顕在化する。一方、大規模モデルも表現側が意味のある grounding を支える場合にのみ安定した挙動を示した。論文は新しい生成 architecture の提案より、表現の粒度が記述可能な指示の範囲と観測できる failure mode をどう変えるかの実証に焦点を置く。結論として、粗い意味表現で得た高い instruction-following 指標はモデル能力を過大評価し得るため、自然言語制御 PCG の評価では dataset semantic granularity を明示的に扱う必要があるとする。

## why_relevant_to_games

自然言語からレベル仕様を作る時、生成器を比較する前に、制作者が区別したい地形・敵・関係を中間表現と評価指標が保持しているかを点検する材料になる。
