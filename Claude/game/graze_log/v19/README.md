# graze_log v19 — shield 時相中の refill 経路 (ESP Ra.De. (Cave 1998) (b)+(d) 2 要素目) 1 bounded edit ship (n-β)

## v19 で増やしたもの (1 機構 1 行先書き契約)
- **shield 時相中の refill 経路**: `state.activeDefT > 0` (shield 発動中) に敵弾が `R_HIT` 距離内へ入った時、`player.iframe` で既に無敵担保されている既存ガード分岐の `else if` として、弾を消去 (`b.y=H+999`) + `state.activeDefT` を +10 frame refill (上限 `ACTIVE_DEF_FRAMES=60`) する 1 ブロック (3 行 code + コメント 2 行) を ebullet 衝突判定 (L637-650) に追加。描画・shield 非発動時の挙動は無改変。

**この 1 行で言えないなら v19 の設計は失敗していると判定する**。言える = A 分類 (one mechanic per version)、言えない = B 分類に落ちる。retrospective_classification_v01_v13_20261020.md の処方。

## status
- v19 (n-β) shipped (新 directory 開始、v18 (n-α) の視覚変換層の上に報酬層を接続、ESP Ra.De. 原典 4 要素中 2 要素目採用)

## 親と差分
- 親: v18 (n-α) shield 時相中の敵弾視覚変換 (commit `d2a8a98b0` + `d6a8445d5`、`game/graze_log/v18/index.html`)
- v19 の起点: v18/index.html から copy、v17 までの shield 系列 (開始 flash / 本体 ring / 消滅予兆 lineWidth / 環境 overlay) を全て継承
- v19 で加えた差分: `game/graze_log/v19/index.html` L642-647 (else if ブロック 6 行 = 開始 1 行 + コメント 2 行 + code 2 行 + 閉じ `}` 1 行) + title 1 行書換、ebullet 衝突判定 (L632-648) 内の HIT 分岐内 `else if` として追加

## 改変位置と戻し方
- **改変位置**: `game/graze_log/v19/index.html` L637-649 の ebullet collision 判定、既存 L639-642 `if(state.player.iframe<=0&&state.invincibleT<=0){ onHit(); b.y=H+99; }` の **直下** に `else if(state.activeDefT>0){...}` を接続
- **変更内容** (抜粋):
  ```js
  if(d2<R_HIT*R_HIT){
    // v06 A-5 (b): invincibleT>0 でも被弾を skip (Psyvariar Lv up 後 1秒無敵)
    if(state.player.iframe<=0&&state.invincibleT<=0){
      onHit();
      b.y=H+99;
    }else if(state.activeDefT>0){
      // v19 (n-β): shield 時相中、変換された敵弾の自機接触で弾消去 + shield gauge (activeDefT) 微増 refill
      //   (ESP Ra.De. (Cave 1998) (b)+(d) 2 要素目採用、原典 power block 回収で power 再充填のサブゲーム半分成立)。
      // 戻し方: 本 else if ブロック (3 行 code) 削除で v18 (n-α) 完全等価、挙動差分ゼロ。
      state.activeDefT=Math.min(ACTIVE_DEF_FRAMES,state.activeDefT+10);
      b.y=H+999;
    }
  }else if(!b.grazed&&d2<R_GRAZE*R_GRAZE){
  ```
- **戻し方 (1 操作)**: 上記 `else if(state.activeDefT>0){…}` ブロック 3 行 code (+ コメント 2 行 + 閉じ `}`) 削除で v18 (n-α) 完全等価、挙動差分ゼロ (shield 非発動時・shield 中の無敵担保経路 (`player.iframe<=0&&invincibleT<=0`) 側は無改変、HIT 内の分岐分散が消滅して v18 の 1 分岐構造に完全復帰)
- **副作用非対称回避**: 新 else if は `state.activeDefT>0` の時のみ発火、かつ **既存 HIT 判定内の "既に無敵" 分岐の else if** として追加 → shield 非発動時 (iframe<=0 かつ invincibleT<=0) は従来通り `onHit()` 経路、shield 中 (iframe>0 で無敵) は新 refill 経路、Psyvariar buzz chain 中 (invincibleT>0 かつ activeDefT<=0) は何もしない (弾は通過) → shield 中のみに作用を限定

