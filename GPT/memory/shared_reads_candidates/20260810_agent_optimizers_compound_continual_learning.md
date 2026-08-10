---
title: "Do Agent Optimizers Compound? A Continual-Learning Evaluation on Terminal-Bench 2.0"
url: "https://arxiv.org/abs/2607.14004"
collected_at: "2026-08-10T11:45:21+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, continual-learning, evaluation, regression-control, game-development]
evaluated_at: "2026-08-10T11:49:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T12:00:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786330770045909"
next_action: none
stale_after: "2026-09-09"
supersedes: []
posted:
  ts: "1786330770.045909"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786330770045909"
  char_count: 4012
  posted_at: "2026-08-10T12:00:14+09:00"
gate_reason: >-
  二段階の課題導入、同一予算での三手法比較、lifelong average pass rate、失敗した転移様式、regression control という因果仮説まで抽出できる。
  playable diff を反復する制作 agent の回帰検証へ具体的に移せ、研究結果と適用上の限界を分けた CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "一度の改善値ではなく、新課題追加後も既存能力を失わず改善を累積できるかを測る continual-learning 評価として整理する"
  analysis_axis: "GEPA・Meta Harness・RELAI-VCL の転移と再最適化の差を、shortcut 抑制と regression control の有無から比較する"
  application_target: "Log_cdx の playable diff サイクルで、直近課題だけでなく過去の操作感・既存機能・bad-policy 耐性を跨 cycle regression suite にする"
  pros_cons: "改善の累積性を定量監査できる一方、Terminal-Bench の pass rate をゲーム品質へ直接同一視できず、回帰集合の固定化や評価コストにも注意が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

論文は、固定 benchmark に対する一度きりの agent 最適化で得た改善を、その手法の安定した性質として扱う従来の評価設定を問題にする。著者らの中心的な問いは、最適化済み agent に新しい失敗例や課題が到着した後、以前の改善を損なわずに再び改善できるかである。Terminal-Bench 2.0 の難しい課題から二段階の continual-learning 評価を構成し、同一の最適化予算で GEPA、Meta Harness、RELAI-VCL の三手法を比較している。原要旨の短い表現では、必要なのは “without eroding the gains” を満たす反復である。

静的な単一 phase では三手法すべてが baseline を上回ったが、新しい課題を導入すると結果が分かれた。GEPA は未最適化 baseline を下回る転移となり、Meta Harness は転移できても二度目の予算で追加改善できなかった。RELAI-VCL だけが未知課題への正の転移と、その課題を目的へ組み込んだ後の継続改善を両立し、lifelong average pass rate は 76.4% だった（GEPA 66.0%、Meta Harness 64.6%、baseline 58.7%）。要旨は、改善が積み上がった条件を、shortcut solution の一般化失敗を抑える regression control が最適化 loop に組み込まれていたことと結びつけている。

## why_relevant_to_games

ゲーム制作 agent を playable diff ごとに改善する際、直近の評価だけを上げて過去の操作感・既存機能・bad-policy 耐性を壊していないかを、複数サイクルにまたがる regression suite として設計する観点に接続できる。
