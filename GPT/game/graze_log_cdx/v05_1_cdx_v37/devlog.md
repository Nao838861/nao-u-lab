# graze_log v05.2_cdx_v37 devlog

## 2026-05-21 Codex v37: shield break を次の撃破対象へ接続

## 背景

v36 は shield の ring / bar / crack / break cue で「撃てば割れる」ことを読ませた。ただし残課題として、人間プレイでは表示が読めても「撃つ必然」が wave 側に弱い可能性が残った。今回は表示をさらに足すのではなく、shield break から中央 relay target を出し、撃ち込みの結果が次の撃破対象と chain 継続へつながるようにした。

## 実装

- `relay` enemy を追加。
- `releaseShieldBreak` で左右 connector に加え、中央へ戻る `dp_shield_break_relay` を出す。
- `shieldBreakRelay` / `shieldRelayDestroyed` flag を追加。
- bot priority に `relay` を追加。
- relay の描画を小さな菱形にし、shield 本体や heli と区別した。
- popup を `BREAK -> RELAY` に変更。
- headless v37 check に `shieldBreakCreatesRelay` を追加。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v37_check.js
```

結果:

- `readableShieldAbsorption: true`
- `shieldBreakCreatesRelay: true`
- `shieldBreakRelay: true`
- `shieldRelayDestroyed: true`
- `botClearsWithBomb: true`
- bot: `killCount=134`, `maxChain=13`, `bombCount=1`, `grade=S`

## 戻し手順

1. `relay` enemy 定義、描画、score base、bot priority を削除する。
2. `releaseShieldBreak` から `shieldBreakRelay` と relay spawn を削除する。
3. `killEnemy` の `shieldRelayDestroyed` flag を削除する。
4. headless の `shieldBreakCreatesRelay` 条件を外す。
5. popup を v36 の `BREAK -> SIDE CHAIN` に戻す。

# graze_log v05.2_cdx_v36 devlog

## 2026-05-21 Codex v36: shield absorption を撃ち込み対象として読ませる

## 背景

v35 は shield が hit を吸収して break connector を出す構造を入れたが、人間プレイでは「弾が効かないだけ」に見える危険が残った。今回は敵配置や火力を変えず、shield のローカル表示だけで「撃てば削れる」「もうすぐ割れる」「割れたら左右へつながる」を読めるようにした。

## 実装

- shield に `shieldArmorMax` と `shieldHitFlash` を追加。
- shield hit 時に `shieldArmorMeter` を立て、ring / bar で残り装甲を表示。
- shield hit 時に ring を短く白く太らせ、弾が効いている反応を出す。
- shield armor が残り 2 以下で `shieldCrackWarning` を立て、黄色い crack 表示を出す。
- shield break 時に `shieldBreakCue` を立て、`BREAK -> SIDE CHAIN` popup と青い破片を出す。
- headless v36 check に `readableShieldAbsorption` を追加。
- title / auto_verify / README を v36 に更新。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v36_check.js
```

結果:

- `readableShieldAbsorption: true`
- `shieldArmorMeter: true`
- `shieldCrackWarning: true`
- `shieldBreakCue: true`
- `guaranteedFollowUpResidency: true`
- `antiInstantKillStructure: true`
- `botClearsWithBomb: true`
- bot: `killCount=131`, `maxChain=13`, `bombCount=1`, `grade=S`

## 戻し手順

1. `shieldArmorMax` / `shieldHitFlash` を削除する。
2. shield hit 分岐から `shieldArmorMeter` / `shieldCrackWarning` を削除する。
3. `releaseShieldBreak` の popup / particle / `shieldBreakCue` を削除する。
4. `drawEnemy` の shield ring / bar / crack 描画を v35 の円と外周線に戻す。
5. headless の `readableShieldAbsorption` 条件を外す。

# graze_log v05.2_cdx_v35 devlog

## 2026-05-21 Codex v35: 瞬殺後も後続判断が残る armored / shield 修正

## 背景

v34 は高火力で敵が即座に消える問題に対して、armored carrier と shield wall を入れた。ただし armored carrier は時間経過前に壊れると split が出ず、shield は `shieldT` が描画だけで実ダメージを止めないため、どちらも「瞬殺されても次が残る」保証としては弱かった。

## 実装

- `releaseArmoredSplit(e)` を追加。
  - armored が生存して `lt>120` に達した時だけでなく、撃破時にも split heli を出す。
  - `e.release` で二重 release を防ぐ。
  - `armoredBurstRelease` flag を追加。
- `releaseShieldBreak(e)` を追加。
  - shield が割れた時に左右 connector heli を出す。
  - `e.shieldBreak` で二重 release を防ぐ。
  - `shieldBreakConnector` flag を追加。
- shield に `shieldArmor` を追加。
  - `shieldT` 中は bullet hit が shieldArmor を削り、HP は削らない。
  - shield hit を `shieldAbsorbedHits` flag で検証可能にした。
