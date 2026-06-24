---
title: "Beyond Static Evaluation: Co-Evolutionary Mechanisms for LLM-Driven Strategy Evolution in Adversarial Games"
url: "https://arxiv.org/abs/2606.10389"
collected_at: "2026-06-19T04:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [strategy-games, co-evolution, adversarial-evaluation, game-ai, automated-design]
evaluated_at: "2026-06-19T04:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781377659.400139"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781377659400139"
  char_count: 3539
  posted_at: "2026-06-14T04:07:39.400139"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-19T04:10:40+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781377659400139"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  static evaluator の限界、evaluator co-evolution、hierarchical deep evaluation、weakness pressure、unseen opponent 評価まで要素が揃う。
  Nao_u_BOT の bot policy 評価、opponent pool、headless bad-policy test に具体的に転用できる。
suggested_post_outline:
  overview_angle: "敵や評価器も進化させ、固定ベンチへの過適合を避ける adversarial game 評価"
  analysis_axis: "FAMOU の三機構、MCTF 2026 での比較、未見 opponent への汎化、戦術構造の発現"
  application_target: "対戦ゲームの敵 AI、bot policy regression、弱点を突く opponent pool の運用"
  pros_cons: "メリットは固定評価の穴を潰せる点。デメリットは計算量と評価設計の複雑化"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv:2606.10389。Haoran Li ほか。2026-06-09 投稿。論文は、LLM-driven code evolution を adversarial multi-agent games に使う時、固定 evaluator では評価 landscape が相手戦略の進化に追いつかず、進化が stagnate する問題を扱う。静的な相手や少数試合の点数だけでは、新しく出た戦術に評価器が弱くなり、強く見える候補が実は局所的な穴を突いただけかもしれない、という構図。

提案フレームワーク FAMOU は、3 つの機構を組み合わせる。evaluator co-evolution は、発見された champion strategies を opponent pool に入れて評価側も進化させる。hierarchical deep evaluation は、少数試合の noisy score ではなく、統計的に信頼できる評価へ置き換える。weakness pressure は、もっとも破りにくい opponent を動的に重く扱い、plateau を抜ける圧力を作る。

評価対象は MCTF 2026 の 3v3 maritime capture-the-flag task。検索結果要旨では、FAMOU は OpenEvolve / ShinkaEvolve 系 baseline を上回り、unseen opponents への win rate 61.7% を報告している。さらに、seed strategies に無かった lookahead search や adaptive interception のような tactical structures が LLM mutation process から出たとされる。

## why_relevant_to_games

敵 AI、bot policy、対戦ゲームの調整で、固定テスターにだけ勝つ戦略へ過適合しないための候補。Nao_u_BOT の headless bad-policy 評価や opponent pool 設計に接続できる。
