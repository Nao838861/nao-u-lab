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

## v20 (o-α) Stage 4 Ash 自プレイ判定 (C 2026-10-24 Phase 4)

### (a) Stage 3 予測の事後確認 (6c160a66f index.html コードベース trace)
- **変更範囲の 1 行 trace** (`game/graze_log/v20/index.html` L864-868):
  ```js
  if(state.activeDefT>0){
    ctx.fillStyle=state.activeDefT>=ACTIVE_DEF_FRAMES?'rgba(176,176,176,0.75)':'rgba(224,208,96,0.75)';
    ctx.fillRect(wx-3,wy-3,6,6);
  }
  ```
  三項演算子は `fillStyle` 文字列の choice に閉じる — `fillRect` 引数・`activeDefT>0` 外側分岐・shield 非発動時描画はすべて無改変。`ACTIVE_DEF_FRAMES=60` (L84 定数)、`triggerActiveDef()` (L387-399) で `state.activeDefT=ACTIVE_DEF_FRAMES` 設定、v19 (n-β) refill 経路 (L645) で `Math.min(ACTIVE_DEF_FRAMES, state.activeDefT+10)` 加算 — cap 条件は shield 発動直後と refill cap 到達中の 2 相で成立。
- **意図通り作動の確認**: 三項演算子 `state.activeDefT>=ACTIVE_DEF_FRAMES` は等号付き、cap=60 到達瞬間 (59F → 60F 1 弾消去で境界到達) と shield 発動直後 (`triggerActiveDef` で activeDefT=60 設定) の両方で灰色相へ遷移。cap 未達中 (`activeDefT<60` 下落中) は黄色相へ戻る。Stage 3 L41-43 の境界設計 (`>=` 不等号で発動直後の初期灰色相を含む) 通り。
- **他 pipeline 不干渉**: v18 (n-α) overlay (L866-868) + v19 (n-β) refill (L642-647 の else if ブロック) との 3 層構造で、本 v20 patch は v18 描画層の `fillStyle` 1 行拡張に閉じる。v19 refill ブロック (collision 判定内) と v20 描画分岐 (描画ループ内) は independent pipeline で、同一フレーム内順序は衝突判定 → refill → 画面外退避 → 次フレームで overlay 対象消滅。triggerActiveDef / fireBomb / onHit / onGraze / updateEffects に影響なし。
- **戻し操作の 1 手性**: fillStyle 三項演算子を `'rgba(224,208,96,0.75)'` 固定文字列に戻し、v20 コメント 2 行 + 戻し方コメント 1 行書換を削除 → v19 (n-β) 完全等価、挙動差分ゼロ (cap 分岐消滅で overlay 色が shield 中常に muted-yellow 固定)。装置の向き原則 ([feedback_device_direction_rescue_vs_suffocation.md](../../../memory/feedback_device_direction_rescue_vs_suffocation.md)) 準拠、`ash:` prefix commit `6c160a66f` で意図を commit log に明示済、backup auto-commit (`backup:` prefix) との区別維持。

