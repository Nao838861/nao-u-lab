---
title: "Codified Finite-state Machines for Role-playing"
url: "https://arxiv.org/abs/2602.05905"
collected_at: "2026-05-28T17:29:58+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-npc, role-playing, character-consistency, state-machines, dialogue]
---

## raw_excerpt

arXiv 2602.05905。Letian Peng / Yupeng Hou / Kun Zhou / Jingbo Shang による、LLM role-playing の latent character state を扱う論文。既存の prompting-based approach は surface actions を捉えやすいが、interaction を駆動する潜在状態を追跡できず、character consistency が崩れやすい、という問題設定。そこで、ゲーム設計で長く使われてきた finite-state machine (FSM) を、open-ended semantic space を持つ RP へ再導入する。

提案する Codified Finite-State Machines (CFSMs) は、textual character profile から key states と transitions を LLM-based coding で抽出し、解釈可能な構造として character consistency を支える。さらに uncertainty / variability を扱うため、Codified Probabilistic Finite-State Machines (CPFSMs) へ拡張し、transition を state 上の probability distribution としてモデル化する。評価は synthetic evaluations と real-world RP scenarios の両方で、構造化タスクだけでなく open-ended stochastic state exploration でも一般的 baseline を上回ったとする。短い原文メモ: "latent character states" / "interpretable structures" / "probability distributions over states"。

## why_relevant_to_games

LLM-NPC や会話型 companion を、プロンプトだけでなく状態遷移として扱う設計候補になる。NPC の気分、警戒、目的、信頼度などを明示状態にして、会話の自由度と一貫性を両立させる時の外部資料。
