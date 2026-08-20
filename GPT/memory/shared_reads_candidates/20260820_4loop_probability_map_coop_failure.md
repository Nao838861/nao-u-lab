---
title: "Inside the gameplay systems of 4:Loop"
url: "https://blog.playstation.com/2026/02/12/inside-the-gameplay-systems-of-4loop/"
collected_at: "2026-08-20T10:01:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelike, co-op, emergent-gameplay, failure-design]
evaluated_at: "2026-08-20T10:05:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-20T10:05:11+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-20T10:05:11+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  route 投票、少なくとも一人の脱出、死亡後の持続負傷、Homebase での再計画を一つの循環として抽出でき、
  procedural variation も system 間相互作用まで分解されているため、約4000字の概要を構成できる。
  協力 prototype で全滅だけを run 終了にし、個人失敗を次の共同判断へ残す failure 設計として具体的に試せる。
suggested_post_outline:
  overview_angle: "協力 roguelike の失敗を即終了ではなく、誰か一人の脱出と持続負傷を介して次の route 判断へ接続する設計"
  analysis_axis: "Probability Map の先読みと投票、mission 内の計画崩壊、一人脱出条件、broken bone、Homebase、相互作用型 variation の循環"
  application_target: "Log_cdx の小規模 co-op prototype で、全員成功・全員失敗の二値判定を、一人生還なら継続し脱落者の制約を次 node に持ち越す run loop へ置き換える probe"
  pros_cons: "個人の犠牲を team の継続と次の意思決定へ変換し、乱数を複数 system の組合せとして設計できる。一方、負傷の累積が敗勢固定や置き去り役の最適化を生む危険があり、実 playtest の定量根拠は記事から得られない"
  verdict_pre: "部分採用"
---

## raw_excerpt

PlayStation.Blog で game director Mike Booth が解説した開発採録メモ（長文の逐語引用ではない）。『4:Loop』は4人協力の roguelike shooter で、run の中心に Probability Map を置く。各 node は固有の mission、risk、reward、surprise を持ち、team は投票で開始 node を決める。node は後続 route と boss へ連鎖するため、目先の報酬だけでなく先の構成を見て経路を選ぶ。mission では alien technology の hack、資源回収、survivor 救出などを行い、敵の drop pod による介入へ即興的に対処する。team の一人でも Escape Zone へ着けば run は続き、死亡者は Homebase で再生成されるが、死亡の痕跡として broken bone を負い、Rest Stop の medic でしか治せない。全員が脱出に失敗した時だけ run 全体が終わる。

mission や boss の後は Homebase へ戻り、reward、装備、route を再検討する。weapon、item、ability は combat、intel、movement、stealth、hacking、healing を横断して組み合わせられる。環境は level designer と artist が制作する一方、開始位置、mission objective、enemy、loot、時刻、weather をrunごとに変え、enemy、creature、plant、weapon、item、objective の相互作用から予測不能な状況を作る。設計上の循環は、経路を決める、現場で計画が崩れる、少なくとも一人が脱出する、報酬と負傷を抱えて次を選ぶ、という team decision と improvisation の往復として説明されている。

## why_relevant_to_games

協力型runで「一人の生存なら継続」「死亡は即終了でなく持続する負傷」「route投票が後のbossと装備選択へ接続」というfailure設計を参照できる。procedural variationを単独乱数ではなくsystem間相互作用へ分解する場面にも関係する。
