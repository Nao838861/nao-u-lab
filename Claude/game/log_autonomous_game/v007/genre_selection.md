# log_autonomous_game v007 — genre_selection.md

**起票**: 2026-06-11 C323 Phase 4 (Log)
**親**: [v003/PEARSON_BLOCKER.md](../v003/PEARSON_BLOCKER.md) (C322 Phase 4 着地、v003 構造特性確定)
**v004-v006 既存**: v004 (2026-05-27 Q-D シート Echo 経済反転防止)、v005 (boghog 2026-05-28)、v006 (2026-05-29 design_log のみ) は v003 Echo-Path 系の派生で着地済 → 本 v007 は **Echo-Path 系自体からの脱出** = 別ジャンル選定が役割

**用途**: v003 wave-rider 反証 + outlier 支配確定 (PEARSON_BLOCKER) を受け、Echo-Path/STG 系統から構造的に離脱するためのジャンル候補ブレストと選定。`design_log.md` の Q-D0 (1行コンセプト) と Q-A (中心入力) を確定する前段。

---

## 0. なぜ別ジャンルが必要か (Echo-Path 系統からの離脱根拠)

| 観点 | v001-v006 共通 = Echo-Path 系 | v007 で変えたい方向 |
|---|---|---|
| ミミクリ宣言 | STG パイロットごっこ | パイロット**以外**のごっこ (探検家 / 思考者 / 観察者) |
| 入力 timing | 1 秒先予測 (中時間域) | 別 timing 域 (即時 100ms or 思考型 time-independent) |
| 危険源 | 敵弾 (画面内 + 退場前) | 環境ハザード or 制約 or 思考迷路 |
| 評価軸 | proxy 4 指標 (clear_wave / play_time / graze / survival) | 別の評価軸 (空間到達 / 解 / 集中時間) |
| 構造特性 | PEARSON_BLOCKER の outlier 支配 | proxy 系統が無効化される非数値評価域 |

**コア論証**: C322 Phase 4 で v003 wave-rider 改造反証 = 同設計内では超えられない、別軸 probe 拡張は研究装置の充実化に倒れる (= `feedback_means_ends_reversal_check.md` 診断対象)、playable 直接改修は方向不明。**ジャンル変更が構造的必要性**。

---

## 1. ジャンル候補 5 案

### 候補 1: アクションアドベンチャー探索 (mini-metroidvania)

**1 行**: 移動 + 1 アクションで限定空間を探索し、隠された通路 / アビリティを段階解放する遊び。
**lineage**: Zelda 1 / Hollow Knight / Animal Well の最小骨格 (1 部屋 + 1 アビリティ + 1 ドア)。
**arxiv 2202.09615 接続**: 直接接続 = MAP-Elites action-adventure 拡張の対象ジャンル、敵配置 / アビリティ配置の quality-diversity 探索素材として使える。
**Echo-Path との対比**: 最大距離。STG パイロット → 探検家。1 秒先予測 (時間軸) → 空間理解 (空間軸)。
**Mimicry 核**: 「未知空間を読む探検家」感。1 画面で「あの隙間に何かある」と認識できる視覚 / 配置設計。
**30 分着地スコープ**: 設計のみは余裕、game.js 着手は次サイクル C324 以降。
**MPS (M5 P4 S4 = 13)**: M=5 (Echo-Path との最大距離) / P=4 (探検家感の確立度高) / S=4 (1画面で？を立てる素材豊富、Animal Well 2023 の同型)。
**懸念**: スコープ拡大リスク (探索ゲームは「もう 1 部屋」で肥大しやすい)。30 分着地では 1 部屋 + 1 アビリティ + 1 ドアまで bounded する制約必須。

### 候補 2: パズル系 (Sokoban / Baba Is You lineage)

**1 行**: 限定マスを 1 手ずつ動かして 1 つの最適解 (or 複数解) に到達する遊び。time-independent。
**lineage**: Sokoban / Stephen's Sausage Roll / Baba Is You / Patrick's Parabox。
**Echo-Path との対比**: 高距離。リアルタイム弾幕 → time-independent 思考。入力 timing 概念自体が消える。
**log_mystery v01-v03 経験活用**: log_mystery のスカスカ感 (「テキスト選択肢が単調」) の原因 = 「思考の階段が存在しない」を、パズル系の「1 手の前後で必ず状態が変わる」骨格で解消可能。
**Mimicry 核**: 「ルールを発見する思考者」感。1 画面で「このルールはこう動くらしい」が伝わる初期配置。
**30 分着地スコープ**: 設計のみは余裕、game.js は 1 ステージ 5x5 グリッド 1 ルール 1 ステージで最小実装可。
**MPS (M4 P4 S5 = 13)**: M=4 (パズル系自体は既存ジャンルだが Baba Is You 系の「ルールがオブジェクト」軸は独自性高) / P=4 (思考者感の確立度高) / S=5 (1 画面で？を立てる素材最多、Baba Is You = 全 stage が？立て構造)。
**懸念**: log_mystery 系で既に「スカスカ感」と評された経路、慎重に骨格を引く必要。

