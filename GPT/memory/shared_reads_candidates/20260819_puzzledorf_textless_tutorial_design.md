---
title: "Reflections on tutorial design in Puzzledorf"
url: "https://www.gamedeveloper.com/game-platforms/tutorial-design-in-puzzledorf-reflections"
collected_at: "2026-08-19T22:47:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, tutorial, onboarding, puzzle, playtesting]
---

## raw_excerpt

（重要箇所の日本語抄録）作者 Stuart Burfield は、ブロック押しパズル『Puzzledorf』を puzzle game に不慣れな人にも届かせるため、non-gamer、熟練者、puzzle fan、非 fan を混ぜて継続的に playtest した。手順は、初回起動から遊んでもらい、規則を覚えるまでの時間を観察し、助けを求められても製品版では作者が横にいないという理由で答えず、観察結果から tutorial を改めるというものだった。過去作では説明文を読み飛ばした人が、tutorial 後に Undo や Restart の存在を質問したため、操作表示だけを全 level の画面隅に常設し、規則説明の文章は外した。

規則は説明ではなく盤面で教える。Tutorial 1 は進路を一本に限定し、赤い block を同色の cross へ押し、続いて青い block を角の向こうから押す以外に進めない構造にした。これにより、色の対応と、block を別方向から押すという後続 puzzle の基礎を、ほぼ失敗不能な操作として経験させる。Tutorial 2 は行先のない白い boulder を導入し、二個同時には押せないこと、回り込む必要、白は goal ではなく障害物であることを同じ方式で示す。最初の通常 level では初めて小さな失敗状態を許し、壁際へ押したら Undo が必要になる形で既習事項を再確認させる。

正しい対象は接近時に明るく点滅し、goal へ置くと明るい効果音と particle が出て animation が止まる。次の対象が点滅して行動を誘導し、level 完了時にはさらに大きな音と粒子で勝利条件を補強する。作者は playtest 上、gamers と non-gamers の双方が状況を理解し、多くが最後まで進めたと報告する。結論では、失敗不能または損失の小さい練習場、視覚・音による正行動の reinforcement、後から参照できる操作表示、観察者が助けずに詰まりを記録して反復修正することを挙げている。

## why_relevant_to_games

新規 prototype の最初の数分を、説明文ではなく「進路制約・小さな成功・即時 feedback・次の通常 level での再確認」として設計し、初見 playtest で学習成立を観察する場面に使える。
