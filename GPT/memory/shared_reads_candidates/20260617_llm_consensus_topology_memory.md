---
title: "Exploring the Topology and Memory of Consensus: How LLM Agents Agree, Fragment, or Settle When Forming Conventions"
url: "https://arxiv.org/abs/2606.04197"
collected_at: "2026-06-17T15:29:20.8446899+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, agent-memory, social-simulation, game-ai, coordination]
evaluated_at: "2026-06-17T15:36:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-17T15:36:28+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-17T15:36:28+09:00"
next_action: revise_or_research
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  memory depth と communication topology の相互作用は重要で、NPC 集団や噂・派閥シミュレーションへの示唆もある。
  ただし候補本文だけでは Naming Game のタスク設計、評価指標、ゲーム制作への落とし込みがやや抽象的で、4000字投稿では推測が増えやすい。
  PDF 本文から topology 条件・memory 条件・失敗例を補強してから再評価するのが妥当。
---

## raw_excerpt

arXiv:2606.04197。2026-06-02 submitted。arXiv 要旨では、LLM agent が consensus を形成する時、どれだけ記憶を持つべきか、どの topology で接続すべきかを、networked Naming Game の simulation で調べている。実験は 16-agent の 8 種 topology と memory depth を変えた 432 runs。主張は、memory と network structure が独立の knob ではなく、組み合わせによって coordination への効果の符号が反転する、というもの。

結果メモとして、長い memory は decentralized network では steady state 到達を遅くするが、centralized network では到達を速める。ただし centralized network での faster settling は、全体 consensus に早く達することではなく、fragmented plateau に早く固定されることを意味し得る。さらに、centralized network は decentralized network より competing conventions を残しやすく、memory depth によって settling speed が大きく変わる。agent level では high-betweenness bridge が brokerage penalty を受け、local cluster 内の agent は coordination success が高い。著者らは、agent の選択が Fictitious Play でよく説明できるとも述べ、実践的含意として memory depth と communication topology は一緒に設計すべきだとしている。

## why_relevant_to_games

NPC 集団、派閥、街の噂、協力/対立 AI などで、記憶量を増やすだけでは合意がよくなるとは限らない。multi-agent game prototype の通信構造と memory depth を同時に変えるテスト観点として使える。
