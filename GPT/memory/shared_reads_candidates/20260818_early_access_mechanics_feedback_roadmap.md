---
title: "How to Decide what Mechanics to add to an Early Access Game?"
url: "https://www.gamedeveloper.com/design/how-to-decide-what-mechanics-to-add-to-an-early-access-game-"
collected_at: "2026-08-18T12:30:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, production, player-feedback, early-access, live-ops]
evaluated_at: "2026-08-18T12:33:51.9397337+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787024421.016969"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787024421016969"
  char_count: 3525
  posted_at: "2026-08-18T12:40:24.5296131+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-18T12:40:24.5296131+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787024421016969"
next_action: none
stale_after: "2026-09-17"
supersedes: []
gate_reason: |-
  要望数をそのまま優先度にせず、意図抽出、分類、定型 pitch、担当者投票、工数見積り、theme 化へ段階的に変換する中核手順と実運用上の結論が明確。
  定量的な効果測定はないが、playtest feedback から次の mechanic と milestone を決める具体場面へ直接適用でき、限界も含めて約4000字の独立した分析を組める。
suggested_post_outline:
  overview_angle: "Early Access の要望投票ではなく、散在する player request を、実装責任と update の物語を持つ roadmap へ変換する意思決定 funnel として書く。"
  analysis_axis: "頻度、発言の背後にある意図、Aesthetic/QoL/Gameplay 分類、定型 pitch、担当者としての投票、工数、theme という異種の signal を各段階でどう保存・変換するかを分析する。"
  application_target: "Nao_u 作品の playtest 後に、feedback 原文から次 iteration の mechanic を選び、担当可能性と実装規模を確かめ、意味の通る milestone に束ねる部分。"
  pros_cons: "メリットは声量だけの feature voting を避け、支持を実装責任へ接続し、player に説明可能な update 単位を作れること。デメリットは self-selection と loud-player bias、定量的な成果検証の欠如、小規模 team の暗黙知への依存。"
  verdict_pre: "部分採用。feedback の同義統合から担当・工数確認までは採用し、theme 化は個別 mechanic の検証可能性を失わない範囲で使う。"
---

## raw_excerpt

Squeaky Wheel が『Academia: School Simulator』の Early Access で、寄せられる大量の機能要望から追加 mechanic を選ぶために使った手順の記録。まず design director が共通する feedback / request を spreadsheet にまとめ、同じ要求を異なる表現で述べた投稿を束ねて件数で重み付けする。この時、文面通りの機能ではなく player が何をしたがっているのかという context を読み取る。候補は Aesthetic / Quality of Life / Gameplay に分類し、team member は一週間かけて定型 template で mechanic を pitch する。単なる「欲しい」ではなく gameplay への影響を説明させるためである。次に、実装したい候補へ各 member が自分を担当者として割り当てる形で投票する。票のない候補は denied、複数票は賛否を議論し、実装期間の label を付けて schedule と照合する。一人だけが支持する案は、その member が game に必要な理由を team に説明する。最後に、残った mechanic を個別に並べず、law and order update のように相互に関係する theme へまとめる。記事は、この grouping が design task を管理可能な単位に分けると同時に、各 update で何が追加されるのか player に伝えやすくすると述べる。

## why_relevant_to_games

playtest や公開後 feedback から追加 mechanic を選ぶ場面で、要望の同義統合、意図の抽出、担当責任、工数、update theme までを一続きに扱う事例として参照できる。
