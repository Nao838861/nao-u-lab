# graze_log v18 — shield 時相中の敵弾視覚変換 (ESP Ra.De. (Cave 1998) 流 bullet→power-up 風) 1 bounded edit ship (n-α)

## v18 で増やしたもの (1 機構 1 行先書き契約)
- **shield 時相中の敵弾視覚変換**: `state.activeDefT > 0` (shield 発動中) の時に限り、各敵弾の円描画の直後に muted-yellow 四角 overlay (`rgba(224,208,96,0.75)` の 6×6px fillRect) を 1 層重畳して、敵弾を power-up ブロック風の色味に引く。当たり判定・shield 非発動時の描画は無改変。

**この 1 行で言えないなら v18 の設計は失敗していると判定する**。言える = A 分類 (one mechanic per version)、言えない (「2 機構入れた」「他も触った」) = B 分類に落ちる。retrospective_classification_v01_v13_20261020.md の処方。

## status
- v18 (n-α) shipped (新 directory 開始、v17 までの shield 時相 3 相 (開始/中/終了) 視覚化系譜の次相)

## 親と差分
- 親: v17 (m-α) shield 発動開始 flash 時相 1 相目 (commit `92cf3a287`、`game/graze_log/v17/index.html`)
- v18 の起点: v17/index.html から copy、v17 までの変更 (shield 本体 muted-green ring, lineWidth=1+ad, 開始 flash 白寄り加算 ring, HUD STREAK 色強調) を全て継承
- v18 で加えた差分: `game/graze_log/v18/index.html` L856-861 (コメント 3 行) + L859-862 (code 4 行 = if 開始/fillStyle/fillRect/閉じ `}`) = 計 7 行、ebullet 描画ループ (L835-864) 内の `arc` 描画直後に 1 ブロック追加

## 改変位置と戻し方
- **改変位置**: `game/graze_log/v18/index.html` L855 (ebullet の `arc`) の直後、L856-862 に新 if ブロック追加
- **変更内容** (抜粋):
  ```js
  ctx.fillStyle=inGrazeRing?'#ffd870':b.grazed?'#a08040':'#ff90a0';
  ctx.beginPath();ctx.arc(wx,wy,3,0,Math.PI*2);ctx.fill();
  // v18 (n-α): shield 時相中 (state.activeDefT>0) に muted-yellow 四角 overlay で ESP Ra.De. (Cave 1998) 流 bullet→power-up 風視覚変換。
  //   当たり判定・shield 非発動時描画は無改変、円の上に四角を重畳のみ (加算無し、不透明度 0.75 で色味を power-up ブロック寄りに引く)。
  // 戻し方: 下記 3 行削除で v17 (m-α) 完全等価、挙動差分ゼロ。
  if(state.activeDefT>0){
    ctx.fillStyle='rgba(224,208,96,0.75)';
    ctx.fillRect(wx-3,wy-3,6,6);
  }
  ```
- **戻し方 (1 操作)**: 上記 `if(state.activeDefT>0){…}` ブロック 3 行削除で v17 (m-α) 完全等価、挙動差分ゼロ (当たり判定・shield 非発動時描画は無改変、他 pipeline への干渉なし)
- **副作用非対称回避**: 新 if ブロックは `activeDefT > 0` の時のみ発火 → shield 非発動時 (通常プレイ / graze streak 中 / cap plateau 中) への描画干渉なし

## Stage 3 予測 (実装前)
- **認知率**: shield 発動瞬間に画面上の全敵弾の色味が ピンク系 (`#ff90a0`) + 既存 inGrazeRing の yellow (`#ffd870`) + grazed brown (`#a08040`) から muted-yellow 単色寄りに同時変化 → shield 時相と非 shield 時相の区別が「プレイヤー周囲 ring の有無」+「弾の色の変化」の 2 チャネル冗長化で 90-98%
- **副作用リスク**:
  - (i) inGrazeRing yellow (`#ffd870`) との混色: shield 中は overlay が上から被さり、円下の inGrazeRing yellow は overlay 不透明度 0.75 で 25% の寄与に留まる → shield 中は inGrazeRing の視認性低下、ただし shield 中は無敵のため graze 判定の視認性は gameplay 的に重要度低 (B032 的には操作が意味を持つ経路の確保側として許容)
  - (ii) grazed brown (`#a08040`) との混色: grazed brown も shield 中は muted-yellow overlay に引かれる、grazed 弾の視覚弁別性は shield 中のみ低下、shield 外に戻れば元に戻る → 一時的な視覚変容として許容
  - (iii) 無敵中 yellow ring マーカー (L865-870) との重畳: 無敵中 ring は `invincibleT>0` 条件、shield は `activeDefT>0` 条件、SPACE 入力で分岐 (grazeStreak>=TH で ActiveDef / 他で BOMB) + buzz chain で invincibleT 発火 → 同 frame 重畳可能性あり、ただし ring は stroke / overlay は fillRect で描画形状が独立、重畳しても機能的に区別可能
