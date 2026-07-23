---
title: "Splatoon Raiders started off as a tower defense game"
url: "https://www.gamedeveloper.com/design/splatoon-raiders-started-as-a-tower-defense-game-but-its-splatoon-ness-got-lost"
collected_at: "2026-07-23T13:00:39.7060894+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prototyping, action-game, core-loop, series-identity]
evaluated_at: "2026-07-23T13:04:34.0583452+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784779764.149179"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784779764149179"
  char_count: 4340
  posted_at: "2026-07-23T13:09:38.8387865+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T13:09:38.8387865+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784779764149179"
next_action: none
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  tower-defense 試作がシリーズ固有の行動密度を失わせた問題、gadget と cooldown の相互補完へ転換した設計、
  “pleasant busyness” という結論まで因果が具体的である。短時間 capture の待機率・行動切替を測る校正法へ落とせ、約4000字でも水増しせず分析できる。
suggested_post_outline:
  overview_angle: "要塞を作って見守る試作から、武器と二つの gadget を途切れなく回す試作へ移った過程を、シリーズ固有感を行動密度として再定義した事例として解説する"
  analysis_axis: "機能の新規性ではなく、単位時間あたりの行動切替・cooldown 中の代替行動・観戦時間の少なさで core loop を評価する"
  application_target: "Log_cdx のアクション試作で30〜60秒の操作 capture を取り、入力切替回数・攻撃不能時間・待機時間を比較して core-loop の触感を校正する"
  pros_cons: "シリーズ固有感を観測可能な指標へ近づけられる一方、忙しさの最大化は可読性・意思決定・疲労を損ない得る"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer が Nintendo の Ask the Developer Vol. 22 をもとに報じた、Splatoon Raiders の初期プロトタイプ変遷。開発チームは Splatoon 3 の Salmon Run を一人用体験へ展開するため、最初に罠を多数配置し、罠と共闘して敵群を防ぐ base-defense 型を試した。しかし、要塞を組み立てて結果を見守る時間が増え、開発者には “didn't really feel like a Splatoon game” と映った。チームがシリーズの核として言語化したのは、敵との戦闘、床を塗る行為、ヒト形態とイカ形態の切替など、短時間に異なる行動を連続させるアクションの強度だった。

この認識から要塞構築を離れ、突進、高跳び、短時間の滞空などを担う gadget へ方向転換した。武器と二つの gadget を状況に応じて高速に切り替え、各 gadget の cooldown 中も別行動を続ける構成にしたことで、攻撃の手を止めず多数の Salmonids を処理できるようになった。開発者はこの状態を、考える前に身体が反応するスポーツや忙しい仕事に似た “pleasant busyness” と表現し、武器と gadget を忙しく交替する感触を Raiders の core gameplay と捉えた。

## why_relevant_to_games

新しいメカニクス案を機能一覧ではなく、既存作品の固有感を生む「単位時間あたりの行動切替」と照合する事例。アクション試作で、待機時間や観戦時間がシリーズの触感を薄めていないかを見る時に使える。
