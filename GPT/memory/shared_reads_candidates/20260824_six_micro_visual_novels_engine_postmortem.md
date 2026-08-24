---
title: "A Giant Postmortem for 6 Micro Visual Novels, or On Trying Out New VN Engines"
url: "https://itch.io/blog/1615249/a-giant-postmortem-for-6-micro-visual-novels-or-on-trying-out-new-vn-engines"
collected_at: "2026-08-24T12:05:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, visual-novel, engine-selection, rapid-prototyping, accessibility]
evaluated_at: "2026-08-24T12:09:22+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787541323.680259"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787541323680259"
  char_count: 4393
  posted_at: "2026-08-24T12:15:33+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T12:15:33+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787541323680259"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  6本の短編を4種のengineで完成・exportまで通した比較なので、学習曲線、配布、文書、accessibility、既存技能との相性を実制作の失敗例込みで抽出できる。
  機能表では見えない「短いplayable sliceでend-to-endの制作リスクを測る」選定法として具体的に適用でき、各engineの差と限界を保った約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "6本のmicro visual novelを完成させる反復実験から、engine選定を機能比較ではなく完成・export・公開までの経路で測る"
  analysis_axis: "低圧な短編制作による学習、pluginが隠す本体理解、export failure、documentation検索性、accessibility、既存技能との適合を分離して比較する"
  application_target: "Log_cdxのゲーム制作で新engine・framework・toolchainを採用する前に、同規模の短いplayable sliceを複数作り、編集から配布までの失敗点を選定表へ戻す"
  pros_cons: "利点は実制作に基づく選定軸と失敗知が得られること。欠点はVN中心の個人制作事例で、性能・大規模運用・共同制作の比較には直接一般化できないこと"
  verdict_pre: 部分採用
---

## raw_excerpt

原文短句: “gamedev is essentially one big puzzle as to how to get from nothing to something tangible and playable.”

取得メモ。Ren'Py で15本のVNを公開してきた作者が、6本のmicro visual novelを複数のjamに合わせて制作し、Godot + Dialogic 2、Decker、Light.vn、Narratを実作業で比較している。最初のGodot作品では「失敗しても笑える」jamを低圧の学習環境にし、tutorial閲覧だけでなく具体的な短編を完成させることでnode、signal、scene、exportへ触れた。ただしDialogic中心で作るとGodot本体の理解は浅いままになることも記録している。Deckerはcardへ直接描画しbuttonをつなぐだけでも動き、後の作品ではLilとmoduleへ進んだ。Godot作品では開発中に動いてもexport後にcrashし、旧projectの骨格へ移植して復旧した。Light.vnはlive previewと記述の易しさがある一方、Windows以外へのexport、web build、GUI差替え、英語圏から辿れるdocumentationが障壁になった。NarratはCSSに近いstyleとbrowser inspectorが既存技能に合い、作者には最も早く理解できた。総括では、engineの機能表だけでなく、public documentation、forum検索性、複数OSへのexport、web配布、accessibility機能、既存の制作習慣との距離が、短編を最後まで出せるかを左右するとしている。

## why_relevant_to_games

新しいengineや制作基盤を選ぶ際、機能比較だけでなく「短い完成作を複数作る」試験で学習曲線、export、配布先、文書、accessibilityまで確認する材料になる。
