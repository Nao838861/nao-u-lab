---
name: game_shmup_enemy_design_noncompression_protocol_20260523
type: directive
status: active
created: 2026-05-23
tags: [memory, game-design, shmup, enemy-pattern, checklist, non-compression]
primary_sources:
  - memory/game_2d_shmup_reproduction_packet_20260523.md
  - memory/2d_stg_autonomous_eval_checklist_20260523.md
  - D:/AI/Nao_u_BOT/Claude/memory/game_lessons_log.md#M-44
  - D:/AI/Nao_u_BOT/Claude/memory/game_lessons_log.md#M-45
---

# 2Dシューティング敵設計 非圧縮プロトコル

このファイルは、2Dシューティング制作で毎回抜け落ちている「敵の出現パターン、敵編隊、ステージ展開、悪い勝ち方の検出」を、次回以降ユーザーの再指示なしで復元するための固定手順である。

ここにある内容を一行要約、短いチェック項目、抽象語だけの設計メモに圧縮してはいけない。要約してから実装するのではなく、このファイルと `memory/game_2d_shmup_reproduction_packet_20260523.md` を開いたまま、対象ゲームの `design_log.md` と `completion_checklist.md` に具体化してから実装する。

## 原文保持

次のユーザー原文は、敵設計で再発しやすい失敗の教師信号として保持する。チェックリストや design log へ移す時に「敵配置をちゃんとする」「単調にしない」のように圧縮してはいけない。

> 敵の出現パターンが単調。既存のゲームのザコ敵の編隊や中ボスを出すタイミング、それぞれの弾を撃つアルゴリズムやステージの展開など、想像ではなく実際のゲームのパターンを調べて再現する形で、散発的に敵が適当に出てくるのではなく、ステージの流れからボスまでの展開をちゃんと作りこんで欲しい。

> ランダムにゆっくりの動きの敵が出てきて、特に意味も意図もなくなんとなく動いてるだけの敵がほとんど。ここで左の編隊を倒している間に、右の編隊が出てきて弾を撃つからどのタイミングで切り替えるか、とか、この流れでプレイヤーが画面左にいるはずなので、次は右に移動してもらいながら、など、プレイヤーをどう動かすかが全然意識できていない。

> 例えば、ギャラガでは曲線軌道で編隊が飛んでくるので同じ場所で撃ち続けていたら連続で倒せる楽しさがあったりするし、右→左→右の場所から、みたいなテンポとリズムがある。しかし、現代の弾が連続で出るシューティングと単発の弾で戦う必要があるギャラガでは敵編隊の考え方は全然違う。

> 縦シューなのに縦一列の敵が横から出てくるのとか、どんなふうにプレイヤーに倒してもらいたいかが全く考えられてないパターンも多い。敵の出現パターンに型がない。なぜ既存のゲームはこんな風な移動でこの数出しているのかとか、分析して再現して。

> shot_log は気持ちのいい敵編隊を実現できた。私が shot_log で直接指示して、Claude がその指示に従って完成させたものは教師データになるので、その教師データを基に次はもっと上手くやれると期待していた。

## 禁止する劣化コピー

- 「敵配置を改善する」「ステージ展開を作る」「リズムを入れる」だけのチェック項目にしてはいけない。
- `scout = 弱い敵`, `weaver = 横に動く敵`, `bruiser = 硬い敵` のように、HP、速度、弾数だけで敵を定義してはいけない。
- 既存の spawn 時間、敵種、lane を微調整するだけで「作り直した」と言ってはいけない。
- 平均スコア、clearRate、総敵数だけで「良くなった」と判断してはいけない。
- ユーザーの「単調」「適当に出ている」「型がない」という原文を、短い抽象語に置き換えて忘れてはいけない。

## 実装前に必ず作る表

新しい 2Dシューティング、または敵配置を大きく作り直す時は、コードを書く前に対象ゲームの `design_log.md` または専用の `enemy_rebuild_packet.md` に、最低 8 ブロックの wave 表を作る。表が書けない wave はまだ実装してはいけない。

| field | 必須内容 |
|---|---|
| `id` | wave 固有名。例: `open_left_curve_train` |
| `reference` | 参照元タイトル、場面、何を写すか。参照元を直接読めない場合は「記憶内のどの教師信号から写すか」を書く。タイトル名だけは禁止。 |
| `time_window` | 出現秒、継続秒、前後 wave との重なり。 |
| `spawn` | 入口、数、間隔、左右順、画面外待機の有無。 |
| `path` | keyframe 座標、補間、速度、停止時間、出口。 |
| `fire_rule` | 何秒後に撃つか、誰を狙うか、撃たない条件、弾速、弾数。 |
| `player_intent` | プレイヤーをどこからどこへ動かしたいか。撃ち続け、切り替え、中央へ上がる、底待ちをやめる、など具体的に書く。 |
| `success_feel` | 成功時の気持ちよさ。1列を溶かす、入れ替えが間に合う、危険を読んで抜ける、まとめて倒す、など。 |
| `failure_pressure` | 失敗時に何が圧になるか。撃ち漏らし、横から弾、底待ちで挟まれる、など。 |
| `bad_policy_check` | どの雑なプレイを潰すか。`camper`, `lane-holder`, `blind-sweeper`, `noPulse`, `pulseHeavy` など。 |
| `telemetry` | `visibleTargets`, `shootableTargets`, `hardTargets`, `enemyBullets`, `emptyGapSec`, `routeCoverage`, `bottomCampPct` など。 |

