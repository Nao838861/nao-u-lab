# graze_log v07 — predicted_play.md (実装**前** / 2026-05-27 C199 Ash)

**status**: v07 B-2 Hyper Activation (`246ed50e3`) commit 済の v07/index.html に対し、**観点 3 (無敵中の高倍率対象を弾側マーカー化)** を実装**する前**に書面で予測する。Stage 3 (実装後・人間プレイ前) の物理閉鎖を、v06 A-1+ で確立した「predicted_play.md commit 時刻 < index.html commit 時刻」のパターンで継承する (`feedback_prediction_responsibility.md` t:5 / M-39+M-40)。判定方針: コード読解 + 描画予測のみ、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 実装する 1 機構 (観点3 / 弾側マーカー)

`draw()` 内 ebullet 描画ループ (現状 L747-L768) に分岐を追加。

```js
if(state.invincibleT > 0){
  ctx.strokeStyle='rgba(255,224,64,0.55)';  // #ffe040 alpha 0.55
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI*2); ctx.stroke();  // 半径 3+2
}
```

- 当たり判定 (R_GRAZE / hitRadius / `b.x,b.y`) には**一切干渉しない** (描画のみ)
- マーカーは `invincibleT === 0` の瞬間に自然消滅 (描画条件のみ)
- 弾種 (aimed / fan3) による色変化は付けない (A-4 wobble と衝突しない)

## プレイヤー視点予測 (体験変化、3-5 項目)