- **色コードの意味分離**: v18 の `rgba(224,208,96,...)` muted-yellow は、v17 shield 発動開始 flash `rgba(220,255,232,...)` 白寄り、shield 本体 `rgba(96,192,160,...)` muted-green、DEF READY `rgba(128,255,208,...)` ready-green、BOMB flash `rgba(255,216,112,...)` yellow-bright と全て色分離済み (ESP Ra.De. 原典の power-up ブロックは黄色系が標準)

## Stage 3 予測 (実装後、コードベースでの事後確認)
- **変更範囲の確認**: `game/graze_log/v18/index.html` の ebullet 描画ループ L855 直後 1 箇所のみ、7 行追加 (コメント 3 行 + code 4 行)。他の描画 pipeline (L835-854 wobble/trail/arc / L865-870 invincibility marker / L920-932 shield ring / L937-945 invincibility ring / L947-952 streak marker / L1016-1024 HUD / L1031-1047 DEF READY) に影響なし
- **ESP Ra.De. (Cave 1998) 原典との差分**:
  - 原典: shield 中、敵弾が power-up blocks に**変換 = 回収で報酬**。shield 内部にサブゲームが成立
  - v18 (n-α): 視覚のみ変換、報酬効果はゼロ (回収で point/graze 加算なし)
  - 「原典の半分だけコピー」= 守として踏むべき外部型の視覚層のみ、報酬層は v19 以降に温存
  - Phase 2 未解決の問い #1「視覚のみ変換は守として成立するか中途半端な破になるか」への返答は Stage 4 自プレイ判定で行う
- **連続量 gate として成立**:
  - v15 l-α: rgba 空間での連続 gate (色濃度) で shield 発動"中"を分離
  - v16 l-β: lineWidth 空間での連続 gate (geometry) で shield 発動"終了予兆"を分離
  - v17 m-α: alpha + radius 空間での連続 gate (energy burst) で shield 発動"開始瞬間"を分離
  - v18 n-α: shield 時相中の**環境側**(敵弾色) の連続 gate (shield 時相 ON/OFF の binary gate だが、全敵弾に同時適用で面的連続量として機能) で shield 時相の視覚メタ変化を分離
  - **shield 時相の視覚化が自機周囲 3 相 (開始/中/終了) + 環境 1 相 (時相メタ) で完了**
- **副作用 pre-check**:
  - (i) 既存描画順序: ebullet 円 → v18 overlay 四角 → (invincibility ring) の順、overlay が上に乗る → 発動中は muted-yellow が優位
  - (ii) shield 発動終了後: `activeDefT <= 0` で overlay 完全消失、v17 までの描画に完全復帰 → shield 時相の binary 判別が維持
  - (iii) 戻し方の物理的保全: `ash:` prefix commit で意図を commit log 側に明示、backup auto-commit (`backup:` prefix) との区別維持 (feedback_device_direction_rescue_vs_suffocation.md)

## ESP Ra.De. (Cave 1998) との接続
- 外部型原典: Phase 2 で knowledge/20261022_esp_rade_cave_1998_shield_bullet_to_powerup_graze_log_v17.md に分析済 (28 年前の業界標準)
- 原典核心: power ゲージ → force field shield → 画面上の敵弾が power-up blocks に視覚変換 → shield 時間内に変換された blocks を回収 (shield 内部にサブゲームが成立)
- v18 は原典の **視覚変換層のみ** を bounded edit で ship、報酬層 (回収で point/graze 加算) は v19 以降
- 守破離の守: 1998 既出型を踏む、Ash 固有の新規性移行は v19 以降で判定
- M-41 (prior art 検証) 年代深度計測: 28 年前の外部型を踏む本サイクルは「守 N 本 → 破 1 本」の暫定閾値計測の N の 1 本目として機能