### 候補 3: タイム制御系 (Superhot lineage)

**1 行**: 自分が動かなければ時間が止まる、動くと時間が流れる、を中心入力にする遊び。
**lineage**: Superhot / Time Stranger / Quantum Conundrum。
**Echo-Path との対比**: 中距離。STG 弾幕は維持されるが、時間軸操作が中心入力 → 「予測」から「制御」へ。
**arxiv 2202.09615 接続**: 弱い (action-adventure ではなく action-puzzle)。
**Mimicry 核**: 「時間を支配する主人公」感。Superhot の "Time moves only when you move" 1 行は Q-D0 の理想形。
**30 分着地スコープ**: 設計は余裕、game.js は静止時=完全停止 / 移動時=通常速度の 2 状態切替で最小実装可。
**MPS (M5 P5 S4 = 14)**: M=5 (時間軸を中心入力にする独自性) / P=5 (時間支配感の体感圧倒的) / S=4 (Superhot 1 行コンセプトの強さ)。
**懸念**: Superhot の既存性が強すぎ「Superhot のごっこ遊び」になりかねない (= ミミクリ宣言の核がライセンス済タイトルに依存)。

### 候補 4: リズム系 (Crypt of the NecroDancer lineage)

**1 行**: BGM の拍に合わせて 1 手ずつ動く / 行動する遊び。リズムが正解、外すと失敗。
**lineage**: Crypt of the NecroDancer / Rhythm Heaven / Hi-Fi RUSH。
**Echo-Path との対比**: 高距離。「1 秒先予測」→「拍に合わせる」= 時間軸概念は維持されるが、判断軸が予測 → 拍同期に変わる。
**Mimicry 核**: 「拍に乗っている人」感。1 拍目で？を立てる音響設計。
**30 分着地スコープ**: 設計は余裕だが音響実装が重い (Web Audio API + BGM 素材必要)、game.js 着手は次サイクル以降。
**MPS (M4 P5 S3 = 12)**: M=4 (リズム軸は新規だがリズム系自体は確立済) / P=5 (拍同期の体感は強烈) / S=3 (1 画面で？を立てる素材は Hi-Fi RUSH 等あり)。
**懸念**: 音響実装の重さ = 設計と実装のスコープが乖離、Log 単体で BGM 素材揃えるのは現実的でない。

### 候補 5: シミュレーション / リソース管理系 (Frostpunk / Slay the Spire lineage)

**1 行**: 限られたリソースと時間で意思決定を繰り返し、状態遷移を最適化する遊び。
**lineage**: Frostpunk / Slay the Spire / Into the Breach / FTL。
**Echo-Path との対比**: 最大距離 (パイロット → 戦略家)、ただし距離は候補 1 と並ぶ。
**Mimicry 核**: 「リソース配分を決める指揮官」感。1 画面で「何を捨てるか」が伝わる初期配置。
**30 分着地スコープ**: 設計は中、game.js は turn-based + 3 リソース 1 イベントで最小実装可。
**MPS (M3 P4 S3 = 10)**: M=3 (リソース管理系は既存ジャンル、独自性出すには工夫必要) / P=4 (指揮官感の確立度中) / S=3 (1 画面で？を立てる素材は Into the Breach 等)。
**懸念**: 「何を捨てるか」の選択肢設計が重い、30 分着地スコープに収まりにくい。

---

## 2. 候補比較表

| 案 | M | P | S | MPS | Echo-Path 距離 | arxiv 接続 | 30分着地 | 既存性懸念 |
|---|---|---|---|---|---|---|---|---|
| 1 action-adventure | 5 | 4 | 4 | **13** | 最大 | 直接 | ◯ | 中 |
| 2 パズル | 4 | 4 | 5 | **13** | 高 | 間接 | ◎ | 低 |
| 3 タイム制御 | 5 | 5 | 4 | **14** | 中 | 弱 | ◯ | **高** (Superhot) |
| 4 リズム | 4 | 5 | 3 | 12 | 高 | 弱 | △ (音響実装重) | 中 |
| 5 リソース管理 | 3 | 4 | 3 | 10 | 最大 | 弱 | △ | 中 |

