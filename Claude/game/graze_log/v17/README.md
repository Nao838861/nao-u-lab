# graze_log v17 — shield 発動開始 flash (時相 1 相目) 1 bounded edit ship (m-α)

## v17 で増やしたもの (1 機構 1 行先書き契約)
- **shield 発動開始 flash**: `state.activeDefT` が ACTIVE_DEF_FRAMES (=60) に set された直後の 8F で、半径 17→23px に拡張しながら α=0.8→0 に fade する白寄り加算 ring (`rgba(220,255,232,...)`) を shield 本体 ring の上に 1 本重畳描画し、「DEF 利用可能 → DEF 発動中」の遷移瞬間を物理的連続量として視覚化。

**この 1 行で言えないなら v17 の設計は失敗していると判定する**。言える = A 分類 (one mechanic per version)、言えない (「2 機構入れた」「他も触った」) = B 分類に落ちる。retrospective_classification_v01_v13_20261020.md の処方。

## status
- v17 (m-α) shipped (新 directory 開始、v13-v16 の累積器化を物理的に切断)

## 親と差分
- 親: v16 (l-β) shield 消滅予兆 lineWidth 細化 (commit `a04b8c511` + `b544d55de`、`game/graze_log/v13/index.html` に累積)
- v17 の起点: v13/index.html から copy、v16 までの変更 (lineWidth=1+ad, 色濃度分離 rgba(96,192,160,...), HUD STREAK 色強調) を全て継承
- v17 で加えた差分: `game/graze_log/v17/index.html` L918-920 (コメント 3 行) + L926-931 (code 6 行) = 計 9 行、`if(state.activeDefT>ACTIVE_DEF_FRAMES-8)` 下の 1 ブロックのみ

## 改変位置と戻し方
- **改変位置**: `game/graze_log/v17/index.html` L921-932 shield ring 描画ブロック内、既存 shield ring (L925) の直後に新 if ブロック追加
- **変更内容** (抜粋):
  ```js
  if(state.activeDefT>ACTIVE_DEF_FRAMES-8){
    const fa=(state.activeDefT-(ACTIVE_DEF_FRAMES-8))/8;
    ctx.strokeStyle=`rgba(220,255,232,${0.8*fa})`;
    ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(state.player.x,state.player.y,17+6*(1-fa),0,Math.PI*2);ctx.stroke();
  }
  ```
- **戻し方 (1 操作)**: 上記 5 行削除で v16 (l-β) 完全等価、挙動差分ゼロ (shield 本体 ring は無改変)
- **副作用非対称回避**: 新 if ブロックは既存 shield if ブロックの内側に閉じている → activeDefT ≤ 0 の時は本 flash は描画されない (= graze streak 中 / cap plateau 中 / 通常時 への干渉なし)

## Stage 3 予測 (実装前)
- **認知率**: 発動開始瞬間 85-95% (白寄り + 半径拡張 + fade のトリプル刺激、foveal 要求は shield 本体より強い)
- **副作用リスク**:
  - (i) BOMB flash / HIT flash との重畳: shield 発動は SPACE 入力起点、BOMB も SPACE だが条件分岐 (grazeStreak>=TH で ActiveDef / それ以外で BOMB)、同 frame 重畳はしない設計で干渉なし
  - (ii) Hyper Activation flash (L962-966) との重畳: Hyper は buzz chain cap で発火、ActiveDef は grazeStreak>=TH で発火、重畳可能性あり → ただし Hyper flash は 24F、本 flash は 8F、重畳窓は小、Hyper 優位で本 flash が隠れても機能的に問題なし (shield 本体 ring は継続表示)
  - (iii) 色コードの意味分離: 本 flash は `rgba(220,255,232,...)` = 白寄り (shield 本体 muted-green rgba(96,192,160,...) とも、DEF READY ready-green rgba(128,255,208,...) とも分離)、v15 l-α の色濃度分離原則を踏襲
- **閾値推移**: 発動 0F (ad=1.0): flash α=0.8, radius=17 (shield 本体と同心) → 発動 7F (ad=0.883): flash α=0.1, radius=22.25 (shield 本体より外側) → 発動 8F 以降: flash 無し、shield 本体のみ