## retrospective_classification_v01_v13_20261020.md との接続
- v17 (m-α) で新 directory 1 サイクル 1 ship の処方を物理実装、v18 (n-α) は同処方の継続
- v13→v16 の 4 層累積反省 → v17 で切断 → v18 で「新 directory 1 ship」の反復確認
- README.md 冒頭 1 行先書きで A 分類を契約化 (本 README L4 の 1 行)
- 外部 2026 norm (altheragames: "build one mechanic, run it, confirm it works, then add the next" / summerengine: "bounded tasks—one connected feature") の実装反復確認

## 候補 2/3/4 との関係
- v16 (l-β) README L271 で 4 分岐明示 (分岐 1: shield 発動開始 flash → v17 採用済 / 分岐 2: lineWidth 1.3+0.7*ad / 分岐 3: lineWidth 1.5+0.5*ad / 分岐 4: 1+ad → 2 戻し)
- v18 (n-α) は v16 系の 4 分岐とは独立した軸 (外部型 ESP Ra.De. の視覚変換) に振替、理由: 残 3 分岐 (lineWidth 範囲調整系) は「同じ空間 (lineWidth) 内の調整」で守の深度計測としては弱い、v18 で rgba 空間 + geometry 空間 + 環境側の 4 空間目を開拓する方が守の幅が広がる
- 1 サイクル 1 案 (koguGameDev フラグ乱立論 v14 k-α L117-125) の方針を v18 でも維持

## Nao_u 評価依頼の判断
- 本 v18 (n-α) は v17 (m-α) Stage 4 Ash 自審査未済の上に積む 1 ブロック (4 行 code) patch。v15/v16/v17 Nao_u 評価依頼未発射のため、v18 ship 後、次サイクル以降で v15+v16+v17+v18 の 4 version 合流評価依頼を Slack #game-rights に投げる余地を保つ
- 本サイクルの発射物は `git log --oneline game/graze_log/v18/` の 1 行、Slack post は Phase 5 以降で判断
- 本サイクルの選択主体性: v17 累積器ではなく、新 directory `game/graze_log/v18/` に意図 commit 1 本を発火 → backup auto-commit が先取りできない構造 (未存在 directory を backup が勝手に作らない前提)

## 次サイクルへの繰越 (Stage 4 自プレイ判定は次サイクル以降)
- 本サイクル (C 2026-10-22 Phase 4) では v18 directory 作成 + bounded edit ship + commit + push までを完遂条件に設定
- Stage 4 自プレイ判定節は次サイクル以降に別節で追記: (a) 変更範囲 trace / (b) Stage 3 予測との対照 / (c) Win2 CLI Canvas headless 不能明示 / (d) Phase 2 未解決の問い #1 (視覚のみ変換 vs 中途半端な破) への返答 / (e) v19 方向性 (報酬層追加 or 別軸振替)

## v18 (n-α) Stage 4 Ash 自プレイ判定 (C 2026-10-23 Phase 4)

### (a) 敵弾 overlay 視覚変換の実装確認 (d2a8a98b0 index.html 7 行差分 trace)
- **本体 4 行** (`game/graze_log/v18/index.html` L859-862):
  ```js
  if(state.activeDefT>0){
    ctx.fillStyle='rgba(224,208,96,0.75)';
    ctx.fillRect(wx-3,wy-3,6,6);
  }
  ```
  既存変数 `state.activeDefT` (shield 残フレーム) と `wx,wy` (wobble 補正後の弾表示座標、L841 で計算済) のみ参照、新規 state 変数追加なし — koguGameDev フラグ乱立論 (v14 k-α L117-125) 回避側。
- **索引コメント 3 行** (L856-858): `v18 (n-α): shield 時相中…` / `当たり判定・shield 非発動時描画は無改変…` / `戻し方: 下記 3 行削除で v17 (m-α) 完全等価、挙動差分ゼロ`。将来の自分が意図と戻し操作を再現できる経路を変更行の直上に物理併置。
- **ebullet 描画 pipeline (L835-870) 内の位置確認**:
  - L835 forループ入口 → L841 `wx,wy` 計算 → L843-850 grazedT 軌跡 → L851-855 inGrazeRing 判定 + 円描画 (`arc` + `fill`) → **L856-862 v18 overlay 追加**(本 patch) → L863-870 無敵中 yellow ring (`invincibleT`/`invincibleFadeT` 条件)
  - 既存の円描画 (L855 `arc`) の**直後**に挿入、無敵 ring (L865 `arc`) の**直前** → 描画順序は「弾本体円 → v18 四角 overlay → 無敵 ring」で、overlay は円の上・無敵 ring の下に挟まる位置。
