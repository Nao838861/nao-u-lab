# log_mystery v10 — devlog (C237 Phase 3)

## 1. 設計核 (chord 同時遷移演出)

v07 で chord 1 ペア、v08 で chord 2 ペア、v09 で chord 3 ペア + 双方向化 + 「両方 pending 化」型 chord を確立した。chord 構造は静的には全部入ったが、**プレイヤー体感としては「ペンディング行が静かに ♪ に変わる」ことしか起きていない** = chord は構造上存在しても**鳴っていない**。v09 devlog §7 (c) で「chord 演出強化」を候補に挙げて 1 サイクル温存していた一手を v10 で実装。

採用設計: **chord = 同一クリックで 2 鐘以上の状態が同時遷移すること** を実行時検出し、該当鐘行に 1.4 秒の `bell-chord-flash` 演出（背景フラッシュ amber + 微振動）を入れる。chord 1 ペアの「C10 click → 動機 ⏸→♪ + 共犯場所 ⏸→♪」も chord 3 ペアの「C8 click → 場所1 ✗→⏸ + 共犯場所 ✗→⏸」も、chord 1+3 三重和音「C10 click → 動機 + 場所1 + 共犯場所 同時 ♪」もすべて同じ仕組みで光る。chord 構造 (静的) を chord 体感 (動的) に翻訳する初手。

## 2. 実装差分 (v09 → v10)

v09 base 831 行に対して以下のみ:

| 変更 | 行 | 内容 |
|---|---|---|
| title/H1/meta | 3 | v09 → v10 + 「同時遷移演出」追記 |
| CSS chord flash | 8 | `.bell-row.bell-chord-flash` + `@keyframes chordFlash` (背景amber 0.55 → 透明 + ±2px translateX 振動) |
| `bellRow` 第 6 引数 `key` 追加 | 2 | `data-bell-key="<key>"` を div に出力 |
| `bellRow` 呼出 9 箇所更新 | 9 | `renderBellGroup` x3 + `renderResult1` x3 + `renderResult2` x3 |
| `bellTri(k)` 新規 | 6 | hit/pending/miss/unset の 4 状態判別 |
| `withChordDetection(fn)` 新規 | 17 | クリック前後で全 6 鐘の tri を snapshot、差分 2 件以上で `setTimeout(20)` 経由で chord-flash class 付与 |
| 2 クリックハンドラを wrap | 4 | `renderClues` + `renderClues2` |

実装コード差分 約 49 行。v01-v09 で形成した抽象 (`bellRow` / `bellState` / `evalXxx` / `reDeduceXxx` / `bell-pending` クラス / `[補強]` タグ / `isExtra` 規約) を**1 つも壊さず**、演出だけを直交層として上に重ねた。

## 3. v09 比較

| 軸 | v09 | v10 | 体感差分予測 |
|---|---|---|---|
| 章数・鐘数・3 値鐘数 | 2/6/4 | 2/6/4 | 同じ |
| 章間 chord ペア数 | 3 | 3 | 同じ |
| chord 方向性 | 双方向 | 双方向 | 同じ |
| chord 種別 | 両方hit型 + 両方pending化型 | 同 | 同じ |
| chord 同時遷移演出 | なし (静かに変わる) | あり (1.4s flash + 微振動) | **+1: chord が「鳴る」体感** |
| C10 トリプル発火可視化 | テキストのみ | 3 鐘同時に光る | **三重和音が視覚化** |

v09 で完遂した「構造」を**そのまま維持**しながら、v10 で「体感層」を追加 = R-D 守破離の **守の延長** (破ではない)、v04-v09 の最小差分シリーズ継続。

## 4. セルフプレイ予測 vs 実測 (コード目視シミュ)

### シナリオ A: 標準プレイ (全 CLUE 既読 → 推理)
- 章 1 推理時 3 鐘同時 ♪ → これは reDeduce 経由でないので chord-flash 発火せず ✓ (deduceChapter1 ボタンクリックは bellState を直接 set、`withChordDetection` 経由ではない)
- 設計判断: ボタン推理の同時 3 鐘は「最初の鳴り」であり「再判定 chord」ではない、別演出にしない方が体験は整理される。chord-flash は **CLUE クリックによる再判定** に限定する。

### シナリオ B: chord 1 観察 (C10 後回し)
- C1-C4 既読 → 章 1 推理 → 動機 ⏸ + 場所 ✗ + 容疑者 ♪ (1/3、章 2 未アンロック)
- C10 click → reDeduceCh1: 動機 ⏸→♪ + 場所1 ✗→♪ (2 件同時遷移) → **chord-flash 発火 (動機+場所1 が同時に amber フラッシュ + 微振動)** ✓
- chapter2 未推理のため reDeduceCh2 は走らない、共犯場所への波及は v10 でも未演出（仕様通り）

### シナリオ C: chord 3 両方 pending 化観察
- 章 1/2 両方推理済の状態で、C8 click → reDeduceCh1: 場所1 ✗→⏸ + reDeduceCh2: 共犯場所 ✗→⏸ (2 件同時遷移、両方 pending 化型) → **chord-flash 発火 (場所1+共犯場所 が同時に amber フラッシュ)** ✓
- 章 1 内 (場所1) と章 2 内 (共犯場所) が**章を跨いで同時に光る** = v09 で導入した双方向 chord 構造を初めて視覚化

