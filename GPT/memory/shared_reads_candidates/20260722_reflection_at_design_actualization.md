---
title: "Reflection at Design Actualization (RDA): A Tool and Process For Research Through Game Design"
url: "https://arxiv.org/abs/2602.12887"
collected_at: "2026-07-22T13:16:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, research-through-design, playtesting, design-journal, tacit-knowledge, godot, unity]
---

## raw_excerpt

著作権に配慮し、原論文の長文引用ではなく重要部分を日本語で採録する。RDA は、設計判断が抽象的な考えから実際に触れるものへ変わる「design actualization」の瞬間、とくに editor 内で playtest を始める前後へ記録を結び付ける open-source の tool/process である。基本 loop は、設計・実装を進める、test 前に変更理由と期待を記す、playtest を自動録画する、test 後に期待との差・途中の変更・次の着想を記す、の四段階。Unity と Godot の editor extension、OBS 経由の録画、記録をまとめる Python script が用意されている。

狙いは、version control だけでは残りにくい小さな設計判断と tacit knowledge を構造化し、動画で project 全体の変化も追えるようにすること。3人の designer-researcher が異なる3 project で自己使用し、1件は4か月、2件は2か月継続した。観察されたテーマは、既存の制作 routine と記録作業の妥協、designer と researcher の persona 切替、記録が自分の散らかった制作過程を映す mirror effect の三つ。全 test を記録すると flow を切り、data が膨張する一方、bug fixing や rapid prototyping で省略すると後から必要な情報が欠ける。利用者は記録対象を選び、tagging や workflow を調整する必要があった。慣れると test 前後の pause が暗黙の判断を言語化し、video compilation は日単位の変化を追う助けになったが、評価は開発者自身による autobiographical design の3例に限られる。

## why_relevant_to_games

playtest の直前・直後へ理由、期待、実測映像、次の変更を結び付ける方法として、AIとの反復制作で失われやすい小さな設計判断と feel の変化を記録する場面に接続できる。
