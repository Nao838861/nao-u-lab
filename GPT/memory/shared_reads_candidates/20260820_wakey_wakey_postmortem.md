---
title: Wakey Wakey - Postmortem
url: https://www.gamedeveloper.com/design/wakey-wakey---postmortem
collected_at: "2026-08-20T00:51:39+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, production, platformer, team-communication]
evaluated_at: "2026-08-20T00:58:31+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-20T00:58:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-20T00:58:31+09:00"
next_action: keep_for_reference
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  設計転換、変更共有不足、対立回避が工程遅延へつながる因果は具体的で、短期ゲーム制作への適用性はある。
  ただし4分程度の単一チーム回顧で比較条件・工程指標・検証結果がなく、約4000字の概要を外部一般論なしで支える密度に達しない。
---

## raw_excerpt

SMU Guildhall の学生5人による First Fantasy は、2016年8月から12月までの授業制作で、Android tablet 向け2D platformer『Wakey Wakey』を完成させた。プレイヤーは10歳の少女 Unmei の夢の中で重力を操作し、上下に浮遊しながら障害物を越えて、夢が悪夢へ変わる前に各 level の終端を目指す。ほとんどのメンバーにとって初めてのゲーム制作であり、途中から加わった programmer は休暇中に Game Design Document を読み、level designer の負荷を引き受けた。team は言語・文化の違いを補うため、英語表現や中国の職場文化も相互に学んだ。

一方、game design の共有像が明確でなかったため、制作中に実質的に3種類のゲームを作ることになった。初期案は色を切り替えて敵を倒す arena fighter だったが、最終形は『VVVVVV』に近い重力切替型 platformer へ変化した。milestone 直前に行われた変更が他メンバーへ伝わらず、方向転換への対応で工程が遅れた。team は Unity、Perforce、Scrum、2D game の出荷工程を学ぶだけでなく、懸念や設計判断への反論を避ける「対立への恐れ」が合意形成を妨げたことも振り返っている。全員を不快にさせないことを優先するのではなく、設計上の懸念を表に出す対立が consensus と buy-in に必要だったとしている。

## why_relevant_to_games

短期プロトタイプで核となる mechanic と共有ビジョンが途中でずれた時、変更伝達・設計合意・異論の扱いが実装量と完成時期にどう影響するかを示す一次の postmortem として参照できる。