### (b) ESP Ra.De. (Cave 1998) 原典 (b) 視覚層 plateau 相との機能等価判定 (v18 単層 → v20 2 相の深化)
- **原典 (b) 視覚層の plateau 相** (knowledge/20261022_esp_rade_cave_1998_shield_bullet_to_powerup_graze_log_v17.md + knowledge/20261023_esp_rade_4_element_decomposition_graze_log_v18_half_copy_pathology_v19_branch_space.md): barrier shield 展開中、画面上の敵弾が power-up/gold block に視覚変換 + 画面上 UI の power メーター表示が MAX plateau 相で「もう吸収しても power が増えない」ことを視覚的に明示。原典の plateau feedback は UI 層 (power メーター MAX 表示) で担保、弾色自体は shield 中は常時 power-up 色固定。
- **v18 (n-α) 単層表現**: shield 中 overlay 1 色 (muted-yellow) で「shield 中は弾が power-up」のメタファーを 1 相で実装、plateau 相の視覚 feedback なし → v19 (n-β) refill 経路追加後、副作用 (i) 「cap plateau 中体感 refill 消失で学習経路が切れる」が構造的に露出。
- **v20 (o-α) 2 相表現**: shield 中 overlay 色が cap 未達 (muted-yellow) / cap 到達 (muted-grey) の 2 相で遷移、v19 refill 無効化と同一条件 `activeDefT>=ACTIVE_DEF_FRAMES` で駆動 → 「色が灰色の弾は取っても shield が伸びない」= cap plateau 相の視覚 feedback が overlay 色自体に埋め込まれる。
- **機能等価判定**: 原典は power メーター UI 層で plateau を可視化、v20 は overlay 色自体 (弾側マーカー) で plateau を可視化 → **可視化経路は違うが「cap 到達 = 吸収無効」の情報を Stage 内で学習可能にする点で機能等価**。原典 UX の plateau 相を graze_log の UI 制約 (power メーター相当の HUD 不在) 内で実装する最短経路として、弾側マーカー化は構造的妥当。守 (b) 1 相 → 2 相の深化、原典解像度に 1 ステップ接近。
- **ただし**: 原典の power メーター MAX plateau は「画面中央 UI で明示的に数値が頭打ち」する直接可視化、v20 は「cap 到達中に取っても shield が伸びない」という**不作為の視覚化** — 原典の直接可視化と v20 の間接可視化は認知コストが異なる可能性、認知率 80-90% の下限 80% 側 (Stage 3 L34) に落ちるリスクは残る。plateau 色が背景 `#07091a` と muted-grey (`rgba(176,176,176,0.75)`) で彩度差が低く「消えた」誤認リスク (Stage 3 L36 副作用 (i)) も校正課題として残置。

### (c) 意味軸逆転の Stage 4 (e) 軸記録 (release plateau vs suppression plateau)
- **外部対応語付き定義** (knowledge/ ルール R-007 準拠):
  - **解放 plateau** = release-oriented plateau — hold-and-release pattern (ボタン押下中=蓄積の時間展開、離した瞬間に蓄積量を 1 気に換金する plateau)。ESP Ra.De. barrier shield の充填時間帯がこれ。
  - **抑制 plateau** = suppression-terminal plateau — cap-and-notice pattern (自動 cap で頭打ち、プレイヤーに「これ以上伸びない」ことを通知する plateau)。v20 cap plateau marker がこれ。
- **意味軸逆転の確認**: 同じ「数値が止まっている時間帯」でも、ESP Ra.De. は**解放前の蓄積**でプレイヤーの選択主体性が時間方向に展開 (ボタンを離すタイミング = 蓄積の換金タイミング)、v20 は**cap 到達後の停滞**でプレイヤーの選択主体性が「無効化」として可視化される時間帯 — plateau 中の意味軸が 180 度逆転している。
- **相互参照**: [knowledge/20261024_esp_rade_plateau_release_vs_graze_log_v20_suppression_meaning_axis_inversion.md](../../../knowledge/20261024_esp_rade_plateau_release_vs_graze_log_v20_suppression_meaning_axis_inversion.md) に 3 ソース (Wikipedia/shmups.wiki/HG101) 裏付け付きで Phase 1 §P1.6 外部検索経由で記録済、M-41 (prior art 検証) 準拠。
- **v21 分岐点としての明示**: v20 の plateau 相は現在**抑制 plateau 側のみ**を実装、解放 plateau 側は未着手。v21 以降で以下 3 分岐が立つ:
  - **分岐 A (抑制のまま終端)**: v20 plateau を終端として据え、plateau 色不透明度や border 調整で認知率校正に専念 (守の深化継続)。
  - **分岐 B (解放経路追加)**: 原典 (c) psychic blast を追加実装し、shield 解放瞬間に「plateau 中蓄積量に比例する全画面消去」= 解放 plateau 側を物理成立させる (守 3/4 → 4/4 到達)。ただし BOMB との設計重複懸念 (v19 README L151) が立つ。
  - **分岐 C (両者直交軸として共存)**: 解放と抑制を別軸として共存させる設計 — 例えば plateau 中に別ボタン押下で「plateau 分の報酬を能動発火」できる解放経路を追加、抑制 plateau はそのまま終端として残す。原典 UX からは離れるが Ash 固有の破への分岐候補。
