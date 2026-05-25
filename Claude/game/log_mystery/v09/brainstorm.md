# log_mystery v09 — brainstorm (C235 Phase 4)

## 1. 起点

v08 devlog §7 で予告した「(b) chord 3 ペア化: 章 2 C8 (換気窓物理構造) を章 1 場所鐘 (Y 隣室) の決定打にも兼任させる第 3 chord ペア」を v09 で最小差分実装する。v07 で chord 1 ペア (C10 → 動機 + 共犯場所)、v08 で chord 2 ペア (C3 → 動機 + 共犯者) を完遂、その上に第 3 chord ペア (C8 → 場所1 + 共犯場所) を追加する。v01 から守ってきた構造抽象 (`bellRow` / `bellState` / `evalXxx` / `reDeduceXxx` / `bell-pending` クラス / `[補強]` タグ / `isExtra` 規約) を一切壊さず、`evalPlace1` 新規追加 + CLUES_CH2 クリックハンドラ 1 行追加 + C8 文面拡張で成立させる。

## 2. 第 3 chord ペア候補 3 案 brainstorm

### 案 A: C8 → 場所1 + 共犯場所 chord (採用候補本命)

- 章 2 C8 (見取り図に基づく換気窓物理構造) を、章 1 場所鐘 (Y 隣室) の決定打にも兼任させる
- 物語: 見取り図で「換気窓は外周通路に面し、外側から覗き込む形でしか接触不可」+「他の侵入経路 (廊下監視・書庫上階) が物理的に不適」が確定すると、貴重書室から外へ出る物理的経路は **換気窓→閲覧室→外周通路** の動線のみ = 章 1 場所鐘 Y が決定打的に補強される
- evalPlace1 新規追加: `c10 ? hit : (c8 ? pending : false)` 形 (evalWhy と並列、C10 が within-ch1 決定打 + C8 が章間 chord 補強)
- chord 3 ペア発火パターン: C8 既読化で **章 1 場所鐘 ⏸ + 章 2 共犯場所鐘 ⏸ を同時 false→pending 遷移** (chord 1/2 と異なり「両方 pending 化」型の chord)、その後 C10 既読化で **動機 ⏸→♪ + 共犯場所 ⏸→♪ + 場所1 ⏸→♪ の三重和音同時遷移** (C10 が 3 鐘トリガー化)
- v07/v08 構造抽象を 1 ミリも壊さない (evalPlace2 / evalSuspect2 / reDeduceCh2 全て不変)

### 案 B: C7 → 章 1 容疑者鐘 の逆方向 chord (代替案・棄却)

- 章 2 C7 (蔵元の現金需要) を、章 1 容疑者鐘の決定打にも再利用
- ただし「主犯特定 = 司書」と「共犯者特定 = 蔵元」は別ベクトル、C7 が章 1 容疑者鐘 (司書) の補強になる物語経路が不自然 (C7 は共犯側の動機情報)
- 章 2 アンロックは章 1 推理 3/3 完成が前提 = C7 が読める時点で章 1 容疑者鐘は既に ♪ → chord 体感が出ない (v08 案 B 棄却理由と同型)
- 棄却

### 案 C: chord 演出強化先行 (代替案・棄却)

- chord 1/2 ペアの発火を画面で可視化 (画面フラッシュ / 鐘の音響 / 紐付き線描画) して同時鳴り直し体感を視覚強化
- chord 構造を増やすのではなく既存 chord 1/2 ペアの体感を強化
- v08 devlog §7 (d) と一致するが「構造を伸ばさず演出だけ盛る」= R-D 守の範疇に留まる
- v09 候補 (d) は v10 以降に温存、まず chord 3 ペアで章間連鎖網を 3 ペア目まで伸ばす → 棄却

## 3. 採用案: A (C8 → 場所1 + 共犯場所 chord)

選定理由:
- v08 §7 (b) の素直な実装、最小差分、v07 chord 1 + v08 chord 2 ペア構造抽象を完全並列で複製
- 物語的整合性が成立 (見取り図と物理的侵入経路の消去法で「閲覧室経由動線」が決定打的に補強される)
- 「決定打 1 つで 2 鐘が同時に再判定される」体感が章間に 3 ペア成立 = 「章間連鎖網」が最小単位 (2 ペア) から 3 ペアに拡張
- v07 章間 chord 1 ペア + v08 chord 2 ペア構造の上に chord 3 ペア化 = R-D 守の延長 (破 = 章 3 追加 ではない)

