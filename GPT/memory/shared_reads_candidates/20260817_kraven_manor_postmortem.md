---
title: "Postmortem: Kraven Manor"
url: "https://www.gamedeveloper.com/design/postmortem-kraven-manor"
collected_at: "2026-08-17T23:45:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, horror, scope, procedural-generation, level-design]
evaluated_at: "2026-08-17T23:52:23+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786978764.031099"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786978764031099"
  char_count: 4140
  posted_at: "2026-08-17T23:59:59+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T23:59:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786978764031099"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  技術実証が遊びの実証にならなかった失敗から、content budget、恐怖演出の制御、Room Table への核の再統合まで因果が具体的である。
  procedural 構想を vertical slice へ縮める判断を自分達の prototype review に直接適用でき、限界を含む約4000字の分析を組み立てられる。
suggested_post_outline:
  overview_angle: "半ランダムな大規模構想を5部屋の linear experience へ縮め、room shifting だけを player-authored な核として救出した設計転換"
  analysis_axis: "技術的 proof of concept と proof of fun のずれ、content 量と演出制御の制約、機能削減後の kernel of fun の再統合"
  application_target: "Log_cdx のゲーム prototype で、vertical slice 前に機能数・必要 content 量・minute-to-minute action を棚卸しし、一つの操作核へ scope を畳む review gate"
  pros_cons: "長所は失敗した構想から削減後の具体形まで追えること。短所は学生 project の自己報告で、比較 playtest や定量評価が乏しいこと"
  verdict_pre: "部分採用—Room Table 自体ではなく、必要 content 量から逆算して構造を縮め、核を一操作へ再配置する判断手順を採用"
---

## raw_excerpt

以下は Game Designer の Ben Roye による本文の重要箇所を日本語で抜粋・再構成したメモ。『Kraven Manor』は当初、部屋を組み替えるボードゲーム『Betrayal at House on the Hill』に着想を得て、story room、exploration room、puzzle room、safe haven を技術側が半ランダムに並べ、複数の haunt から一つを選ぶ構想だった。modular asset による最初の proof of concept では、2週間半で約20分歩ける demo を作れたが、実際に行うことは移動と flashlight battery の補充程度だった。次の sprint では flashlight resource、projector、lock と key、voice acting、outdoor area、room shifting puzzle などを足したものの、学生 project の範囲では大量の content を polish できず、structured randomness の利点を示すだけの部屋数も用意できなかった。

vertical slice では機能を大幅に切り、horror の雰囲気、音、演出の上昇と下降を制御しやすい linear structure へ変更した。部屋は Library、Wine Cellar、Bedroom、Entryway、Kill Room の5つに限定し、残した room shifting を「player が manor の architect になる」kernel of fun として Room Table に集約した。Room Table では model を持ち帰って manor を組み立て、entryway へ接続し、door の向きを回転させ、既存の部屋同士をつなぎ、離れた room island への橋を作る。minute-to-minute の行為が不足したため、『Resident Evil』を参照し、光る object を調べて短い文から story や puzzle clue を得る Examine mechanic を加えた。著者は、idea の bare essentials、面白さを作る小さな facet、体験の core を問い続け、最良と思う案でも繰り返し壊して改善する必要があると振り返る。

## why_relevant_to_games

procedural structure が content 量を要求しすぎる時の scope down、技術的 proof of concept と playable な gameplay proof の分離、単一の kernel of fun へ複数機能を再統合する場面に参照できる。
