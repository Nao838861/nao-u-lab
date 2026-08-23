---
title: "Hedgehog News Network Developer Port Mortem (Mr.Game and Audio's Perspective)"
url: "https://itch.io/devlog/1634633/hedgehog-news-network-developer-port-mortem-mrgame-and-audios-perspective.amp"
collected_at: "2026-08-23T13:18:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, narrative-design, postmortem, twine, tool-integration, ai-assisted-development, game-jam]
---

## raw_excerpt

Narrative Game Jam 2026 で 3 人 team が、unreliable narrator と book を題材にした browser game を制作した記録。開発担当は、writer が扱いやすい Twine の Harlowe format に React UI を組み込み、dialogue window の分離、art 差替え、writer が既存の書き方を変えず animation を呼べる translation bridge を 2 日で用意しようとした。たとえば `|leads>[Eggs]` という signal を物語側へ書くと、book が開き lead を記録して閉じる animation へ変換される。Harlowe が DOM の大半を所有するため、Tweego で story を compile し、到達可能な text element を抽出して制御した。crunch では AI assistant と architecture を相談し code も得たが、作者は通常、提案理由を聞き、code を読み、自分で採否を決める使い方を好むと記す。期限優先で理解が追いつかないまま依存度が増えたことを境界侵犯として振り返り、次回は rubber duck の範囲へ戻すとしている。結語は “I want to be the designer, Not have AI do it for me.”。

## why_relevant_to_games

writer-facing DSL と engine-facing UI を bridge で分離した小規模制作例であると同時に、crunch 下で AI 補助が理解・所有権を侵食する条件を当事者が記録している。制作 harness の説明可能性と停止条件を考える材料になる。
