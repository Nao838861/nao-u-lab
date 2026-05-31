---
title: "CreativeGame: Toward Mechanic-Aware Creative Game Generation"
url: "https://arxiv.org/abs/2604.19926"
collected_at: "2026-05-17T18:14:09+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, llm, mechanics, evaluation, versioning]
evaluated_at: "2026-05-17T18:28:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T18:23:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009798720239"
posted:
  ts: "1779009798.720239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009798720239"
  char_count: 4336
  posted_at: "2026-05-17T18:23:35+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  single-shot LLM game generation の弱点を、mechanic plan / lineage memory / runtime validation / proxy reward に分解しており、手法の中核と評価観点を抽出できる。
  Nao_u_BOT の v01/v02/v03 差分を「機構として何が改善されたか」で追う用途に直結し、CoopEval 水準の概要へ展開できるだけの具体性がある。
suggested_post_outline:
  overview_angle: "LLM にゲームを一発生成させる話ではなく、mechanic change を計画・検証・記憶する version evolution として読む。"
  analysis_axis: "mechanic-guided planning、lineage-scoped memory、runtime validation、proxy reward が creative game generation のどの失敗を受け持つか。"
  application_target: "Nao_u_BOT のゲーム試作で、各版の差分を機構仮説・実行検証・次版への引き継ぎメモに分ける評価サイクル。"
  pros_cons: "利点は playable diff と mechanic-level 改善を接続できること。弱点は proxy reward と inspection 依存が強く、面白さの最終判定は別途必要なこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
原文短句: "mechanics are frequently treated only as post-hoc descriptions"

収集メモ: arXiv:2604.19926 は、LLM によるゲーム生成を single-shot code generation ではなく、version-to-version の創造的改善として扱う報告。問題設定は、生成されたゲームが一見もっともらしくても runtime behavior が壊れやすく、過去バージョンの経験が蓄積されず、creativity score が主観的すぎて最適化信号になりにくいこと。CreativeGame は iterative HTML5 game generation のための multi-agent system として、programmatic signal を中心にした proxy reward、lineage-scoped memory、runtime validation、mechanic-guided planning loop を組み合わせる。retrieved mechanic knowledge をコード生成前の explicit mechanic plan に変換し、playable artifact を一回で出すことより、mechanic change を追跡できる lineage evolution を重視する。報告上の実装規模は 71 stored lineages、88 saved nodes、774-entry global mechanic archive、Python 6,181 lines。4-generation lineage の例で、後続世代に mechanic-level innovation が出ることを inspection / visualization tooling で確認できる、としている。

## why_relevant_to_games
Nao_u_BOT の v01/v02/v03 系列で「差分が何を機構として改善したのか」を追う時、mechanic plan、lineage memory、runtime validation を分ける候補材料になる。