### evalPlace1 設計詳細 (chord 3 自然発火の前提条件)

v08 まで `evalPlace1` は不在で、`deduceChapter1` 内で `whereHit = (wh === ANSWER_CH1.where)` の binary 評価。v09 ではこれを `evalPlace1` 関数化 + 3 値化:

```js
function evalPlace1(wh) {
  if (wh !== ANSWER_CH1.where) return { hit: false, pending: false };
  const c10 = CLUES_CH1.find(c => c.id === 10).read;
  const c8 = CLUES_CH2.find(c => c.id === 8).read;  // 章間 chord 3 参照
  if (c10) return { hit: true, pending: false };
  else if (c8) return { hit: null, pending: true };
  else return { hit: false, pending: false };
}
```

evalWhy と完全並列構造:
- evalWhy: `c10 ? hit : (c3 ? pending : false)`
- evalPlace1: `c10 ? hit : (c8 ? pending : false)`

C10 が within-ch1 決定打、C8 が章間 chord 補強 (pending)。C10 の役割が v08 では「動機決定打 + chord 1 で共犯場所決定打」だったところ、v09 では「動機決定打 + chord 1 で共犯場所決定打 + 場所1 決定打」= **C10 が 3 鐘トリガー化** (chord 3 ペアの自然帰結)。

### 章間連鎖網のトポロジ整理

v09 完成時の章間 chord 構造:

| chord ペア | 駆動 clue | ch1 側 bell | ch2 側 bell | 役割 |
|---|---|---|---|---|
| chord 1 | C10 (ch1) | 動機 (within決定打) | 共犯場所 (cross補強) | C10 → 動機+共犯場所 同時遷移 |
| chord 2 | C3 (ch1) | 動機 (補強pending) | 共犯者 (cross補強) | C3 → 動機 pending + 共犯者 同時遷移 |
| chord 3 | C8 (ch2) | 場所1 (cross補強) | 共犯場所 (within決定打) | C8 → 場所1 pending + 共犯場所 pending 同時遷移 |

**v09 独自性**: chord 1/2 は「ch1 → ch2」方向の cross-chord (ch1 の clue で ch2 鐘も鳴る)、chord 3 は **「ch2 → ch1」方向の cross-chord (ch2 の clue で ch1 鐘も鳴る) = 方向反転の chord** = 章間連鎖網が双方向化。さらに chord 1/2 は「片方の clue で両方 hit」だが chord 3 は「両方 pending 化」型 chord = 違う型の chord も含む網に拡張。

## 4. 実装スケッチ

### CLUES_CH2 C8 文面拡張

v08: 「館の見取り図によれば、換気窓は閲覧室側ではなく外周通路に面しており、外側から覗き込む形でしか接触できない。廊下の監視記録は通過時間のみで滞在を示さず、書庫上階は照明が灯っていないため侵入経路として不適。」

v09: 「館の見取り図によれば、換気窓は閲覧室側ではなく外周通路に面しており、外側から覗き込む形でしか接触できない。廊下の監視記録は通過時間のみで滞在を示さず、書庫上階は照明が灯っていないため侵入経路として不適。**つまり貴重書室から外へ抜ける物理経路は『換気窓→閲覧室→外周通路』の動線しか残らず、章 1 の偽装密室退出地点が閲覧室であることがここで物理的に確定する。**」

`isExtra: true` 追加 → [補強] タグ表示。

### evalPlace1 新規追加 (上記 §3 参照)

### deduceChapter1 改修

v08:
```js
const whoHit = (w === ANSWER_CH1.who);
const whereHit = (wh === ANSWER_CH1.where);  // ← v08 binary
const whyEval = evalWhy(wy);
bellState.where = { hit: whereHit, value: wh, pending: false };
```

v09:
```js
const whoHit = (w === ANSWER_CH1.who);
const whereEval = evalPlace1(wh);  // ← v09 3 値
const whyEval = evalWhy(wy);
bellState.where = { hit: whereEval.hit, value: wh, pending: whereEval.pending };
```

### reDeduceCh1 改修 (place1 も re-eval)

v08:
```js
function reDeduceCh1() {
  if (!chapter1Deduced) return;
  const wy = bellState.why.value;
  if (!wy) return;
  const whyEval = evalWhy(wy);
  bellState.why = { hit: whyEval.hit, value: wy, pending: whyEval.pending };
  renderResult1();
}
```

