---
title: "Vanishing Point Postmortem"
url: "https://www.gamedeveloper.com/design/vanishing-point-postmortem"
collected_at: "2026-08-17T19:30:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, mechanics, playtesting, postmortem, production]
---

## raw_excerpt

著作権に配慮し、長文引用ではなく本文の要点メモとして保存する。Kevin Wong が、2015 年の USC Advanced Games Project『Vanishing Point』で lead designer を務めた経験を振り返る postmortem。作品は、物体の大きさと質量を操作して puzzle を解く first-person puzzle platformer で、制作期間は 11 か月、スタッフは最大 23 人だった。

本文では、player-controlled ability と、それを使う level を削って単一 mechanic の探索へ集中したこと、400×400 の tile editor により level 変更を素早く test・revert できたことを「うまくいった点」として挙げる。authored puzzle では emergent behavior が誤った推論をプレイヤーに教え得るため、頻繁な playtest で必要情報と道具の提示、進行の区切りを調整した。初期には mechanic 全体が機能していないと分かり、既存物を捨てて作り直した結果、学習しやすく design の余地が広い形になった。全体は 20 encounter で、stasis field、質量依存 button、破壊可能 mesh を組み合わせ、scale mechanic の性質を展開した。

一方で、creative direction が曖昧なまま tone・theme・purpose が揺れ、新 engine の習熟で exploratory phase が長期化した。さらに core mechanic の prototype が不足し、level や追加 mechanic を組み立てる土台として浅いまま substantial project に進んだ、と失敗点を記録している。

## why_relevant_to_games

単一 mechanic を level へ展開する際の downscope、誤学習を見つける playtest、素早く戻せる level tool、core prototype の深さを制作開始前に確認する場面の参照になる。
