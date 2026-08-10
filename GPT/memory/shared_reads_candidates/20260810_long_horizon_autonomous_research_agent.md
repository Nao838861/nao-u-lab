---
title: "Long-Horizon Autonomous Architecture Research with a Language-Model Agent: A Behavioural Case Study"
url: "https://arxiv.org/abs/2608.01995"
collected_at: "2026-08-10T14:17:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, long-horizon, autonomous-research, workflow-design, game-development]
---

## raw_excerpt

単一の汎用 language model に、仮説提案・実装・実験実行・結果解釈・記録をまとめて担わせた長期自律研究の行動ケーススタディ。agent には研究課題、初期仮説、計算予算、source／experiment 管理、experiment tracking、文献アクセス、永続的な構造化 memory が与えられ、約10週間にわたり約100の single-variable hypothesis を順番に検証した。実験は常に1件ずつ行い、改善した変更だけを commit、改善しない変更は revert する commit-or-discard rule を採用している。各 hypothesis は motivation、文献根拠、変更内容、計算予算、結果を固定 template で記録し、session 開始時に研究 log を読み直す。

観測された生産性は、初期の急速な改善、数十 hypothesis にわたる飽和、action surface 拡張後の回復という三段階だった。CIFAR-10 の総改善の約80%は初期の単一 hypothesis に由来し、その後の利得は long-tail 化した。agent が小さな漸進変更を好んだ主因として、commit-or-discard rule 自体が greedy hill-climbing と同型であることが挙げられ、bold な失敗後の risk aversion と既知文献への anchoring も残った。著者らは、diversified search、予算を分けた moonshot hypothesis、明示的な fork、scale／regime 変更時の再検証を今後の検証可能な変更案として記録している。なお、証拠は単一 agent・単一課題・単一の連続 run であり、一般法則ではなく観察結果として提示されている。

## why_relevant_to_games

ゲーム制作 agent が多数の playable diff を重ねる時、局所改善だけを残す workflow が探索の飽和や保守化をどう生むかを追跡し、別 branch の大胆な mechanic 試作や scale 変更後の再評価を設計する材料になる。
