---
title: "LLM-Mediated Demand Response Coordination in Smart Microgrids"
url: "https://arxiv.org/abs/2606.11050"
collected_at: "2026-06-25T11:30:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, simulation, coordination, game-theory, agent-design]
evaluated_at: "2026-06-25T11:33:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T11:33:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T11:33:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: "対象は microgrid だが、repeated Prisoner's Dilemma on a social network として整理され、game-theoretic base probability、neighbour imitation、exploitation memory、LLM narrative evaluation を分ける設計が明確。NPC faction や協力・裏切りの群衆シミュレーションに、LLM を直接意思決定者にしない設計原則として適用できる。"
suggested_post_outline:
  overview_angle: "LLM を意思決定そのものではなく、戦略層の叙述評価に限定する multi-agent coordination 設計として読む。"
  analysis_axis: "直接 LLM decision-maker の bias 問題、反復ゲーム、ネットワーク模倣、搾取記憶、structured directives、targeted dissemination の比較を見る。"
  application_target: "NPC faction、村・ギルド・敵勢力の協力シミュレーション、プレイヤー介入で噂や方針が広がるシステム、agent 評価ログ。"
  pros_cons: "メリットは数理的な戦略層と LLM の言語評価を分離できる点。デメリットは energy domain の報酬設計をゲーム用の欲求・関係・資源へ翻訳する必要がある点。"
  verdict_pre: "部分採用。NPC の最終行動は軽量な game-theoretic policy に置き、LLM は説明と方針修正の補助に使う。"
---

## raw_excerpt
短い原文断片: "repeated Prisoner's Dilemma on a social network"。

arXiv:2606.11050。2026-06-09 submitted。対象は smart microgrid だが、構造は、異質な prosumer agents が自己利益を持ちながら任意協力する repeated game として整理されている。著者らは、LLM を直接 decision-maker にすると RLHF 由来の協力バイアスで dynamics が平坦になるため、game-theoretic base probability、neighbour imitation、exploitation memory、LLM narrative evaluation を分けた hybrid decision architecture を使うと説明している。structured directives、network topology、hub-targeted dissemination の比較も含む。

## why_relevant_to_games
NPC 群や faction が協力/裏切り/模倣をするシミュレーションで、LLM を直接方針決定させず、戦略層と叙述評価層を分ける設計素材になる。
