---
title: "Codified Finite-state Machines for Role-playing"
url: "https://arxiv.org/abs/2602.05905"
collected_at: "2026-05-28T17:29:58+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-npc, role-playing, character-consistency, state-machines, dialogue]
evaluated_at: "2026-05-28T17:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-27"
supersedes: []
gate_reason: |
  latent character state の欠落という問題設定、CFSM/CPFSM の構造、確率的状態遷移、synthetic / real-world RP 評価まで候補本文から抽出できる。
  LLM-NPC の気分・警戒・信頼・目的を明示状態として設計する具体場面に接続しやすく、4000字級の概要に耐える。
suggested_post_outline:
  overview_angle: "プロンプトだけで人格を保つのではなく、潜在状態を FSM と確率遷移に落として会話の一貫性を支える資料として書く。"
  analysis_axis: "prompting-based RP の弱点、CFSM の state/transition 抽出、CPFSM による variability、synthetic と実RPシナリオ評価の比較。"
  application_target: "LLM-NPC、companion、敵対/協力キャラの信頼度・警戒度・目的状態をゲーム側の検証可能な state として持つ設計。"
  pros_cons: "長所は解釈可能性と一貫性、短所は状態設計の粒度・遷移抽出の誤り・自由会話の硬直化リスク。"
  verdict_pre: "部分採用。NPC 全人格の自動生成ではなく、重要キャラの state schema と会話ログ検証に使う。"
---

## raw_excerpt

arXiv 2602.05905。Letian Peng / Yupeng Hou / Kun Zhou / Jingbo Shang による、LLM role-playing の latent character state を扱う論文。既存の prompting-based approach は surface actions を捉えやすいが、interaction を駆動する潜在状態を追跡できず、character consistency が崩れやすい、という問題設定。そこで、ゲーム設計で長く使われてきた finite-state machine (FSM) を、open-ended semantic space を持つ RP へ再導入する。

提案する Codified Finite-State Machines (CFSMs) は、textual character profile から key states と transitions を LLM-based coding で抽出し、解釈可能な構造として character consistency を支える。さらに uncertainty / variability を扱うため、Codified Probabilistic Finite-State Machines (CPFSMs) へ拡張し、transition を state 上の probability distribution としてモデル化する。評価は synthetic evaluations と real-world RP scenarios の両方で、構造化タスクだけでなく open-ended stochastic state exploration でも一般的 baseline を上回ったとする。短い原文メモ: "latent character states" / "interpretable structures" / "probability distributions over states"。

## why_relevant_to_games

LLM-NPC や会話型 companion を、プロンプトだけでなく状態遷移として扱う設計候補になる。NPC の気分、警戒、目的、信頼度などを明示状態にして、会話の自由度と一貫性を両立させる時の外部資料。