v09:
```js
function reDeduceCh1() {
  if (!chapter1Deduced) return;
  const wh = bellState.where.value;
  const wy = bellState.why.value;
  if (wh) {
    const whereEval = evalPlace1(wh);
    bellState.where = { hit: whereEval.hit, value: wh, pending: whereEval.pending };
  }
  if (wy) {
    const whyEval = evalWhy(wy);
    bellState.why = { hit: whyEval.hit, value: wy, pending: whyEval.pending };
  }
  renderResult1();
}
```

### CLUES_CH2 クリックハンドラ拡張 (chord 3 cross-back)

v08:
```js
div.onclick = () => {
  if (!chapter1Cleared) return;
  c.read = !c.read;
  renderClues2();
  if (chapter2Deduced) reDeduceCh2();
};
```

v09:
```js
div.onclick = () => {
  if (!chapter1Cleared) return;
  c.read = !c.read;
  renderClues2();
  if (chapter1Deduced && c.id === 8) reDeduceCh1();  // chord 3 cross-back to ch1
  if (chapter2Deduced) reDeduceCh2();
};
```

C7 / C9 は ch1 側鐘に影響しないため `c.id === 8` のみで十分 (staging Phase 4 §4(d) で OR で拡張可と書かれていたが、影響鐘ゼロなので含めず最小差分維持)。

### renderResult1 pending 表示分岐 (場所も pending 表示対応)

v08:
```js
html += bellRow("場所の鐘", LABELS.where[sWhere.value], sWhere.hit, false, false);  // ← 第5引数 false 固定
```

v09:
```js
html += bellRow("場所の鐘", LABELS.where[sWhere.value], sWhere.hit, false, sWhere.pending);
```

加えて renderResult1 内 pending 分岐に「場所」も対応:
- v08 では pending 判定は `pending = sWhy.pending` のみ
- v09 では `pending = sWhy.pending || sWhere.pending`
- pending ヒント文に「場所 pending の場合は C10 (司書日誌) または C8 (見取り図) を既読化で再判定」追記

### UI 説明追記

- 章 1 説明文末尾: 「※ C3 は章 2 容疑者鐘の決定打を兼ねる (chord 2 ペア)、C10 は章 2 共犯場所鐘 + 章 1 場所鐘の決定打を兼ねる (chord 1 + 3 ペア)」
- 章 2 説明文末尾: 「※ C8 は章 1 場所鐘の決定打 (補強) を兼ねる (chord 3 ペア、章間連鎖網が双方向化)」

### meta 文末更新

v08: 「v08 = 6鐘 + 動機鐘・場所鐘・共犯者鐘 3 値化 + C10 chord 1 ペア + C3 chord 2 ペア (章間連鎖網 2 ペア)」
v09: 「v09 = 6鐘 + 動機鐘・場所鐘1・場所鐘2・共犯者鐘 4 値化 + C10 chord 1 + C3 chord 2 + C8 chord 3 ペア (章間連鎖網 3 ペア + 双方向化)」

## 5. 第 3 chord ペア発火条件 / 非発火条件

| シナリオ | C2 | C10 | C8 | 場所鐘1 |
|---|---|---|---|---|
| C10 既読 (within-ch1 決定打) | * | ✓ | * | ♪ 鳴る |
| C8 のみ既読 (chord 3 補強のみ) | * | × | ✓ | ⏸ 保留 |
| 両方未読 | * | × | × | ✗ 鳴らない |
| wh ≠ Y | * | * | * | ✗ 鳴らない (答え不一致) |

C2 (vent window 構造) は v08 まで base 評価に使われていたが、v09 では evalPlace1 が C10 / C8 に依存するため C2 単独では鳴らない (C2 は物語的前提情報として残るが鐘判定からは独立)。これは「C2 既読が必須」型 (evalPlace2 の c8 base 型) ではなく「決定打 1 つで鳴る」型 (evalWhy の c10 型) を選んだため。

**chord 3 自然発火経路**: 章 1 で C2/C10 既読 + C3 未読 → 章 1 推理 → 動機 ♪ + 場所 ♪ + 容疑者 ♪ (3/3) → 章 2 アンロック → C5,C6,C9 既読 (C7,C8 未読) → 章 2 推理 → 共犯者 ⏸ (chord 2 で C3 待ち) + 共犯動機 ♪ + 共犯場所 ✗ (C8 未読) → C8 既読化 → 場所1 (C10 既読のため ♪ 維持) + 共犯場所 ⏸ 同時遷移 → C9 既読化済なら共犯場所 ♪ 単独遷移 → ...

