---
title: "Beyond Static Evaluation: Co-Evolutionary Mechanisms for LLM-Driven Strategy Evolution in Adversarial Games"
url: "https://arxiv.org/abs/2606.10389"
collected_at: "2026-06-14T04:00:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, adversarial-games, strategy-evolution, llm, evaluation]
evaluated_at: "2026-06-14T04:24:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T04:07:39.400139+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781377659400139"
next_action: none
posted:
  ts: "1781377659.400139"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781377659400139"
  char_count: 3533
  posted_at: "2026-06-14T04:07:39.400139+09:00"
stale_after: "2026-07-14"
supersedes: []
gate_reason: |-
  固定 evaluator が強化対象の進化に追いつかず plateau を作るという問題設定が明確で、opponent pool 共進化、deep evaluation、weakness pressure の3要素を分解して説明できる。
  adversarial game の bot policy、対戦バランス、自己対戦評価に直接転用でき、MCTF 2026 の具体評価もあり、Phase 3 の長い概要に耐える。
suggested_post_outline:
  overview_angle: "LLMで戦略を進化させる時、評価者を固定すると最適化先が古くなるという評価環境の劣化問題として書く。"
  analysis_axis: "opponent pool の更新、few-game score のノイズ低減、弱点相手への圧力付け、unseen opponents への汎化を軸に整理する。"
  application_target: "Nao_u_BOT側では、対戦ゲームのAI調整、自動プレイテスト、敵AI候補の tournament harness に適用できる。"
  pros_cons: "メリットは評価環境も進化対象として扱う明快さ。デメリットは maritime CTF 依存が強く、一般ゲームへ移すには相手表現と試合コスト設計が必要。"
  verdict_pre: "採用。対戦AI評価の候補生成と評価プール設計の参照にする。"
---

## raw_excerpt
arXiv:2606.10389。2026-06-09 submitted。Haoran Li ほか。対象は、LLM-driven code evolution を adversarial multi-agent games に適用する時、固定 evaluator が unreliable になり evolution が stagnate する問題。戦略が改善されるほど評価対象の landscape 自体がずれるため、少数試合や固定相手だけで良い候補を選ぶと plateau に入りやすい、という問題設定が置かれている。

提案は FAMOU という framework で、OpenEvolve や ShinkaEvolve と同系統の foundation-model code-evolution paradigm を土台にする。主要機構は 3 つ。evaluator co-evolution は、発見済み champion を opponent pool に組み込む。hierarchical deep evaluation は、noisy few-game scores を統計的に信頼しやすい assessment に置き換える。weakness pressure は、最も破りにくい opponent を動的に up-weight して plateau を抜ける圧力を作る。実験対象は MCTF 2026 の 3v3 maritime capture-the-flag task。2 種の backbone LLM で baseline を上回り、combined score 0.526、unseen opponents への win rate 61.7% が報告されている。LLM mutation から lookahead search や adaptive interception のような seed strategy にない tactical structures が出たとも要旨にある。

## why_relevant_to_games
対戦ゲームや bot policy 評価で、固定相手への過適合を避けながら strategy pool を更新するための収集候補になる。
