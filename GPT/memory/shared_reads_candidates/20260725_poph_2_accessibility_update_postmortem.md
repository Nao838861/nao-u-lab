---
title: "PoPH 2.0 Postmortem, or On Doing A Massive Update on Your Old Game"
url: "https://knickknackpj.itch.io/pillarsonpoppyhills/devlog/1390476/poph-20-postmortem-or-on-doing-a-massive-update-on-your-old-game"
collected_at: "2026-07-25T10:00:48.0312417+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, accessibility, visual-novel, renpy, maintenance, preservation]
---

## raw_excerpt

原文要点の採録（長文引用を避け、日本語で忠実に言い換えた）。作者は、5年前に Ren'Py 6.99 系で制作した visual novel『Pillars on Poppy Hills』を、現在使っている Ren'Py 8 系の個人 GUI framework へ移植した。主目的は作品の全面的な remake ではなく、text-to-speech、画像 caption / alt text、個別 sound の mute、timed choice の無効化など、現在の制作環境で標準化した accessibility と navigation を旧作へ戻すことだった。創作面の描き直しや文章の全面改稿は、当時の作者の技量と判断を保存すること、scope が際限なく広がるのを防ぐことから明示的に避けた。

移植では解像度変更や画像再配置より、旧 Ren'Py が暗黙に行っていた textbox transition の再現が大きな作業になった。作者は旧版と新版を並べ、表示・消去の timing を一つずつ照合した。alt text は単なる別欄の説明にせず narrative の流れへ溶け込ませたが、抽象的な神の外見を言葉にすると長くなること、複数台詞を同じ画面に置く演出では text-to-speech が最後の一行しか読まないこと、無言の「…」が読み上げでは情報を失うこと、非表示の alt text が save/load 画面の直近台詞 hook に混ざることなど、既存演出との衝突が露出した。実際に全編を text-to-speech で通す作業は、読み上げだけでなく typo、発音、文章の流れ、GUI の不整合を見つける回帰テストにもなった。作者は accessibility 更新と追加 side story を分け、後者は各 ending 約2000語に scope を固定している。

## why_relevant_to_games

旧作の保守で「体験を現代化する部分」と「過去の創作判断として保存する部分」を分ける実例であり、accessibility 機能を追加した時に既存の演出・save data 表示・音響制御まで横断して検証する場面に参照できる。
