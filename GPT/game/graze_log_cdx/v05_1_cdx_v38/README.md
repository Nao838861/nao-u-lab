# graze_log v05.2_cdx_v38

## 概要

v38 は v37 の中央 relay を「敵が増えただけ」に見えにくくするため、shield break と side connector の発生タイミングを分離した版。

v37 では shield break と同時に左右 connector と中央 relay が出ていた。v38 では、break 直後は中央 relay だけを出し、relay を撃破した時に左右 side route を開く。目的は `shield break -> relay -> side route` の順序を画面上の撃破因果として読ませること。

## v38 追加

- shield break 時に即時 side connector を出さない。
- break から中央へ流れる `relay` を出す。
- relay 撃破時に `shieldRelayOpensRoute` を立て、左右 connector を開く。
- popup を `RELAY -> SIDE ROUTE` とし、route 開放の瞬間だけ短く示す。
- headless check に `relayOpensSideRoute` を追加し、relay 撃破後に side route が出ることを検証する。

## 実行

`index.html` をブラウザで開く。
自動検証プレイを見る場合は、エクスプローラーで `auto_verify.html` をダブルクリックする。

## Headless

```powershell
node tools\headless_graze_log_cdx_v05_2_v38_check.js
```

# graze_log v05.2_cdx_v37

## 概要

v37 は v36 の shield 可読性を維持したまま、shield break が単なる演出で終わらないように、break 位置から中央へ戻る relay target を追加した版。

目的は「撃ち込むと割れる」から一歩進めて、「割ると次に撃つ対象が生まれる」構造にすること。左右 connector は残し、さらに中央 relay を出すことで、shield を撃つ行為が chain 継続と位置取りへ直接つながる。

## v37 追加

- shield break 時に `shieldBreakRelay` flag を立てる。
- break 位置から中央へ流れる `relay` enemy を出す。
- bot priority に `relay` を追加し、shield break 後の次撃破対象として追わせる。
- relay 撃破時に `shieldRelayDestroyed` を立てる。
- popup を `BREAK -> RELAY` に変更し、side connector だけでなく次目標への接続を示す。
- headless check に `shieldBreakCreatesRelay` を追加し、break から relay 撃破までを検証する。

## 実行

`index.html` をブラウザで開く。
自動検証プレイを見る場合は、エクスプローラーで `auto_verify.html` をダブルクリックする。

## Headless

```powershell
node tools\headless_graze_log_cdx_v05_2_v37_check.js
```

# graze_log v05.2_cdx_v36

## 概要

v36 は v35 の DonPachi route study を維持し、shield wall を「弾が効かない敵」ではなく「撃ち込むと装甲が削れ、割れると左右 connector が出る対象」として読めるようにした版。

## v36 追加

- shield absorption 中に、残り装甲を円弧と小バーで表示する。
- 被弾時は shield ring を白く太らせ、撃ち込みが効いていることを示す。
- 装甲残り 2 以下で crack 表示を出す。
- break 時に `BREAK -> SIDE CHAIN` popup と青い破片を出し、左右 connector への接続を明示する。
- headless check に `readableShieldAbsorption` を追加し、`shieldArmorMeter` / `shieldCrackWarning` / `shieldBreakCue` を確認する。

## 実行

`index.html` をブラウザで開く。
自動検証プレイを見る場合は、エクスプローラーで `auto_verify.html` をダブルクリックする。

## Headless

```powershell
node tools\headless_graze_log_cdx_v05_2_v36_check.js
```

# graze_log v05.2_cdx_v28

1942 の序盤編隊を「抽象化」ではなく、原作画面座標 224x256 からのトレースカードとして再現する試作。

## 方針

- 「Galaga 的」「1942 的」といった名前だけの引用をやめる。
- 1942 の明示情報にある、赤5機/10機編隊、全滅報酬、下左右から出る低速ボーナス機、横から旋回する小型機、大型機前の護衛を wave 単位で写す。
- 各敵は `traceLine` または `traceBezier` の軌跡を追従する。速度は duration frame で制御する。
- 原作完全一致とはまだ言わない。公開資料から確認できる編隊単位を、できるだけ原作座標系で再現する段階。

## 実装した trace wave

1. `1942 red five V down`
2. `1942 left curl squadron`
3. `1942 right curl squadron`
4. `1942 red ten ladder`
5. `1942 bottom bonus plane L`
6. `1942 mirrored side curls`
7. `1942 screen width pass gap R`
8. `1942 bomber escort entry`
9. `1942 red five V repeat faster`
10. `1942 bottom bonus plane R`
11. `1942 boss warning red ten`
12. `1942 large bomber proxy`

## 遊び方

`index.html` をブラウザで開く。

自動検証プレイを見る場合は、エクスプローラーから `auto_verify.html` をダブルクリックする。

