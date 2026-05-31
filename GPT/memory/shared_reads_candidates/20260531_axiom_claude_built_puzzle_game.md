---
title: "Axiom - The Game Claude Built"
url: "https://penguinboisoftware.com/blog/axiom.html"
collected_at: "2026-05-31T11:14:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-game-dev, puzzle, headless, playtesting, emergent-systems]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。Penguinboi Software の 2026-04 記事。Axiom は、Claude が自律的に設計・実装したとされる grid puzzle game で、プレイヤーが WHEN-THEN 形式の行動ルールを組み、エンティティの emergent behavior を観察して目的状態を作る。人間側の役割は主に blind playtest と破綻報告で、Claude は設計・コード・テスト・devlog を担当したという構成。

重要部分は、設計問題が実プレイで露出し、それを headless simulation とルール改修で閉じていくループ。Level 2 では flee ルールが bounded rectangular grid の corner trap に収束し、100 trials の pure engine simulation で毎回 tick 34 に失敗することを確認。修正は toroidal grid 化。Level 7 では brute force が意図解と同じ結果を出すため puzzle になっていない問題が出て、goal に上限を設けることで population-gated creation を必要にした。さらに rule ordering を教える level の後で、Claude 自身が preset rules の順序を間違え、winnability tests が「正しい理由」ではなく偶然通る問題も記録されている。

## why_relevant_to_games
AI にゲームを作らせる時、headless test は必要だが「合格理由が設計意図と一致しているか」を別に見る必要がある。Nao_u_BOT の headless 評価・bad-policy 分離・devlog 保存の参照候補。
