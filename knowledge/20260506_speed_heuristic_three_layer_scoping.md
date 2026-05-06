# 速度ヒューリスティックと事前批判の3層切り分け — ktch9541 / Mark Brown / toRisouP / xiombatsg 統合分析

- source:
  - https://x.com/ktch9541/status/2051545808856875267 (ktch9541 2026-05-05)
  - https://gmtk.substack.com/p/how-to-find-amazing-game-ideas (Mark Brown / Game Maker's Toolkit)
  - https://x.com/toRisouP/status/2051641423976599634 (toRisouP 2026-05-05)
  - https://x.com/xiombatsg/status/2051489698879779095 (xiombatsg 2026-05-05)
- author: 上記4名
- discovered: 2026-05-06
- discovered_via: Phase 1 (twitter_recommended_20260506.txt + log/external_search.log L13)
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game_design, idea_evaluation, speed_heuristic, multi_idea_harness, clone_strategy, cycle_governance]
- concept_nodes:
  - **多案harness** = multi-idea harness — 1案飛びつき禁止の上流規律
  - **守破離の守の足切り** = template-acquisition gating — 型獲得段階での候補ゲーム選定
  - **批判的事前評価** = pre-implementation critical evaluation — 単一案実装着手前の懸念潰し
  - **軌道修正前提** = course-correction-by-default (Boyd OODA loop / agile dev) — 実装中の判断更新規律
  - **連綿たるノウハウアセット** = cumulative know-how asset (institutional knowledge / cross-project tacit transfer) — 複数ゲーム横断の外側ループ

## 主張と根拠

### 4つの外部発話を一直線に並べると、表面的な矛盾が見える

**ktch9541 (2026-05-05)**:
> 良いアイディアの条件は「速く作れること」だなと。ゴールが明確で迷いにくい、面白さが次々広がるので意欲が途切れない、ややこしい部分が少なくシンプル。やたら時間がかかる案はその時点でほぼ失敗とも言える。

**Mark Brown「How to find amazing game ideas」(gmtk.substack.com)**:
> 1〜2日でプロトタイプできない案は1〜2年経っても完成しない。

この2人は同型——**速度を足切り基準として使え**、と言っている。

**toRisouP (2026-05-05)**:
> 「絶対に判断を間違えずに、最初に完璧な計画を建てから始める」は初動が遅れる上に条件が変わった瞬間にすべてが崩壊する。「判断は間違える」「前提条件は変わる」を織り込んだ上で、間違ってたら謝って軌道修正しながら進める方がいい。

これも速度寄り——**完璧な事前評価を諦めて、軌道修正前提で動け**と言う。

**xiombatsg (2026-05-05)**:
> ゲームっていうのは1作品完結ではなくて、連綿と引き継いで作り続けていくノウハウアセットとかがあって成り立つ。開発会社コロコロ変わってるとここが培われない。

これは作品単位の速度ではなく**複数作品横断の蓄積を語っている**——時間軸が違う。

### しかし我々の MEMORY.md には逆方向の規律が固定されている

[feedback_critical_evaluation_before_implement.md](../memory/feedback_critical_evaluation_before_implement.md)（Nao_u 2026-04-30 21:36 #game-rights、brick_log v01 全否定事件起源）はこう書く:

> 作る前から予測可能な懸念点を列挙→解決可否判定→**未解決のまま着手禁止**。「要観察」「要実プレイ確認」で先送りするな。

「速く作れることが良いアイディア」(ktch9541) と「未解決のまま着手禁止」(Nao_u) は、表面だけ読むと矛盾する。前者は「速度をゲートに」、後者は「事前評価をゲートに」と言っている。

### 矛盾しない——3層の射程が違うだけだ

| 層 | 段階 | 機能する規律 | 該当する外部発話 / 内部規律 |
|---|---|---|---|
| **L1 多案 harness（候補生成→絞り込み）** | アイデア複数案 → 1案選定 | **速度ヒューリスティック**: 速く作れない案は足切る | ktch9541「速く作れる」/ Mark Brown「2日プロトタイプ閾値」 |
| **L2 単一案実装着手前** | 1案選定 → コード書き始め | **批判的事前評価**: 予測可能懸念を列挙→解決→未解決なら着手禁止 | feedback_critical_evaluation_before_implement.md（Nao_u 04-30 brick_log v01 事件起源） |
| **L3 実装中** | コード書き始め → 完成 | **軌道修正前提**: 条件変化に応じて方針更新、間違いを抱え込まない | toRisouP「軌道修正しながら進める」 |
| **L0 複数作品横断（外側ループ）** | 1作品完成 → 次作品着手 | **連綿たるノウハウアセット**: 守破離の「守」を通過点として複数作品横断で型を蓄積 | xiombatsg「連綿と引き継ぐ」/ feedback_clone_strategy.md（Nao_u 2026-05-05 15:11） |

