# log_mystery v08 — brainstorm (C236 Phase 4)

## 1. 起点

v07 devlog §7 で予告した「(b) chord 構造の章間拡張: 章 1 C3 (司書の解雇通告書) を章 2 容疑者鐘の決定打にも兼任させる第 2 chord ペア追加 = chord 2 ペアで章間連鎖網化」を v08 で実装する。v07 までで「2 章 / 6 鐘 / 章間 chord 1 ペア (C10 → 動機 + 共犯場所)」が完遂、その上に第 2 chord ペア (C3 → 動機 + 共犯者) を最小差分で追加する。v01 から守ってきた構造抽象 (`bellRow` / `bellState` / `evalXxx` / `reDeduceXxx` / `bell-pending` クラス) を一切壊さず、`evalSuspect2` 新規追加 + クリックハンドラ 1 行追加 + C3 文面拡張で成立させるのが v08 の到達点。

## 2. 第 2 chord ペア候補 3 案 brainstorm

### 案 A: C3 → 動機 + 共犯者 chord (採用候補本命)

- 章 1 C3 (司書の解雇通告書) を、章 2 共犯者鐘 (蔵元) の決定打手がかりとしても再利用する
- 物語: 解雇通告書の余白に館主の手書きで「後任には古書商・蔵元を充てる」と記されており、七尾にとって「自分の二十年を奪い明け渡す相手 = 蔵元」となる。共犯候補としても、七尾と利害が深く絡む人物として蔵元が第一候補に挙がる
- C3 既読化が `reDeduceCh1` (動機鐘) + `reDeduceCh2` (共犯者鐘) を同時発火 = chord 構造
- evalSuspect2 新規追加: `c6 && (c7 || c3)` 形 (evalPlace2 と完全並列)
- v07 構造抽象を 1 ミリも壊さない

### 案 B: C7 → 章 1 動機 の逆方向 chord

- 章 2 C7 (蔵元の現金需要) を、章 1 動機鐘の決定打にも再利用する
- 物語: 蔵元の負債圧迫 → 七尾が「金で動く相手」を見つけた経緯 → 七尾の動機が「単独怨恨」から「共謀計画前提の怨恨」に解像度上がる
- ただし C7 が読めるのは章 2 アンロック後、章 1 動機鐘が ⏸ 保留中 → 章 2 進めない (v07 の lock 仕様)
- 逆方向 chord は v07 案 B と同じ理由で構造変更必要 → 棄却 (R-D 守違反)

### 案 C: chord 2 ペアの演出強化先行

- chord 発火を画面で可視化 (画面フラッシュ / 鐘の音響 / 紐付き表示) して同時鳴り直し体感を視覚強化
- chord 構造を増やすのではなく既存 chord 1 ペアの体感を強化
- v07 devlog §7 (f) と一致するが「構造を伸ばさず演出だけ盛る」= R-D 守の範疇に留まる
- v08 候補 (f) は v09 以降に温存、まず chord 2 ペアで構造伸ばす → 棄却

## 3. 採用案: A (C3 → 動機 + 共犯者 chord)

選定理由:
- v07 §7 (b) の素直な実装、最小差分、v07 chord 1 ペア構造抽象を完全並列で複製
- 物語的整合性が成立 (解雇通告書に後任候補名指し → 共犯候補特定材料化)
- 「決定打 1 つで 2 鐘が同時に再判定される」体感が章間に 2 ペア成立 = 「章間連鎖網」の最小単位
- v07 章間 chord 1 ペア構造の上に chord 2 ペア化 = R-D 守の延長

### evalWhy 微調整 (chord 2 自然発火の前提条件)

v07 まで `evalWhy` は `c3 && c10` 形 = C3 必須。これだと章 2 アンロック時点で C3 必読 → 章 2 推理時点で `evalSuspect2` の C3 既読が確定 → 共犯者鐘 pending 状態を作れず chord 2 が自然発火しない問題が発生。

v08 では evalWhy を `c10 ? hit : (c3 ? pending : false)` 形に微調整 = **C10 単独で動機鐘決定打**、C3 は補強材料に降格。これにより:

- 章 1 で C3 を読み飛ばして C10 だけ既読化 → 動機鐘 ♪ → 章 2 アンロック (v07 と異なる経路)
- 章 2 で C5, C6, C8 のみ既読 (C7, C9 未読) → 章 2 推理 → 共犯者鐘 ⏸ + 場所鐘 ♪ (chord 1 経由)
- C3 既読化 → 共犯者鐘 ♪ (chord 2 単独発火、自然プレイ経路で体感可能)

