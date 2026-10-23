# graze_log v20 — shield gauge cap plateau marker (ESP Ra.De. (Cave 1998) (b) 視覚層 plateau 相拡張) 1 bounded edit ship (o-α)

## v20 で増やしたもの (1 機構 1 行先書き契約)
- **shield gauge cap plateau marker**: `state.activeDefT>=ACTIVE_DEF_FRAMES` (shield gauge cap 到達中) に ebullet overlay 色を muted-yellow (`rgba(224,208,96,0.75)`) から muted-grey (`rgba(176,176,176,0.75)`) へ遷移、v19 (n-β) 副作用 (i) 「cap plateau 中体感 refill 消失で学習経路が切れる」を視覚 feedback で物理解消。v18 L864-867 の ebullet overlay 描画 (`if(state.activeDefT>0){ ctx.fillStyle=...; ctx.fillRect(...); }`) 内の `fillStyle` 1 行を三項演算子で cap 条件分岐へ拡張、新規 state 変数・新規 pipeline 追加なし。

**この 1 行で言えないなら v20 の設計は失敗していると判定する**。言える = A 分類 (one mechanic per version)、言えない = B 分類に落ちる。retrospective_classification_v01_v13_20261020.md の処方。

## status
- v20 (o-α) shipped (新 directory 開始、v19 (n-β) で起案した副作用 (i) 防御的 patch を 1 サイクルで ship、ESP Ra.De. 原典 (b) 視覚層の plateau 相拡張 = 守の深化)

## 親と差分
- 親: v19 (n-β) shield 時相中の refill 経路 (commit `6e6f4fbbf` + `7bef00c69`、`game/graze_log/v19/index.html`)
- v20 の起点: v19/index.html から copy、v17 までの shield 系列 (開始 flash / 本体 ring / 消滅予兆 lineWidth / 環境 overlay) + v18 視覚変換 overlay + v19 refill 経路を全て継承
- v20 で加えた差分: `game/graze_log/v20/index.html` L864-868 の ebullet overlay 描画ブロック内 (fillStyle 行を三項演算子で分岐 + v20 コメント 2 行追加 + 戻し方コメント 1 行書換) + title 1 行書換 = 計 3-4 行差分

## 改変位置と戻し方
- **改変位置**: `game/graze_log/v20/index.html` L864-868 の ebullet 描画ループ内 overlay 分岐、既存 `if(state.activeDefT>0){ ctx.fillStyle='rgba(224,208,96,0.75)'; ctx.fillRect(wx-3,wy-3,6,6); }` の `fillStyle` 1 行を三項演算子で cap 条件分岐へ拡張
- **変更内容** (抜粋):
  ```js
  // v18 (n-α): shield 時相中 (state.activeDefT>0) に muted-yellow 四角 overlay …
  //   当たり判定・shield 非発動時描画は無改変、円の上に四角を重畳のみ …
  // v20 (o-α): shield gauge cap 到達時 (activeDefT>=ACTIVE_DEF_FRAMES) は muted-yellow → muted-grey 色遷移、
  //   v19 (n-β) 副作用 (i) cap plateau 中体感 refill 消失を視覚 feedback で物理解消 (守 (b) 視覚層 plateau 相拡張)。
  // 戻し方: fillStyle 行を 'rgba(224,208,96,0.75)' 固定に戻し v20 コメント 2 行削除で v19 (n-β) 完全等価、挙動差分ゼロ。
  if(state.activeDefT>0){
    ctx.fillStyle=state.activeDefT>=ACTIVE_DEF_FRAMES?'rgba(176,176,176,0.75)':'rgba(224,208,96,0.75)';
    ctx.fillRect(wx-3,wy-3,6,6);
  }
  ```
