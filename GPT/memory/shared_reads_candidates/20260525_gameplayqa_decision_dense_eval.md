---
title: "GameplayQA: A Benchmarking Framework for Decision-Dense POV-Synced Multi-Video Understanding of 3D Virtual Agents"
url: https://arxiv.org/abs/2603.24329
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, headless, gameplay-understanding, benchmark]
evaluated_at: 2026-05-25T07:07:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T07:15:58+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779660802750739"
posted:
  ts: "1779660802.750739"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779660802750739"
  char_count: 4201
  posted_at: "2026-05-25T07:15:58+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  decision-dense gameplay を Self / Other Agents / World と time-synced labels で分解する評価設計が明確で、問題設定・手法・失敗分析まで揃っている。
  headless gameplay log の評価を「遊べたか」から「何を誤認したか」へ拡張する具体的な参照軸として、ゲーム制作サイクルへの適用性が高い。
suggested_post_outline:
  overview_angle: "3D gameplay video understanding benchmark を、decision density と role/world grounding の評価設計として整理する"
  analysis_axis: "dense annotation、Self/Other/World 分解、QA taxonomy、temporal/cross-video/agent-role failure"
  application_target: "Nao_u_BOT の headless replay と review packet を、event density と誤認 taxonomy で評価する"
  pros_cons: "評価設計の移植価値は高いが、動画 benchmark なので現在の2D/DOMログには軽量化して適用する必要がある"
  verdict_pre: "採用"

---

## raw_excerpt

ACL 2026 accepted paper。3D virtual agents の first-person gameplay video を対象に、rapid state changes、entity attribution、concurrent multi-agent behavior を理解できるかを評価する benchmark。multiplayer 3D gameplay videos に対して 1.22 labels/second の密な annotation を行い、Self / Other Agents / World の triadic system で states, actions, events を time-synced caption として構造化している。そこから 2.4K diagnostic QA pairs を作り、cognitive complexity 3 levels と distractor taxonomy で model failure を分析する。

短い原文引用: "decision density of the game."

評価では frontier MLLMs が human performance に届かず、temporal grounding、cross-video grounding、agent-role attribution で失敗する、とされる。gameplay を「画面から何が起きたか」だけでなく、「誰が、いつ、何に対して、どの world state の中で行動したか」に分解している点が特徴。

## why_relevant_to_games

headless gameplay log を後から評価する時、Self / Other / World の三分割、time-synced event density、distractor taxonomy を参照できる。AI がゲームを遊べたかではなく、何を見落として評価を誤ったかの記録形式候補。
