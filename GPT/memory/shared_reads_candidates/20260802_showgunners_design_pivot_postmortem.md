---
title: "From Dystopian Police Game to Showgunners: A Design Postmortem"
url: "https://80.lv/articles/from-dystopian-police-game-to-showgunners-a-design-postmortem"
collected_at: "2026-08-02T03:47:49.8652550+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, tactics, level-design, production]
---

## raw_excerpt

Artificer の Kacper Szymczak は、『Showgunners』が当初は Dredd や Robocop を想起させるディストピア都市の警察ゲームだったが、米国で起きていた出来事を背景に partner / investor が方向転換を決めたと説明する。既に作ったキャラクターや環境などの art asset を捨てず、探索 map を短時間で再設計できる設定を探した結果、残酷な TV show を舞台にした turn-based tactics へ変わった。制作中は high-level vision deck を compass として使った。

目標は、長大な XCOM や Crusader Kings ほど重くなく、minimal puzzle より深い、streamlined で high-octane な体験だった。各 combat encounter には別々の premise、problem、modifier、objective を置き、頻繁に新しい character、ability、tool、enemy を加え、その複雑さを処理しないと押し切られる程度の pressure を与えたという。cover が重要な grid tactics では、壁や箱などの形が tile を視覚的に満たし、cover か eye candy かを一目で区別できなければならない。animation / VFX では可読性だけでなく、複数 unit の行動を追わせながら enemy turn の待ち時間を十数秒以上にしない点を課題に挙げる。

tool 制作については、不足すると production の choke point が残る一方、作り込みすぎると tool が高速化できる範囲へゲーム設計そのものを狭めると述べる。戦略ゲームの peak moment は偶然ではなく、複数 system が同時に働く結果であり、狙う感情的な頂点から、必要な systemic outcome、system、両者を束ねる design へ逆向きに組み立てるとしている。

## why_relevant_to_games

大きな設定変更を既存 asset と design pillar の制約下で成立させる方法、tactics の encounter 差別化・cover 可読性・待ち時間、peak experience から逆算する設計を、現在の小規模 prototype の方向転換や stage 設計に参照できる。