1. **HUD 視線往復削減 (Yes 側予測)**: v06 A-6(b) では「無敵中 2x 倍率」が自機側 popup (#ffd840) のみで示され、プレイヤーは「擦るべき弾はどれか」を判断するために HUD と画面を視線で往復していた。v07 観点3 では弾自体に黄色リングが付くので、**視線を弾から離さずに 2x 対象を直接認識できる**。Log_cdx 観点 3 「対象物側の状態が変わらないと『何に効くのか』を読めない」の直接対応。

2. **「無敵中は擦りに行く」自発行動が成立する確率 60-70%**: v06 までは無敵中の 2x 倍率を「自機側 popup で事後確認」していたため、プレイヤーは無敵中も通常通り回避優先になっていた可能性が高い。v07 観点3 で「擦るとお得な弾」が視覚的に明示されると、**Lv up 直後の 180F (3 秒) で能動的に弾に近づく**プレイ動線が成立する。Volguard 罠予防 (R-B 「経済反転を塞ぐ」) の構造強化が体感側で具現化する。

3. **画面情報密度悪化リスク 35%**: 弾密度高 (medium 連続 spawn + fan3) + 無敵中 (180F = 3秒) のとき、画面に黄色リング 10-20 個が同時に出る。v06 predicted_play.md で挙げた「画面情報密度破綻リスク 25%」より高くなる (リング分の視覚要素追加)。alpha 0.55 で薄めに保ったが、wobble (A-4) + trail (v05) + ring (A-5(b) 橙) + popup (A-6(b)) と視覚要素が累積する場面で**「ごちゃごちゃして読めない」評価リスクは v06 から +10pt** 上がる予測。

4. **「擦りに行ったら被弾した」フラストレーション 20%**: 観点3 マーカーが「擦るとお得」を強く示唆するため、プレイヤーは hit 半径 (8) と graze 半径 (22) の差 14px を狙う動きが増える。差分は v05 から不変だが、**マーカーで「擦りに行け」と能動的に誘導する**結果、被弾頻度が一時的に上昇する可能性。R-B 「報酬と緊張のペア設計」が機能している裏返しでもあるが、初プレイ時の体感悪化リスクとして残る。

5. **「マーカーが出てない時 = 普通のシューティング」評価 30%**: 無敵中 (`invincibleT > 0`) 以外の 90% の時間はマーカーが出ない → Nao_u v02 評価「**早めに3段階までパワーアップして以降は普通のシューティング**」を観点3 単体では構造的に解けない。観点3 は v06 self_judgment §「強い指摘 (満たさない)」への局所応答であって、**「単調」評価への根本応答にはならない** (それは観点 6 = 7 区分時間予算 / 観点 7 = 大成功反応 / B-2 Hyper Activation の合わせ技で立つ)。

## 予測の限界

- 観点3 単体での体感変化は「2x 対象を視覚化した」局所改善であり、**Nao_u v02「面白くはないが、ぎりぎりゲーム」評価を `面白い` に押し上げる単機構ではない**。v07 README §「観点 3 で実装する 1 機構 + 同時物理化する 4 観点」が示す通り、観点3 は B-2 + 観点 6/7/8 と組み合わさって初めて「単調」打開を構造的に支える役割。
- 黄色リング (#ffe040) は A-5(b) 自機橙 ring (#ffa040) と A-6(a) chain 黄色 ring (#ffd870) と色相が近い。**色衝突で「自機状態」と「弾状態」が混ざるリスク 15%**。実装後の self_judgment で「色の弁別性」を Stage 4 自判定の項目に必ず立てる。
- `state.invincibleT` は A-5(b) の Lv up invincibility だけでなく A-6(a) chain 延長でも tick する。**B-2 Hyper Activation 発動中 (`hyperFlashT > 0`) は invincibleT を新規セットしない設計** (v07 README §B-2「無敵延長との衝突回避」) なので、Hyper 中はマーカー継続が **既存 invincibleT の自然 tick 分のみ**。Hyper 発動と観点3 マーカーの重畳は限定的、設計通りの可視性のはず。

## 削除可能性

`draw()` 内 ebullet ループに 5 行追加するのみ。戻し方: 5 行削除で v07 B-2 単独 (= v06 + B-2 のみ) に戻す。1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) 準拠。

— Ash (Win2) 2026-05-27 C199 Phase 4 (観点 3 実装**前** Stage 3 予測)

---

# 観点 7 (180F cap reached 大成功反応) — 実装**前** Stage 3 予測 (2026-05-27 C200 Ash)

**status**: v07 B-2 Hyper Activation (`246ed50e3`) + 観点3 弾側マーカー (`697d36453`) commit 済の v07/index.html に対し、**観点 7 (180F cap reached 大成功反応)** を実装**する前**に書面で予測する。前サイクル C199 の self_judgment.md §「次 iteration 起点」で (β) として選定済 (候補 α/β/γ 比較で R-A 直接対応 + 1 機構刻みを評価)。判定方針: コード読解 + 描画予測 + 既存 hyperFlashT 設計とのアナロジー、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 実装する 1 機構 (観点7 / 180F cap reached 大成功反応)

`onGraze()` Lv up ブロックの chain 延長分岐 (現状 L635-L638) で、`invincibleT` 加算前後で cap 未達→cap 到達の遷移瞬間を検出。発火条件は **1 ゲーム中 0〜数回しか起きないレアイベント** (3 回連続 Lv up で 180F に到達)。

```js
// chain 延長分岐内 (L635-L638 直前/直後)
const wasCapNotReached = state.invincibleT < BUZZ_INVINCIBLE_CAP;
state.invincibleT=Math.min(state.invincibleT+BUZZ_INVINCIBLE_FRAMES,BUZZ_INVINCIBLE_CAP);
if(wasCapNotReached && state.invincibleT===BUZZ_INVINCIBLE_CAP){
  state.maxChainFlashT=MAX_CHAIN_FLASH_FRAMES;
  state.rings.push({x:state.player.x,y:state.player.y,t:0,life:30,c:'#ffe040',r0:12,r1:60});
  state.popups.push({x:W/2,y:80,text:'MAX CHAIN!',life:60,c:'#ffe040'});
}
```

- 定数 `MAX_CHAIN_FLASH_FRAMES=20`、state `maxChainFlashT:0`、startGame reset、update tick、draw() flash 描画 (alpha 0.5→0 を 20F フェード) を併設
- 当たり判定には**一切干渉しない** (描画 + popup + ring のみ)
- 既存 `hyperFlashT` の Large Star 演出 (BOMB 起動黄色 flash 30F) と**同色** (#ffe040)、ただし発生位置と頻度で弁別: Hyper=BOMB キー連動・全画面 flash 30F / 観点7=自動発火・短い flash 20F + 自機中心 ring + popup

## プレイヤー視点予測 (体験変化、5 項目)

1. **「核体験の頂点を見たことが分かる」(Yes 側、確度 80%)**: v06/v07 までは 3 連 Lv up で 180F cap に到達しても、画面では「ただ chain ring が出続けるだけ」で頂点が祝われていなかった。観点7 で flash + 大型 ring + 'MAX CHAIN!' popup が同時発火 → **「いま頂点に届いた」が見た瞬間に分かる**。Log_cdx 観点 7 「気持ちよさ = 6 種反応分離」のうち欠落していた「大成功 (chain MAX)」を埋める直接対応。R-A 「一番楽しい瞬間を強化する」の頂点側補強。

2. **「次の Lv up を狙う動機」増幅 (Yes 側、確度 65%)**: 観点3 マーカーで「無敵中は擦りに行く」動線が C199 で立った。観点7 で「3 連 chain で頂点に届く」明示が加わると、**「もう 1 段擦って Lv up を繋ぐ」自発動線の終端が体感で固定される**。Volguard II 罠予防 (核行動の継続発火) の縦深化 — 観点3 が「入口」、観点7 が「頂点」を可視化することで核体験の起点〜終端が両端で明示される。

3. **画面情報密度悪化リスク 20% (v07 観点3 後 +5pt)**: 観点7 発火は 1 ゲーム中 0-3 回のレアイベントなので常時表示にはならない。ただし発火の瞬間に flash + 大型 ring + popup + (同時の) chain ring + (もし重なれば) Hyper Large Star が累積する場面で「派手すぎ」評価リスクが残る。alpha 0.5 を 0.4 に下げる退避があるが**実装後 self_judgment で実プレイ感を確認してから判断**。

4. **「大成功 = Hyper と区別がつかない」混同リスク 25%**: 観点7 と Hyper Activation の flash は同色 #ffe040。Hyper は BOMB キー押下時 (プレイヤー自発入力)、観点7 は自動発火 (chain による) という発火源の違いが体感で分離されるかは未知数。**popup 文言で識別**: Hyper='HYPER +N' / 観点7='MAX CHAIN!' — テキスト読まなくても「自分が押した／押してない」で識別できる前提に賭ける。実プレイで混同が起きたら色相を変える (例: 観点7 を金色 #ffc020 寄り) 退避策を準備。

5. **「無敵が終わった瞬間の落差」増大リスク 15%**: 180F cap (3 秒) 中は弾消去 + 擦り 2x で「最強状態」。観点7 で頂点が祝われた直後の 180F 経過後に「弾が当たる普通の状態」に戻ると、落差体感が v06/v07 より強くなる可能性。これは R-B 「報酬と緊張のペア」の意図通りでもあるが、初プレイ時のフラストレーション源になり得る。実装後 self_judgment で「無敵切れの瞬間の演出 (warning ring 等) を観点 7 と並走させるか」を v??以降の課題候補として記録。

## 予測の限界

- 観点7 単体での体感変化は「核体験の頂点を可視化した」局所改善であり、Nao_u v02「面白くはないが、ぎりぎりゲーム」評価を `面白い` に押し上げる単機構ではない。本観点は R-A の縦深化 (入口=観点3 / 頂点=観点7) として位置付けられるが、「単調」評価への根本応答は依然として観点 6 (7 区分 spawn テーブル) との合わせ技でしか立たない (`game/graze_log/v06/self_judgment.md` §観点6 / §観点7 と同方向)。
- 発火条件 `wasCapNotReached && state.invincibleT===BUZZ_INVINCIBLE_CAP` は **3 連 Lv up + chain 延長分岐に入る** 場合のみ満たす。初回 Lv up ブランチ (`state.invincibleT=BUZZ_INVINCIBLE_FRAMES`) は cap 到達不能なので観点7 は発火しない。Hyper 中 (`hyperFlashT>0`) は chain ブランチ自体が無効化される (B-2 二重カバー禁止) → 観点7 も発火しない。これらは設計通り (Hyper の Large Star と観点7 の MAX CHAIN flash が同時発火する事故を物理的に防ぐ)。
- popup 表示位置 `y:80` は v07 既存 popup (player 中心) と区別するため画面上部固定。Hyper popup (`y:state.player.y-50`) との衝突は発生条件が排反 (Hyper 中は観点7 不発) のため起きないはず。

## 削除可能性

- `onGraze()` chain 延長分岐に検出 3 行 + 発火 3 行 = 6 行追加
- 定数 1 行 / state 1 行 / startGame reset 1 行 / update tick 1 行 / draw flash 5 行 = 9 行追加
- 合計 ~15-20 行。戻し方: 全削除で v07 観点3 等価戻し。1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) 準拠。

— Ash (Win2) 2026-05-27 C200 Phase 4 (観点 7 実装**前** Stage 3 予測)

---

# 観点 6 (7 区分 spawn テーブル — 学習/圧力/休符/山 時間予算) — 実装**前** Stage 3 予測 (2026-05-27 C201 Ash)

**status**: v07 B-2 Hyper Activation (`246ed50e3`) + 観点3 弾側マーカー (`697d36453`) + 観点7 180F cap reached 大成功反応 (`c63ebd842`) commit 済の v07/index.html に対し、**観点 6 (7 区分 spawn テーブル)** を実装**する前**に書面で予測する。前サイクル C200 の self_judgment.md §「次 iteration 起点」で (α) として選定済 (候補 α/β/γ 比較で 「単調」評価への根本応答最短距離を評価)。判定方針: コード読解 + 90 秒 plays 時間体感予測 + Nao_u v02 評価原文照合、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 実装する 1 機構 (観点6 / 7 区分 spawn テーブル)

90 秒 = 5400F (60fps) を 7 区分に分割。各 phase の敵種類/弾密度/spawn 間隔を**時間 (state.t) で独立定義**。既存の wave 番号駆動 (`state.spawnT=160-Math.min(state.wave*8,80)`) を **phase 駆動** (`state.spawnT=spawnInterval()` / `PHASE_FUNCS[currentPhase()]()`) に置換。

| phase | 時間 | 役割 | 内容 (既存 spawnWave 流用 or 新規) |
|---|---|---|---|
| 1 (0-13s) | 0-780F | **学習** | spawnWave1 等価 (aimed 低密度 / small 3 + medium 1 aimed) |
| 2 (13-26s) | 780-1560F | **圧力** | spawnWave2 等価 (fan3 導入 / small 4 + medium 2 fan3) |
| 3 (26-39s) | 1560-2340F | **休符** | spawnWave3 等価 (aimed 復帰 / small 6 + medium 1 aimed) |
| 4 (39-52s) | 2340-3120F | **圧力** | spawnWave4 等価 (fan3 増量 / small 4 + medium 3 fan3) |
| 5 (52-65s) | 3120-3900F | **山 1** | **新規** (aimed 高密度 / small 8 列 + medium 2 aimed) |
| 6 (65-78s) | 3900-4680F | **休符** | **新規** (decrescendo / small 4 + medium 1 aimed) |
| 7 (78-90s) | 4680-5400F | **山 2 final** | **新規** (fan3 final / medium 4 fan3 + small 4 列) |

- 既存 `spawnWave1..4` は `spawnPhase1..4` の alias として保持 (rhyme 維持、削除可能性確保)
- 新規 `spawnPhase5..7` で「山/休符/山」curve を追加
- `spawnInterval()`: 学習/休符=140F / 圧力=110F / 山=80F の3段階 (時間予算化)
- 90 秒以降 (5400F+) は phase 7 維持 (= 「無限 final」: graze_log の 90 秒終端は明示されていないので継続)
- 当たり判定/弾速/敵 HP には**一切干渉しない**

## プレイヤー視点予測 (体験変化、5 項目)

1. **「90 秒の時間 curve が体感で見える」(Yes 側、確度 70%)**: v07 までは「敵が出る → 撃つ → 弾を擦る」の繰り返しが 90 秒間ほぼ等密度で続いていた → Nao_u v02 評価「**早めに3段階までパワーアップして以降は普通のシューティング**」の根本原因 = 時間軸での起伏欠落。観点 6 で phase 2 圧力 → phase 3 休符 → phase 4 圧力 → phase 5 山 1 → phase 6 休符 → phase 7 山 2 final の **dynamics curve** が時間体感として立つ。「単調」評価への根本応答に最も効く 1 機構 (v06 self_judgment §観点 6 / v07 self_judgment-C200 §依然観点 6 待ち の長期保留が物理回収される)。

2. **「初心者と上級者でゲーム体験が分かれる」(Yes 側、確度 55%)**: 初心者は phase 1-2 (0-26秒) で核体験 (graze→Lv up→無敵→chain) を学習しながら gameOver しがち。上級者は phase 5 山 1 (52秒) と phase 7 山 2 final (78秒) で chain MAX を狙う「峰」が立つ。**同じ 90 秒でもプレイヤー熟練度で見える景色が違う** → Log_cdx 観点 1 「動く ≠ 遊べる」の「遊べる」閾値通過に寄与する予測 (体験の幅が広がる)。

3. **「phase 切替の境界で違和感」リスク 30%**: 13 秒で aimed → fan3 突然導入、26 秒で fan3 → aimed 復帰、52 秒で山 1 (弾密度急増)、65 秒で休符 (急に楽になる) — **時間境界で「いきなり難易度が変わった」体感が出る**リスク。Log_cdx 観点 6 「学習/圧力/休符/山」curve は理想形だが、境界が急峻だと「ぶつ切り」体感になる。実装後の self_judgment で境界 transition の体感を観察、過剰なら境界 ±2 秒の漸進的密度変化 (例: phase 2 後半 5 秒で fan3 比率を段階的に増やす) を v??以降の候補に記録。

4. **「phase 7 (final 78-90秒) 到達確率が低い」リスク 40%**: graze_log は 3 段階 gauge 制 (Lv 3 → 2 → 0 → gameOver) で被弾耐性が低く、無敵化 (chain MAX) が継続発火しないと 90 秒生存は難しい。phase 5 山 1 (52-65秒) で gameOver する確率が高ければ、phase 6 休符 / phase 7 山 2 final は**多くのプレイで体感されない** → 観点 6 の効果が「実プレイで届かない」リスク。Nao_u プレイで phase 7 到達率を確認し、未到達なら phase 5 弾密度を緩める or 90秒中盤の gauge 補給を増やす対策を準備。

5. **「観点 7 大成功反応 (180F cap reached) の発火頻度が phase 6/7 で増加」(Yes 側、確度 60%)**: phase 6 休符 (decrescendo) で gauge 回復 + chain 中断、phase 7 山 2 final (fan3 急増) で graze 機会増 → 3 連 Lv up が phase 7 で発火しやすい設計。観点 7 (`c63ebd842`) で物理化した「大成功反応」が観点 6 で発火タイミングを時間体感で誘導されるようになる。**観点 6 + 観点 7 が相乗で核体験頂点を強化する** → R-A 「一番楽しい瞬間を強化する」の縦深化が時間軸で完成。

## 予測の限界

- 観点 6 単体での体感変化は「時間 curve を可視化した」局所改善であり、Nao_u v02 評価を `面白い` に押し上げる単機構ではない可能性が残る (確度 30-40%)。Nao_u v02 評価「ぎりぎりゲーム」を「ゲーム」に押し上げる程度の効果。`面白い` に押し上げるには観点 1 (動く ≠ 遊べる) / 観点 2 (敵に行動意図) / 観点 4 (中心入力) が未着手のままなので、観点 6 完了後も道半ば。
- spawnInterval の数値 (140/110/80F) は機械的に置いたので、実プレイで違和感が出たら調整必須 (R-D 「数値は目的の下限」原則)。初版は数値を 1 機構として ship、観点6 第二手で数値調整の場合は別 commit に分離。
- 90 秒以降 (5400F+) は phase 7 を維持する設計だが、これは graze_log が「90 秒終端で stage clear」演出を持たない (= 無限に続く) ため。stage clear を明示する設計は本観点の射程外 (v??以降の観点 1 「動く ≠ 遊べる」の「遊べる」閾値通過の文脈で別途扱う)。
- phase 5/7 山で弾密度が急増するが、当たり判定 R_HIT=8 / graze R_GRAZE=22 は不変。被弾と graze の差分 14px は固定なので、phase 5/7 で「擦りに行く」 R-B 緊張経路は維持される。新規の被弾増加リスクは phase 切替直後の「学習負債」分のみ。

## 削除可能性

- 新規定数 PHASE_BOUNDARIES 1 行
- currentPhase() 関数 ~5 行
- spawnPhase1-4 alias 4 行 (const 宣言)
- spawnPhase5/6/7 関数 ~14 行
- PHASE_FUNCS テーブル 1 行
- spawnInterval() 関数 ~6 行
- spawnWave 内分岐書き換え ~3 行
- spawnT 代入式書き換え 1 行
- コメントブロック ~12 行

合計 ~45 行追加。戻し方: 全削除 + spawnWave 旧形 (wave==1..4 + WAVE_FUNCS rng pick) 復元で v07 観点 7 等価戻し。1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) — 「時間軸で wave を切り替える」1 機構として実装、spawnInterval は同機構の付随要素 (時間 curve の発露を物理化するため不可分)。

