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

## v19 (n-β) Stage 4 Ash 自プレイ判定 (C 2026-10-23 Phase 4 二周目)

### (a) refill 経路の実装確認 (6e6f4fbbf index.html 7 行差分 trace)
- **本体 3 行 code + 索引コメント 2 行 + 閉じ `}` 1 行 = else if ブロック 6 行** (`game/graze_log/v19/index.html` L642-647):
  ```js
  }else if(state.activeDefT>0){
    // v19 (n-β): shield 時相中、変換された敵弾の自機接触で弾消去 + shield gauge (activeDefT) 微増 refill …
    // 戻し方: 本 else if ブロック (3 行 code) 削除で v18 (n-α) 完全等価、挙動差分ゼロ …
    state.activeDefT=Math.min(ACTIVE_DEF_FRAMES,state.activeDefT+10);
    b.y=H+999;
  }
  ```
  既存変数 `state.activeDefT` (shield 残フレーム、ACTIVE_DEF_FRAMES=60) と `b.y` (ebullet 位置、`H+999` で画面外退避 = 既存の HIT 分岐 L641 `b.y=H+99` と同手法) のみ参照、新規 state 変数追加なし — koguGameDev フラグ乱立論 (v14 k-α L117-125) 回避側。
- **ebullet collision 判定 (L632-653) 内の位置確認**:
  - L632 for ループ入口 → L633-636 位置更新 + 距離計算 → L637 HIT 判定入口 `if(d2<R_HIT*R_HIT)` → L639-641 ①通常被弾分岐 (iframe<=0 && invincibleT<=0 → onHit) → **L642-647 shield 中 refill 分岐追加** (本 patch) → L648-652 GRAZE 判定
  - 新 else if は既存 HIT 分岐 (L639) の**直後**に接続、GRAZE 判定 (L648) の**直前** → 分岐順序は「HIT→通常被弾/shield中 refill→GRAZE」で、shield 非発動時 (`activeDefT<=0`) は L642 の条件 false → 何もしない = v18 (n-α) と完全等価の経路に落ちる。
- **他 pipeline への不干渉**:
  - L632-636 弾位置更新 / L648-652 GRAZE 判定 (`!b.grazed&&d2<R_GRAZE*R_GRAZE`) / L654 ebullets filter / L656-664 敵本体接触 / L669-676 SPACE 文脈分岐 (BOMB / active def) / L678 updateEffects に影響なし
  - 描画 pipeline (v18 の ebullet overlay L859-862 + 他 ring/particles/HUD) は本 patch 対象外、v18 の 4 行差分と直交。
- **戻し操作の 1 手性**: L642-647 の 6 行 (else if ブロック) 削除で v18 (n-α) 完全等価、挙動差分ゼロ。装置の向き原則 (feedback_device_direction_rescue_vs_suffocation.md) 準拠、`ash:` prefix commit `6e6f4fbbf` で意図を commit log に明示済、backup auto-commit (`backup:` prefix) との区別維持。