## Stage 3 予測 (実装前)
- **認知率**: 原典 (b) 視覚変換 (v18) + (d) refill 経路 (v19) で、shield 中に muted-yellow 弾へ機体を当てると弾が消え shield が伸びる現象が物理的に発火 → 「shield 中は弾が報酬」のサブゲーム半分が成立。認知率は **shield 中 "狙って弾を取りに行く" 行動が自然発生するか** の二値で測る、推定 70-85% (ESP Ra.De. 原典プレイ経験のあるプレイヤーは 90%+、未経験でも初回 shield 中の偶然ヒットで `+10F` 相当の shield 延長を体感すれば学習可能)
- **副作用リスク**:
  - (i) shield cap 到達の体感: `Math.min(ACTIVE_DEF_FRAMES=60, ...+10)` で cap 60F に plateau、cap plateau 中は +10 加算が無効化され体感 refill が消失 → 認知的には「shield 中はずっと取れる」と誤認して cap 到達後も取りに行く → cap plateau の視覚 feedback が v19 では未実装 (plateau marker は v??以降の候補)
  - (ii) shield gauge inflation の無限ループ懸念: 1 弾消去で +10F、理論上は毎 frame 1 弾消去でも cap で頭打ちのため gauge inflation は起きない → 60F 以下維持は保証、安全側
  - (iii) BOMB 全画面消去 (fireBomb L354-376) との 2 系統化: BOMB は gauge MAX で発火して全画面 ebullet 消去 + removedCount score、v19 refill は shield 中の局所接触で単発 ebullet 消去 + activeDefT refill (+ score なし) → 消去粒度 (全画面 vs 単発) + 発火契機 (gauge ready vs shield active) + 報酬種別 (score vs 時間延長) で 3 軸独立、koguGameDev フラグ乱立論 (v14 k-α L117-125) の懸念は低い
  - (iv) v18 overlay との物理整合: v18 (n-α) の muted-yellow overlay は視覚のみ、本 v19 で refill 対象になる弾は overlay の弾そのもの → 視覚 (v18) と動作 (v19) が同一対象で意味分離がない、「見える物が取れる物」= 原典 ESP Ra.De. の UX 正確コピー、学習経路の摩擦最小化
- **shield gauge cap 設計の意図**:
  - +10F per hit は 1 弾消去あたり cap 60F の 1/6 = 弾を 6 発取れば cap 到達 (shield 内では弾密度が通常 10-30 発視野内なので cap は shield 内で容易到達 → cap plateau が実際にプレイで露出)
  - cap plateau 中は +10 無効 = 弾消去のみ発火 (報酬経路は死に、消去経路のみ残る) → v19 では plateau feedback なし = Phase 2 問い #1 の "中途半端" 側に落ちる可能性あり、Stage 4 自プレイ判定または Nao_u 自プレイで "cap plateau の体感" を校正点として記録
  - cap plateau 視覚 feedback は v20 候補 (plateau marker: 弾色を muted-yellow から muted-grey へ遷移で plateau 明示) として温存