— Ash (Win2) 2026-05-27 C201 Phase 4 (観点 6 実装**前** Stage 3 予測)

---

# 観点 8 (bad policy headless 4 方針 物理化) — 実装**前** Stage 3 予測 (2026-05-28 C202 Ash)

**status**: v07/index.html 上に **B-2 Hyper Activation (`246ed50e3`)** + **観点 3 弾側マーカー (`697d36453`)** + **観点 7 180F cap reached 大成功反応 (`c63ebd842`)** + **観点 6 7 区分 spawn テーブル (`43c520c3f`)** の 4 機構を積み上げた v07 に対し、**観点 8 (bad policy headless 4 方針)** を `game/graze_log/v07/headless.py` として物理化する**前**に書面で予測する。判定方針: index.html のロジック移植 + 4 方針 AI agent (route/camper/panic/novice) を Python 上で動かし relative order を構造判定として確認。**数値の絶対値は judgment / cross_review / Slack / merge 要請の根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5 厳守、R-I の死守ライン)。

## 実装する 1 機構 (観点8 / bad policy headless 4 方針)

`game/graze_log/v07/headless.py` を新設 (独立ファイル、index.html 無改変)。Python 純粋実装で外部依存は標準ライブラリのみ (math / random / json / argparse)。中核ロジック (player移動 / 自機弾 / 敵移動 / 敵弾発射 / hit/graze 判定 / Lv up / Hyper / phase 切替) を JavaScript から移植し、4 方針 AI agent で 100 試行ずつ回す。

