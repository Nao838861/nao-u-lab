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