- **本 Stage 4 の立場**: v20 時点では分岐判定を Nao_u 評価データ待ちで保留、ただし意味軸逆転の構造的発見は本サイクル内で確定、v21 候補内定時 ((d)) の判定材料として組み込む。

### (d) v21 候補 (psychic blast / plateau 色不透明度調整 / 別軸振替) の自己判定 + 本命暫定内定
Nao_u 評価判定を待たず Ash Stage 2 内で消化可能な予防的 patch として v21 候補を 3 本起案、v20 (o-α) 自己審査で「視覚層 (v18) + 行動層 (v19) + plateau 相 (v20) 完了、原典 (c) psychic blast 残 + v20 plateau 色対比校正課題」を特定した処方 + (c) 意味軸逆転の v21 分岐 A/B/C に対応。

**候補 1: 原典 (c) psychic blast — 分岐 B (解放経路追加) 本命候補**
- 改変: `state.activeDefT` が 0 に落ちる frame で全画面 ebullet 消去 + 短い全画面 flash 描画の 4-6 行追加 (v19 README L148-151 と同一式)。既存 BOMB flash (`state.bombT>0`) と対称の設計で学習済経路再利用。
- 戻し方: 4-6 行削除で v20 (o-α) 完全等価。
- 予測: shield 時相"終了"に報酬 (全画面消去) 付与、v17 shield 発動開始 flash と対称。原典 4 要素中 4/4 = 守の最深到達 (a)+(b)+(c)+(d)。認知率 85-95% (全画面 flash は既存 bombFlash で学習済経路)。**意味軸逆転の解放側を物理成立させる — v20 plateau 中の蓄積に換金経路を接続**。
- 守/破: 原典 (c) 採用 = 守 4/4 到達、BOMB との設計重複 (全画面消去 2 系統) で v14 k-α L117-125 koguGameDev フラグ乱立論の懸念継続。

**候補 2: plateau 色不透明度/border 調整 — 分岐 A (抑制のまま終端で認知率校正) 候補**
- 改変: fillStyle muted-grey (`rgba(176,176,176,0.75)`) の 0.75 を 0.85 に引き上げ or border 1px (ebullet 外周に muted-grey 描画) を 1-2 行追加。
- 戻し方: 1-2 行削除で v20 (o-α) 完全等価。
- 予測: Stage 3 L36 副作用 (i) + 本 Stage 4 (b) で指摘した「plateau 色が背景と彩度差低く消えた誤認」リスクを物理解消。認知率 80-90% の下限 80% 側 → 85-90% 側に押し上げ、v20 の plateau 相の信号対雑音比を向上。
- 守/破: 原典 (b) 視覚層 plateau 相の分解能向上 = 守の深化継続、まだ守の範疇。v20 Stage 4 (b) で明示した「背景彩度差低い」校正課題の防御的 patch 側面もあり。