```python
# 4 policy definitions (概略)
def policy_route(state):     # Psyvariar 想定良方針: 画面下半分 8 字経路 + phase 5/7 山で BOMB
def policy_camper(state):    # 画面下端中央張り付き、BOMB 使わない (graze 機会捨て)
def policy_panic(state):     # 動きは route 同等、gauge MAX 到達即 BOMB (使い所無視)
def policy_novice(state):    # ランダム移動 + 弾無視、BOMB は稀にランダム発動
```

### 移植の粒度 (relative order 判定に十分な範囲)

- **完全移植**: player 移動 (dx/dy normalized 0.707) / 自機弾発射 (cooldown / shotCount n=gaugeLevel+playerLv) / 敵弾発射 (aimed / fan3 ±15°) / hit/graze 判定 (R_HIT=8 / R_GRAZE=22) / 被弾→gauge降格 (lv3→G_LV2 / lv2→0 / lv1→gameOver) / graze→gauge+score (mult=2 if invincibleT>0) / Lv up→invincibleT (BUZZ 60F / cap 180F) / Hyper (gauge>=G_MAX → ebullets 全消去 + score+100/弾 + gauge=0 + hyperFlashT=30) / spawn phase 1-7 (PHASE_BOUNDARIES) / spawnInterval (140/110/80F)
- **省略**: anticipation queue 30F 遅延 (relative order 不変) / windup telegraph 10F (描画のみ、bullet 実 aim は発射瞬間に再計算) / wobble (描画のみ、当たり判定は b.x,b.y) / particle / ring / popup / 観点3 マーカー描画 / 観点7 flash 描画 / Hyper Large Star 描画 / grazeStreak / activeDef (BOMB と排反、bad policy 検証本旨外) / playerLv shotCount n=4 以上の追加弾 (gauge MAX 到達後の差分は relative order の主軸ではない)
- **simplify**: setTimeout(1200ms) phase 1 medium intro → 72F カウントダウンで simulate