3層は直列に通る。同時に同じ案件に対して矛盾しない。

- L1 で「2日プロトタイプ可能か」を足切ると、L2 で批判的に検討する案件数が減る → L2 の慎重さが負担過剰にならない
- L2 で「予測可能懸念を全部潰してから着手」すると、L3 で軌道修正する対象が「予測不可能だった事象」だけに絞られる → L3 の柔軟性が浪費されない
- L0 の「ノウハウアセット蓄積」が機能していると、L1 で出る案の質が次の周回で上がる → 結局 L1〜L3 全体が速くなる

### 矛盾の根は「層の取り違え」

過去の私（Ash）が brick_log v01 cross_review で踏んだのは **L1 と L2 の取り違え** だった。「BACK!ポップアップは中心視野で文字を読ませる、要実プレイ確認」と書いて先送りしたのは、L2 の「未解決懸念→着手禁止」を L3 の「軌道修正前提」で擁護した動きだ。Nao_u 04-30 21:36 全否定はそこを突いていた——「実プレイ確認必須」は L3 では正しいが、L2 では希望的観測の擁護にしかならない。

逆に、L2 の規律を L1 に持ち込むと別の事故になる——多案 harness 段階で各案を「未解決懸念ゼロ」になるまで詰めると、複数案を持ち寄る前に1案が肥大化して、結局1案飛びつきと同じ結果になる。L1 では「速く作れるか」だけが足切りで、懸念は「想像可能なら列挙する」程度で良い（落とすべきは速度で、慎重さではない）。

## 我々の分析・体験接続

### 接続点1: feedback_multi_idea_harness.md の足切りゲート未明文化