---

## 3. 最終選定: 候補 1 アクションアドベンチャー探索 (mini-metroidvania)

**選定理由**:

1. **Echo-Path との対比軸最強**: ミミクリ核を「STG パイロット」→「未知空間を読む探検家」に置換。1 秒先予測 (時間軸) → 空間理解 (空間軸) = 軸自体が直交。
2. **arxiv 2202.09615 直接接続**: 本サイクル shared-reads 投稿 (ts=1781105732) の素材を v007 設計に直接適用可能。M-43 30 本枠 §「異ジャンル同型 ≥ 10 / 学術寄り」への転写を v007 と同時並行で運用できる = akira_goya 指示の M-43 30 本枠拡張と本 v007 着手が同じ素材で連動。
3. **MPS スコアでタイム制御 (14) に次ぐが、Superhot 既存性懸念で実質トップ**: 候補 3 は MPS=14 で最高だが、Superhot 既存性が強すぎてミミクリの核が「Superhot のごっこ遊び」に倒れる懸念 = ライセンス済タイトル依存の構造的弱点。候補 1 は Hollow Knight / Animal Well / Zelda 1 と複数 lineage を持ち、特定タイトル依存が薄い。
4. **30 分着地スコープに bound 可能**: 1 部屋 + 1 アビリティ + 1 ドアまで制約することで scope creep を防げる。設計のみで Phase 4 完遂、game.js 実装は次サイクル C324 以降。
5. **CLAUDE.md「絶対にやる」第1項 = 「ゲームを動かして出す」**: 別ジャンル着手は 1 サイクルで完遂しないので、v007 ディレクトリ + 4 設計ファイル着地が「playable 着地への動き」の第 1 段 = 2 サイクル連続 (C322/C323) playable diff ゼロの警告線を解除する第 1 歩。

**選定しなかった理由**:

- **候補 2 (パズル)**: MPS 同点だが、log_mystery v01-v03 で既に「スカスカ感」評を受けた経路 = 慎重設計が必要、同じスカスカ感を v007 で再現するリスク。後続候補 (v008+) として保留。
- **候補 3 (タイム制御)**: Superhot 既存性懸念。「Superhot 風」が頭から離れない状態で設計すると、ミミクリの核が特定タイトル依存になり、再評価時に「結局 Superhot じゃん」で終わる。
- **候補 4 (リズム)**: 音響実装の重さで Phase 4 30 分着地スコープに収まらない、game.js 着手まで延期するなら設計のみで判断可能だが、音響素材の現実性が低い。
- **候補 5 (リソース管理)**: 選択肢設計の重さ、30 分着地スコープ超過、Mimicry 核「指揮官感」が STG パイロット感と対比軸は明確だが Echo-Path 系統の延長で考えると「数値最適化」の研究装置に倒れるリスク (`feedback_means_ends_reversal_check.md` 同型懸念)。

---

## 4. 選定後 → design_log.md / brainstorm.md への引き渡し

選定済ジャンル = **アクションアドベンチャー探索 (mini-metroidvania)**

- `design_log.md`: Q-A〜Q-F 8 ゲートを mini-metroidvania 用に書き直し、Q-D0 (1行コンセプト) は **「1 つの隙間 / 1 つのアビリティ / 1 つのドアで『あの先に何かある』を立てる遊び」** で着地
- `brainstorm.md`: mini-metroidvania 内のメカニクス候補 5-10 案 + MPS スコア、本ジャンル選定後に詳細化

---

## 5. 未確認 / 残務

- **MAP-Elites 系探索の game.js 適用**: arxiv 2202.09615 本文 PDF 取得後に MAP-Elites の behavior descriptors を v007 のアビリティ / 配置軸にどう転写するかは次サイクル以降
- **M-43 30 本枠 §「異ジャンル同型 ≥ 10 / 学術寄り」への転写**: 候補 1 の lineage (Hollow Knight / Animal Well / Zelda 1) を 30 本枠に転写、v007 設計と並行運用は C324+ で
- **game.js 実装着手**: 本 v007 Phase 4 では設計のみ。game.js 着手は次サイクル C324 以降の playable diff 起動枠で実施
- **Mir / Ash との重複ジャンル確認**: action-adventure 系統を他インスタンスが並行で着手していないかは次サイクル Phase 1 で確認 (本 Phase 4 では時間予算外)
