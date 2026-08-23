---
title: "Slick Speed: Post Mortem"
url: "https://itch.io/devlog/1439113/slick-speed-post-mortem.amp"
collected_at: "2026-08-24T03:31:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, game-jam, arcade, scope]
evaluated_at: "2026-08-24T03:35:18+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787510572.969729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787510572969729"
  char_count: 3732
  posted_at: "2026-08-24T03:42:57+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T03:42:57+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787510572969729"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  過去 jam の scope 失敗を起点に、10日工程の配分、移動だけの入力、障害物同士の衝突から生まれた展開、未実装要素の cut、playtest の反応まで因果を追える。
  短期 prototype で polish 枠を先に確保し、入力数ではなく object 間相互作用で深さを作る具体策として適用でき、限界も含めて約4000字の概要と分析を構成できる。
suggested_post_outline:
  overview_angle: 10日間 jam で scope を制御し、最小入力と障害物同士の相互作用から arcade game の展開を作った制作判断を時系列で整理する
  analysis_axis: polish 専用日の先取り、偶発的に見つかった相互作用を中核へ昇格する判断、期限内に cut した機能の整合性を評価する
  application_target: Log_cdx の短期 prototype で、初日に入力語彙を固定し、object 間相互作用の探索日と sound・UI・playtest の保護枠を工程表へ置く
  pros_cons: 小規模制作の具体的な時間配分と scope 判断を再利用できる一方、単一作者の事後報告であり比較実験や継続率などの定量評価はない
  verdict_pre: 部分採用
---

## raw_excerpt

記事の重要部分を日本語で採録する。『Slick Speed』は Bigmode Game Jam 2026 の10日間で制作された、固定画面・pixel art の arcade game。作者は普段の Unity 3D 制作から離れ、Unity 2D と Aseprite を初めて使った。pixel per unit を64に固定し、asset の64 pixelをengine上の1 unitへ対応させた。前回の7日間jamではscopeを広げすぎ、soundとUIをreleaseへ入れられなかったため、今回は木・金をbrainstorm / design / planning、土曜をmechanics prototype、日曜をmechanics確定、月〜水をloopのpolish・balance・bug fix・playtest、木・金をsound / UI、最終土曜をpolishと提出に割り当てた。bug fixとplaytestの一部は木曜へずれ込んだが、sound・UI・仕上げ専用日を先に確保していた。

操作はarrow keyまたはWASDによる移動だけで、片手で遊べる構成にした。入力を増やさない代わりに、障害物同士が衝突して元の軌道から外れる相互作用を入れた。この挙動はcollision codeのvelocityを試している途中で生まれ、playerから反応の多かった場面になった。時間を遅くしてgrid上に経路を描き、その経路で障害物を分断するpower-up、slick pointでskinを買うshop、phaseごとに形態が変わる障害物は期限内に入らずcutされた。

## why_relevant_to_games

短期prototypeで、入力種類を増やさずobject間相互作用から展開を作る場面と、sound・UI・polishを日程上の独立枠として確保する場面の参照になる。