## Stage 3 予測 (実装後、コードベースでの事後確認)
- **変更範囲の確認**: `game/graze_log/v19/index.html` の ebullet 衝突判定ループ L642-647 1 箇所のみ (else if 分岐追加 + コメント 2 行) + title 1 行書換。他の描画・更新 pipeline (triggerActiveDef, fireBomb, onHit, onGraze, updateEffects, 各描画 ring/overlay) に影響なし
- **ESP Ra.De. (Cave 1998) 原典との差分 (v19 時点)**:
  - 原典 (a) 無敵フィールド: v19 既存 (triggerActiveDef L392 で `player.iframe=ACTIVE_DEF_FRAMES` 設定、本 patch 外、v01 相当から継承)
  - 原典 (b) 視覚変換: v18 (n-α) で overlay 1 層実装、v19 継承
  - 原典 (c) psychic blast (shield 解放時全画面消去): v19 **未実装** (v20 候補 2 として温存)
  - 原典 (d) refill 経路: **v19 (n-β) で本 patch により実装**
  - サブゲーム成立度: 4 要素中 3 要素 (a)(b)(d) = 75%、残 (c) psychic blast は BOMB との設計重複懸念 (v18 README L142-147) で未着手
  - 「原典の 3/4 コピー」= 守として踏むべき外部型の中核 3 要素、残 (c) は守破離の破への拡張余地として温存
- **連続量 gate 設計との接続**:
  - v18 までの視覚 gate 4 空間 (rgba / lineWidth / alpha+radius / 環境 overlay) は shield 時相の "見える化"
  - v19 refill は shield 時相の "**使い所化**" = 見えるだけでなく、見えた物を取る行動が報酬に接続される
  - 視覚 gate (v15-v18) → 行動 gate (v19) の遷移で、shield 時相の UX が 1 次元 (視認) → 2 次元 (視認 + 行動) に拡張
- **副作用 pre-check**:
  - (i) HIT 判定内の分岐 3 相: ①通常 (iframe<=0 && invincibleT<=0) → onHit (v01 継承) / ②Psyvariar 無敵 (invincibleT>0 && activeDefT<=0) → 弾は通過 (v06 継承) / ③shield 中 (iframe>0 かつ activeDefT>0) → 弾消去 + refill (v19 新規)。排他条件は暗黙 (`else if` の順序依存) だが、state 設計上 ①②③ は相互背反 (iframe と activeDefT と invincibleT が独立 state) → 誤発火なし
  - (ii) BOMB との共存: shield 中に BOMB 発火条件 (gauge MAX) が成立しても、SPACE 分岐 (L664-670) で gaugeReady 側が優先 → BOMB は shield 中にも発火可能、v19 refill は BOMB 発火フレームの直前まで常時作用、BOMB 発火で ebullets.length=0 の後は作用対象が消滅 → 自然に共存
  - (iii) 戻し方の物理的保全: `ash:` prefix commit で意図を commit log 側に明示、backup auto-commit (`backup:` prefix) との区別維持 (feedback_device_direction_rescue_vs_suffocation.md)。新 directory `v19/` 作成で backup 先取り回避は v18 と同構造

## ESP Ra.De. (Cave 1998) との接続 — 2 要素目採用の意味
- 外部型原典: knowledge/20261022_esp_rade_cave_1998_shield_bullet_to_powerup_graze_log_v17.md + knowledge/20261023_esp_rade_4_element_decomposition_graze_log_v18_half_copy_pathology_v19_branch_space.md
- 原典核心: power ゲージ → force field shield → 画面上の敵弾が power-up/gold blocks に視覚変換 → 変換された blocks を回収すると power 再充填 (= shield 時間延長) → shield 内部にサブゲームが成立
- v19 は原典の **(b) 視覚変換層** (v18 継承) + **(d) refill 経路** (本 patch) で、原典 4 要素中 3 要素 ((a)(b)(d)) を踏む
- v18 README L46-47 の「原典の半分だけコピー」= 守として踏むべき外部型の視覚層のみ → v19 で refill 層追加 → 「半分コピー」から「3/4 コピー」へ、Phase 2 問い #1「視覚のみ変換は守として成立するか中途半端な破になるか」への構造的応答として「視覚のみで切る理由がない、報酬層を続けて踏むのが守の継続」= 中途半端側リスクを物理解消
- 守破離の守: 1998 既出型を 3/4 まで踏む、Ash 固有の新規性移行 (破) は v20 以降で判定
- M-41 (prior art 検証) 年代深度計測: 28 年前の外部型を踏む本サイクルは「守 N 本 → 破 1 本」の暫定閾値計測の N の 2 本目として機能