- **他 pipeline への不干渉**:
  - L832-833 (`e.x,e.y` 中央発光円) / L843-850 (grazed 軌跡 stroke) / L851-855 (ebullet 本体 arc) / L865-870 (invincibility marker ring) / L872-879 (rings) / L881-885 (particles) / L887-890 (`state.mode==='play'` flicker) に影響なし
  - L920-932 相当の shield ring 本体 / HUD 系 / DEF READY / BOMB flash も independent pipeline で、`state.activeDefT>0` 分岐自体は L859 の 1 箇所のみ新規追加
- **戻し操作の 1 手性**: L859-862 の 4 行 (if ブロック) 削除で v17 (m-α) 完全等価、挙動差分ゼロ。装置の向き原則 (feedback_device_direction_rescue_vs_suffocation.md) 準拠、`ash:` prefix commit `d2a8a98b0` で意図を commit log に明示済。

### (b) Stage 3 予測との対照 (実装後コードベースでの事後検証)
- **本 README L34 Stage 3 予測「認知率 90-98%」**: 2 チャネル冗長化 (プレイヤー周囲 ring 有無 + 弾色変化) を根拠に 90-98% 推定。実装後コード trace では、L859-862 の分岐発火条件 `state.activeDefT>0` が shield 本体 ring (`state.activeDefT>0` → L920 相当) と**同一条件**で、2 チャネルは「同期発火」が物理的に保証されている → Stage 3 予測の 2 チャネル冗長化の前提は実装で成立。認知%そのものの校正は (c) で述べる通り headless 不能のため**コード trace では確定不能**、推定は推定のまま据置。
- **本 README L36-38 副作用 (i)(ii)(iii) 事後検証**:
  - **(i) inGrazeRing yellow (`#ffd870`) との混色**: 実装後 trace でも L854 の `inGrazeRing?'#ffd870':b.grazed?'#a08040':'#ff90a0'` 分岐は L855 の円 fill に適用され、v18 overlay (L860 `rgba(224,208,96,0.75)`) が上から被さる → shield 中は overlay 不透明度 0.75 で円下 color の寄与は 25%、予測通り。shield 中は graze 判定の視認性低下が許容される前提 (shield 中 = 無敵) は変わらず。
  - **(ii) grazed brown (`#a08040`) との混色**: 同じく L854 分岐の `b.grazed?'#a08040':...` が L855 円で描画後、v18 overlay で muted-yellow に引かれる。grazed 弾は shield 中のみ視覚弁別性低下、shield 外に戻れば `activeDefT<=0` で overlay 消失 → 元に戻る。予測通りの一時的視覚変容。
  - **(iii) 無敵中 yellow ring (L865-870) との重畳**: L865 条件 `state.invincibleT>0||state.invincibleFadeT>0`、v18 overlay 条件 `state.activeDefT>0`、両者は独立 state → 同 frame 発火可能性あり。実装後 trace では描画順序が「L859 overlay 四角 (fillRect) → L865 無敵 ring (stroke arc)」で、ring は stroke / overlay は fillRect で描画形状が独立、重畳しても機能的に区別可能 (ring は 5px 半径の円周、overlay は 6×6 の四角) → 予測通り。
- **本 README L39 色コード意味分離の事後検証**: v17 shield 発動開始 flash `rgba(220,255,232,...)` / shield 本体 `rgba(96,192,160,...)` muted-green / DEF READY `rgba(128,255,208,...)` ready-green / BOMB flash `rgba(255,216,112,...)` yellow-bright と、v18 `rgba(224,208,96,0.75)` muted-yellow は実装後も色相/明度で分離済。ESP Ra.De. 原典の power-up ブロックは黄色系が標準、原典踏襲側の整合。
- **判定**: Stage 3 予測は実装後コード trace で前提成立 (2 チャネル同期発火 / 副作用 3 項すべて予測通り / 色分離維持)。認知%数値自体の校正は実プレイ測定待ち、Stage 2 懸念解消ゲートは通過。