evalWhy 改修により C10 の決定打性が更に強化 (v07 では C10 は動機鐘+場所鐘 chord 決定打、v08 では動機鐘単独決定打 + 場所鐘 chord 決定打)。物語整合: C10 司書日誌は「怨恨確定 + 蔵元への謀議段取り」を両方含む = 動機決定打として C3 通告書より強い、という整合性が成立。

## 4. 実装スケッチ

### CLUES_CH1 C3 文面拡張

v07: 「司書・七尾は事件直前、館主から『来月で辞めてもらう』と書面で通告されていた。動機の方向としては怨恨・金銭・相続のいずれかが想定されるが、この通告書面だけでは決め手にならない。」

v08: 「司書・七尾は事件直前、館主から『来月で辞めてもらう』と書面で通告されていた。動機の方向としては怨恨・金銭・相続のいずれかが想定されるが、この通告書面だけでは決め手にならない。同じ通告書の余白には館主の手書きで『後任には古書商・蔵元を充てる』と記されており、七尾にとっては「自分の二十年を奪い、明け渡す相手」が蔵元になる。共犯候補としても、七尾と利害が深く絡む人物として蔵元が最初に挙がる材料がここで揃う。」

### evalWhy 改修 (C10 単独決定打化)

```js
function evalWhy(wy) {
  if (wy !== ANSWER_CH1.why) return { hit: false, pending: false };
  const c3 = CLUES_CH1.find(c => c.id === 3).read;
  const c10 = CLUES_CH1.find(c => c.id === 10).read;
  if (c10) return { hit: true, pending: false };  // v08: C10 単独決定打
  else if (c3) return { hit: null, pending: true };
  else return { hit: false, pending: false };
}
```

### evalSuspect2 新規追加

```js
function evalSuspect2(w2) {
  if (w2 !== ANSWER_CH2.who2) return { hit: false, pending: false };
  const c6 = CLUES_CH2.find(c => c.id === 6).read;
  const c7 = CLUES_CH2.find(c => c.id === 7).read;
  const c3 = CLUES_CH1.find(c => c.id === 3).read;  // 章間 chord 2 参照
  if (c6 && (c7 || c3)) return { hit: true, pending: false };
  else if (c6) return { hit: null, pending: true };
  else return { hit: false, pending: false };
}
```

evalPlace2 と完全並列構造 (c6 が base、c7 が [補強] 章内、c3 が章間 chord)。C7 を `isExtra: true` 化して [補強] タグ表示。

### deduceChapter2 / reDeduceCh2 改修

```js
function deduceChapter2() {
  // ... (省略) ...
  const who2Eval = evalSuspect2(w2);
  const motive2Hit = (m2 === ANSWER_CH2.motive2);
  const place2Eval = evalPlace2(p2);
  bellState.who2 = { hit: who2Eval.hit, value: w2, pending: who2Eval.pending };
  // ...
}

function reDeduceCh2() {
  if (!chapter2Deduced) return;
  const w2 = bellState.who2.value;
  const p2 = bellState.place2.value;
  if (w2) {
    const who2Eval = evalSuspect2(w2);
    bellState.who2 = { hit: who2Eval.hit, value: w2, pending: who2Eval.pending };
  }
  if (p2) {
    const place2Eval = evalPlace2(p2);
    bellState.place2 = { hit: place2Eval.hit, value: p2, pending: place2Eval.pending };
  }
  renderResult2();
}
```

### CLUES_CH1 クリックハンドラに章 2 chord 2 発火追加

```js
div.onclick = () => {
  c.read = !c.read;
  renderClues();
  if (chapter1Deduced) reDeduceCh1();
  if (chapter2Deduced && (c.id === 10 || c.id === 3)) reDeduceCh2();  // chord 1 + chord 2
};
```

### UI 説明追記

- 章 1 説明文末尾: 「※ C3 は章 2 容疑者鐘の決定打も兼ねる (chord 2 ペア目)、C10 は章 2 共犯場所鐘の決定打も兼ねる (chord 1 ペア目)」
- 章 2 共犯者鐘ヒント新規追加: 「[補強] タグ付き手がかり (章 2 の C7) または 章 1 の C3 (解雇通告書) を既読化すると共犯者の鐘が再判定されます」
- 章 2 共犯場所鐘ヒント維持 (v07 通り)

### meta 文末更新

v07: 「v07 = 6鐘 + 動機鐘・場所鐘 3 値化 + 章 1 C10 が動機+共犯場所の chord 決定打 (章間連鎖 1 ペア)」
v08: 「v08 = 6鐘 + 動機鐘・場所鐘・共犯者鐘 3 値化 + C10 chord 1 ペア + C3 chord 2 ペア (章間連鎖網 2 ペア)」