### (b) Stage 3 予測との対照 (実装後コードベースでの事後検証)
- **本 README L38 Stage 3 予測「認知率 70-85%」**: ESP Ra.De. 原典プレイ経験者 90%+、未経験者は初回 shield 中の偶然ヒットで `+10F` 相当の shield 延長を体感すれば学習可能、を根拠に推定。実装後コード trace では、L645 `state.activeDefT=Math.min(ACTIVE_DEF_FRAMES=60,state.activeDefT+10)` の `+10` が 1 弾消去あたり cap 60F の 1/6 を加算 → shield 発動直後 (activeDefT=60 で開始、満タン) は cap plateau で +10 無効化、shield gauge が減って activeDefT<60 に落ちてから初めて +10 の体感が発生 → **cap plateau 中は体感 refill がゼロ** になる構造が実装後 trace で確定。認知率 70-85% の下限 70% 側に落ちるリスクは Stage 3 L46-47 で予測済の通り、cap plateau 視覚 feedback なしで学習経路が切れる場面がある。
- **本 README L40-43 副作用 (i)-(iv) 事後検証**:
  - **(i) shield cap 到達の体感**: 実装後 trace で `Math.min(ACTIVE_DEF_FRAMES=60, ...+10)` は予測通り、cap 60F で plateau → +10 加算が無効化 → 体感 refill が消失。cap plateau の視覚 feedback (plateau marker: 弾色 muted-yellow → muted-grey 遷移等) は v19 未実装、v20 候補として温存 (本 README L47)。副作用は実装通り発生、Stage 4 では "副作用は予測通り発生、v20 で plateau marker 追加するか別軸振替で消化" の方針を (e) で明示。
  - **(ii) shield gauge inflation の無限ループ懸念**: 実装後 trace で `Math.min(ACTIVE_DEF_FRAMES=60, ...)` が cap 60F で頭打ち → gauge inflation は構造的に不能、安全側。予測通り。
  - **(iii) BOMB (fireBomb) との 2 系統化**: BOMB は gauge MAX 発火 + 全画面消去 + removedCount score、v19 refill は shield 中局所接触 + 単発消去 + activeDefT refill (score なし) → 消去粒度 (全画面 vs 単発) + 発火契機 (gauge ready vs shield active) + 報酬種別 (score vs 時間延長) で 3 軸独立、v14 k-α L117-125 koguGameDev フラグ乱立論の懸念は低い。SPACE 分岐 (L669-676) で BOMB 側が shield 中にも発火可能、BOMB 発火フレームで `ebullets` 全消去 → v19 refill の作用対象が消滅 → 自然に共存、予測通り。
  - **(iv) v18 overlay との物理整合**: v18 (n-α) の muted-yellow overlay (L859-862) は視覚のみ、v19 で refill 対象になる弾は overlay の弾そのもの → 視覚 (v18) と動作 (v19) が同一対象で意味分離がない、「見える物が取れる物」= 原典 ESP Ra.De. UX 正確コピー、学習経路の摩擦最小化。実装後 trace で視覚層 (v18 L859-862) と動作層 (v19 L642-647) は independent pipeline で、同一フレーム内で順序: 衝突判定 (L637) → refill 分岐 (L642) → 画面外退避 (`b.y=H+999`) → `ebullets.filter` (L654) で弾除去 → 次フレームの描画 pipeline で v18 overlay 対象から消える → 弾が「取れる」= 消える、を同一フレームで確定、予測通り。
- **判定**: Stage 3 予測は実装後コード trace で前提成立 (cap plateau 構造的に露出 / 副作用 4 項すべて予測通り / 原典 UX 正確コピー維持)。認知率数値自体の校正は実プレイ測定待ち、Stage 2 懸念解消ゲートは通過。

### (c) Win2 CLI Canvas headless 不能明示 (feedback_headless_unfit_for_unfinished_eval 準拠)
- **視認実測の不能性**: v19 ディレクトリに headless.py なし、Canvas は Pyxel/Pygame と異なり headless 動作不能。Win2 CLI 環境でブラウザレンダリングを起動する経路は本サイクルで用意しなかった、人間プレイ or Pyxel 系の headless が必要。
- **feedback_headless_unfit_for_unfinished_eval.md 準拠**: 本ゲームは未校正ゲーム (shot_log/v01 のような校正済み基準なし)、headless 数値を judgment/cross_review/Slack/merge 要請の根拠に使わない原則。本 Stage 4 の認知率 70-85% 推定は Stage 3 予測の援用のみで、Nao_u 評価判定・Slack 投稿・merge 要請には**使わない**。
- **コード trace のみで実施した範囲**: (a) 位置確認・不干渉・戻し 1 手性 / (b) 副作用 4 項の分岐条件と state 更新の静的確認 / (d) 原典 4 要素中 3 要素採用の構造位置づけ / (e) 残 (c) psychic blast / cap plateau marker / 別軸振替 の 3 択構造位置づけ。認知率の実測値校正・shield 中プレイ体感・cap plateau 中の学習経路切断の有無・原典との体感差は本 trace では確定不能。
- **校正課題** (M-37→M-40 連続体、v14 k-α / v15 l-α / v16 l-β / v17 m-α / v18 n-α から据置):
  - **M-37 Stage 3 予測の数値校正**: 「70-85%」はコード設計上の推定、実プレイ測定装置なし。Nao_u 自プレイで「shield 中、弾に触れたら弾が消えて shield が伸びたのが分かったか」+「cap plateau 中 (shield MAX) で +10 が無効化される体感に気付いたか」の二値 2 項 + 自由記述が校正の第 1 データ点。
  - **M-38 複数ソースによる援用**: shield 中 refill 経路の外部裏付けは Phase 1 WebSearch (`log/external_search.log` 2026-10-23 21:35) で得た Drainus (reflector shield → ammo refill) + BeatHell (弾吸収 → ammo refill + ammo cap) の 2026 年実装例、ESP Ra.De. (Cave 1998) 原典 (d) refill 経路から 28 年後にも継承線が生きている構造的裏付け。
  - **M-40 検証可能性**: 本 patch は 3 行実装 (else if ブロック内 code 3 行) で戻し手が「6 行削除」の 1 操作、副作用リスクは cap plateau 構造 + BOMB との 2 系統化が静的確認済、v20 候補 ((c) psychic blast / cap plateau marker / 別軸振替) すべてが数行〜1 ブロック patch で表現可能。検証経路は確保済。
