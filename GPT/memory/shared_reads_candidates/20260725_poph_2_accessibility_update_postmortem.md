---
title: "PoPH 2.0 Postmortem, or On Doing A Massive Update on Your Old Game"
url: "https://knickknackpj.itch.io/pillarsonpoppyhills/devlog/1390476/poph-20-postmortem-or-on-doing-a-massive-update-on-your-old-game"
collected_at: "2026-07-25T10:00:48.0312417+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, accessibility, visual-novel, renpy, maintenance, preservation]
evaluated_at: "2026-07-25T10:04:58.2145188+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-25T10:04:58.2145188+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-25T10:04:58.2145188+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  旧作の創作判断を保存しつつ accessibility と基盤だけを更新する境界設定、旧新版の並列照合、
  TTS 全編走査による回帰検証、演出・save/load・音響との衝突まで具体例が揃う。
  旧作保守と accessibility QA の両方へ直接適用でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "旧作を全面 remake せず、体験の可用性だけを現代化する移植設計と検証"
  analysis_axis: "保存対象と更新対象の境界、accessibility 機能と既存演出の衝突、TTS を回帰テストとして使う効果"
  application_target: "Log_cdx の旧作・prototype 更新で、基盤移行時の scope 固定と accessibility 横断 QA checklist を設計する場面"
  pros_cons: "創作履歴を保ちつつ利用可能性と不具合検出力を上げる一方、alt text と演出の再設計や全編走査の工数が増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文要点の採録（長文引用を避け、日本語で忠実に言い換えた）。作者は、5年前に Ren'Py 6.99 系で制作した visual novel『Pillars on Poppy Hills』を、現在使っている Ren'Py 8 系の個人 GUI framework へ移植した。主目的は作品の全面的な remake ではなく、text-to-speech、画像 caption / alt text、個別 sound の mute、timed choice の無効化など、現在の制作環境で標準化した accessibility と navigation を旧作へ戻すことだった。創作面の描き直しや文章の全面改稿は、当時の作者の技量と判断を保存すること、scope が際限なく広がるのを防ぐことから明示的に避けた。

移植では解像度変更や画像再配置より、旧 Ren'Py が暗黙に行っていた textbox transition の再現が大きな作業になった。作者は旧版と新版を並べ、表示・消去の timing を一つずつ照合した。alt text は単なる別欄の説明にせず narrative の流れへ溶け込ませたが、抽象的な神の外見を言葉にすると長くなること、複数台詞を同じ画面に置く演出では text-to-speech が最後の一行しか読まないこと、無言の「…」が読み上げでは情報を失うこと、非表示の alt text が save/load 画面の直近台詞 hook に混ざることなど、既存演出との衝突が露出した。実際に全編を text-to-speech で通す作業は、読み上げだけでなく typo、発音、文章の流れ、GUI の不整合を見つける回帰テストにもなった。作者は accessibility 更新と追加 side story を分け、後者は各 ending 約2000語に scope を固定している。

## why_relevant_to_games

旧作の保守で「体験を現代化する部分」と「過去の創作判断として保存する部分」を分ける実例であり、accessibility 機能を追加した時に既存の演出・save data 表示・音響制御まで横断して検証する場面に参照できる。
