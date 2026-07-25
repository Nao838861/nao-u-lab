---
title: "AI did the content, I did the rules: a bullet-hell on the jagged frontier"
url: "https://itch.io/devlog/1547545/ai-did-the-content-i-did-the-rules-a-bullet-hell-on-the-jagged-frontier.amp"
collected_at: "2026-07-25T20:46:23.8040800+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, bullet-hell, postmortem, ai-copilot, procedural-content, verification]
---

## raw_excerpt

原文の短い核: “The AI is strong on the thing in isolation and blind to the thing in interaction.”

収集時の本文メモ（長文引用ではなく日本語での言い換え）: 2026年6月1日の初回 commit から約一週間で公開された、単一 `index.html` の東方風縦弾幕ゲーム『桜花弾幕 / Sakura Danmaku』の制作 postmortem。初日に Stage 1 とルール一式ができ、その後の五つの stage、各 midboss / boss、17曲の procedural soundtrack、balance が長い tail になった。作者は分業境界を、AI は個別のルール・画面・曲の生成と検査に強いが、プレイヤーが複数ルールを組み合わせて最適化した結果や、作品全体での一貫性を見落とす、と記す。落下 item を拾いにくい問題に対し、AI は pickup radius 拡大など局所修正を出したが、人間は射撃と focus を同時に離すと1.6倍速になる操作を足し、危険を冒した高速回収を score と残機獲得へ接続した。content は AI が stages、bosses、patterns、sound、music を生成し、人間は Stage 4 boss が Stage 3 より弱い、背景 lamp と敵弾を識別しにくい、Stage 5 の中段 spawn が回収行動と衝突する、spell 破壊点が total score の94%を占める、といった文脈上の不整合を弾いた。実装は Canvas2D / Web Audio、外部 asset なし、固定 1/120 秒 tick と seeded RNG を採用し、無入力の stage opening 全体を hash 化する golden fingerprint harness で refactor 前後の挙動一致を確認した。

## why_relevant_to_games

AI と人間の分業を「code 対 design」ではなく、局所生成・機械的回帰検査と、ルール相互作用・支配戦略・全体 coherence の監督に分けた一次制作例。弾幕 prototype の mechanic 設計、procedural content、deterministic headless 検証を組み合わせる場面の参照候補になる。
