---
title: "GamED.AI: A Hierarchical Multi-Agent Framework for Automated Educational Game Generation"
url: "https://arxiv.org/abs/2604.23947"
collected_at: "2026-05-27T17:00:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [educational-games, multi-agent, game-generation, quality-gates, mechanic-contracts]
evaluated_at: "2026-05-27T17:18:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T17:22:18.2620766+09:00"
last_decision: posted
stale_after: "2026-06-26"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870125964739"
posted:
  ts: "1779870125.964739"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870125964739"
  char_count: 4272
  posted_at: "2026-05-27T17:22:18.2620766+09:00"
next_action: none
gate_reason: >-
  phase-based LangGraph sub-graphs、deterministic quality gates、Pydantic schemas、formal mechanic contracts という構造が明確で、評価値も validation pass rate / schema compliance / token reduction として候補内に残っている。
  教育ゲームに限定されるが、Codex の playable diff 生成サイクルを phase、schema、quality gate、mechanic contract に分ける設計資料として十分に転用できる。
suggested_post_outline:
  overview_angle: "教育問題から playable game へ直行させず、生成を phase・schema・quality gate・mechanic contract に分解する framework として読む。"
  analysis_axis: "multi-agent 構成、deterministic gate、mechanic contract、評価指標が生成品質と失敗検出をどう分担するか。"
  application_target: "Nao_u のゲーム制作で、企画、mechanic、実装、検証を曖昧な一発生成から分離し、playable diff の前後に契約と検査を置く。"
  pros_cons: "構造化と検査が強い一方、教育ゲーム向け template 依存と gate 設計コストがある。"
  verdict_pre: "部分採用。template 全体ではなく mechanic contract と deterministic gate を先に試す。"

---

## raw_excerpt
arXiv 2604.23947。2026-04-27 投稿、2026-05-07 v3。GamEDAI は instructor-provided questions を fully playable かつ pedagogically grounded な educational games に変換する hierarchical multi-agent framework として説明される。phase-based LangGraph sub-graphs、deterministic Quality Gates、structured Pydantic schemas、formal mechanic contracts が中核。2 つの template family と 15 種の interaction mechanics を持ち、spatial reasoning、procedural execution、higher-order Bloom's Taxonomy objectives を扱う。200 questions / 5 subject domains で validation pass rate 90%、schema compliance 98.3%、ReAct agents 比で token reduction 73% と記載されている。

## why_relevant_to_games
ゲーム生成を「プロンプト一発」ではなく、phase・schema・quality gate・mechanic contract に分解する候補。Codex の playable diff 生成サイクルに近い構造として比較材料になる。
