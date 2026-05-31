---
title: "Robo Dance, Postmortem, GamedevJS Jam 2026"
url: "https://forum.defold.com/t/robo-dance-postmortem-gamedevjs-jam-2026/82698"
collected_at: "2026-06-01T01:44:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, jam, rhythm, turn-based, testing]
evaluated_at: "2026-06-01T01:46:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-01T01:49:41+09:00"
last_decision: postponed_duplicate
evidence: "already posted to #shared-reads as https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779034850236629"
next_action: none
stale_after: "2026-07-01"
postpone_reason: "Phase 3 duplicate guard: same source URL already exists in #shared-reads atom sr-1779034850-de94d348a3."
supersedes: []
gate_reason: "同時ターン制とリズム同期の組み合わせで edge case が爆発し、movement/pushing を unit test/TDD 的に固めて進捗を回復した流れが明確。ゲーム制作への適用先が core logic、入力計画 UI、テスト設計に分解できる。4000字級の概要は設計変更、テスト導入、プレイテスト発見を軸に書ける。"
suggested_post_outline:
  overview_angle: "ジャム制作で複雑な同時解決ルールに詰まった時、ゲームロジックをテスト可能な単位に分けて制作速度を取り戻した事例として読む。"
  analysis_axis: "初期案の撤退、simultaneous turn-based への回帰、リズム同期の副作用、edge case、unit test/TDD 的な解決、プレイテストでの UI 課題を見る。"
  application_target: "パズル/アクション prototype の core logic を、見た目の前に deterministic な状態遷移テストで固める制作サイクル。"
  pros_cons: "メリットは実装上の詰まりと解決策が具体的な点。デメリットは Defold/ジャム文脈の個別事情があり、全ジャンルにそのまま当てはまるわけではない点。"
  verdict_pre: "採用"
---

## raw_excerpt
短い引用: "Classic game dev problem"

GamedevJS Jam 2026 向けに 2 週間で作られた Robo Dance のポストモーテム。最初は crafting / production game を試したがしっくり来ず、以前から試したかった simultaneous turn-based + turn planning の仕組みに戻った。音楽・効果音・演出はリズム同期の方向へ寄り、音が追加されるたびゲーム全体の感触が変わるため、聞き慣れた状態で音を選ぶ難しさも記録されている。

実装面では、同時解決のターン制が多数の edge case を生む。2 体が同じセルへ動いたらどうするかなど、状態解決ルールがすぐ複雑化するため、作者は 4-5 日ほど着手に迷い、開始後は unit tests と TDD 的な進め方で movement / pushing を固めた。core movement と解決器ができてからは進行が速くなった。

プレイテストでは、初期版でプレイヤーが操作や目的を理解できなかった。また、4 ターン分の計画を強制してから execute させる案は、フィードバック後に外した方が大きく良くなったと書かれている。

## why_relevant_to_games
同時ターン解決、リズム同期、入力計画 UI、unit test でルール複雑性を抑える話が、パズル/アクション prototype の core logic 設計に使える。
