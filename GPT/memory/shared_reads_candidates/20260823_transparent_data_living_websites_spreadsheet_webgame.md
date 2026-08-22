---
title: "Transparent Data, Living Websites: Spreadsheets for Realtime (and Visible!) Webgame Integration"
url: "https://media.gdcvault.com/gdc2026/Slides/Pierre_Guillaume_SpreadsheetsMicrotalks.pptx.pdf"
collected_at: "2026-08-23T07:03:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, tools, rapid-prototyping, webgame, live-tuning]
---

## raw_excerpt

GDC 2026 の Spreadsheets Microtalks 内、Everest Pipkin による講演。原文短句は “Game Design in Google Sheets” と “Live editing games by writing in the spreadsheet”。以下は該当スライド 8〜23 の日本語採録である。

Pipkin は browser game の小さな JavaScript engine に、room、object、NPC、interaction、special event の処理だけを hardcode し、変化しやすい game content は外部 spreadsheet から読み込む構成を示す。表では `Name / Type / Speed / Friendly To / Unfriendly To` を game object の property に対応させ、Google Sheets を CSV として web 公開し、Fetch API で取得して key-value data に変換する。sheet を直して game を refresh すれば speed や説明、画像などを即座に調整でき、列を追加して受け側の function を用意すれば property を拡張できる。

さらに spreadsheet を flavor text や数値だけに限定せず、`wiggle / hide / popup / attack / destroy` などの modular behavior script、movement、初期座標をセルから割り当てる。新しい魚や UI 部品を行として足すだけで既存 behavior を組み合わせられる。一方、公開中の sheet 更新は patch download なしで反映されるため、想定外の値を受けても壊れない script が必要になる。実例として remote data が読めず game が壊れた報告画面を示し、公開用とは別の sheet で local test した値だけを live file へ移す手順を勧める。また web 公開した sheet は閲覧可能であり、game logic の露出を隠せない点も明示している。

## why_relevant_to_games

小規模 webgame で、敵・UI・挙動の tuning を code rebuild から切り離し、設計変更をすぐ playable diff として試す場面に関係する。live data の柔軟性と、検証用 sheet・想定外値・公開情報という運用上の注意を同時に収集できる。