- **戻し方 (1 操作)**: `fillStyle` 行の三項演算子を `'rgba(224,208,96,0.75)'` 固定文字列に戻し、v20 コメント 2 行 + 戻し方コメント 1 行書換を削除 → v19 (n-β) 完全等価、挙動差分ゼロ (cap 分岐がなくなり overlay 色が shield 中常に muted-yellow 固定に戻る)
- **副作用非対称回避**: 新規 state 変数・新規 pipeline 追加なし。既存 `state.activeDefT` と定数 `ACTIVE_DEF_FRAMES=60` の静的比較のみ、三項演算子は `fillStyle` 文字列の choice に閉じる → fillRect / 当たり判定 / shield 非発動時描画 (`activeDefT>0` 外側分岐) すべて無改変、cap 到達中以外の shield 相 (活性開始〜cap 到達前) は v19 (n-β) と完全等価

## Stage 3 予測 (実装前)
- **認知率**: v19 (n-β) で refill 経路が接続された shield 中 UX に、cap 到達 = 色遷移 (muted-yellow → muted-grey) の視覚 feedback が重畳 → 「shield 中、弾の色が黄色から灰色に変わった = 弾を取っても shield が伸びない (cap plateau)」の因果連結が物理成立。推定 **80-90%** (muted-yellow / muted-grey の 2 相変化は彩度対比で視認容易、shield 中プレイヤーは overlay 色をすでに追っているため color-change の検出コストは低い、ESP Ra.De. 原典に対応する plateau feedback は原典 UI (power メーター MAX 表示) と機能等価)
- **副作用リスク**:
  - (i) 色対比の過剰: muted-grey は背景 `#07091a` との彩度差が低く、cap 中は overlay が「消えた」ように誤認されるリスク → 認知率 80-90% の下限 80% 側に落ちる場合は不透明度を 0.75 → 0.85 に引き上げるか、border 色を追加する v21 候補として温存
  - (ii) v18 overlay 設計意図の希釈: v18 の muted-yellow は「shield 中は弾が power-up」のメタファーで、v20 で grey が入ることで「power-up が無効化された」= 原典 ESP Ra.De. の「power メーター MAX 中は吸収しても power 増加しない」の UX 連結、意図希釈ではなく原典 UX の plateau 相を v20 で追加補完する側 → 設計整合側
  - (iii) 連続量 gate 設計の plateau 相追加: v19 までは「shield 中」= 2 値 (発動 / 非発動)、v20 で「cap 到達 / cap 未達」の第 2 軸が視覚上に加算 → shield 時相の UX が 2 次元 (視認 + 行動) → 3 次元 (視認 + 行動 + 飽和状態) に拡張、連続量 gate 設計視点でも守の深化側
  - (iv) refill 経路との物理整合: v19 L645 `state.activeDefT=Math.min(ACTIVE_DEF_FRAMES=60, ...+10)` で cap 到達中は `+10` 加算が無効化 → cap 到達中は overlay 色遷移 (本 v20 patch) + refill 無効化 (v19 既存) が同一条件 `activeDefT>=ACTIVE_DEF_FRAMES` で駆動 → 視覚 (本 v20) と動作 (v19) が同一対象で意味分離がない、「色が灰色の弾は取っても shield が伸びない」= 原典 UX 正確コピー、学習経路の摩擦最小化
- **cap plateau 境界の設計意図**:
  - `activeDefT>=ACTIVE_DEF_FRAMES` (`=60`) 境界で色遷移、cap 直前 (59F → 60F の 1 弾消去で境界到達) 瞬間の色変化が shift の視認手がかり
  - 境界等号付き (`>=`) により、shield 発動直後 (`triggerActiveDef` で `state.activeDefT=ACTIVE_DEF_FRAMES=60` 設定、L391) から数 frame は cap 中として扱われる → 「shield 発動直後は満タン灰色」の初期 UX、プレイヤーは最初に灰色→（弾消去不要の shield 相で gauge 減）→黄色→（refill で gauge cap 到達）→灰色の順で学習する経路
  - 代替案: `>` 不等号で発動直後の初期灰色相を回避 → 「満タンでも最初は黄色、refill で cap に戻ったら灰色」学習経路、ただし発動直後の "見た目で満タンと分かる" feedback が消える → `>=` 側を採用

