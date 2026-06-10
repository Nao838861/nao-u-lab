# v007 mini-metroidvania 初版実装 (C325 Phase 4 着地)

**起票**: 2026-06-11 C325 Phase 4 (Log)
**前置**: [genre_selection.md](genre_selection.md) (C323 Phase 4) + [design_log.md](design_log.md) (C323 Phase 4) + [brainstorm.md](brainstorm.md)
**着地物**: `index.html` + `game.js` (本サイクル新規)

## 起動

ブラウザで `index.html` を開く (`file://` 直 or `python -m http.server`)。Canvas 800×450、playable diff。

## Q-守 審問 (feedback_shuhari_clone_first.md 順守、記憶散歩で fired)

- **型**: mini-metroidvania (action-adventure 探索、能力解放型空間ゲーム)
- **代表作 3 本**: Hollow Knight / Animal Well / Zelda 1
- **忠実再現可否**: 部分的 yes。最小骨格 = 「2 部屋遷移 + 1 能力ゲート」は代表作の型に従う。
  - design_log.md は「1 部屋 + ダッシュ」設計だったが、staging Phase 4 仕様で「2 部屋 + ダブルジャンプ」に拡張。room 遷移を骨格に含めるため (= metroidvania の「同じマップが能力で意味を変える」感は単一画面では立てにくい判定)
  - 階層的能力解放 / 戦闘 / 大マップは v007 では削った。次 version で拡張する仮の起点

## 構造

- **Room 1**: 自機 (左下スポーン) + シアンのオーブ (x=250) + 高さ 180px の壁 (x=500)
  - 単 jump (JUMP_V=-10, GRAVITY=0.5) では壁の上 (y=240) に到達不能 (頭頂 y=293 で阻まれる)
  - オーブ取得 → ダブルジャンプ獲得 → 壁の上 (頭頂 y=198) を越えて画面右端へ
- **Room 2**: ゴールドア (黄色、x=720)。触れると CLEAR

## 操作

- 矢印キー / WASD: 移動
- ↑ / W / Z: ジャンプ (能力取得後は空中で再押下 = ダブルジャンプ)
- Space: クリア後リトライ

## 自己プレイ判定 (実装直後 Log 自己評価 — 実機未試遊、ロジック検証のみ)

1. **メトロイドヴァニア骨格は立っているか**: 部分的に立つ。能力ゲート (ダブルジャンプ) と空間制約 (180px の壁) の対応関係は数値検証済 (single=y293/double=y198 vs 壁 top=y240)。ただし壁が「壁に見える」明示性が過剰、Hollow Knight 系の「最初は道に見えない誘導」はない
2. **前作 v006 系との比較**: v006 は Echo-Path 系 (時間軸 1 秒先予測 STG)、v007 は空間軸 (能力解放) = ジャンル軸が直交。Echo-Path 系統からの脱出という genre_selection.md §0 の主張は本実装で物理化された
3. **面白く遊べる骨格か**: 「30 秒で 1 周」スコープ、面白さ未到達、型示し止まり。代表作の「最初の 30 分」相当の体験はない
4. **Q-D シート (経済反転防止) 遵守**: スコア / ゲージ / パワーアップ機構なし、報酬経路 = 空間到達のみ。graze_log v01 同型事故の構造は発生していない

## 次サイクル C326 以降への引継ぎ

- **「壁の明示性過剰」改善**: 高さ 180px の壁が画面右側に直立、誘導が直接的すぎる。L 字 / 段差 / 隠し通路 等で「最初は道がないように見える」レイアウトに変更
- **能力種類追加**: ダッシュ / フック を追加し、部屋数を 4-6 に拡張、能力 × 空間の組み合わせで「あの先に何かある」を多層化
- **design_log.md との差分整理**: design_log は「1 部屋 + ダッシュ」、本実装は「2 部屋 + ダブルジャンプ」。差分の経緯 (staging Phase 4 仕様で拡張) を design_log.md §14 「未確認 / 残務」に追記
- **Mir / Ash / Nao_u 体験**: 「探検家感」体感成立条件は実機判定なしには確証できない、次サイクル以降で Slack 経由依頼

## 物理パラメータ (ロジック検証用)

| 値 | 設定 |
|---|---|
| GRAVITY | 0.5 px/frame² |
| JUMP_V | -10 px/frame (単 jump max height = 100 px) |
| MOVE_V | 3 px/frame |
| MAX_FALL | 12 px/frame |
| 壁高 | 180 px (top y=240, ground y=420) |
| 単 jump 頭頂 | y=293 (壁阻止 ✓) |
| 二段 jump 頭頂 | y=198 (壁越え ✓、マージン 42px) |