L1 の規律は MEMORY.md の [feedback_multi_idea_harness.md](../memory/feedback_multi_idea_harness.md) (Nao_u 05-01 04:51 #game-rights) に対応するが、現状の本文は「複数案生成→批判的レビュー→相乗効果探索→最良案でのみ実装」と書かれていて、**足切り基準が明示されていない**。複数案を出した後どう絞り込むかが、外部の「速度ヒューリスティック」を通すと「2日プロトタイプ閾値」が候補になる。

具体的な実装提案: `feedback_multi_idea_harness.md` に「Step 3.5: 各案について『2日でプロトタイプ可能か』を判定列に追加。不可能な案は L2 に進めない」を追記する。これは外部論者2人（ktch9541、Mark Brown）が独立到達している基準で、私的造語ではない。

### 接続点2: brick_log v01「裏抜けカウンタ」事件の再診断

事件の本来の診断は「未解決懸念のまま着手」(L2 違反) だった。だが層の切り分けで見直すと、**L1 でそもそも足切れた**可能性も浮かぶ：

- 「裏抜けカウンタ」案は「速く作れる」か？ — Yes（実装は数十分）
- 「ゴールが明確で迷いにくい」か？ — No（L7 の認識で「裏抜け到達は40秒〜1分」、プレイヤーが意図に到達する前に意味不明文字列が出る、ゴールの解釈が必要）
- 「ややこしい部分が少なくシンプル」か？ — No（自明の楽しさを文字列で上書きする時点で「シンプルな改善」ではなく「解釈追加」）

**ktch9541 基準を L1 で先に通していたら、L2 まで案が降りてこなかった**。L2 で慎重に詰めるよりも、L1 で速く落とす方が事故は減る。これは feedback_critical_evaluation_before_implement.md を否定するのではなく、その上流の L1 でも同等の足切り力が要るということだ。

### 接続点3: clone+1 戦略 (feedback_clone_strategy.md) は L0 にも効く

xiombatsg「連綿と引き継ぐノウハウアセット」は、Nao_u 2026-05-05 15:11 #game-rights「クローン戦略=守の段階で型を獲得する一連のフロー、守は通過点であってゴールではない」(feedback_clone_strategy.md 起源) の外部側裏付けに完全一致する。

「守は通過点」は L0 の語彙——1作品の中で守を抜けるのではなく、複数作品にわたって「守 → 守 → 守 → 破」と進む。xiombatsg が言う「開発会社コロコロ変わってるとノウハウが培われない」は、L0 のサイクルが切断されると L1〜L3 の品質も上がらないことを言っている。我々の場合「会社が変わる」相当は **インスタンス変更 / プロジェクト変更 / 記憶階層の reset** で、ここを途切れさせない設計が L0 の運用課題になる。

### 接続点4: graze_log v02 / brick_log v07 への適用

Phase 1 で確認した今サイクル本丸 = `graze_log/v02` の cross_review 提案 (3〜5箇条) を #game-rights に投稿。提案を書く際、3層を意識して書く:

- L1 提案 = 「v03 で何を作るか」: 2日プロトタイプ可能な独自要素1個に絞れているか
- L2 提案 = 「v02 から v03 に何を引き継ぐか」: 予測可能懸念がゼロのものだけ
- L3 提案 = 「v03 実装中の停止条件」: 軌道修正がいつ発火するか

層を混ぜずに3項目以上書ければ、cross_review として有用な提案になる。

## 接続先

- **beliefs**: B016 「自律サイクルの価値は処理量ではなく『判断の質×修正能力』で決まる」 — L1 速度＋L2 慎重＋L3 軌道修正の組み合わせは、まさに「判断の質×修正能力」を3層に分解した形
- **articles**:
  - [20260501_knshtyk_layer_contamination_unverified_numbers_sokoban_v01.md](20260501_knshtyk_layer_contamination_unverified_numbers_sokoban_v01.md) — 多案 harness の起源
  - [20260427_aba_juiciness_close_call.md] (関連: ABA本「Joys of Small Game Development」 One-Button章) — 速度ヒューリスティックの ABA 側裏付け
  - log/external_search.log L7-L9 — 関連外部検索クエリ群
- **projects**:
  - `projects/INDEX.md` Active 全般 — 多案 harness を通る前のプロジェクトはない
  - `memory_consolidation_20260504.md` (Ash担当未着手) — 本記事はその先送り材料の1つ。L1 足切りゲートの追記は consolidation 第一波で扱う候補
- **memory feedback**:
  - [feedback_multi_idea_harness.md](../memory/feedback_multi_idea_harness.md) (L1 規律、足切りゲート未明文化)
  - [feedback_critical_evaluation_before_implement.md](../memory/feedback_critical_evaluation_before_implement.md) (L2 規律)
  - [feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) (L0 規律、xiombatsg 外部裏付け)
  - [feedback_predict_before_human_play.md](../memory/feedback_predict_before_human_play.md) (L2 と L3 の境界、人間プレイ前ゲート)
- **concept_graph**:
  - 多案harness → 守破離の守の足切り (L1 内部)
  - 守破離の守の足切り → 批判的事前評価 (L1 → L2 直列)
  - 批判的事前評価 → 軌道修正前提 (L2 → L3 直列)
  - 連綿たるノウハウアセット → 守破離の守の足切り (L0 → L1 周回フィード)

## 未解決の問い

1. **「2日プロトタイプ閾値」は我々の作業速度で正しい数値か？** — Mark Brown は人間開発者ベース。我々は実装一瞬・思考に時間をかける構造。「思考2日 + 実装数十分」とすべきか、「思考＋実装合計2日」とすべきか。次回 brainstorm で実測候補。
2. **L1 で足切った案を「捨てる」べきか「保留」すべきか？** — xiombatsg「ノウハウアセット」を L0 に効かせるなら、L1 で落ちた案も「速度以外の評価軸では筋が良い」場合、後で再評価できる形で残すべき。だがそうすると保留案が肥大化して L1 の足切り力自体が弱まる。境界設計が必要。
3. **L3「軌道修正前提」と feedback_critical_evaluation_before_implement.md「未解決懸念で着手禁止」の境界条件は？** — 「予測可能だが解決不可能な懸念」はどちらに分類するか。L2 で着手禁止にするか、L3 で軌道修正対象として着手 OK にするか。brick_log v01 事件はここの取り違えだったが、一般則化はまだ書けていない。
4. **xiombatsg「開発会社コロコロ変わってるとノウハウが培われない」の我々への射程は？** — 3インスタンス（Log/Mir/Ash）の独立性は L0 ノウハウ蓄積の阻害要因か、複数視点による促進要因か。両方ある。どちらが優勢かは sense_prediction_log での実測待ち。
5. **L0 を効かせる「連綿たる引き継ぎ装置」は何か？** — knowledge/ 蓄積？ devlog.md 連鎖？ feedback_*.md 累積？ 現状は3つとも走っているが、どれが xiombatsg の言う「ノウハウアセット」に最も近いかは未検証。memory_consolidation_20260504 で扱う候補。
