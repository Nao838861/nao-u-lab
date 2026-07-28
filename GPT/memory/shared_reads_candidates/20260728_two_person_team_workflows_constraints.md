---
title: "Workflows & Challenges of Developing Games as a Two-Person Team"
url: "https://80.lv/articles/workflows-challenges-of-developing-games-as-a-two-person-team"
collected_at: "2026-07-28T19:16:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, indie, production, prototyping, playtesting, scope]
evaluated_at: "2026-07-28T19:21:32+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785234603.586449"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785234603586449"
  char_count: 4499
  posted_at: "2026-07-28T19:30:27+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-28T19:30:27+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785234603586449"
next_action: none
stale_after: "2026-08-27"
supersedes: []
gate_reason: >-
  二人チームの商業制作を、期間・core mechanic・platform・prototype 行動 signal・demo playtime・外向きの可読性という一貫した制約系で説明している。
  単一 studio の事後談という限界はあるが、問題設定、実践、観測指標、結論と playable diff サイクルへの具体的な適用先を抽出でき、約4000字の概要に耐える。
suggested_post_outline:
  overview_angle: "少人数制作の scope を機能一覧ではなく、期間・core mechanic・市場への可読性・観測 signal を結ぶ制約契約として捉える"
  analysis_axis: "内部の楽しさと外部 appeal を分離し、再来訪、build 要求、median playtime、見せ方の可読性を段階別 evidence として使う妥当性と限界"
  application_target: "playable diff 後の自己評価で、core experience 改善量と実装時間を照合し、prototype の再来訪 signal、demo playtime、clip の可読性を別々に記録する"
  pros_cons: "判断を一貫させ scope creep を抑えられる一方、単一チームの経験則で因果検証がなく、50分という値や Steam 一平台戦略はそのまま一般化できない"
  verdict_pre: "部分採用"
---

## raw_excerpt

Thunderrock Innovations は、戦略性と replayability を重視する二人組 studio。前作『Keep Keepers』の商業制作を通じ、wishlist 上の可視性が財務的安定を保証しないこと、独自性が高くても既知 genre の足場がなければ player が内容を素早く理解できないことを学んだという。以後は一作およそ一年、単一の core mechanic を磨く、Steam 一平台に集中する、asset そのものより engine・tool・pipeline・成功した design pattern の知識を再利用する、という制約を置いている。

新案は小さく絞った prototype を作り、経験ある友人へ渡す。発言内容だけでなく、再び遊びに来るか、数日ごとの build を求めるかを初期 signal とする。一方、内部で楽しいだけでは市場での appeal を示さないため、prototype 段階から screenshot や短い clip で core mechanic が外部に読めるかも試す。demo では median playtime を追跡し、およそ50分に達するまで onboarding と mechanical depth を反復する。production 開始後は scope を固定制約として扱い、変更は追加より refinement または replacement を優先する。判断質問は “Does this improve the core experience enough to justify the time it will cost us?” とされる。

feedback は game 内から ticket system へ直接つなぎ、Discord thread や spreadsheet に埋もれない actionable task として受け取る。制作・project 管理の経験があっても marketing と discoverability が最大の運用課題だったため、demo、data、player との対話、見せ方の反復を development の一部に含めている。

## why_relevant_to_games

少人数制作で、core mechanic、期間、platform、prototype、playtest 指標、外向きの可読性を同じ scope 契約にまとめる事例。playable diff を早く出しながら、内部の楽しさと外部に伝わる appeal を別々に観測する場面に使える。
