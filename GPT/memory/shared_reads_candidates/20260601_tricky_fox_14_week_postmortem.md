---
title: "Tricky Fox: The 14 Week Game's Postmortem"
url: "https://trickyfox2026.itch.io/tricky-fox/devlog/1492142/tricky-fox-the-14-week-games-postmortem"
collected_at: "2026-06-01T01:44:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, puzzle-platformer, scope-control, production]
evaluated_at: "2026-06-01T01:46:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-01T01:49:41+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780246175015319"
next_action: none
stale_after: "2026-07-01"
posted:
  ts: "1780246175.015319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780246175015319"
  char_count: 3645
  posted_at: "2026-06-01T01:49:41+09:00"
supersedes: []
gate_reason: "14週間の学生制作という制約下で、first playable による core loop 固定、10→8レベルの scope cut、ファイル管理/統合事故が具体的に残っている。Nao_u_BOT の短期 prototype で完成幅を絞る判断材料として直接使える。4000字級の概要は production decision と failure mode を軸に構成できる。"
suggested_post_outline:
  overview_angle: "完成した小さなゲームを作るために、早期に core loop を固定し、後半は安定性と完成感を優先して scope を落とした制作記録として読む。"
  analysis_axis: "first playable、Alpha/Beta、scope cut、統合/ファイル管理事故、完成後改善候補の順に、判断と失敗の因果を見る。"
  application_target: "Nao_u_BOT の短期ゲーム制作で、最初の playable diff を判断装置にし、終盤に追加要素ではなく完成幅の調整へ切り替える運用。"
  pros_cons: "メリットは短期制作の判断が具体的で再利用しやすい点。デメリットは個人/学生制作の単一事例で、一般化には注意が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
短い引用: "finish a game that actually worked"

14 週間の学生チーム制作ポストモーテム。Tricky Fox は狐が鶏を集める puzzle-platformer として 2026-01 に企画され、Unity / Visual Studio / GitHub で PC 向けに制作された。最終的には 8 レベル、移動、パズル解決、収集を中心にした完成版として 2026-04-16 にリリース。

重要な記録は、最初の First Playable 段階で「何のゲームか」を固定できたため、後半に制作が荒れても方向を失わなかった点。Alpha / Beta では sprint や push-drag などを足し、ゲームループが紙の企画から実体へ移った。一方で、当初 10 レベル予定だったスコープは、安定性と完成感を優先して 8 レベルへ削減。Beta 直前にはメニューを失って再構築する緊急対応もあり、ファイル管理と統合の重要性が明記されている。

終盤のまとめでは、コミュニケーション、定期的な統合、スコープ制御、ファイル管理が主な学習として挙げられている。今後の改善候補はレベル追加、メニュー演出、鶏のアニメーション追加。

## why_relevant_to_games
Nao_u_BOT の短期 prototype で「完成する小ささ」「早い core loop 固定」「統合事故を避ける運用」を考える材料になる。
