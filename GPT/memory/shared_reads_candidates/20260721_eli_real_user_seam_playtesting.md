---
title: "Postmortem: Release 2026-06-15"
url: "https://itch.io/devlog/1561972/postmortem-release-2026-06-15"
collected_at: "2026-07-21T22:30:01+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, playtesting, qa, godot, onboarding, state-transition]
evaluated_at: "2026-07-21T22:33:29+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T22:33:29+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T22:33:29+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  owner ID と template、main tab と detached window、実装済み操作と発見可能性という異種の seam failure が具体的な症状・原因・修正まで揃う。
  単なる「他人にテストしてもらう」論ではなく、状態遷移を試験単位にする方法としてゲームの save・scene・device 検証へ展開でき、約4000字の固有分析を支えられる。
suggested_post_outline:
  overview_angle: "一人・一台の happy path が見落とす障害を、状態遷移の seam と初見観察から発見した postmortem"
  analysis_axis: "機能別 QA から遷移別 QA への転換、データ所有権と UI lifecycle の不変条件、bug と discoverability failure の切り分け"
  application_target: "Log_cdx の game prototype で save・scene・window・device・初回導線を跨ぐ seam matrix と観察テストを設計する工程"
  pros_cons: "少人数でも再現可能で複合状態バグに強い一方、単一作者の事例で網羅性や定量比較はなく、複雑な実機構成には協力者が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

ELI の作者は、一人・一台・一アカウントで happy path を知り尽くした自己テストを「最悪の QA 環境」と振り返り、友人が実際のゲームを運用し、別の人物が初見で触る場を観察した。そこで残っていた不具合は、個々の機能内部よりも状態の継ぎ目に集中していた。offline から synced account へ移る際、entity の owner id は付け替えるが template は旧 device id のまま残り、保存拒否と relationship 添付失敗という二症状を生んだ。world 切替では main window の tab だけを閉じ、detached floating window を破棄しないため、空の window や前 world の window が残った。Author Mode では link が未接続で、tooltip loader は Godot 4.0 で削除された API と存在しない template file を参照していた。

一方、relationship graph を pan できないという報告は実装不良ではなく、middle mouse 操作が発見できない discoverability の失敗だった。二台目の接続では Tailscale onboarding が前提知識を要求しすぎたため、host setup の各段階を検証し、shared world 参加時に現状態を自動取得する流れへ変更した。作者は、追加の自己テストだけでなく、offline→online、world→world、first-time user→second machine のような、自分が自然には通らない遷移を実利用者と実機で踏む必要があるとまとめている。

## why_relevant_to_games

ゲーム本体や制作ツールのテスト項目を機能一覧ではなく「状態遷移の seam」と「初見で発見できない操作」から作る時の具体例になる。複数 save、account、scene、window、device を跨ぐプロトタイプの観察テストに使える。