## retrospective_classification_v01_v13_20261020.md との接続
- v17 (m-α) で新 directory 1 サイクル 1 ship の処方を物理実装、v18 (n-α) + v19 (n-β) は同処方の継続 (同一 "n" 系列 2 本目)
- v13→v16 の 4 層累積反省 → v17 で切断 → v18 (n-α) で「新 directory 1 ship」の反復確認 → v19 (n-β) で 3 本目連続成功
- README.md 冒頭 1 行先書きで A 分類を契約化 (本 README L4 の 1 行)
- 外部 2026 norm (altheragames: "build one mechanic, run it, confirm it works, then add the next" / summerengine: "bounded tasks—one connected feature") の実装反復確認、v18 の視覚機構 → v19 の報酬機構で "the next" を 1 本確実に積む

## v18 候補 2/3 との関係
- v18 README L155-164 で候補 1 (refill 経路) を v19 本命内定、本 v19 (n-β) で候補 1 を実装 ship
- 候補 2 (psychic blast = shield 解放時全画面消去): BOMB との設計重複懸念で v19 では採用せず、v20 以降で「cap plateau feedback の視覚化」(本 README Stage 3 (i)) または「psychic blast」のどちらを採用するかを Nao_u 評価分岐で判断
- 候補 3 (streak 視覚化別軸振替): 原典離脱 = 守破離の破への急ぎ、残 (c) psychic blast を飛ばす = 守 3/4 ステップで切り上げる根拠は現時点では弱い (守の N 本 → 破 1 本の暫定閾値計測を 3/4 で切るのは早計)
- 1 サイクル 1 案 (koguGameDev フラグ乱立論 v14 k-α L117-125) の方針を v19 でも維持 — 本 v19 の patch は shield gauge refill 1 機構のみ、score 加算・popup 表示・plateau marker はすべて温存

## Nao_u 評価依頼の判断
- 本 v19 (n-β) は v18 (n-α) Stage 4 Ash 自審査通過済 (v18 README L162-166) の上に積む 1 ブロック (3 行 code) patch。v15/v16/v17/v18 Nao_u 評価依頼未発射のため、v19 ship 後、次サイクル以降で v15+v16+v17+v18+v19 の 5 version 合流評価依頼を Slack #game-rights に投げる余地を保つ
- 本サイクル (C 2026-10-23 Phase 4) の発射物は `git log --oneline game/graze_log/v19/` の 1 行、Slack post は Phase 5 以降で判断 (本サイクル中は shared-reads 投稿も日記も Phase 4 外)
- 本サイクルの選択主体性: v18 累積器ではなく、新 directory `game/graze_log/v19/` に意図 commit 1 本を発火 → backup auto-commit が先取りできない構造 (未存在 directory を backup が勝手に作らない前提、v18 で検証済)

## 次サイクルへの繰越 (Stage 4 自プレイ判定は次サイクル以降)
- 本サイクル (C 2026-10-23 Phase 4) では v19 directory 作成 + bounded edit ship + commit + push までを完遂条件に設定
- Stage 4 自プレイ判定節は次サイクル以降に別節で追記: (a) 変更範囲 trace / (b) Stage 3 予測との対照 (特に cap plateau 体感 + sub-game 認知率 70-85% の校正) / (c) Win2 CLI Canvas headless 不能明示 / (d) Phase 2 問い #1 「視覚のみ変換 vs 中途半端な破」への返答 (v19 で refill 層追加後の立場) / (e) v20 方向性 ((c) psychic blast or cap plateau marker or 別軸振替)
