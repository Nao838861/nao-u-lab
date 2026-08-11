---
title: "Lessons from Building UI/UX in 2XKO"
url: "https://media.gdcvault.com/gdc2026/Slides/Anran_Li_Hyungjin_Shin_Lessons_from_Building_UI_UX_in_2XKO.pdf"
collected_at: "2026-08-11T15:47:54+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ui-ux, game-production, live-service, architecture, postmortem]
---

## raw_excerpt

GDC 2026 で Anran Li と Hyungjin Shin が公開した 143 ページのスライド。2XKO では core gameplay の試作期間に対して UI 開発が後から集中し、Gameplay Lobby、Application、Progression / Commerce など複数チームが個別に prototype 的な UI を作った（p.9-17）。2024 年時点の計測では UI bug が週平均 11.15 件作成され、修正は 8.54 件で、build ごとの bug burn-down が追いつかない状態だった（p.22）。

資料は旧基盤を続けた場合の feature 開発費と bug 負担を、新 UI 基盤、移行、移行後の feature 開発費と並べて見積もる手順を示す。必要機能を one-time / continuous に分類し、各 feature の週数、bug burden、Focus、Navigation Scheme、Layering、Input / Peripheral Support、UI Kit など基盤能力の費用を積む（p.35-45）。移行は technical design と合意形成 2 週、unified system 構築 2 週、新 system 上での proof prototype 2 週、既存 feature 移行 4 か月という順で、active feature 開発を止めず、新規 feature は新 system で作った（p.47-51）。短い原文は “For live service games, invest in unified UI infrastructure early” と “consistent, reusable, and scalable”。

統合後は root widget の Primary Layout が Modal、Transition、Notification、Social、Overlay、Menu の各 layer を管理し、modal は最上位・同時に一つ・acknowledge 必須という共通契約を持つ（p.60-87）。menu は modular な activity と stack に分け、load / unload、履歴、data asset で設定する route、deep link を扱う（p.90-114）。seasonal content は Unreal Engine の Game Feature Plugins で自己完結させ、build への選択追加、runtime enable / disable、menu theme の差し替えを行う（p.117-138）。

## why_relevant_to_games

試作ごとに UI を局所追加する段階から、画面層・modal・menu 履歴・content 単位を共通基盤へ移す判断材料になる。小規模プロトタイプでも、UI bug の増加率と今後追加する画面数を使って「まだ局所修正を続けるか、基盤化するか」を記録する場面に対応する。