### シナリオ D: chord 1+3 三重和音 (C10 click 全 3 鐘同時 ♪)
- 章 1/2 両方推理済 + C8 既読の状態で、C10 click → reDeduceCh1: 動機 ⏸→♪ + 場所1 ⏸→♪ + reDeduceCh2: 共犯場所 ⏸→♪ (3 件同時遷移) → **chord-flash 発火 (動機+場所1+共犯場所 3 行が同時 amber フラッシュ)** = **三重和音が視覚化** ✓
- 結果ペイン (#result, #result2) と全体盤 (#bellsStatus) の両方に data-bell-key があり、両方の場所で同時に光る = 章 1 推理結果と全体盤を同時に視野に入れているプレイヤーは同期して光るのを見る

### シナリオ E: chord 2 (C3 click → 動機 ⏸→♪ + 共犯者 ⏸→♪)
- C1,C2,C4,C10 既読 + 章 1 推理済 + C5,C6 既読 + 章 2 推理済 (共犯者 ⏸: c6 のみ) の状態で、C3 click → reDeduceCh1: 動機 (変化なし、c10 で既に ♪) + reDeduceCh2: 共犯者 ⏸→♪ → 1 件のみ遷移 → chord-flash 発火せず ✓ (chord 2 ペアは「C3 が章 1 動機 + 章 2 共犯者の両方の決定打」だが、C10 が既読なら動機は既に ♪、C3 click では共犯者のみが遷移、これは chord ではなくソロ)
- chord 2 ペアの「同時 ♪」を見るには C3, C10 両方未読から C3 を読む必要があり、その時は C3 click で動機 ✗→⏸ + 共犯者 ⏸→♪ (or ✗→⏸) で **章を跨いで 2 件同時遷移 → chord-flash 発火** ✓

### 反例検証 (regression check)
- 単独 click (C1/C2/C4/C5/C6/C9 等で何も遷移しない or 1 件のみ) → chord-flash 発火せず ✓
- chapter1Deduced=false かつ chapter2Deduced=false 状態 (推理前) で CLUE click → fn() 内側何も走らない → 遷移ゼロ → 発火せず ✓
- chapter1Cleared=false で CLUES_CH2 click → 早期 return、withChordDetection も呼ばれない ✓
- 同じ CLUE を 2 回連続 click (read=true→false) → 逆方向遷移 (♪→⏸ or ⏸→✗) も 2 件同時なら発火 → **取消しでも光る** = 設計通り (再判定の「逆 chord」も chord)
- `before[k] === 'unset'` (まだ推理してない鐘) は遷移カウントから除外 → 章 2 未推理時の C10 click で chapter1Deduced=true → reDeduceCh1 → 動機+場所1 が遷移 → 共犯場所は unset のままで除外 → 2 件で発火 ✓

## 5. R-A 自己判定 1 文

**v09 の「6 鐘 + 章間 chord 3 ペア + 双方向化 + 両方 pending 化型 chord 種別」構造を一切壊さず、CLUE クリックによる reDeduce で 2 鐘以上が同時に状態遷移したことを検出して該当鐘行に 1.4 秒の chord-flash 演出 (背景 amber + 微振動) を入れる ~49 行差分で、これまで「静かに変わるだけ」だった chord 1/2/3 ペアおよび C10 三重和音の同時遷移が初めて視覚的に鳴るようになり、chord 構造 (静的) が chord 体感 (動的) に翻訳された (R-A 違反なし、強化方向、R-D 守の延長維持、v01-v09 抽象を 1 つも壊していない)。**

## 6. v11 候補

- (a) v01-v10 一括試遊依頼を Nao_u に出す (GitHub Pages 公開化が並走必要、v06 §6 から 5 サイクル持ち越し)
- (b) chord 4 ペア化 (完全網): 6 鐘すべてが少なくとも 1 つの章間 chord に参加する形 (v09 §7 (b) 継承)
- (c) chord 音響演出: chord-flash と同期して短いベル音を鳴らす (chord 1=単音、chord 2=2 音同時、三重和音=3 音同時) → 視覚 + 聴覚で chord 体感を増幅
- (d) 3 値化の完全対称化 (v09 §7 (d) 継承)
- (e) chord 種別の追加: 「片方 hit + 片方 pending」型 chord (現状なし)
- (f) chord 発火後の「ペア線描画」: chord で同時遷移した 2 鐘の間に短い光線を描画して chord 構造を視覚化 (v07 §7 (f) / v08 §7 (d) / v09 §7 (c) 系譜の発展形)

優先度: (a) > (c) > (f) > (b) > (d) > (e)。(a) は GitHub Pages が並走しないと不可、(c)/(f) は v10 chord-flash の上に直交的に追加可能で chord 体感を更に増幅。(b) は構造拡張だが「演出のない chord を 1 ペア増やす」より「既存 chord の体感を多軸化する」方が体験密度が上がるという v10 着手判断と同方向。
