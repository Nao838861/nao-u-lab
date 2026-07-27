---
title: "Select-to-Act: Hierarchical Reinforcement Learning via Adaptive Language Guidance"
url: "https://arxiv.org/abs/2606.22350"
collected_at: "2026-06-26T07:45:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, reinforcement-learning, language-guidance, agent-evaluation, strategy]
evaluated_at: "2026-07-28T03:21:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T03:21:03+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T03:21:03+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  selector / executor 構造と RTFM の評価条件は抽出できるが、baseline ごとの定量差、学習安定性、失敗条件が候補本文にない。
  bot policy や tutorial hint への接続は具体的でも、現資料だけで CoopEval 水準の評価内容を支えると一般化を過剰にするため fail とする。
---

## raw_excerpt
arXiv 2606.22350。Select-to-Act は、自然言語 instruction を RL agent に与える時、全 instruction を一つの条件として混ぜるのではなく、現在状態に応じて relevant な guidance piece を選び、その選択された guidance を低レベル action policy に渡す hierarchical framework。著者らは HRLLI と呼び、高レベル policy を selector、低レベル policy を executor として同時に学習させる。問題設定は、実環境やゲームでは「全部の説明が常に同じ重要度」ではなく、探索序盤、戦闘直前、アイテム取得後など、段階ごとに効くヒントが変わる、という点にある。

評価は RTFM benchmark。RTFM は text-based gridworld で、player、monsters、collectible items、task description、wiki-style instruction を持つ。論文では、instruction set を sentence-level に分解し、single-monster / two-monster、structured language / natural language、shuffled instruction などの条件で比較する。結果の要点は、stage-dependent instruction selection を明示的に学ぶ HRLLI が、instruction-conditioned baseline より安定し、無関係または順序の乱れた instruction に対しても崩れにくいというもの。

## why_relevant_to_games
ゲーム AI や headless bot に「全部のルールを常時読む」のではなく、現在局面に効く短い指示を選ばせる設計として拾える。自作 prototype の bot policy や tutorial hint 設計にも接続しやすい。
