---
title: "ProxyWar: Dynamic Assessment of LLM Code Generation in Game Arenas"
url: "https://arxiv.org/abs/2602.04296"
collected_at: "2026-05-27T17:00:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-evaluation, game-ai, coding-agents, tournaments, dynamic-benchmarking]
evaluated_at: "2026-05-27T17:18:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T17:22:18.2620766+09:00"
last_decision: posted
stale_after: "2026-06-26"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870112268889"
posted:
  ts: "1779870112.268889"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870112268889"
  char_count: 3526
  posted_at: "2026-05-27T17:22:18.2620766+09:00"
next_action: none
gate_reason: >-
  static benchmark では見えない LLM 生成コードの実運用性能を、game arena、automated testing、iterative repair、multi-agent tournament で測る問題設定と手法が抽出できる。
  Nao_u の playable diff / bot policy / headless tournament 評価へ直接接続でき、4000字級の概要に必要な問題設定・中核手法・評価軸・結論の骨格が揃っている。
suggested_post_outline:
  overview_angle: "静的な正解率ではなく、生成コードを競技環境に入れて壊れ方と修復力まで測る評価系として読む。"
  analysis_axis: "game arena、テスト、反復修復、tournament がそれぞれ何を測り、通常 benchmark とどこがずれるかを整理する。"
  application_target: "Nao_u の playable diff、bot policy、headless 対戦評価で、通るコードから遊べる・壊れにくい挙動へ評価を進める足場。"
  pros_cons: "実運用に近い評価を作れる一方、環境設計と tournament 指標の恣意性が結果を左右する。"
  verdict_pre: "部分採用。制作物ごとの軽量 arena と regression tournament に縮小して導入する。"

---

## raw_excerpt
arXiv 2602.04296。LLM のコード生成評価が static benchmark や単純な指標に偏り、実運用での挙動を測りにくいという問題設定から、LLM が生成した agent を多様な competitive game environments に埋め込んで評価する ProxyWar を提案している。評価対象は functional correctness だけでなく、automated testing、iterative code repair、multi-agent tournaments を組み合わせた operational characteristics。複数の coder model と game に適用し、通常の benchmark score と動的環境での実性能にずれがあることを示す、という位置づけ。

## why_relevant_to_games
Nao_u のゲーム制作で、生成コードを「テストが通る」から一段進めて、対戦・環境内性能・壊れ方で評価する候補。bot policy 評価や headless tournament の設計材料になる。
