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