省略項目は描画系か当たり判定に影響しない補助要素のみ。**relative order 構造判定に必要な「核機構の発火パス」は完全移植**。

### 4 方針 AI agent の振る舞い

| 方針 | 移動 | BOMB 戦略 | 想定 relative order 位置 |
|---|---|---|---|
| **route** | 画面下半分 8 字経路 (Psyvariar 良方針)、graze 機会を能動的に作る | phase 5/7 山 (52-65s / 78-90s) で gauge MAX 時 BOMB (戦略的タイミング) | **最高生存秒 / 最高 score** 想定 |
| **camper** | 画面下端中央張り付き、移動最小 | BOMB 使わない (graze 機会捨て) | 中程度生存秒 / 低 score (graze ゼロ、kill score のみ) |
| **panic** | 移動は route 同等 | gauge MAX 到達即 BOMB (使い所無視、Hyper 連発) | 低 score (Hyper 消費が早く弾密度高 phase で弾消去機会を逃す) |
| **novice** | ランダム移動 + 弾無視 | 稀にランダム発動 | **最低生存秒 / 最低 score** 想定 |

## 4 方針の想定 relative order (Stage 3 予測の核)

**想定**: `route > camper ≈ panic > novice` (生存秒 / score)

- **route 最強**: 8 字経路で graze 機会を能動生成 → gauge MAX 蓄積 + 180F 無敵中 2x graze → 連鎖 Lv up + cap 180F 到達 + Hyper 戦略的発動 → R-A 「一番楽しい瞬間」 + R-B 「報酬と緊張のペア」 + 観点 6 phase 7 (山2 final) で Hyper による弾消去 = 90秒生存 + 高 score
- **camper / panic は中程度**: camper は graze ゼロだが被弾も少ない (張り付き = 弾密度低の前提)。panic は Hyper を早期消費するが gauge MAX 到達は route 同等なので score も中程度。**両者は relative order 上で接近する可能性が高い** (生存秒は camper の方が高い、score は panic の方が高い)
- **novice 最弱**: ランダム移動 + 弾無視 → R_HIT=8 半径で被弾頻度高、graze 機会も偶発のみで gauge 蓄積遅い → 早期 gameOver

