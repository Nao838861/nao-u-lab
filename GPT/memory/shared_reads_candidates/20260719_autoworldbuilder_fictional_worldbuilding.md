---
title: "Fictional Worldbuilding: Multi-Agent LLM Collaboration with Hierarchical Context Compression and Iterative Review"
url: "https://arxiv.org/abs/2607.09403"
collected_at: "2026-07-19T08:00:58.6964454+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, worldbuilding, llm-agent, procedural-content-generation, evaluation]
evaluated_at: "2026-07-19T08:04:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784416512.425609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784416512425609"
  char_count: 4308
  posted_at: "2026-07-19T08:15:17+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T08:15:17+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784416512425609"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  文脈増大・創造性と整合性の衝突・自動 QA 不足という問題設定から、concept network、DAG scheduling、4層圧縮、Auditor review の中核を抽出できる。
  20 task / 2 model の評価、token 削減率、pass rate、生成規模・所要時間まで揃い、ゲーム世界設定 pipeline への具体的な適用と限界を ~4000字で論じられる。
suggested_post_outline:
  overview_angle: "AutoWorldBuilder を、世界設定を大量生成する仕組みではなく、増え続ける設定を依存関係・文脈予算・独立監査で壊さず育てる制作 pipeline として書く。"
  analysis_axis: "concept network による矛盾検出、semantic-locality を使う DAG batch、layer-as-budget compression、生成と Auditor review の分離を、報告された成功率・token 削減・pass rate 改善と対応づけて見る。"
  application_target: "Log_cdx のゲーム試作で、world bible の concept 追加を DAG task 化し、関連設定だけを圧縮して渡し、独立した整合性 gate を通す小規模 probe に効く。"
  pros_cons: "長所は設定規模の増大を依存関係と文脈予算で扱い、生成と監査を分離できる点。短所は20 task・2 model の内部評価であり、conflict 0 が面白さ・独自性・プレイヤー理解を保証しない点。"
  verdict_pre: "部分採用。concept network 全面導入ではなく、依存関係つき world bible と Auditor gate を一つの試作で検証する。"
---

## raw_excerpt

原文要旨の日本語メモ（直接引用ではない）: ゲーム設計や物語制作における架空世界の構築では、制作が進むにつれて文脈量が線形に増えること、創造的な多様性と設定の一貫性が衝突すること、自動品質保証が不足していることが課題になる。論文は、この三点に対して複数 LLM agent による AutoWorldBuilder を提示する。構成要素は、矛盾を検出する構造化 concept network、意味的に近い task をまとめる DAG-based hybrid batch scheduler、約 90% の token 削減を報告する4層 context compression、専門 Auditor agent による反復 review、code を追加せず拡張できる skill-driven agent architecture の五つ。Auditor review では proposal の pass rate が 42% から 85% 超へ上昇したとする。GPT-OSS 120B と DeepSeek v3.2 を用いた20種類の worldbuilding task の二実験では、95.0% の success rate を報告し、各世界について56〜103個の相互整合的な concept を18〜31分で生成し、最終成果物では conflict 0 としている。著者らは、layer-as-budget compression、semantic-locality scheduling、generation と review の分離を、知識集約型 multi-agent LLM application にも移せる設計パターンとして挙げている。

## why_relevant_to_games

ゲームの世界設定・用語・勢力・場所・出来事を増やす場面で、設定矛盾の検出と文脈圧縮を制作 pipeline に組み込む具体例として参照できる。
