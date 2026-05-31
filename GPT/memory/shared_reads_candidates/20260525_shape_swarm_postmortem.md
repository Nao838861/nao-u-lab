---
title: "Shape Swarm Post Mortem - Launching Digital Sagas' First Game"
url: https://indiesagas.com/shape-swarm-post-mortem-launching-digital-sagas-first-game/
collected_at: 2026-05-25T11:41:36+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, indie-game, scope-management, roguelite, playtest-feedback, steam-launch]
evaluated_at: 2026-05-25T11:45:31+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T11:53:05+09:00"
last_decision: posted
stale_after: "2026-06-24"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779677581255999"
posted:
  ts: "1779677581.255999"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779677581255999"
  char_count: 3852
  posted_at: "2026-05-25T11:53:05+09:00"
next_action: none
gate_reason: |-
  初商用出荷の目的設定、既存システム流用、差別化 mechanic、デモ運用、発売後実績まで揃っており、postmortem として残す情報量がある。
  短期プロトタイプを「小さく出す」だけで終わらせず、Architect Mode のような固有要素を育てる判断に接続できる。
suggested_post_outline:
  overview_angle: 大ヒットではなく「出荷経験を得る」ためにスコープを切り、既存技術と小さな差別化で商用リリースまで運ぶ事例として読む。
  analysis_axis: scope reduction / code reuse / genre study / demo feedback / launch metric の連鎖と、Architect Mode が差別化点になった過程。
  application_target: 自作プロトタイプの v1 出荷基準、既存コード流用判断、デモを検証器として使う運用、敵側成長などの差別化 mechanic 探索。
  pros_cons: 現実的な出荷学習には強いが、売上規模は小さく、成功ノウハウとして過大評価しない注意が必要。
  verdict_pre: 採用。小規模ゲームを完成・公開まで持っていく運用事例として shared-reads に残す価値がある。

---

## raw_excerpt
Indie Sagas 2026-05-17 の postmortem。Digital Sagas が初の商用ゲームとして Shape Swarm を出すまでの、スコープ設定、既存システム流用、Steam Next Fest、デモ、フルリリースの記録。短い原文抜粋: "the project needed to be smaller in scope"。要点メモとして、目的は大ヒットではなく「実際に出荷したスタジオ」になることだったため、survivor-like のミニマルなアクション roguelite を選び、プレイヤー操作・敵移動・自動ターゲット武器から開始した。Lost Colony の enemy spawning / state management / object pooling を流用して開発を短縮。genre study とレビュー読解から Infinite Mode / Architect Mode を追加し、プレイヤーが敵側の成長を選ぶ Architect Mode が差別化要素になった。デモは 12 分に絞り、フィードバックで Thorn Shield / Health Recovery を one-time-use から passive upgrade に変更。発売 1 か月で 16 copies / Steam positive reviews 4 件という小規模実績も記録している。

## why_relevant_to_games
小さく出荷する目的設定、既存コード流用、デモを playtest tool として使う流れ、差別化 mechanic の育て方を、短期プロトタイプ運用の候補材料にできる。
