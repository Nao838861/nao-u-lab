---
title: "Ask Early, Ask Late, Ask Right: When Does Clarification Timing Matter for Long-Horizon Agents?"
url: https://arxiv.org/abs/2605.07937
collected_at: 2026-05-16T11:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, clarification, long-horizon, evaluation, workflow]
source_note: "memory/raw/web_research/results.jsonl query=AI coding agents benchmark workflow; arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T11:33:56+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T11:41:36+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |-
  missing information の種類別に clarification timing を評価する問題設定、forced-injection framework、3 benchmark/4 model/84 variants/6000+ runs の評価規模、timing profile の結論が揃っている。
  ゲーム制作そのものの論文ではないが、phase 制作業で「開始前に聞くべき goal」と「途中まで価値が残る input」を分ける判断に直接使える。
suggested_post_outline:
  overview_angle: "長期 agent では clarification は早ければよいのではなく、欠けている情報の種類ごとに価値の残る時間帯が違う、という評価結果として整理する。"
  analysis_axis: "goal/input/constraint/context の欠落種別、trajectory 上の注入タイミング、never asking との比較、goal は早期に価値を失い input は中盤まで価値が残るという profile を軸にする。"
  application_target: "Nao_u_BOT の game production phases で、着手前 gate、実装途中確認、レビュー時保留を分ける運用基準に適用する。"
  pros_cons: "長所は曖昧さへの対応を一律ルールではなく情報種別で分けられる点。短所は paper の benchmark がゲーム制作専用ではなく、制作現場では質問コストやユーザー応答遅延も別途見る必要がある点。"
  verdict_pre: "採用。恒久ルール追加ではなく、Phase 3b/4a の小さな probe として試す価値が高い。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778899288756099"
next_action: none
posted:
  ts: "1778899288.756099"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778899288756099"
  char_count: 4397
  posted_at: "2026-05-16T11:41:36+09:00"

---

## raw_excerpt

arXiv abstract short quotes:

> "a single wrong assumption early on can cascade into irreversible errors"

> "the value of clarification depends sharply on what information is missing"

採取メモ: Gulati ほかによる 2026-05-08 submitted paper。長い作業を行う AI agent が、曖昧な指示に対して「聞くべきか」だけでなく「いつ聞くべきか」を測る。forced-injection framework により、goal / input / constraint / context の 4 種類の情報を、agent trajectory の異なる時点で注入し、3 benchmark、4 frontier model、84 task variants、6000+ runs で比較する。抽象のポイントは、早ければ常に良いのではなく、goal clarification は実行 10% を過ぎると価値をほぼ失い、input clarification は 50% 付近まで価値が残る、mid-trajectory を過ぎた clarification は never asking より悪化しうる、という timing profile。

## why_relevant_to_games

ゲーム制作サイクルで「曖昧だが進める」「今聞く」「後で評価する」の境界を設計する材料。特に phase 制の中で、着手前ゲートと実装途中確認を分ける判断に使えそう。
