---
title: "Snake Story: Exploring Game Mechanics for Mixed-Initiative Co-creative Storytelling Games"
url: "https://arxiv.org/abs/2404.07901"
collected_at: "2026-08-31T18:36:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mixed-initiative, narrative-game, generative-ai, playtest]
---

## raw_excerpt

原文短句: “players must balance the survival of the growing snake with the quality and coherence of the story”

収集メモ: 既存の mixed-initiative storytelling game が物語生成を主目的にし、gameplay mechanics を弱く扱いがちだという問題から、古典的 Snake と GPT-3 の共同執筆を統合した prototype を作る。各 round では AI が二つの文章断片を生成し、それぞれを盤面上の candy に対応させる。player は snake を操作して一方を取得し、対応文を物語へ追加する。candy には回復、障害物追加、体力減少などの効果があり、好ましい文章と生存上の利益が一致しない場合がある。青 candy の次 round には自作文を入力できる黄 candy が出る。文章提示時は25秒、自作文時は45秒 pause する。

米国の大学で game design を学ぶ11名が、snake が死亡するまで約10〜15分 play し、think-aloud と15〜20分の semi-structured interview に参加した。全142 round で、高 temperature の文章が89回、低 temperature が43回、自作文が10回選ばれた。gameplay state が悪い時ほど参加者は物語より生存を優先した。質的分析では、story quality を優先して mechanics を妨害と感じる writer、story をほぼ無視して survival を遊ぶ player、gameplay を物語の続きを読む動機として扱う reader の三つの role perception が観察された。著者は、writer には gameplay goal と writing goal の整合、player には mechanics と物語結果の強い結合、reader には物語への curiosity と適度な urgency の両立を設計上の観点として挙げる。対象が11名の game-design student、単一の Snake prototype であることも明記されている。

## why_relevant_to_games

生成 AI の出力選択を既存 mechanic の reward / risk と結び付けた時、創作・勝敗・鑑賞のどれを主目的に感じるかが分かれる事例として、narrative prototype の mechanic 設計と playtest 観察項目に使える。