## 最低ステージ構成

単発 wave を並べるのではなく、最低でも次の 8 ブロックを stage の骨格にする。各ブロックは前のブロックで作ったプレイヤー位置や学習を使う。

1. `Opening curve train`: 曲線で入り、同じ射線に並び、連続撃破できる導入。横から縦一列に出して主射線と噛み合わない敵にしない。
2. `Mirror answer`: 最初の編隊で寄せたプレイヤーに、反対側から次の処理を要求する。左右切り替えのタイミング判断を作る。
3. `Center lane bait`: 中央に処理しやすい価値を置き、その後に中央を危険にして、底待ち以外の位置を使わせる。
4. `Side feeder plus cover`: 主目標を撃つ間に横から小型が弾を置く構造。上を撃つだけではなく、横圧を見て移動判断させる。
5. `Armored gate`: 出現即死を防ぐ硬めの対象。火力が高くても位置変更なしでは処理し切れない対象にする。
6. `Relief / harvest`: 圧の後に処理しやすい列を出し、成功体験、リズム、回復、ゲージ回収を作る。退屈な空白とは区別する。
7. `Midboss setup`: ボス前に、ボス戦で必要になる移動・撃ち返し・弾処理を予告する。
8. `Boss approach / final braid`: 既出文法を短く重ね、ボス前に「ここまで学んだ処理」を統合する。

## Boghog / lesson 由来の assertion

`wave_grammar_check.js` 相当には、少なくとも次を warning ではなく hard issue として入れる。

- Toaplan パターン: 前 spawn と反対側を使い、プレイヤーの横移動を強制する場面がある。
- lane: 5-7 本程度の離散 lane を使い、連続 x 座標を捨てる。
- Layered Design: popcorn と tank を異なる周期で並走させる。単独敵の散発配置で済ませない。
- Pacing と Variety: constant intensity を禁止し、意図した休符と処理しやすい収穫 wave を区別する。
- 4 失敗パターン禁止: 垂直スタック、画面端配置、同時高HP複数、下方ドリフト。
- side enemy は画面端で弾だけ撃って終わらせず、一定時間内に射線へ入るか、固有メカの反撃対象になる。

## headless で見るべき悪い勝ち方

headless は平均スコアの採点器ではなく、ユーザーが指摘した「雑な勝ち方」を bot policy として再現する装置にする。最低限、次の policy を分ける。

- `route`: authored route を通る。各 wave の意図位置へ移動し、クリア可能性を見る。
- `marksman`: 射線を正確に合わせる。処理快感の上限を見る。
- `aggressive`: 敵へ寄って早く倒す。火力報酬が機能するかを見る。
- `survival`: 倒すより避ける。ゲームが回避だけで進むかを見る。
- `camper`: 画面下で左右移動しながら撃つ。底待ち支配戦略を見る。
- `lane-holder`: 1つの射線だけに張り付く。曲線列や横圧が機能するかを見る。
- `blind-sweeper`: 敵位置を見ずに左右往復する。ランダムっぽいプレイが勝つかを見る。
- 固有メカがある場合は `noMechanic` と `mechanicHeavy` を必ず入れる。

合格条件は `route` が勝つことだけではない。`route` と `marksman` は authored content を通って勝ち、`camper` / `lane-holder` / `blind-sweeper` は低到達率、低スコア、早期失敗、または少なくとも route より明確に弱くなる必要がある。

## 次回の読み順

2Dシューティング制作で「敵」「wave」「ステージ」「出現パターン」「shot_log」「完成度」「自律して作る」が依頼文に含まれる時は、実装前にこの順で読む。

1. `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
2. `memory/game_2d_shmup_reproduction_packet_20260523.md`
3. `memory/2d_stg_autonomous_eval_checklist_20260523.md`
4. `D:/AI/Nao_u_BOT/Claude/memory/game_lessons_log.md` の M-44 / M-45 / M-30 / M-31 / M-37
5. 対象ゲームの `design_log.md` と `completion_checklist.md`

この読み順を実行した証跡を、対象ゲームの `design_log.md` に残す。読んだだけで終わらせず、wave 表、bad policy、telemetry、assertion のどこへ反映したかを書く。

