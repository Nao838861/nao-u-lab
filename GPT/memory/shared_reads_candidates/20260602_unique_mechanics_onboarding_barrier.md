---
title: "The more unique or complicated your mechanics are, the more barriers you make the player have to clear to enjoy your game"
url: "https://www.reddit.com/r/gamedesign/comments/1tke106/the_more_unique_or_complicated_your_mechanics_are/"
collected_at: "2026-06-02T16:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, onboarding, controls, camera, mechanics, indie-postmortem]
evaluated_at: "2026-06-02T18:02:14+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-02T18:02:14+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T18:02:14+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  独自操作が first minutes の楽しさに届く前の barrier になる、という問題設定が具体的で、camera、depth perception、mode switching に分解できる。
  Nao_u_BOT の新 mechanic 検討で「標準操作から外す cost と得る gameplay gain」を評価する軸に直結する。
  Reddit postmortem だが、作者の失敗例とコメント側の設計分解が揃っており、4000字級の概要にできる。
suggested_post_outline:
  overview_angle: "独自 mechanic は価値そのものではなく、プレイヤーが最初に越える認知・入力・視界の関門を増やす投資として扱う。"
  analysis_axis: "作者の demo 失敗、camera/depth/mode switching の分解、標準操作でも同じ gameplay が成立するかという費用対効果。"
  application_target: "新規 prototype の first 3 minutes、独自操作採用判断、camera と auto-aim の補助設計。"
  pros_cons: "長所は抽象論でなく onboarding failure を操作系・視界・level cue に落とせる点。短所は単一 reddit 事例で、定量評価はない点。"
  verdict_pre: "部分採用。独自 mechanic の採否ゲートと初回プレイ観察チェックリストに使う。"
---

## raw_excerpt

Reddit r/gamedesign の Paradox Patrol demo postmortem。作者は、1 か月 game jam から始まって受賞した prototype を半年ほど広げ、Omni-Shooter という独自 control / combat system を作ったが、demo では player が controls を grasp できず、bright pink glowing flowers で waypoint を置いた level でも同じ場所で詰まったと書いている。作者の仮説は、独自性や複雑性が高い mechanics は、player が楽しむ前に越える barrier を増やしすぎるというもの。作者は concept / story には愛着があるが、player に楽しんでもらうには regular third-person shooter に寄せる必要があるかもしれない、と振り返っている。

コメント側には、camera / level design / depth perception / mode switching の問題として分解する視点が出ている。特に、固定カメラ的な platforming で Z axis の landing が読めないこと、敵が少し外角にいるだけで mode switching が必要になり combat flow を壊すこと、auto-aim や designer-controlled camera で player の視線を助けられることが指摘される。別コメントでは、独自 mechanics が何を買っているのか、標準 control scheme でも同じ gameplay が成立するなら、player に新 system を学ばせる cost に見合う gain があるのかを問うている。

## why_relevant_to_games

新規 mechanic を作る時、「独自性」ではなく、入力負荷、camera、first 3 minutes の confused state、標準操作から外すことで得る具体的な gameplay gain を Phase 2 で検討する材料になる。
