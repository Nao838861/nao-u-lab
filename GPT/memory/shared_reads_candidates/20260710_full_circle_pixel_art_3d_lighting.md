---
title: "How Full Circle blends pixel art, 3D worlds and modern lighting into one gorgeous RPG"
url: "https://www.creativebloq.com/3d/video-game-design/how-full-circle-blends-pixel-art-3d-worlds-and-modern-lighting-into-one-gorgeous-rpg"
collected_at: "2026-07-10T07:30:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, art-direction, indie-dev, pixel-art, production]
evaluated_at: "2026-07-10T07:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-10T07:44:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-10T07:44:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-09"
supersedes: []
gate_reason: "古典JRPGの表層再現ではなく、記憶の再構成、pixel sprite と low-poly 3D の整合、texture pixel density、64px sprite の差別化、非対称デザインの工数リスクまで制作判断として抽出できる。評価実験型の記事ではないが、小規模RPGの art direction と asset pipeline に直接適用でき、CoopEval 水準の概要を書く材料がある。"
suggested_post_outline:
  overview_angle: "Full Circle を、ノスタルジーの模写ではなく「記憶の中のJRPG」を現代の3D空間とpixel spriteで再構成する制作ケースとして読む。"
  analysis_axis: "参照元の選び方、world tone、sprite readability、texture pixel density、Blender/Photoshop pipeline、音楽起点の level mood を、見た目と工数の制約管理として分解する。"
  application_target: "Log_cdx の小規模ゲーム試作で、先に art rule を固定せず、sprite silhouette、texture density、lighting、scene mood を一枚の制作チェックに落とす用途。"
  pros_cons: "メリットは美術方針を asset 単位の判断に分解できる点。デメリットは単一作品の制作記事なので、評価指標や再現性は自分達のプロトタイプで補う必要がある点。"
  verdict_pre: "部分採用。投稿では美術紹介ではなく、低工数で一貫した見た目を作る制約設計として扱う。"
---

## raw_excerpt

Creative Bloq の 2026-07-05 記事。対象は solo developer Adolfo Juan Fernando Gazzo Castaneda / 2ndPlayerGames の indie RPG `Full Circle`。記事は、古典 JRPG の見た目をそのまま再現するのではなく、「記憶の中の JRPG」を現代の camera、low-poly 3D、dramatic lighting、pixel art sprite、expressive animation で再構成する制作姿勢を扱っている。短い原文断片: "not recreate them pixel for pixel" / "textures with the same pixel density"。

記事内では、Full Circle の視覚方針が「Zelda / SNES / Sega / Breath of Fire III 風」という参照元の列挙で止まらず、post-apocalyptic world を灰色で洗い流さず、floating cities と surface world の対比で世界の状態を読ませる方向に組まれている。キャラクター面では、64 x 64 pixel art sprite で差異を読ませるために、palette、hair、clothing、portrait、small extra animations を使う。一方で、asymmetrical character は animation cost が大きいという制作上の失敗も明示されている。

制作 pipeline のメモとしては、3D asset ではまず asset が置かれる setting を決め、樹木なら日照、年齢、成長角度、生存条件のような問いから reference を集め、sketch から Blender へ進む。low-poly modeling は速いが、pixel art sprite と馴染ませるために 3D asset の texture pixel density を揃える工程が重く、organic shape では Blender 上で直接描き、UV stretch を抑えてから Photoshop で dirt / shading を詰める。level design では音楽先行の発想もあり、scene を melody や placeholder music の感情から組むことがある。

## why_relevant_to_games

小規模制作で「懐古」ではなく、制約、記憶、視認性、工数を一つの art direction に束ねる材料。pixel art + 3D の試作で、asset ごとの pixel density、sprite silhouette、非対称デザインの animation cost、音楽から level mood を起こす手順を候補として残す。
