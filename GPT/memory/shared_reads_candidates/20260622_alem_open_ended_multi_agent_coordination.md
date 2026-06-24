---
title: "Benchmarking Open-Ended Multi-Agent Coordination in Language Agents"
url: "https://arxiv.org/abs/2606.08340"
collected_at: "2026-06-22T02:59:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, coordination, survival-games, crafting, communication, agent-evaluation]
evaluated_at: "2026-06-22T03:02:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782065326.755519"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065326755519"
  char_count: 3564
  posted_at: "2026-06-22T03:08:53+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T03:08:53+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065326755519"
next_action: none
stale_after: "2026-07-22"
supersedes: []
gate_reason: >-
  Craftax-like survival world で exploration / crafting / trading / combat を含む長期協調を測り、
  communication、memory、role specialisation の寄与まで切り分けている。単体能力と協調能力を
  分離して観察でき、ゲーム制作の multi-agent / NPC 設計に直接使える。
suggested_post_outline:
  overview_angle: "open-ended survival world における LLM multi-agent coordination の限界と、通信・記憶・役割分化の効き方を中心に書く。"
  analysis_axis: "base-task reward と coordination reward の差、zero-shot LLM teams と MARL reference の比較、ablation の意味。"
  application_target: "探索・クラフト・取引・戦闘が混ざる prototype で、NPC 群の協調失敗を通信不足、記憶不足、役割未分化に分ける評価軸。"
  pros_cons: "長所は game-like な長期環境で協調難度を制御できる点。弱点は benchmark 成績が体験品質やプレイヤー同伴時の面白さを直接保証しない点。"
  verdict_pre: "採用。multi-agent survival prototype の評価設計に優先して接続する。"
---

## raw_excerpt

arXiv:2606.08340。2026-06-06 submitted。論文は alem という JAX-based benchmark を提案し、language agents が open-ended interactive tasks で長期協調できるかを測る。Craftax-like dynamics を土台に、procedurally generated coordination tasks、soft specialisation、communication、controllable coordination difficulty を、exploration、crafting、trading、combat を含む long-horizon survival world に埋め込む構成。

評価は 13 modern LLMs の zero-shot homogeneous teams と、trained MARL agents を reference として比較する。abstract では、現在の LLM agents は alem をほとんど解けず、平均は約 6% normalized return とされる。ただし失敗は一様ではなく、hardest coordination setting では Gemini-3.1-Pro-High が 10 億 step 訓練の MARL agents に近づく一方、GPT-5.4-High は base-task reward は強いが coordination reward が低い、と説明される。ablation では communication が coordination への最大寄与で、memory と reasoning は multi-step plans を保つ時に効くとされる。

## why_relevant_to_games

単体能力と協調能力を分けて測る候補。探索・クラフト・取引・戦闘が混ざる survival prototype や、複数 AI / NPC が役割分担するゲームで、通信、記憶、役割分化のどこが詰まるかを観測する材料になる。
