---
title: "Game-Theoretic Multi-Agent Control for Robust Contextual Reasoning in LLMs"
url: "https://arxiv.org/abs/2606.10322"
collected_at: "2026-06-13T21:59:49+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-safety, multi-agent, context-management, evaluation, game-ai-harness]
evaluated_at: "2026-06-13T22:01:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781356054.517259"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781356054517259"
  char_count: 4170
  posted_at: "2026-06-13T22:09:59.4949982+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-13T22:09:59.4949982+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781356054517259"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: |
  multi-turn LLM agent の context poisoning / drift を問題設定に置き、validated context graph、agent agreement、distributional drift、rollback self-healing まで手法要素が候補内で追える。
  ゲーム制作では、長手数 playtest agent が誤読やノイズを固定化する失敗を、causal context graph と drift 検知で監査する harness 設計に具体接続できる。
  評価も 100 interaction turns、bounded drift 99.6%、recovery 0.4% と書ける材料があり、CoopEval 水準の概要へ展開可能。
suggested_post_outline:
  overview_angle: "LLM agent の長期文脈を単なる履歴ではなく、攻撃や誤読で歪む動的状態として扱い、game-theoretic controller で安定化する手法として整理する。"
  analysis_axis: "context poisoning の問題設定、MCP が passive routing に留まる限界、3 agent controller、trust function、rollback self-healing、100 turn adversarial 評価を軸に読む。"
  application_target: "Nao_u_BOT の game-agent / playtest-agent 評価で、プレイログ、観察、仮説、評価判断が長手数で drift していないか検査する harness 設計に効く。"
  pros_cons: "メリットは文脈信頼性を causal consistency / agreement / drift に分解できる点。デメリットはゲーム固有評価ではなく、実装コストと過剰防御のリスクがある点。"
  verdict_pre: "部分採用。GT-MCP 全体を導入するより、playtest log の context graph 化、agreement check、rollback 条件の probe として使う。"
---

## raw_excerpt
arXiv 2606.10322。Saeid Jamshidi, Amin Nikanjam, Arghavan Moradi Dakhel, Kawser Wazed Nafi, Foutse Khomh。検索結果と arXiv 要旨では、multi-turn interaction の中で LLM が evolving context を保持するため、局所的にはもっともらしい prompt injection や context poisoning が長期の reasoning trajectory を歪める問題を扱う。既存防御は個別出力の filter に寄り、context evolution を直接制御しにくい。論文は Game-Theoretic Secure Model Context Protocol (GT-MCP) を提案し、context management を closed-loop dynamical process として扱う。controller は 3 つの heterogeneous LLM agents を協調させ、validated context graph に対する causal consistency、agents 間の semantic agreement、時間方向の distributional drift を合わせて評価する trust function で出力を選ぶ。不安定性が検出されると rollback-based self-healing により validated context を復元し、support の弱い adversarial fragment が後続 turn へ伝播するのを止める。500 interaction turns の adaptive adversarial threat model で評価し、contextual drift は 99.6% の turn で bounded、recovery required は 0.4%、controller level では injection が成功しなかったと報告されている。

## why_relevant_to_games
長手数の game-agent / playtest-agent が、途中の誤読やノイズを文脈として固定してしまう失敗を分解する材料。自作ゲーム評価 harness で、agent の行動ログを causal context graph、agreement、drift、rollback の観点で記録する候補になる。
