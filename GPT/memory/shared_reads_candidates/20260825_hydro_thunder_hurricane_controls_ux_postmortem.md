---
title: "Postmortem: Vector Unit's Hydro Thunder Hurricane"
url: "https://www.gamedeveloper.com/design/postmortem-vector-unit-s-i-hydro-thunder-hurricane-i-"
collected_at: "2026-08-25T10:49:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, controls, playtesting, racing, usability, qa]
evaluated_at: "2026-08-25T10:54:12.6947816+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-25T10:54:12.6947816+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-25T10:54:12.6947816+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  現実寄りの水面物理を初見操作へ校正した反復と、短時間 playtest が長期 progression や QA coverage を見落とした失敗が対になっている。
  問題設定・変更手法・外部テスト・制作上の限界まで抽出でき、ゲーム評価を時間軸と目的別に分ける約4000字の批判的概要が成立する。
suggested_post_outline:
  overview_angle: "水上物理の忠実さを初見操作へ合わせた成功と、短時間反復だけでは全体体験を保証できなかった失敗を一つの評価設計として読む"
  analysis_axis: "物理 model の意図的な非現実化、説明なし外部テスト、早期 multiplayer、短時間 tuning と通し progression／QA coverage の分離"
  application_target: "ゲーム prototype の評価を、初見入力、moment-to-moment、全編 progression、例外・exploit QA の独立した試験へ分ける運用"
  pros_cons: "少人数でも観測単位を分けて具体的な改善へ接続できる一方、単一作品の制作後記で定量比較がなく、古い console 開発事情をそのまま一般化できない"
  verdict_pre: "部分採用"
---

## raw_excerpt

Vector Unit が小規模チームで水上レースゲーム『Hydro Thunder Hurricane』を開発した際のポストモーテム。水面物理は実在の船に近い浮力・流体計算から始めたが、時速200マイルを超える arcade racing には現実的すぎたため、人工的な downforce、高速時の浮力低下などを加えて操作感を作り直した。開発者自身はテストコースを問題なく走れた一方、説明なしで controller を渡した最初の外部テスターは壁へ衝突し続けた。そこで旋回 model を複数回簡略化し、現実味を残しながら初見でも扱える形へ調整した。split-screen multiplayer を早期に作ったことは、AI 実装前から wake、drafting、接戦の感触を検証する助けになった。

反面、毎日の短い対戦で corner や wave を細かく調整できた一方、最初から最後まで通す長時間テストが不足した。40 event を linear な credit ladder で解放する構造は、Race だけ遊びたい人にも Gauntlet や Ring Master を強制し、初心者向け難度から Expert までの幅も広すぎた。外部 QA は certification compliance に寄り、collision、boat balance、general usability の coverage が不足して leaderboard exploit などを残した。記事は、moment-to-moment の手触り、全体 progression、QA coverage を別の試験として扱う必要を示す制作記録になっている。

## why_relevant_to_games

操作の物理らしさを初見可読性で校正する方法と、短時間の反復 playtest だけでは長期 progression の強制や難度幅を見落とす問題を、プロトタイプの headless / human 評価設計へ接続できる。
