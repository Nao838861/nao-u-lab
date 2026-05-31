---
title: "How a Party Game Tile Puzzle Became a Roguelite Where Your Spells Kill You?"
url: "https://itch.io/devlog/1468323/how-a-party-game-tile-puzzle-became-a-roguelite-where-your-spells-kill-you.amp"
collected_at: "2026-05-31T11:14:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, roguelite, puzzle, mechanics, prototype, fail-state]
evaluated_at: "2026-05-31T11:18:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-05-31T11:18:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-31T11:18:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-06-30"
supersedes: []
gate_reason: |
  party game 的な tile tray を casting circle / HP / working memory / action currency へ変換する中核が明確。
  ゲーム制作への適用も、単一 UI 要素に複数の圧を重ねる設計と、upgrade を数値ではなく認知変化にする判断として具体化できる。
suggested_post_outline:
  overview_angle: "単純な tile matching を、失敗状態と認知負荷を束ねる roguelite へ変える設計記録として読む"
  analysis_axis: "7 slots の緊張、fail state の多重機能、grimoire が視線と探索方針を変える構造"
  application_target: "小型パズル prototype、UI が health / memory / action economy を兼ねる設計、upgrade 設計"
  pros_cons: "再利用しやすい構造が多い一方、記事は個別 devlog なので数値の妥当性は自作プロトタイプで再検証が必要"
  verdict_pre: "採用"
---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。Backfire の 2026-03-24 devlog。出発点は tile-triple puzzle の 7-slot tray だが、単なる matching ではなく「tray を weapon / casting circle にする」発想へ変えている。triples は board clear ではなく spell damage になり、monster HP、floor descent、run over が入る。roguelite 化の中心は grimoire pages で、between floors に valid rune combination を変える cards を draft し、同じ tile set の見え方を変える。

重要部分は fail state の多重機能化。casting circle は health bar、working memory、action currency を同時に担う。7 slots が埋まることは死に近づくことであり、同時に次の tile を受ける余地と行動選択の余白を失うことでもある。作者は 9 slots では緊張が消え、5 slots では窒息感が強すぎ、7 slots が「足りそうで足りない」圧を作ると記録している。また grimoire の条件は単なる damage +1 ではなく、player が board を scan する視線を変えるものにする、という判断がある。

## why_relevant_to_games
単一 UI 要素に health / memory / action economy を重ねる設計例。小型プロトタイプで「数値強化ではなく認知の見え方を変える upgrade」を作る時の候補素材。
