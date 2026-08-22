---
title: "Transparent Data, Living Websites: Spreadsheets for Realtime (and Visible!) Webgame Integration"
url: "https://media.gdcvault.com/gdc2026/Slides/Pierre_Guillaume_SpreadsheetsMicrotalks.pptx.pdf"
collected_at: "2026-08-23T07:03:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, tools, rapid-prototyping, webgame, live-tuning]
evaluated_at: "2026-08-23T07:08:47+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-23T07:15:15.9538445+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787436897991969"
next_action: none
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  固定 engine と変化しやすい content の分離、CSV 取得と property/behavior への写像、
  live 更新の失敗例と staging 運用まで具体的で、小規模 webgame の反復制作へ直接適用できる。
  定量評価はないが、実装機構・実運用上の評価・限界を区別すれば約4000字の高密度な概要を構成できる。
suggested_post_outline:
  overview_angle: "spreadsheet を単なる数値表ではなく、公開 webgame の content/behavior layer として扱う設計と、その安全な運用条件"
  analysis_axis: "固定 engine と可変 data の境界、行・列から property/behavior への写像、即時反映が生む反復速度と障害面の対称性"
  application_target: "Log_cdx の小規模 webgame prototype で、敵・UI・挙動の tuning を rebuild から切り離し、検証用 sheet から live data へ昇格させる playable-diff サイクル"
  pros_cons: "利点は非コード編集、即時 tuning、既存 behavior の再結合。欠点は remote fetch 障害、無効値による破損、logic の公開、schema と受け側 function の同期負担"
  verdict_pre: "部分採用。authoring と staging には有効だが、公開 runtime の唯一の依存先にはせず validation と fallback snapshot を置く"
posted:
  ts: "1787436897.991969"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787436897991969"
  char_count: 3984
  posted_at: "2026-08-23T07:15:15.9538445+09:00"
---

## raw_excerpt

GDC 2026 の Spreadsheets Microtalks 内、Everest Pipkin による講演。原文短句は “Game Design in Google Sheets” と “Live editing games by writing in the spreadsheet”。以下は該当スライド 8〜23 の日本語採録である。

Pipkin は browser game の小さな JavaScript engine に、room、object、NPC、interaction、special event の処理だけを hardcode し、変化しやすい game content は外部 spreadsheet から読み込む構成を示す。表では `Name / Type / Speed / Friendly To / Unfriendly To` を game object の property に対応させ、Google Sheets を CSV として web 公開し、Fetch API で取得して key-value data に変換する。sheet を直して game を refresh すれば speed や説明、画像などを即座に調整でき、列を追加して受け側の function を用意すれば property を拡張できる。

さらに spreadsheet を flavor text や数値だけに限定せず、`wiggle / hide / popup / attack / destroy` などの modular behavior script、movement、初期座標をセルから割り当てる。新しい魚や UI 部品を行として足すだけで既存 behavior を組み合わせられる。一方、公開中の sheet 更新は patch download なしで反映されるため、想定外の値を受けても壊れない script が必要になる。実例として remote data が読めず game が壊れた報告画面を示し、公開用とは別の sheet で local test した値だけを live file へ移す手順を勧める。また web 公開した sheet は閲覧可能であり、game logic の露出を隠せない点も明示している。

## why_relevant_to_games

小規模 webgame で、敵・UI・挙動の tuning を code rebuild から切り離し、設計変更をすぐ playable diff として試す場面に関係する。live data の柔軟性と、検証用 sheet・想定外値・公開情報という運用上の注意を同時に収集できる。
