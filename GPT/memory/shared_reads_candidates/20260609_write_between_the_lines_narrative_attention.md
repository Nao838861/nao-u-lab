---
title: "Write Between the Lines: How to Write Video Game Stories In a Distracted, Polarized, Media Illiterate World"
url: "https://gamedevdolin.com/gdc2026/"
collected_at: "2026-06-09T07:25:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, player-attention, gdc, writing]
evaluated_at: "2026-06-09T07:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-09T07:28:16+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780957691430689"
next_action: none
posted:
  ts: "1780957691.430689"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780957691430689"
  char_count: 3506
  posted_at: "2026-06-09T07:28:16+09:00"
stale_after: "2026-07-09"
supersedes: []
gate_reason: "attention economy / media literacy という問題設定、layered storytelling・curiosity reward・strategic brevity という中核、短い文量と深い物語を両立する結論が抽出できる。小規模プロトタイプで環境語り、観察報酬、UI文量制御へ落とせるためゲーム制作への適用が具体的。講演ページ由来で評価事例の厚みは限定されるが、CoopEval水準の概要は設計原則と実装観点を中心に構成可能。"
suggested_post_outline:
  overview_angle: "注意資源が細いプレイヤーに対して、短く浅くするのではなく、浅い入口と深い探索層を分けて物語理解を設計する軸で書く。"
  analysis_axis: "layered storytelling、curiosity reward、strategic brevity を、情報配置・報酬設計・テキスト密度制御の3要素として分解する。"
  application_target: "Nao_u_BOT の短期 playable diff で、説明文を増やさずに観察、移動、音、UI反応へ物語理解を分散させるチェックリストに効く。"
  pros_cons: "メリットは小規模でも深みを出しやすい点。デメリットは評価指標が曖昧になりやすく、情報不足を意図的余白と誤認しやすい点。"
  verdict_pre: "部分採用。文章量削減ではなく、入口の軽さと探索報酬の設計原則として採用する。"
---

## raw_excerpt
長文引用ではなく、GDC 2026 講演ページと公開スライドからの要点メモとして保存する。Alexa Ray Corriea と Adam Dolin による narrative design 講演で、問題設定は「プレイヤーが大量の情報と短い注意資源の中で物語を消費する時代に、ゲームの書き手がどう深い関与を設計するか」。講演ページは、プレイヤーが以前より media-savvy である一方、批評的に物語へ関与する道具を十分に持たない場合があると述べ、interactive media がその隙間を埋められると位置づける。スライド側では、creative risk、attention economy、media literacy を柱に置き、narrative success の戦略として layered storytelling、rewarding curiosity、strategic brevity を挙げる。短い原文断片: "Design systems that encourage deep engagement" / "Reward player curiosity" / "Short text ≠ shallow story"。

## why_relevant_to_games
小規模プロトタイプでも、説明文を増やす代わりに環境・UI・音・行動報酬で物語理解を分散させる設計メモとして使える。特に、初見導線と hidden depth を両立させたい時の narrative / UX 参照点になる。
