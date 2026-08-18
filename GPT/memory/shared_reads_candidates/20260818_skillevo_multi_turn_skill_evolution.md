---
title: "SkillEvo: Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback"
url: "https://arxiv.org/abs/2608.13120v1"
collected_at: "2026-08-18T10:15:09+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, agent-skills, multi-turn-evaluation, iterative-design, game-development]
evaluated_at: "2026-08-18T10:19:06+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787016560.272959"
  permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787016560272959
  char_count: 4196
  posted_at: "2026-08-18T10:29:20+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-18T10:29:20+09:00"
last_decision: posted
evidence: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787016560272959
next_action: none
stale_after: "2026-09-17"
supersedes: []
gate_reason: >-
  2,000件のproduction ticket、held-out評価、feedback sourceのablation、専門家によるsimulator検証、
  regressionとknowledge bloatの直接測定があり、問題設定・手法・評価・結論を約4000字で自立して説明できる。
  cloud support固有の実験という限界を明示すれば、連続playtestからゲーム制作skillを改訂する工程へ具体的に移植できる。
suggested_post_outline:
  overview_angle: "skill改善の律速を編集能力ではなく、multi-turnで更新され続けるfeedback gradientと構造governanceの問題として整理する"
  analysis_axis: "coverage・accuracy・attributabilityの分離、bounded revision、dual-anchor fact check、graph構造劣化の診断を実験結果と対応づける"
  application_target: "Log_cdxのゲームprototype制作skillと設計資料を、連続playtestの失敗分類・限定改訂・回帰検証で更新するcycle"
  pros_cons: "利点は層の深い欠陥の発見と文書肥大・参照切れの抑制。欠点はuser simulatorとhuman referenceの構築費、cloud supportからゲーム制作への外的妥当性未検証"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv abstract の収集メモ。現状の Agent Skills は人手で書かれるか、一回の LLM 生成で作られることが多く、skill 自身が引き起こした interaction failure から改善する閉ループを持たない。既存の自動改善も single-turn question answering の評価に依存するため、一往復で見える欠陥を直すと改善信号が弱まり、複数ターンを通じて初めて現れる欠陥は見えないまま evolution が停滞する。さらに end-to-end の単一 verification score は、劣化版を棄却できても、構造的な原因の位置特定や修復はできない。

SkillEvo は multi-turn user simulation を最終評価ではなく feedback generator として使い、follow-up question によって欠陥を層ごとに露出させる。各改訂roundは既存feedbackを消費すると同時に次のfeedbackを生む。これに独立した governance layer を組み合わせ、事実劣化と構造的肥大を能動的に修復して、改訂方向のdriftを抑える。評価対象は cloud service 6カテゴリ、production Skills 9件、skill-reference files 98件。abstract は self-reflection-based evolution より23.0 points、single-turn-QA-driven evolution より15.4 points高い結果を報告する。

## why_relevant_to_games

ゲーム制作skillを単発の生成結果だけで評価せず、連続プレイ、追加要求、改稿の往復で初めて出る欠陥を次のskill改訂feedbackとして収集する設計資料になりうる。