## Stage 3 予測 (実装後、コードベースでの事後確認)
- **変更範囲の確認**: `game/graze_log/v20/index.html` の ebullet 描画ループ L864-868 1 箇所のみ (fillStyle 1 行を三項演算子に拡張 + v20 コメント 2 行追加 + 戻し方コメント 1 行書換) + title 1 行書換。他の描画・更新 pipeline (triggerActiveDef, fireBomb, onHit, onGraze, updateEffects, 各 ring/overlay) に影響なし
- **ESP Ra.De. (Cave 1998) 原典との差分 (v20 時点)**:
  - 原典 (a) 無敵フィールド: v20 既存 (triggerActiveDef L391)
  - 原典 (b) 視覚変換: v18 (n-α) overlay 1 層 + **v20 (o-α) plateau 相の色遷移追加** = v18 単層 → v18+v20 の 2 相表現 (shield 中 / shield cap 中)、守 (b) の深化
  - 原典 (c) psychic blast (shield 解放時全画面消去): v20 **未実装** (v21 以降候補として温存)
  - 原典 (d) refill 経路: v19 (n-β) 既存
  - サブゲーム成立度: 4 要素中 3 要素 (a)(b)(d) 到達、(b) 内部で plateau 相拡張 = 守 3/4 深度、残 (c) psychic blast は BOMB との設計重複懸念で未着手据置
  - 「原典 (b) の plateau 相拡張」= 守の N 本 → N+1 本連続性で (b) 空間を深化、未着手の (c) は温存
- **連続量 gate 設計との接続**:
  - v18 まで視覚 gate 4 空間 (rgba / lineWidth / alpha+radius / 環境 overlay) → v19 で行動 gate 1 空間 (視認 → 取る)
  - v20 で視覚 gate の 1 空間 (rgba) 内に plateau 相を追加 = 連続量 gate 空間の深化、新規空間追加ではなく既存空間の分解能向上
- **副作用 pre-check**:
  - (i) shield 発動直後の初期灰色相: `triggerActiveDef` で activeDefT=60 設定直後は cap 相として扱われる、プレイヤーが shield 発動 → 最初に見るのが灰色 overlay → 1-2 frame 内に activeDefT が 59 以下に減 → 黄色相へ遷移、初期灰色相は 1-2 frame のみで視認困難、しかし発動瞬間に ring (v17 発動 flash) 描画が重畳するので灰色は半隠蔽 → 実用上は「shield 発動 → 短い灰色 → 黄色 → refill で灰色復帰」の学習経路、副作用 (i) は Stage 3 で検出済だが実害低い想定
  - (ii) BOMB (fireBomb) との共存: BOMB は shield の有無に関わらず発火、v20 patch は ebullet 描画のみを変更 → BOMB 発火フレームで ebullets 全消去後は overlay 対象消滅 → v20 patch も自然に無効化、共存問題なし
  - (iii) 戻し方の物理的保全: `ash:` prefix commit で意図を commit log 側に明示、backup auto-commit (`backup:` prefix) との区別維持 (feedback_device_direction_rescue_vs_suffocation.md)。新 directory `v20/` 作成で backup 先取り回避は v17/v18/v19 と同構造 (未存在 directory を backup が勝手に作らない前提)

