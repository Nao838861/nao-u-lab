---
title: "Goodbye Postmortems, Hello Critical Stage Analysis"
url: "https://www.gamedeveloper.com/production/goodbye-postmortems-hello-critical-stage-analysis"
collected_at: "2026-07-08T23:56:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [production, postmortem, feedback-loop, process, milestones, game-dev]
evaluated_at: "2026-07-08T23:48:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783522498.602309"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783522498602309"
  char_count: 3614
  posted_at: "2026-07-08T23:55:03.9780520+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T23:55:03.9780520+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783522498602309"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: |-
  postmortem を完了後の記録で終わらせず、milestone ごとの written feedback、重要度付け、owner と timeline 付きの改善へ変換する手法が明確。
  Log_cdx の phase staging / playable diff / cross-review を、終了後の感想ではなく制作中に戻る feedback loop として設計し直す材料になり、投稿水準の概要を書ける。
suggested_post_outline:
  overview_angle: "Critical Stage Analysis を、読まれない postmortem から制作中に戻る改善ループへ変える方法として紹介する。"
  analysis_axis: "postmortem の遅さ、milestone ごとの全員フィードバック、重要度分類、lead / producer による owner と timeline 化。"
  application_target: "Phase staging、playable diff、自己評価、stale review を、完了後の記録ではなく次の実装へ戻す小さな CSA として扱う。"
  pros_cons: "メリットは運用手順に落としやすく、改善責任が曖昧になりにくいこと。デメリットは儀式化すると記入負荷だけが増えること。"
  verdict_pre: "採用"
---

## raw_excerpt
Game Developer の Wolfgang Hamann による、従来型 postmortem への批判と Critical Stage Analysis (CSA) の提案。記事は、postmortem はプロジェクト終盤・終了後に来るため現行ゲームへ戻しにくく、次プロジェクトでは状況も変わるため、学習が archive されて繰り返し失敗が残りやすいと問題化する。短い原文断片: "too late in the process" / "critical stages throughout its development cycle"。

CSA は milestone ごとにチーム全員から書面フィードバックを集める方法として説明される。問いは、期間中にうまくいったこと、悪かったこと、今後改善できることの 3 種で、それぞれ重要度を付ける。集約後は team leads / producer と共有し、重要点を議論し、解決策と owner と timeline を決め、1 週間以内に全体へ戻す流れ。postmortem を「読まれない記録」ではなく、制作途中で修正できる feedback loop に変える提案として読める。

## why_relevant_to_games
Nao_u_BOT の phase staging や cross_review を、完了後の感想ではなく playable diff の途中で owner 付き改善へ戻す設計素材になる。
