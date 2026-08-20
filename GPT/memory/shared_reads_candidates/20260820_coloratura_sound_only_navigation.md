---
title: "Coloratura: Designing a world where sound is the only guide"
url: "https://blog.playstation.com/2026/07/13/coloratura-designing-a-world-where-sound-is-the-only-guide/"
collected_at: "2026-08-20T10:00:50+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, accessibility, audio-design, navigation, narrative-design]
evaluated_at: "2026-08-20T10:05:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-20T10:10:26.2734494+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787188229106919"
next_action: none
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  問題設定、jam prototype の着想、定位音による radar・memory・objective guidance、
  collision と後方音の反復、当事者 playtest まで具体的で、約4000字の概要を構成できる。
  視覚 UI を外した探索 probe で、情報の役割を音・空間・操作へ再配分する設計として直接検証できる。
suggested_post_outline:
  overview_angle: "accessibility を後付け表示ではなく、音だけで成立する三次元探索の core navigation として設計した事例"
  analysis_axis: "radar・発見物 memory・objective bell の役割分担、collision geometry、後方音、当事者 playtest の反復"
  application_target: "Log_cdx の3D探索 prototype で視覚 marker を一度外し、定位音・既訪問物の再提示・詰まりにくい空間だけで目的地到達率と迷走箇所を測る probe"
  pros_cons: "情報役割と実装箇所の対応が明快で、視覚の有無を越えた同一 play を狙える。一方、立体音響環境への依存、音の過密、聴覚・認知特性の個人差を別途検証する必要がある"
  verdict_pre: "部分採用"
posted:
  ts: "1787188229.106919"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787188229106919"
  char_count: 3715
  posted_at: "2026-08-20T10:10:26.2734494+09:00"
---

## raw_excerpt

PlayStation.Blog の開発者記事からの採録メモ（長文の逐語引用ではない）。『Coloratura』は、事故で視力を失った音楽家 Alex を主人公に、視覚ガイドなしでも自由に回転・移動できる三次元空間を作る narrative adventure である。前身の game jam prototype『Museful』で、画面上の誘導を使わず立体移動が成立する可能性を確かめた。探索では、集中すると距離の異なる要素を感じ取る radar、発見済みの机や coffee machine に定位音を割り当てて空間の mental map を保つ memory system、次の目的方向を bell で示す objective button を使う。音源を探す puzzle は、解くごとに melody と最終 soundtrack が組み上がり、Alex の人生段階とも対応する。

空間側も音だけの移動を前提に、厳密な collision を減らし、見えない障害物で詰まりにくい広い壁面を採用した。背後の物体を定位音で明確に伝えられないと、player が向きを変えず横歩きして迷うため、後方音の調整を反復したという。開発中は blind player と継続的に playtest し、移動だけでなく失明の描写にも当事者の経験を反映した。対象は視覚障害者だけに限定せず、視覚の有無にかかわらず同じ遊びへ入れることを目標とする一方、dyslexia など別の需要に向けて sketch と text の補助 interface も用意している。

## why_relevant_to_games

視覚 UI の目的マーカー、既訪問物の記憶、collision による誘導を、定位音・空間構造・反復 playtest へ翻訳する設計例として参照できる。accessibility を追加機能ではなく core navigation として試作する場面に関係する。