## ヘッドレス検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v28_check.js
```

確認項目:

- 1942 trace source notes がある。
- 224x256 原作座標から 420x620 へスケールしている。
- 赤5機V、赤10機、左右 curl、下方ボーナス機、横幅 pass、大型機 proxy の stage flag が立つ。
- boss / clear / Active DEF / bot clear が通る。

## 参照元

- Arcade Database / MAME 1942: https://adb.arcadeitalia.net/dettaglio_mame.php?game_name=1942
- NES 1942 manual mirror: https://www.world-of-nintendo.com/manuals/nes/1942.shtml
# graze_log v05.2_cdx_v29

## 概要

`v05_1_cdx_v28` の 1942 trace study をベースに、boss 終盤へ **CORE LOCK - BOMB** cue を追加した playable diff。

通常ショットで boss HP を一定値まで削ると CORE LOCK が発生し、画面中央に `CORE LOCK: PRESS SPACE/B` を表示する。この瞬間に gauge を満タン化し、BOMB を使うと boss を倒して `S` clear になる。BOMB を「いつでも撃てる全画面消去」ではなく、stage 最後に温存して使う final cue として読ませるための変更。

## v28 との差分

- title / 表示文言を v29 に更新。
- boss HP が `BOSS_FINAL_LOCK_HP` 以下になった時、通常ショットだけでは削り切れない lock を追加。
- lock 発生時に `bossFinalCue` flag を立て、`CORE LOCK - BOMB` popup と中央 cue を表示。
- lock 発生時に gauge を `G_MAX` にし、BOMB が実行可能な状態と cue を同期。
- BOMB の boss damage を 12 から 22 に上げ、lock 後の BOMB が clear へ直結するように調整。
- headless check を v29 用に更新し、boss final cue と bot の BOMB clear を検証。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v29/index.html` を開く。

操作:

- 矢印 / WASD: 移動
- SPACE: start / BOMB
- B: BOMB
- D: Active DEF

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v29_check.js
```

確認済み:

- 1942 trace labels / source notes / coordinate scale が残っている。
- boss が出現する。
- Active DEF が単体 probe で機能する。
- `bossFinalCue` が立つ。
- bot が BOMB を 1 回使って `S` clear する。

# graze_log v05.2_cdx_v30

## 概要

v30 は、完成済み shot_log を直接変更せず、Codex 側に保存した `GPT/game/shot_log_cdx/v01_from_bd6c65a` から「密度差分」だけを graze_log_cdx へ移した版。

v29 の 1942 trace wave は残し、その間に `cdx_*` の fuel / restock / cover wave を追加した。目的は、敵がすぐ消えて空白になる問題を減らし、左、右、中央、ボス前後の流れを固定タイムラインとして読めるようにすること。

## 追加した文法

- 開幕 V 編隊後に左右の遅延列を追加。
- side curl 後に tail restock を追加。
- red ten 後に中央 fuel を追加。
- bonus plane の反対側に cover lane を追加。
- bomber / fast V / boss approach / boss sustain に燃料編隊を追加。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v30_check.js
```

検証項目:

- 1942 trace labels / source notes / coordinate scale が残っている。
- `cdxDensityFuel` と `cdxBossApproachFuel` が立つ。
- boss が出る。
- Active DEF が単体 probe で機能する。
- boss final cue が出る。
- bot が BOMB を使って `S` clear する。

# graze_log v05.2_cdx_v35

## 概要

v35 は、v34 の中盤密度改善を維持しつつ、プレイヤー火力が高くて敵が瞬殺され単調になる問題を、火力低下ではなく敵側の後続構造で解く版。

主目的は、気持ちよい敵配置を「単一のゲーム内文法」として作ること。小型敵の chain connector、硬い敵を先に削る構造、bunker 破壊からの small tank 放出、中ボス、部位 boss を一本の流れにした。

## 参照した DonPachi 文法

- GPS chain: 30 フレーム以内に次の敵または物体を壊す。
- Stage 1 high turret midboss: 危険で、chain に早く入れる価値がある。
- Stage 1 boss: back turret / side turret / core の部位構造。back は wide 7-way、side は fast stream、core は部位破壊後に攻撃が変わる。

## 実行

`index.html` をブラウザで開く。
自動検証プレイを見る場合は、エクスプローラーで `auto_verify.html` をダブルクリックする。

## Headless

```powershell
node tools\headless_graze_log_cdx_v05_2_v35_check.js
```

検証では、clear だけでなく、DonPachi 単一ソース、30f chain window、bunker release、中ボス、boss 部位破壊、final cue、BOMB clear、maxChain、中盤以降の feeder / boss approach、anti-instant-kill 構造、armored / shield の後続保証を確認する。

## v35 追加

- armored carrier は、時間経過だけでなく撃破時にも必ず split heli を出す。瞬殺されても次の撃破対象が残る。
- shield wall は、shieldT 中に一定ヒットを吸収してから割れる。割れた瞬間に左右 connector を出し、撃ち続けた結果が次の移動判断へつながる。
- headless check に `guaranteedFollowUpResidency` を追加し、`armoredBurstRelease` / `shieldAbsorbedHits` / `shieldBreakConnector` を確認する。

## v34 追加

- armored carrier: 壊す前から分裂 heli を出し、瞬殺しても次の対象が残る。
- shield wall: shieldT 中に狙い続ける対象を置き、左右 connector か中央 shield の撃破順を選ばせる。
- bot priority に armored / shield を追加。

## v32 からの修正

- `duration:9999` の入口 trace により midboss / boss / bunker が画面外で遅すぎた問題を修正。
- midboss 前に left/right feeder を追加。
- post-midboss に hard target pair を追加。
- final bunker 後に connector を追加。
- boss 前に braid heli を追加。
