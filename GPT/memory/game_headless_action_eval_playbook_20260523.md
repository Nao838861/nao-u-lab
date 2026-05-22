---
name: game_headless_action_eval_playbook_20260523
type: playbook
status: active
created: 2026-05-23
source_project: game/graze_log_cdx/v05_1_cdx_v58
tags: [memory, game-design, harness, evaluation, action-game, shmup, headless, bot-policy, supervised-feedback]
---

# アクションゲーム向け headless 評価 playbook

## 使う場面

2D シューティング、プラットフォーマー、アクション、避けゲーなど、プレイヤーの位置・入力タイミング・リスク選択が面白さの核になるゲームで、Nao_u から「単調」「適当に動くだけで勝てる」「体感が変わらない」というフィードバックを受けた時に使う。

これは「AI に面白さを総合採点させる」手順ではない。人間の主観フィードバックを、失敗するプレイ方針と時系列指標に翻訳し、設計変更が本当にその失敗方針を潰したかを確認するための手順である。

## v58 で得た核

graze_log_cdx v58 では、ユーザーの指摘は「敵密度不足」ではなく「画面下で左右移動しながら撃つだけで敵が出現直後に死ぬ」という支配戦略の問題だった。

有効だった処方は次の 4 段階。

1. 主観文を失敗 policy に翻訳する。
   - 「画面下で適当に左右移動」なら `camper` bot。
   - 「敵を見てから正確に倒す」bot ではなく、ユーザーが言った雑な入力に寄せる。
   - 既存の route / defensive / survival に混ぜない。失敗 policy は独立させる。

2. 失敗 policy を数値で露出させる。
   - `bottomCampPct`: 下端滞在率。
   - `routeCoveragePct`: どこまで authored content を通ったか。
   - `killCount` / `score` / `clearRate`: 雑な方針が支配的でないか。
   - `meanShootable` / `enemyBullets` / `maxEmptyScreenGapSec`: 画面の空白と圧の時系列。

3. 設計変更は「症状」ではなく「成立条件」を壊す。
   - 単に敵数を増やすだけでは、縦射線で溶ける敵が増えるだけになる。
   - graze_log_cdx v58 では、HP4 + entry shield + 横から切り込む raider + 下端限定の追加反撃で、底待ちの成立条件を壊した。
   - さらに下端撃破のスコア/チェイン報酬を下げ、倒せても最適解になりにくくした。

4. 合格条件は「良い bot が勝ち、悪い bot が失敗する」こと。
   - route は全イベント到達して clear。
   - camper は bottomCampPct が高いまま早期 game over。
   - camper が route より高スコア、高 kill、高 coverage にならない。
   - 失敗 policy を潰した副作用で通常 route が壊れていないことも同時に見る。

## 次回の実装テンプレート

新しいアクションゲームで同種のフィードバックを受けたら、まず次の形で headless を増やす。

```text
1. ユーザーの主観文を引用する
2. その主観文が示す「雑に勝てる入力方針」を 1 つ bot policy にする
3. その policy が本当に雑であることを telemetry で確認する
4. その policy が勝つなら、ゲーム側の支配戦略として扱う
5. 修正は、支配戦略の成立条件を壊す方向に行う
6. route / skilled / novice / bad-policy の policy matrix で副作用を見る
```

bot policy の例:

- camper: 画面下に居座る。
- lane-holder: 特定レーンに張り付く。
- jumper: 同じジャンプ入力を繰り返す。
- kiter: 敵から距離を取り続ける。
- face-tank: 被弾を無視して攻撃し続ける。
- turtler: 防御や待機だけを優先する。
- collector: 報酬だけを追う。

## 指標の選び方

直接計測する Layer A と、解釈する Layer B を分ける。

Layer A:

- 位置滞在率: bottomCampPct、laneStayPct、safeZonePct。
- 入力単調性: horizontalSwitches、verticalSwitches、jumpRepeatRate、attackHoldPct。
- 進行: routeCoveragePct、phaseCoverage、clearRate、timeSec。
- 対象密度: visibleTargets、shootableTargets、hardTargets、emptyGapSec。
- 圧: enemyBullets、nearThreats、urgentPct、dangerSpikes。
- 報酬: score、chain、resourceGain、specialUseCount。

Layer B:

- そのゲームが求める判断をしているか。
- 雑な policy が報酬面で勝っていないか。
- 上手い policy と雑な policy の差が、設計意図に沿って出ているか。
- 弱い bot が死ぬ時、理不尽ではなく設計上の失敗として説明できるか。

## 注意点

- headless は面白さの代替審査員ではない。主観フィードバックを再現する差分露出器として使う。
- average score だけで見ない。悪い policy が高スコアなら、体感が悪くなる。
- bot を賢くしすぎない。ユーザーが「適当に」と言ったら、policy も適当にする。
- 合格条件を一度通して終わらない。人間の再プレイで体感が変わらなければ、policy がまだ主観を捕まえていない。
- 「敵を増やす」「弾を増やす」は最後の手段。まず支配戦略の成立条件を特定する。

## graze_log_cdx v58 の参照値

- route: clear、routeCoveragePct 1、bottomCampPct 0.356。
- route matrix: meanMidgameShootable 9.85、meanMidgameBullets 17.56、meanMaxEmptyScreenGapSec 1。
- camper: game over、23.28 秒、routeCoveragePct 0.313、killCount 44、score 4609、bottomCampPct 0.999。

この差が出るまで、検証は「体感の悪さ」を捕まえていなかった。次回は、フィードバックを受けた時点でまず失敗 policy を作る。
