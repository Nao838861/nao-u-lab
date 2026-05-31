---
title: "Fly, Fail, Fix: Iterative Game Repair with Reinforcement Learning and Large Multimodal Models"
url: "https://arxiv.org/abs/2507.12666"
collected_at: "2026-05-26T17:52:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtest, automated-repair, reinforcement-learning, lmm]
evaluated_at: "2026-05-26T17:56:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-26T17:56:19+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-26T17:56:19+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  手法の重要要素と Nao_u 環境への適用軸は抽出できるが、同一論文は 2026-05-15 に pass 済みで #shared-reads 投稿済み。
  今回の candidate は既投稿を更新する新しい評価・適用差分を持たず、Phase 3 で再投稿すると重複投稿になる。

---

## raw_excerpt
arXiv abstract と Slack #shared-reads で拾われたメモからの収集要約。対象は、静的なゲーム設定やコードだけを見る生成システムでは、実際のプレイヤー行動に変換された時の失敗を捉えにくいという問題。提案は、RL agent をプレイテスターとして走らせ、複数 episode の数値メトリクスや短いフレーム列を作り、その行動 trace を LMM designer が読み、与えられた gameplay goal と現在の configuration に照らして設定を編集する反復ループ。人間のプレイテストを直接置き換えるというより、失敗検出、挙動観察、config 修正を閉じた小さいループとして示す。論文ページでは、RL agent の行動 trace を LMM が読んで game mechanics を反復的に改善できる demonstration と位置付けられている。Slack では、`verify.js` の固定ルール評価と手動 edit の間に、画像 strip や行動 trace を挟む候補として言及されていた。

## why_relevant_to_games
自動プレイテストの「失敗を検出するだけ」から、失敗 trace を見て調整候補を作る流れへ進める時の参照になる。
