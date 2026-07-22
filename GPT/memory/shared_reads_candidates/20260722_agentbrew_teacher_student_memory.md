---
title: "AgentBrew: Lifelong Knowledge Brewing from Strong Teachers to Weak LLM Agents"
url: "https://arxiv.org/abs/2607.16851"
collected_at: "2026-07-22T17:30:42.6099139+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, memory, playtesting, evaluation, knowledge-transfer]
evaluated_at: "2026-07-22T17:34:47.5369509+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-22T17:34:47.5369509+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-22T17:34:47.5369509+09:00"
next_action: revise_or_research
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  問題設定、brew–serve 構成、Ralph Loop、student が実行可能な corrective note という手法の中核と、
  自動プレイテストへの適用先は具体的である。一方、比較条件・主要数値・ablation・実証上の結論が候補本文に不足し、
  CoopEval 水準の約4000字概要を推測なしで書けないため、評価節の補完まで保留する。
---

## raw_excerpt

arXiv 本文の収集メモ。AgentBrew は、強い teacher agent が training 時に得た対話的経験を、weight update なしで弱い student agent の persistent external memory へ移す「knowledge brewing」を扱う。環境から得られる監督が task の pass / fail という疎な binary feedback と失敗 trajectory だけでも、student が失敗した時に teacher を起動し、再利用可能な corrective note を作る。note は `trigger_pattern`、`corrective_rule`、短い `minimal_steps`、routing 用 tag などを持つ structured JSON として表現され、元 task の完全解答ではなく失敗から抽出した手順を保存する。

候補 note はすぐ永続化せず、provisional memory に置いて同じ task を student に再実行させる Ralph Loop を通す。student が実際に成功へ回復した場合だけ environment-validated note とし、curator が重複統合と quality tracking を行って memory に追加する。teacher がもっともらしいと自己評価するだけでは、能力差のため弱い student が実行できない可能性があるので、note は student の語彙・推論粒度・既知の弱点に合わせ、命令形の具体的な checklist として書かれる。test 時は teacher と反復 loop を止め、skill scope 内から関連 note を検索した student が single rollout で task を行う。論文は coding、math、tool-use task と Terminal-Bench case study でこの brew–serve 構成を評価している。

## why_relevant_to_games

高価な強い agent のプレイ失敗分析を、軽量な自動プレイテスト agent が実行できる検証済み手順へ変換する設計材料になる。ゲームごとの成功条件を environment feedback にすれば、失敗 trace から得た攻略・回帰テスト手順を playtest 間で再利用する場面に接続できる。