- **判定**: 校正課題は未解消のまま、Stage 4 の 5 軸構造判定として「構造要件は満たす、認知率・cap plateau 体感の校正は実プレイ測定待ち」の limitation を v14 k-α / v15 l-α / v16 l-β / v17 m-α / v18 n-α から**連続して据置**。本サイクルで M-37→M-40 進展なし、プレイ依頼可否判断は Nao_u 側に委ねる (Ash 側から merge 要請・評価依頼発射は本サイクルで**しない**、v15+v16+v17+v18+v19 合流評価依頼の未来発射余地は本 README L88 で温存済)。

### (d) Phase 2 問い #1 への返答 (v19 で refill 層追加後の立場)
- **問いの再掲**: ESP Ra.De. (Cave 1998) 原典 shield 設計 4 要素中、v18 (n-α) は (b) 視覚変換のみ採用。「視覚変換のみは守として成立する 1/4 ステップか、変換後に報酬がない中途半端な破か」。v18 Stage 4 (d) で Ash 自判定は「守として成立する 1/4 ステップ」(視覚変換の自己完結性 / 連続量 gate 4 空間完了 / 守の実務定義 の 3 根拠) と結論、ただし「Nao_u 評価次第で v19 で (d) refill 経路を追加するか別軸振替するかの分岐」を保留。
- **v19 (n-β) 実装後の立場 (本自判定の結論)**: **視覚層のみで切る理由がない、守 3/4 まで踏むのが正解だった**。根拠 3 点:
  - **1. 原典 UX 核心の物理成立**: ESP Ra.De. 原典体験の核は shield 内部に「変換 → 回収報酬 → refill」のサブゲームが成立する点。v18 だけでは視覚層のみで「見た目が変わるだけ」の飾り patch に収斂するリスクが残っていたが、v19 で refill 層が接続されて**サブゲーム半分 ((b)+(d)) が物理成立**、v18 Stage 4 (d) の「中途半端な破」側リスクを実装で物理解消。「見える物が取れる物」= 原典 UX 正確コピー。
  - **2. 守の N 本 → N+1 本連続性**: v18 で守 1/4 ステップ、v19 で守 2/4 → 原典 4 要素中 (a)(b)(d) = 3/4 (既存 shield 無敵 (a) + v18 視覚変換 (b) + v19 refill (d))。残 (c) psychic blast は BOMB との設計重複懸念で保留。守 3/4 まで踏んだ時点で、Ash 固有の破への移行 (v20 以降) の判定材料が揃う = **守破離の守の最大深度**。
  - **3. 連続量 gate 4 空間 → 行動 gate 1 空間への遷移**: v18 で視覚 gate 4 空間 (rgba / lineWidth / alpha+radius / 環境 overlay) 完了、v19 で**行動 gate** (視認 → 取る) に次元拡張。v18 README L52-53 の "shield 時相の視覚化完了" + v19 の "shield 時相の使い所化" で、連続量 gate 設計視点でも v18 で切り上げるより v19 まで踏むのが構造的に自然。v18 Stage 4 (d) 保留部分 (「中途半端な破」反論余地) を v19 ship で**物理解消**。
