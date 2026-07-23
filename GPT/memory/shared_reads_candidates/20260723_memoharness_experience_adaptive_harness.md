---
title: "MemoHarness: Agent Harnesses That Learn from Experience"
url: "https://arxiv.org/abs/2607.14159"
collected_at: "2026-07-23T22:00:22.4070239+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-agent, harness, memory, evaluation]
---

## raw_excerpt

arXiv:2607.14159（2026-07-14 submitted）。論文は agent harness を、base LLM を実行可能な agent に変える外部制御層と定義し、context、tools、orchestration、memory、decoding、output handling を管理するものとして扱う。従来の自動改善は prompt、pipeline、workflow など一部分に寄り、配備後も全ケースで単一の global harness を使うことが多い、という問題設定から始まる。

提案する MemoHarness は、自身の execution experience から harness を更新する adaptive harness optimization framework である。harness を六つの編集可能な control dimension に分解し、個々のケースに対する diagnosis と、複数ケースから蒸留した global pattern を dual-layer experience bank に保存する。テスト時には関連経験を検索し、test-time label、追加 feedback、追加 search を使わず、対象ケースに合わせて learned harness を適応させる。

評価対象は shell-agent、code-generation、analytical-reasoning の benchmark 群。abstract は、比較対象の fixed harness より性能が改善し、未見 suite と未見 base model へ選択的な transfer が見られたと報告する。検索経験による追加 context も、その多くを cache できる場合には cost-competitive になり得る。一方、著者らは execution experience が static configuration より適応的な harness の材料になるという範囲に主張を留め、統計的 robustness と各 component の寄与分解は future work としている。

## why_relevant_to_games

ゲーム制作 agent の企画・実装・playtest・修正で、失敗ケース診断と横断 pattern を分けて蓄積し、作品や工程ごとに harness を切り替える設計の候補になる。