実際に「両方 pending 化」chord 3 体感を出すには **C10 未読 + C8 未読** からスタート → C8 既読化で **場所1 ✗→⏸ + 共犯場所 ✗→⏸** 同時 false→pending 遷移、その後 C10 既読化で **動機 ✗→♪ + 場所1 ⏸→♪ + 共犯場所 ⏸→♪** の三重和音同時遷移 (C10 が 3 鐘トリガー = chord 1 + chord 3 同時発火)。

## 6. R-A〜R-I 抽象ルール照合

- **R-A 体験から設計**: 「鐘の同時鳴り直し体感」を chord 3 ペア化で「章間連鎖網の双方向化」に拡張 = 核体験を強化。違反なし
- **R-B 緊張は外発**: 自発リスクなし、罰駆動なし。違反なし
- **R-C 見えないものは存在しない**: chord 3 発火は `⏸ → ♪` および `✗ → ⏸` の遷移で画面に出る、説明文と章 1 場所鐘ヒントで明示。違反なし
- **R-D 型から始める**: v07 chord 1 + v08 chord 2 構造抽象 (`evalWhy` パターン) を完全並列で複製 = 守の延長。独自要素は evalPlace1 1 つ追加 + reDeduceCh1 で place1 re-eval 追加 + CH2 ハンドラに chord 3 cross-back 1 行。違反なし
- **R-E 対症療法を避ける**: v08 を強化する方向 (核体験 = 章間連鎖網を 2 ペアから 3 ペア + 双方向化)。違反なし
- **R-F 指標**: ヘッドレス不要、試遊で観察可能。違反なし
- **R-G target**: 「v08 を試遊済の 1 回プレイ層」が v09 を初見プレイする想定で、~140-170 秒で 6/6 到達、chord 3 体感は読み順次第で発生。違反なし
- **R-H 解像度**: 「鐘 chord 3 ペア + 双方向化」は造語気味だが「C8 が場所鐘1+共犯場所鐘の決定打 (補強) を兼ねる、章間連鎖網が ch1→ch2 と ch2→ch1 両方向に通る」と実装動詞で書ける。違反なし
- **R-I 着手前批判**: chord 3 ペア化が「面白いか／v08 より良いか」自己判定要、devlog で結論。違反なし

## 7. 着手前批判レビュー

- **懸念 1**: 「evalPlace1 新設で v08 までの場所鐘挙動が変わる (binary → 3 値)、wh=Y のみで鳴っていた経路が C10 必須化」→ 設計理由付きの変更。v07 で動機鐘が binary → 3 値化、v08 で共犯者鐘が binary → 3 値化、v09 で場所鐘1 が binary → 3 値化 = v07-v09 の連続流れと整合 (3 値化サイクル継続)。可
- **懸念 2**: 「C8 が章 1 場所鐘の決定打を兼ねる物語整合性が弱い」→ C8 は「他の物理経路がすべて不適 → 残るのは閲覧室経由動線のみ」の消去法的決定打 = 物語整合は成立。可
- **懸念 3**: 「C2 が evalPlace1 から独立して『鐘判定に効かない物語前提情報』になる」→ v07 で C1/C4 も鐘判定から独立した物語情報になっており、同型 = R-D 守の延長で許容範囲。可
- **懸念 4**: 「chord 1/2/3 ペアが UI で混同される (どの clue が何を兼ねるか覚えにくい)」→ 章 1 / 章 2 説明文に区別明示、ヒント文を 3 系統に分岐。可

4 懸念すべて「可」、R-I の「1 つでも不可/不明があれば棄却」をクリア。

## 8. 完遂時の到達体感 (1 文)

C10 未読 + C8 未読の状態から C8 を既読化した瞬間、章 1 場所鐘 (補強 pending) と章 2 共犯場所鐘 (補強 pending) が同時に `✗ → ⏸` 遷移し、その後 C10 を既読化で **動機鐘 + 場所鐘1 + 共犯場所鐘** の 3 鐘が同時に `⏸ → ♪` 三重和音遷移し、v08 の chord 2 ペアと並んで章間連鎖網が 3 ペア + 双方向化した形に到達する。