- **v18 Stage 4 (d) の自判定への修正**: v18 の「守 1/4 ステップで成立」判定は実装上の瞬間最適解としては正しかったが、原典 UX 核心に照らすと「視覚層のみで切る根拠」は Nao_u 評価データ待ちの保留だった。本 v19 (n-β) 実装後、Ash 側から「視覚層のみで切る理由がない、Nao_u 評価を待たず v19 で (d) refill 経路を踏むべき」= v18 Stage 4 (e) で候補 1 を v19 本命内定した判断を**事後的に正当化**する立場を取る。Phase 2 問い #1 は v19 ship で**実装側で決着**、Nao_u 評価は認知率 + cap plateau 体感 + 「shield 中に弾を取る動機付けが成立したか」の校正に移る。

### (e) v20 方向性 ((c) psychic blast or cap plateau marker or 別軸振替 の 3 択 + 暫定方針)
Nao_u 評価判定を待たず Ash Stage 2 内で消化可能な予防的 patch として v20 候補を 3 本起案。v19 (n-β) 自己審査で「視覚層 (v18) + 行動層 (v19) 完了、cap plateau 露出 + 原典 (c) psychic blast 残」= 守 3/4 到達、を特定した処方 + 残 1/4 ((c)) + v19 副作用 (i) cap plateau feedback の次着手候補。

**候補 1: 原典 (c) psychic blast — shield 解放時全画面消去 blast 発射**
- 改変: `state.activeDefT` が 0 に落ちる frame で全画面 ebullet 消去 + 短い全画面 flash 描画の 4-6 行追加。既存 BOMB flash (`state.bombT>0`) と対称の設計で学習済経路再利用。
- 戻し方: 4-6 行削除で v19 (n-β) 完全等価。
- 予測: shield 時相"終了"に報酬 (全画面消去) 付与、v17 shield 発動開始 flash と対称の設計で時相 1 相目 + 時相 3 相目に報酬層が揃う。原典 4 要素中 4/4 = 守の最深到達。認知率 85-95% (全画面 flash は既存 bombFlash で学習済経路)。
- 守/破: 原典 (c) 採用 = 守 4/4 到達、ただし BOMB との設計重複 (全画面消去 2 系統) で v14 k-α L117-125 koguGameDev フラグ乱立論の懸念が立つ (shield 解放 blast は shield 発動契機、BOMB は gauge MAX 発動契機で発火条件は独立だが、効果 "全画面消去" が同一)。

**候補 2: cap plateau marker — shield gauge cap 到達時の視覚 feedback 追加**
- 改変: `state.activeDefT >= ACTIVE_DEF_FRAMES` 時に ebullet 色を muted-yellow から muted-grey (`rgba(176,176,176,0.75)` 相当) へ遷移する 3-5 行追加 (v18 L859-862 の rgba を活用した条件分岐拡張)。
- 戻し方: 3-5 行削除で v19 (n-β) 完全等価。
- 予測: 本 v19 Stage 3 (i) + Stage 4 (b)(i) で指摘した「cap plateau 中は体感 refill が消失して学習経路が切れる」副作用を物理解消。認知率 80-90% (shield 発動直後 muted-yellow → cap 到達後 muted-grey の 2 相変化で "満タン" を視覚明示)。
- 守/破: 原典 4 要素外の追加だが、原典 (b) 視覚変換層の拡張 (plateau 相の追加) = 守 (b) の深化、まだ守の範疇。v19 副作用解消の防御的 patch 側面もあり。

