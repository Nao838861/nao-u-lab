---
title: "Post-release Postmortem"
url: https://itch.io/devlog/1452824/post-release-postmortem.amp
collected_at: 2026-05-17T22:44:33.5995464+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, roguelike, scope, narrative, llm, game-jam]
evaluated_at: "2026-05-17T22:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-17T22:56:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-17T22:56:00+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  短期 jam で scope を削る判断、LLM narrative の薄さ、vibe coding の debug 負債という論点は有用。
  ただし素材は制作反省の箇条書きに近く、問題設定・手法の中核・評価の中身を CoopEval 水準の概要へ展開するには根拠量が足りない。

---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。Coherence は HTML5 browser game の post-release postmortem で、7DRL の短期制作を振り返っている。うまくいった点として、inventory management、loot mechanics、damaged modules を含む初期 scope を切り、map generation や room placement の debug に時間を使った後、battle-loot 要素を survival-puzzle に入れる余裕がないと判断したことが挙げられている。

失敗点として、実装前に「新しい」アイデアを考える時間が大きくなり、紙に落とすと期待ほど噛み合わなかったこと、同じ level を探索すると repeated dialogs が puzzle 理解を混乱させたこと、vibe coding で game engine 的な機能を再発明して debug が重くなったことが書かれている。学びとして、feature creep を避けるため scenario を mechanics より前に構造化すること、LLM は雰囲気作りには使えるが、読者が考え込むような重要 narrative は浅くなりやすいことが挙げられている。

## why_relevant_to_games

短期制作で「新規性探し」「scope 削減」「LLM narrative の浅さ」が同時に出た例として保存する。Phase 2 で、ゲーム jam 的な短期プロトタイプと LLM 補助の境界を考える材料になる。
