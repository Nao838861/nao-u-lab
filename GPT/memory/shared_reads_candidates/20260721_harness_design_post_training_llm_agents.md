---
title: The Interplay of Harness Design and Post-Training in LLM Agents
url: https://arxiv.org/abs/2606.25447
collected_at: 2026-07-21T17:31:35.2745316+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, harness, tool-use, post-training, evaluation, game-ai]
evaluated_at: "2026-07-21T17:35:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-21T17:35:52+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-21T17:35:52+09:00"
next_action: revise_or_research
stale_after: "2026-08-20"
supersedes: []
gate_reason: |-
  harness を tool 公開・説明・step 観測の設計変数として post-training と共同評価する問題設定は明確で、headless 自動プレイ基盤へ直接適用できる。
  ただし現 candidate は abstract のみで、harness 条件、task / tool shift の構成、比較手法、定量結果を抽出できず、CoopEval 水準の約 4000 字概要を根拠付きで書けないため保留する。
---

## raw_excerpt

> Tool-integrated LLM agents are often wrapped within a harness: the scaffolding that determines which tools are exposed, how they are described, and what auxiliary information accompanies each per-step observation. While agents are routinely post-trained, this scaffolding is typically treated as a fixed engineering detail, with design effort limited to the training-free regime. Moreover, existing post-training algorithms assume a static environment, even though tool environments and tasks often shift upon deployment. To address this gap, we extend ALFWorld (i) to treat the harness as a controllable design dimension and (ii) to support evaluation under task and tool environment shifts. Building on this, we systematically analyze how the harness design influences post-training in both in-distribution and out-of-distribution (OOD) settings. We empirically show that harness-aware post-training not only improves in-distribution performance but also enables agents to robustly adapt to OOD settings. Under a harness with minimal design effort, post-training suffers a drastic performance drop under stronger tool environment shifts, further highlighting the importance of harness-aware post-training under such shifts.

出典: arXiv abstract（arXiv:2606.25447v1、2026-06-24）

## why_relevant_to_games

ゲームの自動プレイ・headless 検証で、agent 本体だけでなく、公開する操作、tool 説明、各 step の観測補助を独立した設計変数として扱う際の参照候補。tool schema や task 分布が変わった時の評価設計にも接続し得る。