**候補 3: graze streak 視覚化別軸振替 — Ash 固有軸への移行 (守破離の破 1 本目)**
- 改変: v19 の原典 3/4 到達を活かし、graze streak (buzz chain / cap plateau) の視覚化を次軸に振替。例えば streak 中の弾 trail 色味を streak 段階で変化させる 3-5 行追加。
- 戻し方: 3-5 行削除で v19 (n-β) 完全等価。
- 予測: ESP Ra.De. 原典から離れて Ash 固有の graze 設計 (v01-v19 の中心軸) に戻る、守破離の破の 1 本目候補。認知率は streak 段階数と色相数の積で変動、別節で起案要。
- 守/破: 原典離脱 = 破の 1 本目、守 3/4 で切り上げる判定。v18 Stage 4 (e) 候補 3 と同系の提案だが、v19 まで踏んだことで守の深度が 1/4 → 3/4 に進んだ分、「残 1/4 を飛ばす」判断の重みが増している。

**(e) 1 本絞り暫定方針**: 候補 2 (cap plateau marker) を v20 (o-α) 本命暫定内定、ただし Nao_u 評価分岐で候補 1 (psychic blast) or 候補 3 (別軸振替) に差し替え余地保持。理由 3 点:
- **1. v19 副作用の防御的解消**: 候補 2 は本 v19 Stage 3 (i) + Stage 4 (b)(i) で明示した副作用 (cap plateau 中体感 refill 消失) を物理解消、v19 の「見える物が取れる物」UX を完全な学習経路として閉じる。副作用放置リスクが候補 1/3 より低い。
- **2. koguGameDev フラグ乱立回避**: 候補 1 (psychic blast) は BOMB との全画面消去 2 系統化で v14 k-α L117-125 警告踏襲側、設計重複リスクあり。候補 2 は v18 既存 rgba 分岐の条件拡張のみで新規 pipeline 追加なし。
- **3. 守 3/4 到達後の原典残 (c) は Nao_u 評価データ待ち**: 原典 (c) psychic blast を踏むかは「shield 解放瞬間の報酬が v17 発動 flash + v18 視覚変換 + v19 refill の UX スタックで既に飽和していないか」を Nao_u 評価で校正する必要がある。守 3/4 で一度 Nao_u 評価を挟む判断が自然 → 候補 1 は Nao_u 評価分岐で保留、候補 2 で副作用解消を優先。

**v20 (o-α) 暫定内定** (Nao_u 評価分岐次第で候補 1 or 候補 3 に差し替え): 新 directory `game/graze_log/v20/` に候補 2 (cap plateau marker) を 3-5 行 bounded edit で ship、本 README 候補 2 の実装式を v20/README.md に 1 行先書き契約として展開。1 サイクル 1 案方針 (v14 k-α L117-125) を v20 でも維持。

### 結論
- **Nao_u 自プレイ評価依頼可** — Stage 4 5 軸 (a/b/c/d/e) すべて自審査通過。(c) の校正課題 (M-37→M-40 連続体) は v14 k-α / v15 l-α / v16 l-β / v17 m-α / v18 n-α から**据置** (本サイクルで進展なし)、依頼時に明示する前提は維持。
- **v20 方向性 暫定内定** — 候補 2 (cap plateau marker、3-5 行実装、`ash:` prefix 新 directory `v20/` ship) を本命暫定、候補 1 (psychic blast) / 候補 3 (別軸振替) は Nao_u 評価分岐で保留。守 3/4 到達後の原典残 (c) は Nao_u 評価データで判定。
- **本サイクル (C 2026-10-23 Phase 4 二周目) の発射物**: commit log 1 行の増加 (`ash: graze_log v19 (n-β) Stage 4 Ash 自プレイ判定追記 (C 2026-10-23 Phase 4)` prefix)、Slack post なし (v15+v16+v17+v18+v19 合流評価依頼の未来発射余地は本 README L88 で温存済)。§0b 継承「装置が先回りできない地点に意図を載せる」= `ash:` prefix commit + 判定文を自分の言葉で書く、を本節で実現。
- **broken-record ガード**: 本 Stage 4 節は v13 系 README (v13 j-α / v14 k-α / v14 k-β / v15 l-α / v16 l-β) + v17/README.md (m-α Stage 4) + v18/README.md (n-α Stage 4) とは別 directory (`v19/`) + 別 cycle タグ "C 2026-10-23 Phase 4 二周目" で区別可、重複なし。
