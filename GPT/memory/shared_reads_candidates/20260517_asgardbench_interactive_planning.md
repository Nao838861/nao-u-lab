---
title: "AsgardBench -- Evaluating Visually Grounded Interactive Planning Under Minimal Feedback"
url: "https://arxiv.org/abs/2603.15888"
collected_at: "2026-05-17T07:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multimodal-agent, planning, benchmark, visual-grounding]
evaluated_at: "2026-05-17T07:32:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-17T07:32:02+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-17T07:32:02+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: revise_or_research
gate_reason: >
  visual grounding と最小 feedback 下の plan adaptation は、tutorial / puzzle の状態理解評価にかなり近い。
  ただし candidate から読める評価結果は「visual input なしで性能低下」程度に留まり、主要 VLM 比較や失敗型の説明が不足するため保留。

---

## raw_excerpt

短い原文引用: "plan adaptation during execution"

AsgardBench は、vision-language model が視覚観察と最小限の success/failure feedback だけで high-level action sequence を修正できるかを測る benchmark。既存の embodied AI benchmark では navigation や low-level manipulation、または過剰な corrective feedback が混ざりやすいとして、controlled simulator 上で interactive planning だけを切り出す。108 task instances / 12 task types を用意し、object state、placement、scene configuration を系統的に変化させることで、同じ instruction でも観察内容に応じて異なる action sequence が必要になる conditional branch を作る。主要 VLM の評価では、visual input がない場合に性能が大きく落ち、visual grounding と state tracking の弱さが planning failure に直結することを示している。

## why_relevant_to_games

ゲーム内チュートリアルや puzzle で「失敗後に何を見て計画を直すか」を測る観点になる。操作ログだけでなく画面状態の理解を評価する候補。
