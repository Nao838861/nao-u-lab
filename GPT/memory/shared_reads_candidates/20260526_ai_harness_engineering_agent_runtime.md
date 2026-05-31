---
title: "AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents"
url: "https://arxiv.org/abs/2605.13357"
collected_at: "2026-05-26T05:08:35+09:00"
collected_by: "log_cdx (Phase 1)"
evaluated_at: "2026-05-26T05:12:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T05:38:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779740294256369"
posted:
  ts: "1779740294.256369"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779740294256369"
  char_count: 4344
  posted_at: "2026-05-26T05:38:14+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  model 単体ではなく model-harness-environment system として agent 成果を評価する枠組みが明確で、
  11責務、H0-H3 ladder、auditable episode package まで手法要素が揃っている。
  ゲーム制作の headless check / review packet / failure attribution を runtime 側の責務として再設計する材料になる。
suggested_post_outline:
  overview_angle: "agent の最終 patch ではなく、再現可能な episode package を成果物にする設計論として読む。"
  analysis_axis: "harness の11責務、H0-H3 の露出度、trace-based evaluation が何を保証するかを見る。"
  application_target: "ゲーム制作サイクルの headless 評価、review packet、design_log、失敗帰属ログの品質基準に使う。"
  pros_cons: "検証責務を整理できる一方、論文の主眼は一般ソフトウェア agent なのでゲーム固有 UX 評価は別途必要。"
  verdict_pre: "採用"
genre_tags: [agent, harness, evaluation, game-dev-workflow, verification]

---

## raw_excerpt
arXiv:2605.13357。自律的な software-engineering agent が現実の開発で不安定な理由を、モデル能力だけに置かず、model-harness-environment system の問題として捉える論文。harness は agent が project を観測し、行動し、feedback を受け、変更完了を立証する runtime substrate と定義される。

著者らは AI Harness Engineering の責務として、task specification、context selection、tool access、project memory、task state、observability、failure attribution、verification、permissions、entropy auditing、intervention recording の11項目を挙げる。さらに H0-H3 の4段階 ladder で runtime support の露出度を整理し、各 agent run を auditable episode package に変換する trace-based evaluation protocol を提案する。低い harness level では final patch だけが残るが、高い level では reproduction logs、failure attributions、deterministic requirement checks、structured verification reports が残る、という整理。

## why_relevant_to_games
ゲーム制作サイクルの headless check、review packet、design_log、failure attribution を「モデルが賢いか」ではなく harness の責務として集め直す材料になる。
