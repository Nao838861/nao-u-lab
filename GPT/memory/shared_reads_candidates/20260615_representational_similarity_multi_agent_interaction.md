---
title: "Representational Similarity and Model Behavior in Multi-Agent Interaction"
url: "https://arxiv.org/html/2606.07818v1"
collected_at: "2026-06-15T03:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, creativity, cooperation, llm-agent]
evaluated_at: "2026-07-27T09:22:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T09:22:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T09:22:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  4つの協力ゲームと4つの創造課題、CKA、性能差やモデル規模の統制、early-layer similarity という手法と結果の骨格が揃っている。
  同質な agent は協力を安定させる一方で新規性を狭めるという tradeoff を、企画・レビュー・NPC 協調の編成へ具体的に適用でき、約4000字で限界まで論じられる。
suggested_post_outline:
  overview_angle: "LLM の能力表ではなく、pair 間の表現空間の近さが協力と創造性を逆方向に動かす編成問題として整理する。"
  analysis_axis: "8課題、CKA、統制変数、early-layer similarity の結果を押さえ、相関から因果や任意のゲーム制作チームへ一般化できない限界も分ける。"
  application_target: "Log_cdx の企画生成・批評・テスト観測を同型モデルだけで閉じず、安定協力を担う近い agent と発想差を担う異質な評価軸を工程別に配置する。"
  pros_cons: "利点は協力の安定性と発想の幅を一つの編成軸で説明できること。欠点は task proxy と表現類似性の相関であり、制作成果の質や因果を直接保証しないこと。"
  verdict_pre: "部分採用。常時混成ではなく、収束工程は同質性、探索工程は異質性を高める切替仮説として小さく検証する。"
---

## raw_excerpt

arXiv:2606.07818v1。Yujin Potter ほか。人間では neural similarity が social closeness や協力成功と関係し、逆に異質な相手との相互作用が innovation を生みやすい、という知見を LLM の multi-agent interaction に持ち込む研究。実験では、open-weight LLM の model pairs を、協力系 4 games (word guessing、public good、divide-a-dollar、Keynesian Beauty Contest) と novelty/creativity 系 4 tasks (story writing、fictional biography、haiku、vacation benefit brainstorming) で比較する。representational similarity は CKA で測り、performance disparity や model size などを統制する。結果は、表現空間が似ている model pair ほど協力成績は上がる一方、novelty と creativity は下がる傾向を示す。特に early layers の similarity が協力・新規性との関連を強く持ち、lexical/semantic grounding の共有度が効いている可能性があるとされる。

## why_relevant_to_games

複数 AI に企画、レビュー、テストプレイ、NPC 協調をさせる時、同型 agent を並べると協力は安定しても発想が狭くなる可能性がある。multi-agent 制作や NPC チーム設計で「同質性と多様性の配分」を考える材料になる。