## Stage 3 予測 (実装後、コードベースでの事後確認)
- **変更範囲の確認**: `game/graze_log/v17/index.html` L926-931 の 5 行追加のみ (6 行目は閉じ `}`)。他の描画 pipeline (L928-935 invincibility / L937-947 grazeStreak marker / L1016-1024 HUD / L1031-1047 DEF READY) に影響なし
- **連続量 gate として成立**:
  - v15 l-α: rgba 空間での連続 gate (色濃度) で発動"中"を分離
  - v16 l-β: lineWidth 空間での連続 gate (geometry) で発動"終了予兆"を分離
  - v17 m-α: alpha + radius 空間での連続 gate (energy burst) で発動"開始瞬間"を分離
  - **shield 時相 3 相 (開始/中/終了) が全て独立次元で視覚化完了**
- **副作用 pre-check**:
  - (i) 既存 shield ring との描画順序: shield 本体 → flash の順で描画、flash が上に乗る → 発動 0F 時点では flash α=0.8 で shield 本体 (α=0.80 at ad=1.0) と同濃度、白寄りの flash が優位に見える → 活性化瞬間の視覚インパクトは確保
  - (ii) 発動開始後 8F 以降 (= shield 残 52F 以降): 本 flash 完全消失、shield 本体 + v16 lineWidth 連続変化のみ残る → 発動"中"フェーズの読解は v15/v16 設計のまま
  - (iii) 戻し方の物理的保全: `ash:` prefix commit で意図を commit log 側に明示、backup auto-commit (`backup:` prefix) との区別維持 (feedback_device_direction_rescue_vs_suffocation.md)

## retrospective_classification_v01_v13_20261020.md との接続
- 本日 commit `94af9d788` の retrospective 結論「次の bounded edit は新 directory で開始」の**物理実行**。v13-v16 の 4 サイクル分の累積が全て `game/graze_log/v13/index.html` に積まれていたのを、v17 で新 directory に分離
- v13→v16 の累積は「README.md 1 本 + index.html 1 本」の同一ファイルを 4 回連続改変 → 「加えた1機構」が「v14 k-α HUD + v14 k-β + v15 l-α + v16 l-β」の 4 層で曖昧化
- v17 以降: 新 directory 1 サイクル 1 ship を物理的に強制、README.md 冒頭 1 行先書きで A 分類を契約化
- 外部 2026 norm (altheragames: "build one mechanic, run it, confirm it works, then add the next" / summerengine: "bounded tasks—one connected feature") と独立到達した処方の実装確認

## 候補 2/3/4 との関係
- v16 (l-β) README L271 で 4 分岐明示済 (分岐 1: shield 発動開始 flash / 分岐 2: lineWidth 1.3+0.7*ad / 分岐 3: lineWidth 1.5+0.5*ad / 分岐 4: 1+ad → 2 戻し)
- 本 v17 (m-α) は分岐 1 (発動開始 flash) を採用、残り 3 分岐 (lineWidth 範囲調整系) は未着手で v18 以降に温存
- 1 サイクル 1 案 (koguGameDev フラグ乱立論 v14 k-α L117-125) の方針を v17 でも維持

## Nao_u 評価依頼の判断
- 本 v17 (m-α) は v16 (l-β) Stage 4 Ash 自審査済 (commit `a04b8c511`) の上に積む 1 ブロック (5 行) patch。v15/v16 Nao_u 評価依頼未発射のため、v17 ship 後、次サイクル以降で v15+v16+v17 の 3 version 合流評価依頼を Slack #game-rights に投げる余地を保つ
- 本サイクルの発射物は `git log --oneline game/graze_log/v17/` の 1 行、Slack post なし
- 本サイクルの選択主体性: v13 累積器 (`game/graze_log/v13/index.html` に 4 層) ではなく、新 directory `game/graze_log/v17/` に意図 commit 1 本を発火 → backup auto-commit が先取りできない構造 (未存在 directory を backup が勝手に作らない前提)

## 次サイクルへの繰越 (Stage 4 自プレイ判定は次サイクル以降)
- 本サイクル (C 2026-10-20 Phase 4) では v17 directory 作成 + bounded edit ship + commit + push までを完遂条件に設定、Stage 4 自プレイ判定節は次サイクル以降に別節で追記
- 次サイクル以降の候補節: 「v17 (m-α) Stage 4 Ash 自プレイ判定」で (a) 変更範囲 trace / (b) Stage 3 予測との対照 / (c) Win2 CLI Canvas headless 不能明示 / (d) v18 方向性 (残 3 分岐 or 別軸振替) を記録