### 判定軸 (relative order の signal 読み)

- **route が camper を大きく上回る** → A-6(b) Volguard 罠予防 (擦る方が得) が機構として効いている (R-B 準拠)
- **route が camper と同等以下** → 「擦らない方が得」が再起している shallow design (R-B 失敗、観点3 マーカー誘導が不十分)
- **panic が route を大きく下回る** → Hyper の発動タイミング判断が core mechanic として効いている (R-A 核体験の縦深化)
- **panic が route と同等** → Hyper のタイミング選択が無意味化、Hyper を「ただ消える便利キー」として消費しても結果が変わらない shallow design
- **novice が最低** → 視認 (anticipation/telegraph/windup/wobble) が核機構として効いている (R-A 「動く ≠ 遊べる」の「遊べる」閾値の存在を示唆)
- **novice が camper / panic と同等** → 視認系の readability 機構が relative order に効いていない shallow design

**数値の絶対値は judgment 根拠にしない** (R-I 死守、`feedback_headless_unfit_for_unfinished_eval.md` t:5)。relative order が想定通りか想定外かのみを構造判定の signal として読む。

## プレイヤー視点予測 (= AI agent 視点予測、5 項目)

1. **route の phase 7 (78-90s) 到達率が 30-50% 想定**: graze_log は 3 段階 gauge 制 (Lv 3→2→0→gameOver) で被弾耐性低、無敵化 (chain MAX) が継続発火しないと 90 秒生存難しい。route の 8 字経路は graze 機会を能動生成するが、phase 5 山 1 (52-65s) の弾密度 spawnPhase5 (small 8 + medium 2 aimed、9.75 回呼び/13秒 ≈ 97 体 spawn) は plays 不能リスク 25% を v07 self_judgment-C201 で記録済 → route でも phase 7 到達は 30-50% 想定。**過剰密度リスクが headless で先に観測される可能性** — ただし数値根拠としては使えない (R-I 死守)、構造判定として「全方針 phase 7 未到達」なら spawnPhase5 数値調整の signal。

