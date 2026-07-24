---
title: "How kicking a ball around drove authenticity in Despelote"
url: "https://www.gamedeveloper.com/design/how-improvisation-and-kicking-a-ball-around-drove-authenticity-in-despelote"
collected_at: "2026-07-24T23:30:58.6675112+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, audio, improvisation, postmortem]
evaluated_at: "2026-07-24T23:34:40.2391258+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784903981.504579"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784903981504579"
  char_count: 4275
  posted_at: "2026-07-24T23:39:54.0504566+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-24T23:39:54.0504566+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784903981504579"
next_action: none
stale_after: "2026-08-23"
supersedes: []
gate_reason: >-
  問題設定、最小動詞と即興会話を結ぶ着想、録音から NPC behavior と asset を逆向きに更新する手法、
  prototype の成立例、neorealism という結論が具体例込みで揃い、ゲーム制作へ直接移せる。formal benchmark はない制作事例だが、
  その限界を明示すれば CoopEval 水準の概要・分析・適用・利害を約4000字で構成できる。
suggested_post_outline:
  overview_angle: "ボールを蹴る最小動詞と、台本なしの会話収録を往復させて、土地と記憶を game scene に定着させた制作ループ"
  analysis_axis: "即興を雰囲気素材として消費せず、録音内容が NPC behavior・asset・scene 構成を変更する設計入力になった点と、検証が制作事例に留まる限界"
  application_target: "生活感や場所の記憶を扱う小規模 prototype で、先に最小動詞を成立させ、身近な協力者の即興録音から演出と NPC 行動を更新する縦切り制作"
  pros_cons: "利点は低コストで固有の会話リズムと予期しない物語を得られること。欠点は収録品質・同意管理・編集負荷・局所的な成立例を一般化しすぎる危険"
  verdict_pre: "部分採用。即興から scene を逆算するループは採用し、文化的真正性や一般的有効性の証明とは分けて扱う"
---

## raw_excerpt

Game Developer が GDC Festival of Gaming 2026 での Julián Cordero の講演を基にまとめた Despelote の制作事例。Cordero は、2001年のエクアドルの町と共同体を描く入口として、言葉を使わずボールを蹴り合う行為を「universal language」と捉え、初期 prototype では NPC voiceover を置かなかった。しかし gameplay 上の考えや土地の文脈を伝えるには不足があり、producer の Gabe Cuzzillo と検討した結果、台本を書かず即興だけで会話を収録する条件で dialogue を試した。友人たちを video call に集め、普段どおりの会話を録音して、プレイヤーがボールを蹴る場所の横に配置した最初の test が成立したため、その後も家族や友人へ soccer・政治・日常生活の scenario を渡し、自然な場所で会話してもらった。

即興から想定外の場面も生まれた。子どもたちが player に恋人がいるとからかう会話を採用した際は、その会話が game 内で成立するよう、NPC が player の周囲へ集まり、誰かが恋人らしき人物を見つけたふりをする behavior と asset を追加した。つまり録音済み dialogue を既存 scene に貼るだけでなく、現実の improvisation が game design 側へ変更を要求した。Cordero はこの方法を photorealism や厳密な simulation とは別の neorealism、すなわち場所・人・記憶を documentation として game に埋め込む方法として説明する。過去の代表戦映像、当時を知る人の話、両親や友人の記憶も参照し、意図していなかった texture や story まで作品へ入ったとしている。

## why_relevant_to_games

最小の反復動詞、ambient dialogue、即興収録、NPC behavior を相互に変更させる制作例として、生活感のある narrative game や地域・記憶を扱う prototype の設計時に参照できる。
