---
title: "CreativeGame:Toward Mechanic-Aware Creative Game Generation"
url: "https://arxiv.org/abs/2604.19926"
collected_at: "2026-06-04T03:07:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-game-generation, mechanics, evaluation, tool-agent]
evaluated_at: "2026-06-04T04:31:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-04T04:34:32+09:00"
last_decision: postponed
evidence: "duplicate_of:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009798720239"
next_action: none
postpone_reason: "Phase 3 重複確認。同一 URL は 2026-05-17 に #shared-reads 投稿済みのため再投稿しない。"
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260517_creativegame_mechanic_aware_generation.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009798720239"
  ts: "1779009798.720239"
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  mechanics を生成後の説明ではなく、plan、lineage、runtime validation、
  repair/reward に接続する設計として扱っており、問題設定と手法の中核が明確。
  Nao_u_BOT の playable diff と経験継承に直結し、CoopEval 水準の概要へ展開できる。
suggested_post_outline:
  overview_angle: "LLM game generation を playable artifact 単発ではなく mechanic lineage の進化として扱う軸"
  analysis_axis: "explicit mechanic plan、lineage-scoped memory、programmatic proxy reward、runtime validation の役割分担"
  application_target: "ゲーム制作サイクルの playable diff 記録、mechanic 変更理由、次版への経験継承"
  pros_cons: "利点は mechanic の検証可能性と履歴化。弱点は proxy reward が人間の面白さを代替しきれない点。"
  verdict_pre: "部分採用。mechanic lineage と validation ログを小さく取り入れる。"
---

## raw_excerpt
短い原文抜粋: "mechanics are frequently treated only as post-hoc descriptions" / "support interpretable version-to-version evolution"。

arXiv 2026-04-21 submitted。LLM によるゲームコード生成を、単発の playable artifact ではなく、版ごとの創造的改善として扱うための multi-agent HTML5 game generation system。問題設定は、単発生成が壊れやすい runtime behavior、version 間で経験が蓄積されにくいこと、創造性評価が LLM 主観に寄りすぎ optimization signal として弱いこと。提案は、programmatic signals を中心にした proxy reward、lineage-scoped memory、repair/reward に組み込まれた runtime validation、retrieved mechanic knowledge を code generation 前の explicit mechanic plan に変換する mechanic-guided planning loop。実装規模として 71 lineages、88 saved nodes、774-entry global mechanic archive、Python 6,181 lines と inspection/visualization tooling を持つ。4-generation lineage で mechanic-level innovation が後続 version に現れ、version-to-version records から検査できるとする。

## why_relevant_to_games
Nao_u_BOT の「playable diff を出しながら経験を次に使う」構造に近い。mechanic を事後ラベルではなく、生成前の plan と version 間 lineage に置く候補として使える。
