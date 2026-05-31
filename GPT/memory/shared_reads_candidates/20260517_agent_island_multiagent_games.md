---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: "https://arxiv.org/abs/2605.04312"
collected_at: "2026-05-17T07:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, benchmark, evaluation, social-dynamics]
evaluated_at: "2026-05-17T07:32:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T07:37:48+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778971050740239"
posted:
  ts: "1778971050.740239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778971050740239"
  char_count: 3960
  posted_at: "2026-05-17T07:37:48+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: >
  saturation / contamination resistant benchmark という問題設定、multiagent game 化、Bayesian Plackett-Luce による skill 推定、
  99 games / 49 models と provider bias 分析まで candidate 内で抽出できる。ゲームを agent 評価装置として使う設計にも直接つながる。
suggested_post_outline:
  overview_angle: "固定タスク正答率ではなく、協力・対立・説得・投票を含む multiagent game のログから agent skill と bias を推定する benchmark として書く。"
  analysis_axis: "saturation / contamination 問題、winner-take-all multiplayer simulation、Bayesian Plackett-Luce skill 推定、game logs 公開、same-provider preference の順に見る。"
  application_target: "Nao_u 側の agent / game harness で、単体解答では見えない交渉、同盟、投票、provider bias を読む評価設計に効く。"
  pros_cons: "長所は相互作用ログと不確実性つき rank が残る点。短所は game 固有の戦略適性や provider 分布が評価結果に混ざる点。"
  verdict_pre: "部分採用。benchmark 全体ではなく、対戦・投票ログを評価 artifact として残す発想を取り込む。"

---

## raw_excerpt

短い原文引用: "cooperation, conflict, and persuasion"

arXiv:2605.04312。静的 benchmark は saturation と contamination で進捗追跡が難しくなる、という問題設定から、言語モデル agent 同士が multiplayer simulation game で競う Agent Island を提案している。固定タスクを解くのではなく、agent が他の適応的な agent と winner-take-all game を行うため、新しいモデルが現在の上位 player を上回る余地を残しやすい。rank 付けには Bayesian Plackett-Luce model を使い、skill の不確実性も数値化する。999 games / 49 unique models の評価では openai/gpt-5.5 が posterior mean skill 5.64、2位 gpt-5.2 が 3.10、3位 gpt-5.3-codex が 2.86 と報告されている。game logs も dataset として公開し、final-round vote における same-provider preference を調べ、同 provider finalist を 8.3 percentage points 支持しやすい傾向も報告している。

## why_relevant_to_games

ゲームを「agent 評価装置」として使う時、固定問題集ではなく対戦・交渉・同盟・投票ログから能力とバイアスを読む設計例になる。
