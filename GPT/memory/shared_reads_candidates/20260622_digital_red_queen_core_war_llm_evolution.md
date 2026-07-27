---
title: "Digital Red Queen: Adversarial Program Evolution in Core War with LLMs"
url: https://arxiv.org/abs/2601.03335
collected_at: 2026-06-22T08:59:46+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, open-endedness, adversarial-design, llm-evolution, artificial-life]
evaluated_at: 2026-07-27T21:07:26+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-27T21:07:26+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T21:07:26+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |
  過去の全 warrior を倒す相手を反復生成する核は、敵 AI や対戦ルール探索へ具体的に写像できる。
  ただし候補本文は要旨相当で、held-out 評価の条件・数値と diversity 低下の範囲が不足している。
  収束と多様性の交換条件を根拠付きで論じられるまで、Phase 3 投稿は保留する。
---

## raw_excerpt

arXiv abstract によると、この論文は LLM を使った evolution framework が static optimization problem に寄りがちな点を問題にし、Core War という game-like な仮想マシン環境で adversarial adaptation を扱う。提案する Digital Red Queen は self-play algorithm で、LLM が assembly-like programs である warriors を進化させ、過去の全 warriors を倒す新しい warrior を各 round で生成する。

要旨では、DRQ は changing objective への continual adaptation として Red Queen dynamics を取り込み、round を重ねると held-out human warriors に対して warriors がより general になると説明されている。一方で、独立 run 間の behavioral diversity は下がり、general-purpose behavioral strategy への convergence pressure が観測されたとされる。著者らは Core War を、LLM-based evolution methods と artificial systems の adversarial adaptation を調べるための controllable sandbox と位置付けている。

短い原文句: "continual adaptation to a changing objective" / "Core War" / "controllable sandbox"。

## why_relevant_to_games

ゲーム制作では、固定評価器に最適化した敵・ルール・bot はすぐ停滞する。Core War の Red Queen 型 self-play は、敵 AI、パズル生成、対戦ルール調整で「過去の解法を倒す新条件」を作り続ける候補探索の材料になる。