**候補 3: graze streak 視覚化別軸振替 — 分岐 C 変種 (Ash 固有軸への移行) 候補**
- 改変: v19 の原典 3/4 到達 + v20 plateau 相で原典解像度 3+1/4 到達を活かし、graze streak (buzz chain / cap plateau) の視覚化を次軸に振替。例えば streak 中の弾 trail 色味を streak 段階で変化させる 3-5 行追加 (v19 README L159-163 の継承)。
- 戻し方: 3-5 行削除で v20 (o-α) 完全等価。
- 予測: ESP Ra.De. 原典から離れて Ash 固有の graze 設計 (v01-v20 の中心軸) に戻る、守破離の破の 1 本目候補。認知率は streak 段階数と色相数の積で変動、別節で起案要。
- 守/破: 原典離脱 = 破の 1 本目、守 3+1/4 で切り上げる判定。v19 Stage 4 (e) 候補 3 と同系の提案だが、v20 まで踏んだことで守の深度が 3/4 → 3+1/4 に進んだ分、「残 1/4+ を飛ばす」判断の重みがさらに増している。

**(d) 1 本絞り暫定方針**: **候補 2 (plateau 色不透明度/border 調整) を v21 (p-α) 本命暫定内定**、ただし Nao_u 評価分岐で候補 1 (psychic blast) or 候補 3 (別軸振替) に差し替え余地保持。理由 3 点:
- **1. v20 Stage 4 (b) 校正課題の防御的解消**: 候補 2 は本 Stage 4 (b) で明示した「plateau 色が背景彩度差低く消えた誤認」リスクを物理解消、v20 の plateau 相を**認知率校正済み**の守 (b) 3+1/4 深度として確定させる。副作用放置リスクが候補 1/3 より低い。
- **2. koguGameDev フラグ乱立回避**: 候補 1 (psychic blast) は BOMB との全画面消去 2 系統化で v14 k-α L117-125 警告踏襲側、設計重複リスク継続。候補 2 は v20 既存 fillStyle 分岐の数値調整のみで新規 pipeline 追加なし。
- **3. 守 3+1/4 到達後の原典残 (c) は Nao_u 評価データ待ち**: 原典 (c) psychic blast を踏むかは「v20 plateau 相 (抑制 plateau) の認知率が校正済みで安定しているか」を Nao_u 評価で確認した後に判定するのが順序。v20 の plateau 相が「消えた誤認」で学習失敗していると、原典 (c) psychic blast = 分岐 B 解放 plateau を接続しても「何が解放されたか」の因果連結がプレイヤー側で成立しない。候補 2 で plateau 相の信号対雑音比を校正 → 次に候補 1 で解放経路接続、が設計順序として自然。

**v21 (p-α) 暫定内定** (Nao_u 評価分岐次第で候補 1 or 候補 3 に差し替え): 新 directory `game/graze_log/v21/` に候補 2 (plateau 色不透明度/border 調整) を 1-2 行 bounded edit で ship、本 README 候補 2 の実装式を v21/README.md に 1 行先書き契約として展開。1 サイクル 1 案方針 (v14 k-α L117-125) を v21 でも維持。

