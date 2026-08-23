---
title: "Hunter Diorama GMTK 2026 Postmortem"
url: "https://itch.io/devlog/1609220/hunter-diorama-gmtk-2026-postmortem.amp"
collected_at: "2026-08-24T01:30:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, tactical-rpg, mechanics, onboarding, balancing, postmortem, game-jam]
---

## raw_excerpt

原文の要点を日本語で採録する。『Hunter Diorama』は、Star Renegades の timeline を 60 単位から 6 slot へ縮約し、Front / Middle / Back の 3 lane を加えた tactical RPG である。行動の charge に使う slot 数だけ damage を受け、敵を攻撃すると行動を遅らせ、十分な stagger で turn から押し出せる。制作初期には grid tactics、card chain、chess piece 別移動、部位破壊まで同居していたが、4日間 jam の Day 2 に大半を削り、3 lane の side-by-side combat へ作り直した。完成版では、charge damage が被弾を二重に罰する一方、player が「何もしない turn」で health を温存する未想定の戦術を発見した。boss attack の RNG は学習可能な puzzle 性を弱め、急造した forecast はほぼ使われなかったという。tutorial は 3 turn に情報を詰め、slot は 6→1 と数えるのに skill は time cost で示すため、cost 5 が slot 2 に置かれる逆向きの表現になった。stagger pushback、time cost、turn skip の説明も欠け、作者自身が対象 genre を好む前提で playtest した結果、一般 audience には難しすぎた。記事は、攻撃 pattern を固定 chain にして予測と習熟を支える案、mechanic ごとに fight を 3 段階へ分ける onboarding 案も記している。

## why_relevant_to_games

複数 mechanic を短期 prototype へ畳む際の削減単位、timeline UI の表現方向、未想定の「何もしない」支配戦術、作者自身による playtest の偏りを、具体的な tactical RPG の失敗例として参照できる。
