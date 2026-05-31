---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "http://arxiv.org/abs/2605.23652v1"
collected_at: "2026-05-27T19:23:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-ai, reinforcement-learning, persona, evaluation]
evaluated_at: "2026-05-27T19:27:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T19:27:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T19:27:00+09:00"
postponed:
  at: "2026-05-27T19:42:00+09:00"
  reason: "Phase 3 で同一論文の既投稿を確認したため。2026-05-26 の投稿と新規差分がなく、#shared-reads の重複投稿を避ける。"
  duplicate_of:
    candidate: "memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md"
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725135414829"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  問題設定、persona条件付き共有RL policyという中核、300 persona benchmark、zero-shot識別・semantic-behavioral alignment・推論速度比較という評価軸が候補本文だけで追える。
  Nao_u側の大量NPC/群衆/生活行動に対して、LLM直呼びではなく軽量policyへ落とす具体的な設計論に接続できるため、Phase 3で4000字級の概要へ展開可能。
suggested_post_outline:
  overview_angle: "多数NPCを個別LLMで動かすのではなく、自然言語personaを条件に共有policyへ畳み、人格の追跡性とリアルタイム制御を両立する論点で書く。"
  analysis_axis: "persona条件付け、共有policy、評価指標の3点を分け、会話AIではなく行動制御AIとして何が新しいかを見る。"
  application_target: "生活シミュ、拠点NPC、敵ではない群衆、ゲーム内小集団の一貫行動生成に効く。"
  pros_cons: "利点は推論速度と大量展開、人格一貫性の検査軸。弱点は学習環境とpersona定義の作り込みが必要で、会話品質そのものは別問題。"
  verdict_pre: "部分採用"

---

## raw_excerpt
要旨メモ: life-simulation games で多数の NPC に別々の人格を持たせる問題に対し、自然言語で書かれた persona を条件として受け取る共有 RL policy を使い、個別 NPC ごとの制御性、persona 一貫性、リアルタイム推論の両立を狙う。300 persona の life-simulation benchmark で、zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy baseline との推論速度比較を報告している。

## why_relevant_to_games
大量 NPC を LLM 直呼び出しで動かすのではなく、人格を trace できる軽い policy に落とす設計候補。会話中心ではない生活シミュや群衆行動の評価軸として使えそう。