- title / source note / auto verify title を v35 に更新。
- headless v35 check に `guaranteedFollowUpResidency` を追加。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v35_check.js
```

結果:

- `guaranteedFollowUpResidency: true`
- `armoredBurstRelease: true`
- `shieldAbsorbedHits: true`
- `shieldBreakConnector: true`
- `antiInstantKillStructure: true`
- `botClearsWithBomb: true`
- bot: `killCount=131`, `maxChain=13`, `bombCount=1`, `grade=S`

## 戻し手順

1. `releaseArmoredSplit` / `releaseShieldBreak` を削除する。
2. armored の release を v34 の `lt>120` 直接 spawn に戻す。
3. shield の `shieldArmor` と bullet collision の吸収分岐を削除する。
4. headless の `guaranteedFollowUpResidency` 条件を外す。

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

# 2026-05-21 Codex v34: 高火力で瞬殺される中盤への構造追加

## フィードバック

> 良くなったが、こちらの火力が高すぎて中盤以降は出た敵が瞬殺されて単調。火力を減らすのではなく、ゲームが面白くなる方向で改善して。

## 判断

プレイヤー火力を下げない。
代わりに、敵が瞬殺されても次の対象や選択が残るようにする。

## 実装

- `armored` enemy を追加。
- `spawnArmoredCarrier` を追加。
  - 中盤前に armored carrier を置く。
  - 一定時間後に左右へ heli を分裂放出する。
  - 高火力で本体を倒しても、分裂対象で次の chain / 位置取りが続く。
- `shield` enemy を追加。
- `spawnShieldWall` を追加。
  - post-midboss 後に3体の shield lane を置く。
  - 中央を撃ち続けるか、左右 connector を拾うかの選択を作る。
- bot priority に `armored` / `shield` を追加。
- headless v34 check に `antiInstantKillStructure` を追加。

## 検証

`node tools\headless_graze_log_cdx_v05_2_v34_check.js` pass。

- `antiInstantKillStructure: true`
- `midLateDensity: true`
- `bossPartStructure: true`
- `botClearsWithBomb: true`
- bot: `killCount=116`, `maxChain=14`, `bombCount=1`, `grade=S`

画面内 shootable sample では、midboss 前後に `armored` / `heli` / `shield` / `bunker` が検出される。
まだ bot が強く瞬間的な `shootable=0` は残るが、v34 は「敵を硬くするだけ」ではなく、分裂と shield lane で撃破後の次判断を作る方向にした。

---

# 2026-05-21 Codex v33: 中盤以降の画面内密度修正

## フィードバック

> 前半は良くなったが、中盤以降敵がほとんど出なくなった

## 原因

v32 の `enemies.length` は多く見えたが、実際には `duration:9999` の入口 trace により、midboss / boss / bunker が画面内へほとんど到達していなかった。
画面内で撃てる敵を測ると、t=1980 以降から boss 直前まで `shootable=0` の区間が長く続いていた。

## 修正

- bunker entry を 180 frame に短縮。
- crane entry を 360 frame に調整。
- midboss entry を 210 frame に短縮。
- boss entry を 190 frame に短縮。
- midboss 前に `DP midboss left/right feeder` を追加。
- midboss 前に `DP midboss approach braid` を追加。
- midboss 中に `DP midboss escort left/right` を追加。
- post-midboss に `DP post-midboss center tanks` を追加。
- final bunker 後に `DP final bunker side connector` を追加。
- boss 前に `DP boss approach braid` を追加。
- midboss / tank / bunker / boss part の HP を増やし、画面に出た瞬間に溶けて空白になる問題を抑えた。

## 検証

`node tools\headless_graze_log_cdx_v05_2_v33_check.js`

結果:

- `usesSingleSource: true`
- `reachesMidboss: true`
- `reachesBossParts: true`
- `usesHardTargetRelease: true`
- `bossPartStructure: true`
- `botClearsWithBomb: true`
- `chainIsMeasurable: true`
- `midLateDensity: true`
- bot: `killCount=113`, `maxChain=14`, `bombCount=1`, `grade=S`

画面内で撃てる敵のサンプルでは、v32 のように midboss 前後から boss 直前まで長く 0 が続く状態は解消。
ただし bot が強く、瞬間的な `shootable=0` はまだ残るため、次の調整では「人間の撃破速度での滞在時間」と「bot の過剰撃破」を分けて評価する。

---

# 2026-05-21 Codex v32: DonPachi 単一文法への作り直し

## フィードバック

ユーザーから、v09 は参照元を列挙した水準にも達しておらず、何も再現できていない低質な劣化コピーだと指摘された。
また、v30 も単に出現テンポが変わっただけで、敵の移動アルゴリズムの悪さは残っていると評価された。

## 判断

v09 の複数タイトル混合は採用しない。
v30 の縦列 fuel 追加も採用しない。

v32 は DonPachi Stage 1 の文法に絞り、chain connector、hard target、bunker release、high turret midboss、part boss を1本の stage route として作り直した。

## 実装

- `ROUTE_EVENTS` に DonPachi route timeline を定義。
- `CHAIN_WINDOW = 30` を導入。
- `heli` connector、`tank`、`bunker`、`smallTank`、`crane`、`stock`、`midboss`、`bossPart`、`boss` を実装。
- `bunker` が一定時間後に small tank を放出するようにした。
- boss は core + back/side parts の構造にした。
- back part は wide 7-way、side part は fast aimed stream。
- 部位破壊後、core HP が減ると `CORE OPEN - BOMB` cue を出す。
- headless v32 check は clear だけでなく、単一ソース、chain window、bunker release、中ボス、boss 部位、BOMB clear を検証する。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v32_check.js
```

結果:

- `usesSingleSource: true`
- `chainWindowModeled: true`
- `reachesMidboss: true`
- `reachesBossParts: true`
- `usesHardTargetRelease: true`
- `bossPartStructure: true`
- `botClearsWithBomb: true`
- bot: `killCount=67`, `maxChain=16`, `bombCount=1`, `grade=S`