## 5. 第 2 chord ペア発火条件 / 非発火条件

| シナリオ | C3 | C6 | C7 | 共犯者鐘 |
|---|---|---|---|---|
| 章 2 のみ完全読了 | * | ✓ | ✓ | ♪ 鳴る (C7 経路) |
| C3 経路 (C7 省略) | ✓ | ✓ | × | ♪ 鳴る (v08 新規 chord 2 経路) |
| 両方の決定打既読 | ✓ | ✓ | ✓ | ♪ 鳴る (どちらの経路でも鳴る) |
| 弱手がかりのみ | × | ✓ | × | ⏸ 保留 (v07 通り) |
| 容疑者手がかり弱い | * | × | * | 鳴らない (C6 が必須) |

C6 (蔵元が現場に居た + 共謀提案噂) が前提条件として残り、C7 (蔵元の現金需要 [補強]) と C3 (解雇通告書の後任名指し) のどちらかが決定打として機能。**章 1 で C3 を読み飛ばして C10 だけ既読化** → 章 2 アンロック後 C5,C6,C8 のみ既読 → 章 2 推理時点で共犯者鐘 ⏸ 保留 → C3 を遡って既読化すると共犯者鐘 ♪ 鳴る体感 = chord 2 自然発火経路。

## 6. R-A〜R-I 抽象ルール照合

- **R-A 体験から設計**: 「鐘の同時鳴り直し体感」を chord 2 ペア化で「章間連鎖網の最小単位」に拡張 = 核体験を強化。違反なし
- **R-B 緊張は外発**: 自発リスクなし、罰駆動なし。違反なし
- **R-C 見えないものは存在しない**: chord 2 発火は `⏸ → ♪` の遷移で画面に出る、説明文と章 2 共犯者鐘ヒントで明示。違反なし
- **R-D 型から始める**: v07 構造抽象 (`evalPlace2` パターン) を完全並列で複製 = 守の延長。独自要素は evalSuspect2 1 つに絞る + evalWhy 微調整 1 箇所。違反なし
- **R-E 対症療法を避ける**: v07 を強化する方向 (核体験 = 章間 chord 連鎖を 1 ペアから 2 ペアに増やす)。違反なし
- **R-F 指標**: ヘッドレス不要、試遊で観察可能。違反なし
- **R-G target**: 「v07 を試遊済の 1 回プレイ層」が v08 を初見プレイする想定で、~130-160 秒で 6/6 到達、chord 2 体感は読み順次第で発生。違反なし
- **R-H 解像度**: 「鐘 chord 2 ペア」は造語気味だが「C3 が動機鐘+共犯者鐘の決定打を兼ねる、C10 が動機鐘+共犯場所鐘の決定打を兼ねる」と実装動詞で書ける。違反なし
- **R-I 着手前批判**: chord 2 ペア化が「面白いか／v07 より良いか」自己判定要、devlog で結論。違反なし

## 7. 着手前批判レビュー

- **懸念 1**: 「evalWhy 改修で v07 動機鐘挙動が変わる」→ v07 では C3+C10 両方必須で動機 ♪、v08 では C10 単独で ♪。C3 が動機補強材料から共犯者決定打に役割移動 = 設計理由付きの変更。可
- **懸念 2**: 「物語的整合性 (解雇通告書が共犯者特定の決定打になるのは強引)」→ 解雇通告書に「後任候補に蔵元」と書かれていれば、七尾の利害が絡む対象として蔵元が共犯候補第一に挙がる物語整合は成立。可
- **懸念 3**: 「章 1 で C3 を読み飛ばす経路が自然か」→ 章 1 既読 5/5 を強制しないので C3 省略は自然。C10 だけで動機鐘 ♪ なら 章 2 アンロック可。可
- **懸念 4**: 「chord 1 ペアと chord 2 ペアの混同が UI で起きないか」→ 章 1 説明文に「C3 → 共犯者鐘 chord 2、C10 → 共犯場所鐘 chord 1」と区別明示。可

4 懸念すべて「可」、R-I の「1 つでも不可/不明があれば棄却」をクリア。

## 8. 完遂時の到達体感 (1 文)

C3 を既読化した瞬間、章 1 動機鐘 (補強) と章 2 共犯者鐘 (決定打) の片方または両方が `⏸ → ♪` 遷移し、v07 の C10 chord 1 ペアと並んで章間 chord 2 ペア構造が成立、決定打 2 つで章間 4 鐘が連鎖する「章間連鎖網」の最小単位 (2 ペア) に到達する。