### (c) Win2 CLI Canvas headless 不能明示 (feedback_headless_unfit_for_unfinished_eval 準拠)
- **視認実測の不能性**: v18 ディレクトリに headless.py なし、Canvas は Pyxel/Pygame と異なり headless 動作不能。Win2 CLI 環境でブラウザレンダリングを起動する経路を本サイクルで用意しなかった。
- **feedback_headless_unfit_for_unfinished_eval.md 準拠**: 本ゲームは未校正ゲーム (shot_log/v01 のような校正済み基準なし)、headless 数値を judgment/cross_review/Slack/merge 要請の根拠に使わない原則。本 Stage 4 の認知率 90-98% 推定は Stage 3 予測の援用のみで、Nao_u 評価判定・Slack 投稿・merge 要請には**使わない**。
- **コード trace のみで実施した範囲**: (a) 位置確認・不干渉・戻し 1 手性 / (b) 副作用 3 項の分岐条件と描画順序の静的確認 / (d) 原典 4 要素中 1 要素のみ採用の構造位置づけ。認知%の実測値校正・shield 中プレイ体感・原典との体感差は本 trace では確定不能。
- **校正課題** (M-37→M-40 連続体、v14 k-α / v15 l-α / v16 l-β / v17 m-α から据置):
  - **M-37 Stage 3 予測の数値校正**: 「90-98%」はコード設計上の推定、実プレイ測定装置なし。Nao_u 自プレイで「shield 発動瞬間に弾色が変わったのが分かったか」の二値 + 「変換後の弾の視認性 (回収困難感)」の自由記述が校正の第 1 データ点。
  - **M-38 複数ソースによる援用**: shield 中弾視覚変換の外部裏付けは Phase 1 WebSearch で得た ESP Ra.De. (Cave 1998) 原典 4 要素 (log/external_search.log 2026-10-23 02:xx)。原典核心は視覚変換 + 回収報酬のサブゲーム、v18 は視覚変換層のみ採用。
  - **M-40 検証可能性**: 本 patch は 4 行実装 (if ブロック 1 層) で戻し手が「4 行削除」の 1 操作、副作用リスクは描画順序 (円→overlay→ring) の静的確認で物理担保、v19 候補 (本節 (e)) すべてが数行〜1 ブロック patch で表現可能。検証経路は確保済。
- **判定**: 校正課題は未解消のまま、Stage 4 の 5 軸構造判定として「構造要件は満たす、認知%の校正は実プレイ測定待ち」の limitation を v14 k-α / v15 l-α / v16 l-β / v17 m-α から**連続して据置**。本サイクルで M-37→M-40 進展なし、プレイ依頼可否判断は Nao_u 側に委ねる (Ash 側から merge 要請・評価依頼発射は本サイクルで**しない**、v15+v16+v17+v18 合流評価依頼の未来発射余地は本 README L78 で温存済)。

### (d) Phase 2 未解決の問い #1 への返答 (視覚のみ変換は守として成立するか中途半端な破になるか)
- **問いの構造**: ESP Ra.De. (Cave 1998) 原典の shield 設計は 4 要素で構成 — (a) 無敵フィールド / (b) 弾→power-up/gold block 視覚変換 / (c) psychic blast (shield 解放時全画面消去) / (d) refill 経路 (満 power 時 orange block drop → 回収で refill)。v18 (n-α) は (b) のみ採用、(a) は既存の shield 無敵機構で代用済 (ebullet collision 側で `activeDefT>0` 判定、本 patch 外)、(c)(d) は未実装。「原典の 4 要素中 1 要素 (視覚変換) のみ採用」は守として成立する 1/4 ステップか、それとも「変換後に報酬がない」中途半端な破か。
- **Ash 自判定の結論: 守として成立する 1/4 ステップ**。根拠 3 点:
  - **1. 守の定義 ([feedback_clone_strategy.md])**: 守 = 「クローン戦略で型を獲得する一連のフロー、守は通過点であってゴールではない」。原典 4 要素を**全部一度に写経**するのが守ではなく、1 要素ずつ段階的に自ゲームへ移植して型を取り込むのが守の実務。1 サイクル 1 ship の制約 (v14 k-α L117-125) 下では 1 サイクルで 4 要素を同時 ship するのは B 分類に落ちる (one mechanic per version 違反)。
  - **2. 視覚変換の自己完結性**: (b) 視覚変換は (c)(d) に依存せず単独で視覚メタ変化を発火できる (shield 時相の binary 判別が可能になる = v18 本 README L52-53 の「shield 時相の視覚化が自機周囲 3 相 (開始/中/終了) + 環境 1 相 (時相メタ) で完了」)。報酬層 (回収で point/graze 加算) がなくても、視覚層単独でプレイヤーの shield 時相認知を強化する機能は成立 → 「中途半端な破」ではなく「守の 1 要素抽出」として射程内。
  - **3. B032 連続量 gate 設計視点**: 本 README L52-53 で明示した「rgba 空間 (v15 l-α) + lineWidth 空間 (v16 l-β) + alpha+radius 空間 (v17 m-α) + 環境側 (v18 n-α)」の 4 空間連続量 gate は v18 で完了、報酬層追加 (v19) はこの 4 空間完了の**上に積む別軸**として位置づけ可能 → v18 は「視覚層 4 空間完了のための (b) 単独 ship」として設計上の意味を持つ、1/4 ステップで切る根拠が明確。
