---
title: "Postmortem: Vector Unit's Hydro Thunder Hurricane"
url: "https://www.gamedeveloper.com/design/postmortem-vector-unit-s-i-hydro-thunder-hurricane-i-"
collected_at: "2026-08-25T10:49:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, controls, playtesting, racing, usability, qa]
---

## raw_excerpt

Vector Unit が小規模チームで水上レースゲーム『Hydro Thunder Hurricane』を開発した際のポストモーテム。水面物理は実在の船に近い浮力・流体計算から始めたが、時速200マイルを超える arcade racing には現実的すぎたため、人工的な downforce、高速時の浮力低下などを加えて操作感を作り直した。開発者自身はテストコースを問題なく走れた一方、説明なしで controller を渡した最初の外部テスターは壁へ衝突し続けた。そこで旋回 model を複数回簡略化し、現実味を残しながら初見でも扱える形へ調整した。split-screen multiplayer を早期に作ったことは、AI 実装前から wake、drafting、接戦の感触を検証する助けになった。

反面、毎日の短い対戦で corner や wave を細かく調整できた一方、最初から最後まで通す長時間テストが不足した。40 event を linear な credit ladder で解放する構造は、Race だけ遊びたい人にも Gauntlet や Ring Master を強制し、初心者向け難度から Expert までの幅も広すぎた。外部 QA は certification compliance に寄り、collision、boat balance、general usability の coverage が不足して leaderboard exploit などを残した。記事は、moment-to-moment の手触り、全体 progression、QA coverage を別の試験として扱う必要を示す制作記録になっている。

## why_relevant_to_games

操作の物理らしさを初見可読性で校正する方法と、短時間の反復 playtest だけでは長期 progression の強制や難度幅を見落とす問題を、プロトタイプの headless / human 評価設計へ接続できる。
