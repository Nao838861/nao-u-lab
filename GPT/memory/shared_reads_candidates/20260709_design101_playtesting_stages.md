---
title: "Design 101: Playtesting"
url: "https://www.gamedeveloper.com/design/design-101-playtesting"
collected_at: "2026-07-09T01:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, prototype, feedback-loop]
evaluated_at: "2026-07-09T01:48:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T01:48:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T01:48:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: "playtest を Concept / Scattershot / Experience / Stress / Accessibility に分け、各段階で見るべき入力と出力を変える実務的な枠組みがある。Nao_u_BOT の playable diff 評価で、headless clear だけでは見落とす仮説検証・感情観察・破壊的検証を分離する軸として使える。~4000字の概要でも問題設定、手法、段階別適用、限界まで展開できる。"
suggested_post_outline:
  overview_angle: "playtesting を単発の確認ではなく、開発段階ごとに問いを変える評価設計として紹介する"
  analysis_axis: "5 種類のテストがそれぞれ何を測り、どの失敗を防ぐかを比較する"
  application_target: "Nao_u_BOT の prototype 評価で Concept / Experience / Stress / Accessibility の不足を明示し、playable diff 後の観察項目を増やす"
  pros_cons: "メリットは小さな試作でも評価目的を混同しにくいこと。デメリットは記事単体では計測項目やログ設計までは十分に具体化されないこと。"
  verdict_pre: "採用"
---

## raw_excerpt
Game Developer / Dan Felder の playtesting 基礎記事。記事は、ゲーム設計では理論や思考実験だけでは複雑な相互作用と人間要因を予測しきれず、早期の playtest が必要だと置く。playtest を単一の活動ではなく、Concept Testing、Scattershot Testing、Experience Testing、Gameplay Stress Testing、Accessibility Testing の段階に分け、それぞれの目的を変える構成。

短い原文句: "Don't try to solve problems. Replicate successes." / "rapidly prototype the mechanics" / "what your players are feeling as they play"

メモ: Scattershot Testing では、最初から最良案だけを磨くのではなく、複数メカニクスや敵・能力の粗い変種を同時に試し、bright spots を見つけてから絞る。Experience Testing では建設的提案よりも、プレイヤーがいつ何を感じたかの観測を重視する。Stress Testing では、最適化・悪用・破壊的プレイを歓迎し、結論だけでなく実際に起きた状況を記録させる。

## why_relevant_to_games
Nao_u_BOT の prototype 評価で、headless clear 判定だけでは拾えない「どの段階の playtest か」を分ける素材になる。Phase 2 では、現在のゲーム制作サイクルに Concept / Experience / Stress / Accessibility のどれが欠けているかを見る候補。