### (e) Nao_u 評価依頼可否判定 (v15-v20 合流評価依頼の前提条件)
- **Stage 4 5 軸自審査通過状況**: (a) 変更範囲 trace 完了 / (b) 原典 (b) との機能等価判定済 (守 3/4 → 3+1/4 深化) / (c) 意味軸逆転記録済 + v21 分岐 A/B/C 明示 / (d) v21 候補 (p-α) 本命暫定内定 / (e) 本節で結論。**5 軸すべて自審査通過**。
- **校正課題** (M-37→M-40 連続体、v14 k-α / v15 l-α / v16 l-β / v17 m-α / v18 n-α / v19 n-β から据置): 認知率 80-90% の実測校正は Nao_u 自プレイ待ち、plateau 色対比 (muted-grey vs 背景 `#07091a`) の信号対雑音比の実プレイ確認は候補 2 (v21) で防御的 patch 済まで保留 → 2 択 (本サイクルで Nao_u 評価依頼 or v21 まで待つ)。
- **feedback_headless_unfit_for_unfinished_eval 準拠**: v20 ディレクトリに headless.py なし、Canvas は Pyxel/Pygame と異なり headless 動作不能。Win2 CLI 環境でブラウザレンダリングを起動する経路は本サイクルで用意しなかった、本 Stage 4 の認知率推定は Stage 3 予測の援用のみ、Nao_u 評価判定・Slack 投稿・merge 要請には**使わない**。
- **判定**: **v15-v20 合流評価依頼の前提条件は Stage 4 5 軸自審査通過で揃った、ただし本サイクル中は Slack post しない**。理由 3 点:
  - **1. 発射タイミングの最適化**: v21 (p-α) 候補 2 (plateau 色対比校正) を次サイクルで ship 後、v15-v21 合流評価依頼を #game-rights に投げる方が校正済みの状態で評価データを得られる。本 v20 時点で発射すると plateau 色対比の未校正状態で Nao_u が「plateau が消えた」誤認するリスクが残り、評価データが「plateau 相自体の設計失敗」として誤解される可能性。
  - **2. broken-record ガード準拠**: v15/v16/v17/v18/v19 Nao_u 評価依頼未発射状態が 5 サイクル続いており、評価依頼の「鮮度」は保持されている。v20 → v21 の 1 サイクル待ちで依頼の価値が減ることはない (M-38 「複数ソースによる援用」で守 3+1/4 → 3+2/4 到達後の方が原典連結の説得力増)。
  - **3. §P1.6 外部検索の鮮度活用**: 本サイクル §P1.6 で得た ESP Ra.De. plateau 解放/抑制意味軸逆転 (knowledge/20261024...) は v21 候補 1 (psychic blast 分岐 B 解放経路) の設計根拠として直結、v21 ship 時の README に組み込める。v20 単独評価依頼より v21 までの流れを 1 ブロックで投げる方が設計意図の伝達性が高い。
- **本サイクル (C 2026-10-24 Phase 4) の発射物**: commit log 1 行の増加 (`ash: graze_log v20 (o-α) Stage 4 Ash 自プレイ判定追記 (C 2026-10-24 Phase 4)` prefix)、Slack post なし。§0b 継承「装置が先回りできない地点に意図を載せる」= `ash:` prefix commit + 判定文を自分の言葉で書く + 意味軸逆転の構造的発見を Stage 4 (c) 軸として記録、を本節で実現。
- **broken-record ガード**: 本 Stage 4 節は v13 系 README + v17/v18 (m-α/n-α) + v19 (n-β) Stage 4 とは別 directory (`v20/`) + 別 cycle タグ "C 2026-10-24 Phase 4" + 意味軸逆転 (c) 軸という本サイクル固有の新規発見を含むため、重複なし。

### 結論
- **Nao_u 自プレイ評価依頼は v21 (p-α) ship 後まで保留** — Stage 4 5 軸自審査通過済だが、本 Stage 4 (b) で明示した plateau 色対比校正課題の防御的 patch (v21 候補 2) を先に ship してから v15-v21 合流評価依頼を #game-rights に投げる方が校正済みの状態で評価データを得られる。(c) 校正課題 (M-37→M-40 連続体) は v14 k-α から v20 o-α まで**連続して据置**、依頼時に明示する前提は維持。
- **v21 方向性 暫定内定** — 候補 2 (plateau 色不透明度/border 調整、1-2 行実装、`ash:` prefix 新 directory `v21/` ship) を本命暫定、候補 1 (psychic blast 分岐 B) / 候補 3 (別軸振替 分岐 C) は Nao_u 評価分岐で保留。意味軸逆転の分岐 A (抑制のまま終端で校正) を先に閉じる順序。
- **意味軸逆転の構造的発見を記録** — knowledge/20261024_esp_rade_plateau_release_vs_graze_log_v20_suppression_meaning_axis_inversion.md と相互参照、v21 候補 1 (psychic blast 分岐 B 解放経路) の設計根拠として温存、Stage 4 (c) 軸として本サイクル固有の追加。