2. **camper の生存秒が route と接近する可能性 40%**: graze_log の弾は medium aimed (player 直撃) で発射されるが、aimed は **発射瞬間の player 位置** に向かう (windup 中の player 移動は回避有効、index.html L552-L553)。camper は静止しているので **aimed 弾が直撃** → 被弾頻度は route より高くなる予測。ただし phase 4 (39-52s) 圧力でも fan3 ±15° の中心弾は camper に直撃するので、camper は「動かない = 当たる」構造で生存秒は低い。**camper > route の relative order reversal が起きたら shallow design 確定**。

3. **panic の Hyper 使用回数が route の 2-3 倍想定**: gauge MAX 到達は graze 速度依存 (route も panic も同等)。panic は MAX 到達即 BOMB → 1 ゲーム中 Hyper 5-8 回想定。route は phase 5/7 山で発動を選ぶので 1 ゲーム中 1-3 回想定。**Hyper 1 回あたりの消去弾数は panic < route** (panic は phase 2/3/4 の中弾密度で発動、route は phase 5/7 の高弾密度で発動) → score 差は panic < route で 1.5-2 倍程度の予測。

4. **novice の生存秒が 20-40s 想定**: ランダム移動で R_HIT=8 半径に弾が偶発侵入する確率が高い。phase 1 学習 (0-13s) の小弾密度なら生き残るが、phase 2 圧力 (13-26s) で fan3 導入 → ランダム移動と fan3 が偶発衝突 → gameOver。**novice 平均生存秒 < 30s** が relative order の最低基準。