## ESP Ra.De. (Cave 1998) との接続 — 守 (b) 視覚層の plateau 相拡張の意味
- 外部型原典: knowledge/20261022_esp_rade_cave_1998_shield_bullet_to_powerup_graze_log_v17.md + knowledge/20261023_esp_rade_4_element_decomposition_graze_log_v18_half_copy_pathology_v19_branch_space.md
- 原典 (b) 視覚変換の実装核: 画面上の敵弾が power-up/gold blocks に視覚変換され、power メーター MAX 中は吸収しても power が増えない plateau 相の feedback が原典 UI (power メーター表示) で視覚的に明示
- v18 (n-α) は「shield 中は overlay 色変化」で (b) の基本相を 1 相で表現 → v20 (o-α) で「shield cap 中は色が灰色に遷移」の 2 相表現に拡張、原典の plateau feedback に機能等価
- 守破離の守: v18 (b) 1 相表現 → v20 (b) 2 相表現、(b) 空間内で原典解像度に 1 ステップ近づく、Ash 固有の破への拡張 (v21 以降) は候補 1 (c) psychic blast or 候補 3 (別軸振替) を据置
- M-41 (prior art 検証) 年代深度計測: 28 年前の外部型 (b) 視覚層を plateau 相まで踏む、守の深度を 1/4 → 3/4 (v19 refill 層追加) → 3/4+1(b-plateau) (v20 本 patch) に進める

## retrospective_classification_v01_v13_20261020.md との接続
- v17 (m-α) で新 directory 1 サイクル 1 ship 処方を物理実装、v18 (n-α) + v19 (n-β) + **v20 (o-α) で 4 本目連続成功**
- README.md 冒頭 1 行先書きで A 分類を契約化 (本 README L4 の 1 行)
- 外部 2026 norm (altheragames: "build one mechanic, run it, confirm it works, then add the next" / summerengine: "bounded tasks—one connected feature") の実装反復確認、v19 refill 層 → v20 plateau marker で "the next" を 1 本確実に積む

## v19 (n-β) Stage 4 (e) 候補との関係
- v19 README L146-170 で候補 1 (psychic blast) / 候補 2 (cap plateau marker) / 候補 3 (別軸振替) の 3 択起案 + 候補 2 本命暫定内定
- 本 v20 (o-α) で候補 2 を実装 ship、候補 1 (psychic blast) + 候補 3 (別軸振替) は v21 以降で Nao_u 評価分岐 or Ash 自判定で選択
- 1 サイクル 1 案 (koguGameDev フラグ乱立論 v14 k-α L117-125) 方針を v20 でも維持 — 本 v20 patch は overlay 色遷移 1 機構のみ、plateau 中の gauge 枯渇待ち音声・HUD 表示・border 強調はすべて温存

## Nao_u 評価依頼の判断
- 本 v20 (o-α) は v19 (n-β) Stage 4 Ash 自審査通過済 (v19 README L172-173) の上に積む 1 行差分 patch (fillStyle 三項演算子化)。v15/v16/v17/v18/v19 Nao_u 評価依頼未発射のため、v20 ship 後、次サイクル以降で v15+v16+v17+v18+v19+v20 の 6 version 合流評価依頼を Slack #game-rights に投げる余地を保つ
- 本サイクル (C 2026-10-24 Phase 4) の発射物は `git log --oneline game/graze_log/v20/` の 1 行、Slack post は Phase 5 以降で判断 (本サイクル中は shared-reads 投稿も日記も Phase 4 外)
- 本サイクルの選択主体性: v19 累積器ではなく、新 directory `game/graze_log/v20/` に意図 commit 1 本を発火 → backup auto-commit が先回りできない構造 (未存在 directory を backup が勝手に作らない前提、v18/v19 で検証済)

## 次サイクルへの繰越 (Stage 4 自プレイ判定は次サイクル以降)
- 本サイクル (C 2026-10-24 Phase 4) では v20 directory 作成 + bounded edit ship + commit + push までを完遂条件に設定
- Stage 4 自プレイ判定節は次サイクル以降に別節で追記: (a) 変更範囲 trace / (b) Stage 3 予測との対照 (特に plateau 境界 `>=` の初期灰色相 1-2 frame 影響 + 認知率 80-90% の校正) / (c) Win2 CLI Canvas headless 不能明示 / (d) v19 副作用 (i) 「cap plateau 中体感 refill 消失」が v20 で視覚解消したかの立場 / (e) v21 方向性 ((c) psychic blast or 別軸振替 or 更なる (b) 相拡張)
