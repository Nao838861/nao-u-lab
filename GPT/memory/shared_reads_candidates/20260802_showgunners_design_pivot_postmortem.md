---
title: "From Dystopian Police Game to Showgunners: A Design Postmortem"
url: "https://80.lv/articles/from-dystopian-police-game-to-showgunners-a-design-postmortem"
collected_at: "2026-08-02T03:47:49.8652550+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, tactics, level-design, production]
evaluated_at: "2026-08-02T03:53:41.5815001+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-02T03:53:41.5815001+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-02T03:53:41.5815001+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  既存 asset を保持した設定 pivot、encounter ごとの premise、cover 可読性と敵 turn の待ち時間、tool の過不足、peak experience からの逆算という固有の設計判断を一つの制作事例として説明できる。
  小規模 prototype の方向転換、stage ごとの差別化、視認性・テンポの評価、制作 tool の投資判断へ具体的に適用でき、記事固有の根拠で約4000字の投稿を構成できる。
suggested_post_outline:
  overview_angle: "制約下の設定 pivot を、戦術ゲームの encounter・可読性・テンポ・制作基盤まで一貫した設計へ変えた方法"
  analysis_axis: "既存資産を守る制約が新しい fiction と system 設計をどう結び、各戦闘の固有 premise と感情的 peak の逆算へ展開されたか"
  application_target: "Log_cdx の小規模 prototype で、方向転換時の資産棚卸し、stage ごとの premise 定義、cover/危険物の視認性検査、待ち時間 budget、peak から逆算した system 構成に使う"
  pros_cons: "長所は pivot・戦闘設計・production 判断を同じ事例で追える点。短所は定量的な playtest 結果や変更前後の比較値が乏しく、成功要因の一般化には追加検証が必要な点"
  verdict_pre: "部分採用。制約保持 pivot と peak 逆算を設計チェックに採り入れ、個別数値は自作の playtest で校正する"
---

## raw_excerpt

Artificer の Kacper Szymczak は、『Showgunners』が当初は Dredd や Robocop を想起させるディストピア都市の警察ゲームだったが、米国で起きていた出来事を背景に partner / investor が方向転換を決めたと説明する。既に作ったキャラクターや環境などの art asset を捨てず、探索 map を短時間で再設計できる設定を探した結果、残酷な TV show を舞台にした turn-based tactics へ変わった。制作中は high-level vision deck を compass として使った。

目標は、長大な XCOM や Crusader Kings ほど重くなく、minimal puzzle より深い、streamlined で high-octane な体験だった。各 combat encounter には別々の premise、problem、modifier、objective を置き、頻繁に新しい character、ability、tool、enemy を加え、その複雑さを処理しないと押し切られる程度の pressure を与えたという。cover が重要な grid tactics では、壁や箱などの形が tile を視覚的に満たし、cover か eye candy かを一目で区別できなければならない。animation / VFX では可読性だけでなく、複数 unit の行動を追わせながら enemy turn の待ち時間を十数秒以上にしない点を課題に挙げる。

tool 制作については、不足すると production の choke point が残る一方、作り込みすぎると tool が高速化できる範囲へゲーム設計そのものを狭めると述べる。戦略ゲームの peak moment は偶然ではなく、複数 system が同時に働く結果であり、狙う感情的な頂点から、必要な systemic outcome、system、両者を束ねる design へ逆向きに組み立てるとしている。

## why_relevant_to_games

大きな設定変更を既存 asset と design pillar の制約下で成立させる方法、tactics の encounter 差別化・cover 可読性・待ち時間、peak experience から逆算する設計を、現在の小規模 prototype の方向転換や stage 設計に参照できる。
