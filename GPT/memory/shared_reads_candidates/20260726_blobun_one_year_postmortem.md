---
title: "One Year Of Blobun"
url: "https://cyansorcery.itch.io/blobun/devlog/1455287/one-year-of-blobun"
collected_at: "2026-07-26T16:48:23.3967710+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle, postmortem, difficulty, progression, launch, player-feedback]
---

## raw_excerpt

収集時の要点メモ（原文の長文引用ではない）。top-down puzzle game『Blobun』の発売1年後の記録。difficulty について「簡単すぎる」という反応がある一方、その2～3倍ほど「難しく、全 puzzle を解けない」という反応もあり、作者は player ごとの mechanic への適性差を観測している。設計目標は、必須 puzzle だけなら到達しやすく、望む人には難問を残すことだった。Steam achievement では game clear が29.2%、全 puzzle complete が21.7%、約3分の1が8 world 中の world 7 まで到達した。作者は progression が mechanic を露骨に説明せず教えられたという feedback も受けている。

release 後は、debug tool だった puzzle editor を player 向け機能にし、online puzzle integration、menu と視認性の改善、rule consistency の bug 修正を行った。既存 puzzle の解答が攻略動画と食い違わないよう layout 変更を避け、logic bug のあった1問も solution を維持したまま block を1マス動かした。価格は想定プレイ時間4～6時間に対し実測感が2.5～4時間で、発売時14.99ドルから9.99ドルへ変更。1年間の販売は Steam 1420本、itch 271本、platform fee と税引き後の収益は概算11700ドル。今後の追加 content より、小規模な次作を継続して出す判断を記している。

## why_relevant_to_games

平均 difficulty だけでなく optional challenge と到達率を分けて見る puzzle progression の実例。公開後の解答互換性、editor の製品化、価格と制作継続判断まで同じ作品の数字で追える。
