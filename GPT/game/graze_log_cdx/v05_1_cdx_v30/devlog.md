# graze_log v05.2_cdx_v29 devlog

## v29 目的

`CONTINUOUS_DIRECTIVE.md` の現在焦点 5「人間が自然に撃ちたくなる final cue として BOMB の役割を再評価する」を今回の対象にした。`v28` は 1942 trace study として動いていたが、headless 上は BOMB なしでも clear でき、BOMB が最終手段として読まれるかを検証できなかった。

## 採用案

boss 終盤に **CORE LOCK** を入れる。通常ショットで boss を追い込むところまでは既存のオートショット縦シューの流れを保ち、最後だけ画面中央に `CORE LOCK: PRESS SPACE/B` を出す。lock 発生時に gauge を満タン化し、cue が見えた時点で BOMB が実行可能であることを保証する。

これは「BOMB を連打不能な資源にする」ではなく、「stage の最後に明確な使いどころを作る」変更である。v25 以降の敵配置文法を壊さず、final cue だけを追加する削除可能な 1 個刻みに収めた。

## 改変箇所

- `index.html`
  - version 表示を v29 に更新。
  - `BOSS_FINAL_LOCK_HP` と `FINAL_BOMB_CUE_FRAMES` を定義。
  - `updateBossFinalCue()` を追加し、`bossFinalCue` flag / popup / gauge refill をまとめた。
  - boss が lock HP 以下かつ未 BOMB の時、通常ショットでそれ以上削れないようにした。
  - bot が `bossFinalCue` を見て BOMB を撃つようにした。
  - lock 中の中央表示を追加。
- `tools/headless_graze_log_cdx_v05_2_v29_check.js`
  - 対象 path を v29 に変更。
  - `?bot=1` で bot を有効化。
  - `bossFinalCue` と `botClearsWithBomb` を必須検査に追加。

## 戻し手順

1. `index.html` から `BOSS_FINAL_LOCK_HP` / `updateBossFinalCue()` / lock 中央表示を削除する。
2. bullet collision の boss lock 分岐を v28 の単純な `e.hp--` に戻す。
3. BOMB の boss damage を 22 から v28 の 12 に戻す。
4. bot の BOMB 条件を v28 の `boss.hp/boss.maxHp<0.28` だけに戻す。
5. headless は v28 check を使うか、v29 check の final cue 必須条件を外す。

## Mental Sim

プレイヤーは道中で 1942 trace wave を処理し、boss へ入る。boss は通常ショットで削れるので、ここまでは「避けて撃つ」直感から外れない。終盤で削りが止まり、画面中央に CORE LOCK と BOMB 指示が出る。gauge はこの瞬間に満タンなので、プレイヤーは「今 BOMB を撃てばよい」と読める。BOMB を撃つと clear し、撃たない場合は boss が残り続けるため、BOMB の使いどころが曖昧にならない。

## 自己判定

v29 は面白さの最終判定ではなく、BOMB の役割を検証可能にするための 1 diff として妥当。BOMB を撃たせるために lock で通常ショットを止めているので、強制感はある。ただし cue と実行可能性が同期しており、隠れ補正ではなく画面上の明示イベントとして読めるため、現在の問題「BOMB を必須使用しない headless では final cue を評価できない」を解消する価値が上回る。次は人間プレイで、この強制が納得できる演出か、単なる鍵穴化に見えるかを確認する。

## 検証

実行コマンド:

```powershell
node tools\headless_graze_log_cdx_v05_2_v29_check.js
```

結果:

- 1942 trace source notes / labels / stage flags を確認。
- boss 出現と clear probe を確認。
- Active DEF probe を確認。
- `bossFinalCue: true` を確認。
- bot が BOMB を 1 回使用し、`grade: "S"` で clear することを確認。

## 目的

v24 は敵数やタイミングを調整しても、根本的には「散発的に敵が出て、直線やサインカーブでなんとなく動く」印象が残った。今回は既存ソースの延長ではなく、敵出現と敵移動を作り直した。

## ブレストと採用方針

詳細は `design_log.md` に記録した。

- Galaga からは、編隊が曲線進入し、同じ射線で連続撃破できる楽しさを借りる。ただし単発弾時代の「狙い撃ち」ではなく、オートショット縦シュー向けに「射線へ入って処理する」形へ変換した。
- 1942 からは、横幅のある編隊と安全穴の考え方を借りる。縦シューとして、横から縦一列が流れるだけの不自然な配置は避け、画面上部からの面圧として実装した。
- DonPachi 系からは、次に倒すべき対象を前もって見せ、プレイヤーが左右どちらへ移るかを wave 側で指定する考え方を借りる。

## 実装

- 旧敵ソースの `spawn1942*` / `redWing` / `orangeAce` / `hookWing` / `wheelWing` / `sinePair` 系を廃止。
- 敵種を `drone` / `marker` / `pin` / `anchorCore` / `boss` / `bossPart` に整理。
- `EXPECTED_X` で各 wave の意図するプレイヤー位置を明示。
- `stageFlags` で重要な展開が発生したかをヘッドレスから確認可能にした。
- simple bot は敵だけを追うのではなく、wave の期待位置も参照するようにした。

## 検証

実行コマンド:

```powershell
node tools\headless_graze_log_cdx_v05_2_v25_check.js
```

確認項目:

- 古い敵ソース名が `index.html` に残っていない。
- `design_log.md` にブレストと採用理由がある。
- wave label と期待位置が一致する。
- lane / switch / gap / midboss / final relay / boss の stage flag が立つ。
- BOMB / Active DEF が単体プローブで機能する。
- boss が出現し、clear まで到達する。
- simple bot が clear する。

## 残りリスク

ヘッドレスの simple bot は clear できるが、現時点では BOMB を必須行動として使わない。BOMB 自体の単体プローブは通しているが、「人間が自然に撃ちたくなる最終 cue」として成立しているかは次の人間プレイ確認が必要。

# 2026-05-21 Codex v30: shot_log_cdx 密度差分の移植

## 背景

ユーザーから、shot_log 自体を書き換えるのではなく、shot_log と graze_log_cdx の差分を graze_log_cdx に反映する意図だったと指摘された。

対応として、誤って変更した shot_log は `GPT/game/shot_log_cdx/v01_from_bd6c65a` に保存し、正本の shot_log は復旧済み。そのうえで v29 をコピーして v30 を作った。

## 実装

- v29 の 1942 trace wave は維持。
- `cdx opening left/right fuel columns` を追加し、開幕の空白を減らした。
- `curl tail restock` を左右に追加し、side curl 後の撃破対象を残した。
- `red ten delayed center fuel`、`bonus cover lane`、`cross curl center restock` を追加し、中盤の連続性を上げた。
- `bomber escort fuel columns`、`fast V delayed side fuel`、`boss approach fuel gate`、`boss left/right sustain fuel` を追加し、ボス前後の密度を上げた。
- headless v30 check に `densityFuelAdded` を追加した。

## 検証

未実行時は次を使う。

```powershell
node tools\headless_graze_log_cdx_v05_2_v30_check.js
```

実行結果:

- v30 headless: pass。
- `densityFuelAdded: true`
- `traceLogsEveryWave: true`
- `bossFinalCue: true`
- `botClearsWithBomb: true`
- bot killCount: v29 の `56` から v30 は `262`。
- bot grazeCount: v29 の `0` から v30 は `8`。
- bot activeDefCount: v29 の `0` から v30 は `1`。