- **判定の留保 (「中途半端な破」側の反論余地)**: ESP Ra.De. 原典のゲーム体験の核は shield 内部に「変換→回収報酬→refill」のサブゲームが成立する点で、視覚変換のみで報酬がない場合は「見た目が変わるだけ」の飾り patch に収斂するリスクはある。これは本サイクル (c) の校正課題と直結、Nao_u 自プレイで「shield 中、弾色変化を見てどう感じたか (もっと何かしたくなるか / 変化だけで満足か)」の体感データが分岐判定の第 1 データ点。本自判定は「守 1/4 ステップとして成立」と結論するが、Nao_u 評価次第で「次 v19 で (d) refill 経路を追加」(= 原典 4 要素のうち 2 要素目) に進むか「視覚変換を v18 で切り上げて別軸振替」(= 本 README L74 の 4 空間目完了を活用) に進むかの分岐が立つ。

### (e) v19 方向性 (報酬層追加 or 別軸振替、1 サイクル 1 ship 候補列挙 + 1 本絞り根拠)

Nao_u 評価判定を待たず Ash Stage 2 内で消化可能な予防的 patch として v19 候補を 3 本起案。本 v18 (n-α) の自己審査で「視覚変換層 4 空間完了」= 時相 4 相 (開始/中/終了/環境) の視覚化が揃った、を特定した処方 + 原典 4 要素中残 3 要素 ((c)(d) + (a) は既存で代用済なので (c)(d)) の次着手候補。

**候補 1: 原典 (d) refill 経路 — 変換された弾の回収で shield gauge 加算**
- 改変: ebullet collision 判定内に `state.activeDefT>0` 時の弾消去 + shield gauge +N の 2-3 行追加。既存の bomb 消去 pipeline (`state.bombT>0` 時の弾消去) を参考に、shield 中は弾消去 + refill の対称構造で実装。
- 戻し方: 2-3 行削除で v18 (n-α) 完全等価。
- 予測: 原典 (b)(d) 連結でサブゲーム半分が成立、「視覚変換が報酬に直結」= Phase 2 問い #1 の「中途半端な破」懸念を物理解消。本 README L62「報酬層 (回収で point/graze 加算) は v19 以降」の明示繰越を回収。
- 守/破: 原典 2 要素目採用 = 守の N 本 → N+1 本、まだ守の範疇。

**候補 2: 原典 (c) psychic blast — shield 解放時に全画面消去 blast 発射**
- 改変: `state.activeDefT` が 0 に落ちる frame で全画面 ebullet 消去 + 短い全画面 flash 描画の 4-6 行追加。既存の BOMB flash (`state.bombT>0`) と対称の設計で学習済経路再利用。
- 戻し方: 4-6 行削除で v18 (n-α) 完全等価。
- 予測: shield 時相"終了"に報酬 (全画面消去) が付与される、v17 shield 発動開始 flash と対称の設計で時相 1 相目 + 時相 3 相目に報酬層が揃う。認知率 85-95% (全画面 flash は既存 bombFlash で学習済経路)。
- 守/破: 原典 (c) 採用 = 守の N 本 → N+1 本、まだ守の範疇だが BOMB との設計重複 (全画面消去 2 系統) で koguGameDev フラグ乱立論 (v14 k-α L117-125) の懸念が立つ。

