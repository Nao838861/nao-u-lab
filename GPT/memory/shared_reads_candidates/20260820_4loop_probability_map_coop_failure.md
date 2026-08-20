---
title: "Inside the gameplay systems of 4:Loop"
url: "https://blog.playstation.com/2026/02/12/inside-the-gameplay-systems-of-4loop/"
collected_at: "2026-08-20T10:01:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelike, co-op, emergent-gameplay, failure-design]
---

## raw_excerpt

PlayStation.Blog で game director Mike Booth が解説した開発採録メモ（長文の逐語引用ではない）。『4:Loop』は4人協力の roguelike shooter で、run の中心に Probability Map を置く。各 node は固有の mission、risk、reward、surprise を持ち、team は投票で開始 node を決める。node は後続 route と boss へ連鎖するため、目先の報酬だけでなく先の構成を見て経路を選ぶ。mission では alien technology の hack、資源回収、survivor 救出などを行い、敵の drop pod による介入へ即興的に対処する。team の一人でも Escape Zone へ着けば run は続き、死亡者は Homebase で再生成されるが、死亡の痕跡として broken bone を負い、Rest Stop の medic でしか治せない。全員が脱出に失敗した時だけ run 全体が終わる。

mission や boss の後は Homebase へ戻り、reward、装備、route を再検討する。weapon、item、ability は combat、intel、movement、stealth、hacking、healing を横断して組み合わせられる。環境は level designer と artist が制作する一方、開始位置、mission objective、enemy、loot、時刻、weather をrunごとに変え、enemy、creature、plant、weapon、item、objective の相互作用から予測不能な状況を作る。設計上の循環は、経路を決める、現場で計画が崩れる、少なくとも一人が脱出する、報酬と負傷を抱えて次を選ぶ、という team decision と improvisation の往復として説明されている。

## why_relevant_to_games

協力型runで「一人の生存なら継続」「死亡は即終了でなく持続する負傷」「route投票が後のbossと装備選択へ接続」というfailure設計を参照できる。procedural variationを単独乱数ではなくsystem間相互作用へ分解する場面にも関係する。
