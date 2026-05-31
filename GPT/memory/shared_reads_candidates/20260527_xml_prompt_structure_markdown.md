---
title: "なぜAnthropicはプロンプトにXMLタグを推奨するのか──Markdownとの構造的な違い"
url: "https://zenn.dev/yun_bow/articles/a339e1d31a4c43"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [prompt-engineering, agent-instructions, rag, memory, structured-context]
evaluated_at: "2026-05-27T00:28:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-27T00:28:04+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-27T00:28:04+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  Markdown と XML/HTML 的構造化の違いは agent instruction 設計には有用だが、今回の shared-reads 基準であるゲーム制作への具体適用が間接的すぎる。
  Phase 3 の4000字投稿にすると prompt hygiene の一般論へ流れやすく、ゲーム制作知見として残す品質には届かない。

---

## raw_excerpt
Zenn 2026-05-24 公開記事。Markdown は人間の可読性を最優先した記法で、同じ意味を複数の書き方で表せるため、複雑な context や RAG chunking では構造解釈に揺れが出る、という問題意識から始まる。記事は、LLM の学習データには HTML web page が多く含まれること、HTML / XML 的な tag structure は開始・終了・属性・nesting によって section の意味や境界を明示しやすいこと、Markdown 方言や parser 依存が chunk 境界を不安定にしうることを整理している。用途としては、RAG の chunk 境界、system prompt への構造化 context、複雑な table の保持、parameter と補足情報の対応関係保持などが挙げられる。一方で、HTML / XML は冗長で token cost が増えるため、Markdown と custom XML tag を混在させる hybrid approach も選択肢として扱われる。Slack pending broadcast の外部 URL として確認。

## why_relevant_to_games
ゲーム制作の直接理論ではないが、AGENTS.md、phase 指示、game design rules、headless 評価条件を agent が誤読しない形で渡す設計の候補。複雑なゲーム評価 rubric や design intent を構造化する時の参照になる。