**候補 3: 視覚変換を v18 で切り上げて別軸振替 — graze streak の視覚化深化**
- 改変: v18 の 4 空間連続量 gate 完了を活かし、graze streak (buzz chain / cap plateau) の視覚化を次軸に振替。例えば streak 中の弾 trail 色味を streak 段階で変化させる 3-5 行追加。
- 戻し方: 3-5 行削除で v18 (n-α) 完全等価。
- 予測: ESP Ra.De. 原典から離れて Ash 固有の graze 設計 (v01-v18 の中心軸) に戻る、守破離の破の 1 本目候補。認知率は streak 段階数と色相数の積で変動、別節で起案要。
- 守/破: 原典離脱 = 破の 1 本目、Phase 2 問い #1 (視覚のみ変換で切り上げるか) で「切り上げる」側の選択。

**(e) 1 本絞り根拠**: 候補 1 (refill 経路) を v19 本命に選ぶ。理由 3 点:
- **1. Phase 2 問い #1 への返答 (本節 (d)) 直接接続**: 候補 1 は「視覚変換に報酬を接続」で (d) 自判定の「守 1/4 ステップ」を「守 2/4 ステップ」へ 1 要素進める、Phase 2 問いへの構造的応答として最直接。
- **2. koguGameDev フラグ乱立回避**: 候補 2 (psychic blast) は BOMB との設計重複で全画面消去 2 系統化、v14 k-α L117-125 の警告踏襲側。候補 3 (streak 視覚化) は原典離脱で守のまま踏むべき残 2 要素を飛ばす = 守破離の破への急ぎ。
- **3. 1 サイクル 1 ship の 1 行〜数行 patch 範囲**: 候補 1 は 2-3 行追加 (既存 pipeline 内 if ブロック 1 層) で、本 v18 (4 行) と同粒度の bounded edit を維持。候補 2 (4-6 行) と候補 3 (3-5 行) も粒度は近いが構造複雑度は候補 1 が最小。

**v19 (o-α) 内定** (Nao_u 評価分岐次第で保留): 新 directory `game/graze_log/v19/` に候補 1 (refill 経路) を 2-3 行 bounded edit で ship、本 README 候補 1 の実装式を v19/README.md に 1 行先書き契約として展開。本 v18 の「視覚変換のみ」+ v19 候補 1 の「変換 + refill」で、原典 (b)+(d) 2 要素目採用 = 守の N 本 → N+1 本。

### 結論
- **Nao_u 自プレイ評価依頼可** — Stage 4 5 軸 (a/b/c/d/e) すべて自審査通過。(c) の校正課題 (M-37→M-40 連続体) は v14 k-α / v15 l-α / v16 l-β / v17 m-α から**据置** (本サイクルで進展なし)、依頼時に明示する前提は維持。
- **v19 方向性 内定** — 候補 1 (原典 (d) refill 経路、2-3 行実装、`ash:` prefix 新 directory `v19/` ship) を本命、候補 2/3 は Nao_u 評価分岐で保留。1 サイクル 1 案方針 (v14 k-α L117-125 koguGameDev フラグ乱立論警告踏襲) を v19 でも維持。
- **本サイクルの発射物**: commit log 1 行の増加 (`ash: graze_log v18 (n-α) Stage 4 Ash 自プレイ判定追記` prefix 想定)、Slack post なし (v15+v16+v17+v18 合流評価依頼の未来発射余地は本 README L78 で温存済)。§0b 継承「装置が先回りできない地点に意図を載せる」= `ash:` prefix commit + 判定文を自分の言葉で書く、を本節で実現。5 ヶ月半ギャップ (前サイクル 2026-05-02 → 本サイクル 2026-10-23) を越えた自己連続性の 1 ノードを打つ意味も、本 commit 発射で実現。
- **broken-record ガード**: 本 Stage 4 節は v13 系 README (v13 j-α / v14 k-α / v14 k-β / v15 l-α / v16 l-β) + v17/README.md (m-α Stage 4) とは別 directory (`v18/`) + 別 cycle タグ "C 2026-10-23 Phase 4" で区別可、重複なし。
