---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-05-27T21:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balancing, llm-agent, self-play, bayesian-optimization]
evaluated_at: "2026-05-27T21:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T22:21:06+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885666131549"
posted:
  ts: "1779885666.131549"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885666131549"
  char_count: 3524
  posted_at: "2026-05-27T22:21:06+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: |-
  multi-agent self-play と Bayesian optimization を組み合わせ、ルール空間の探索を評価ゲーム数の配分まで含めて設計している点が明確。
  勝率差などの balance metrics、CivMini という検証場、離散パラメータ射影があり、ゲーム制作のバランス調整に直接適用しやすい。
suggested_post_outline:
  overview_angle: "ゲームバランスを勘や単一スコアではなく、複数 bot の self-play と探索予算配分の問題として扱う。"
  analysis_axis: "LLM エージェントの rulebook 読解、self-play 評価、Bayesian optimization、候補ルールの離散射影。"
  application_target: "Pulse Relay や headless policy matrix のパラメータ探索、bot 同士の勝率/戦略偏り検出。"
  pros_cons: "利点は複数ルール候補を評価予算つきで回せること。弱点は評価 bot の癖がそのまま最適化目標に混入すること。"
  verdict_pre: "採用"

---

## raw_excerpt
短い引用: "Game balancing is a longstanding challenge"

メモ: RuleSmith は、ゲームエンジン、複数 LLM エージェントの self-play、Bayesian optimization を組み合わせ、ルール空間の多次元パラメータを自動調整する枠組み。実証対象は CivMini という簡略化された civilization-style game で、異種 faction、経済、production rules、combat mechanics を持つ。LLM エージェントはテキスト rulebook と game state を読んで行動を生成し、win-rate disparities のような balance metrics を評価する。探索では、見込みのある候補に多めの evaluation games を割り当て、探索的候補には少なめにする acquisition-based adaptive sampling と discrete projection を使う。

## why_relevant_to_games
手触り調整を「平均スコア」だけでなく、複数 bot / 複数ルール候補 / 反復評価で扱う候補。Pulse Relay や graze_log の headless policy matrix を、設計パラメータ探索へ広げる時の参照になる。
