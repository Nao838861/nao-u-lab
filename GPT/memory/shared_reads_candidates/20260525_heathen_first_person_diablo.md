---
title: "How Heathen Reimagines Diablo's Classic Dungeon-Crawling Formula in First Person"
url: "https://80.lv/articles/how-heathen-reimagines-diablo-s-classic-dungeon-crawling-formula-in-first-person"
collected_at: "2026-05-25T18:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dungeon-crawler, arpg, first-person, procedural-generation, solo-dev]
evaluated_at: "2026-05-25T18:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T18:44:10+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779702138512369"
posted:
  ts: "1779702138.512369"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779702138512369"
  char_count: 3511
  posted_at: "2026-05-25T18:44:10+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  Diablo 1 的な価値を first-person 化する際の保存対象が、horror/minimalism、手触りとしての武器差、tight affix、tile chunk + node graph まで具体化されている。
  小型プロトタイプでも「数値差を操作感差に翻訳する」「完全自動生成ではなく pacing 制御を残す」という適用点があり、4000字級の概要に必要な重要要素を抽出できる。
suggested_post_outline:
  overview_angle: "古典 ARPG の構造を first-person dungeon crawler へ移す時、何を保存し何を視点変更に合わせて作り替えるかを軸に書く。"
  analysis_axis: "horror/minimalism、武器の触感、loot affix の絞り込み、tile chunk + node graph による生成制御を分けて分析する。"
  application_target: "Pulse Relay や短編 dungeon prototype の敵/武器/部屋生成で、数値差ではなくプレイヤーが知覚できる差へ変換する設計チェックに使う。"
  pros_cons: "利点は小さい素材数でも密度を出せること。弱点は記事がインタビュー中心で、生成器や戦闘評価の定量情報は薄いこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
80.lv の 2026-05-18 インタビュー。Heathen は Diablo 1 的な「one town, one dungeon」構造を first-person dungeon crawler として再解釈する事例。記事は、古典 ARPG の価値を巨大な endgame や複雑な progression ではなく、孤立した町、地下へ降りる圧迫感、horror-driven pacing、minimalism に置いている。

短い原文抜粋: "horror & minimalism" / "Mostly by feel."

設計上の要点として、first-person 化すると「数値上は 1 ダメージ差の mace と sword」でも、手元で見える武器として異なる触感を持つべきだと語られている。loot affix は tight list に絞り、unique item を能力・playstyle・見た目のスターにする。dungeon generation は純粋自動生成ではなく tile chunks + node graph で、winding staircases、death pits、raised platforms などを手で供給し、first-person で退屈な maze にならないよう pacing と complexity を制御する。

## why_relevant_to_games
古典ジャンルを別視点へ移す時に、何を保存し何を現代化するかの材料。Nao_u_BOT の小型ゲームでも「数値差ではなく手触り差」「自動生成を完全自動にせず pacing 制御を残す」観点に接続できる。