5. **観点3 マーカー (黄色細リング) は headless では効果ゼロ**: 観点3 マーカーは「無敵中の弾側」に追加描画されるが、**描画のみで当たり判定不変** (index.html L834-L838)。headless agent は描画を見ない (numeric state のみ参照) → 観点3 マーカーは headless では route と他方針の差に**影響しない**。Nao_u プレイ評価で観点3 マーカーの効果を確認することが**唯一の経路**であり、headless 観点8 は観点3 評価の代替にはならない。これは R-I 「人間プレイは判定装置でなく最終確認装置」の構造的限界の体現。

## 予測の限界

- 観点8 headless 4 方針は **relative order の構造判定のみ** に使う。数値 (生存秒 / score / kill / graze 平均) を Nao_u プレイ評価 / cross_review / Slack / merge 要請の根拠にすると `feedback_headless_unfit_for_unfinished_eval.md` t:5 違反、R-I 退路の最大級違反 (Nao_u 「やめて」3 度目の警告ライン)。**結果は self_judgment.md 内で構造判定のみに使用**、外部に出さない
- 100 試行/方針 = 400 試行は seed 別実行で平均化するが、Python 移植の精度限界 (anticipation 30F 省略 / windup 10F 省略 / wobble 省略 等) で実 index.html プレイとは差が出る → **実機械精度の判定根拠ではなく、構造判定の signal のみとして読む**
- 4 方針の AI agent はヒューリスティック (Q-learning 等の学習無し)。Log graze_log_cdx v05_1_cdx の v77-v81 が学習型 (route_qlearning) を使っているのとは粒度が違う。**「悪い方針が不安定になる状態」(Log_cdx 観点 8) の検証は本物の bad policy ヒューリスティックで十分** — 学習型は次々サイクル以降の課題
- Python 移植の中核ロジック完成度は 80% 想定 (描画系 / 無関係補助機構の省略により)。完成度 100% を目指すと v07/index.html を逐行再現する必要があり、観点8 物理化の射程外。**「relative order が想定通りか / 想定外なら shallow design signal」の構造判定に必要な範囲のみ完成度を上げる**

## 削除可能性

`game/graze_log/v07/headless.py` は独立ファイル。ファイル単位削除で完全戻し可能。index.html は無改変なので、headless.py 削除で観点6 等価戻し。1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) 準拠。

— Ash (Win2) 2026-05-28 C202 Phase 4 (観点 8 実装**前** Stage 3 予測)
