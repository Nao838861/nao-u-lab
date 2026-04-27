# ABA本 One-Button章 6パターン分類を M-30「向こうから来る緊張」のレンズで読み直す

- source: https://abagames.github.io/joys-of-small-game-development-en/restrictions/one_button.html
- author: 長健太(Kenta Cho / @abagames) — 本文 / Ash — 分析・接続
- discovered: 2026-04-28
- discovered_via: log/external_search.log（クエリ "one-button puzzle game design inherent tension reactive mechanics 2026"）
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [one-button, game-design-typology, exogenous-tension, M-30, M-22, ash_onebutton, puzzle-category-C, ABA, anti-pattern]
- concept_nodes: [向こうから来る緊張, 自発リスクのコア化, 型あり筋良し, ワンボタンの6パターン]

## 概念ノード（R-007 外部対応語併記）

- node: **向こうから来る緊張** = exogenous tension / external pacing pressure (Salen & Zimmerman 2003 における "imposed" pressure)
  meaning: プレイヤーの選択ではなく環境/敵/時間が能動的に圧力を生み、その圧力に「死にたくない→行動」で応答するサイクル。M-30 で刻印済
- node: **自発リスクのコア化** = voluntary risk-taking as core mechanic (anti-pattern)
  external: グレイズ機構 (grazing mechanic, Cave / Treasure 系STG業界用語)、サイヴァリアのバズ、クレイジータクシーのカスリ
  meaning: 報酬を取るために自分から危険に近づくサイクル。コアではなくボーナスとして機能するもの
- node: **型あり筋良し** = "established genre + novel core mechanic" pattern
  external: Schell の "established genre with twist" / 桜花一門「型破りの前に型を学ぶ」
  meaning: 確立形式を骨格にして独自部分を派生する設計戦略

## 主張と根拠

### 1. ABA本One-Button章の核心引用（原文）

ABA本人がOne-Button章を貫いて立てる中心命題は2つある。

**命題A**（最終段）: *"it's important to remember that being a one-button game and being an enjoyable game are unrelated. Thus, it's vital to ensure the game is fun, has a sense of exhilaration and tension, well-balanced risk and reward."*

**命題B**（DIVARR節および本文末尾の警告）: *"a game may unintentionally evolve into a repetitive button-mashing or continuous button-holding pattern where players can earn endless points... it's imperative to test for such repetitive play patterns... implementing constraints, such as introducing targets that should not be hit, is necessary to prevent mindless button mashing."*

命題Aは「ワンボタンを設計目標にするな、楽しさを設計目標にしてからワンボタンに翻訳しろ」と読める。命題Bは「ボタン入力に外部からのフィルタ/敵対要素がないと、入力は無限点稼ぎに退化する」と読める。両者は「ボタン1つ自体には何の緊張もない、緊張は外部から入れる必要がある」という1つの主張の裏表である。

### 2. ABA本 6パターン分類（原文に基づく）

| # | パターン名 | 代表例 | ボタン入力の役割 | 緊張源 |
|---|---|---|---|---|
| 1 | Unique Actions (Button Press) | CYWALL(瞬間移動)、DIVARR(分裂)、JUMP ON(分岐)、NS CLIMB(極性反転) | 押下=即時アクション | 環境配置 + アンチパターン警告対象 |
| 2 | Hold-Down Button Actions | NUMBER BALL(角度蓄積)、FROOOOG(跳躍距離)、PIN CLIMB(伸縮)、EMBATTLED(無敵時間と引換え)、REFLECTOR(壁を削って反撃) | 押し続けでアナログ量蓄積 | 蓄積中に外部から弾/障害が向かってくる |
| 3 | Combining Multiple Actions | SCRAMBIRD(羽ばたき+発射)、BOMB UP(爆弾投下+自機ブースト) | 1ボタン=複合効果 | 複合効果の副作用が向こうから来る |
| 4 | Rotational/Timing-Based | ORBIT MAN(回転する跳躍方向)、ARCFIRE(回転する砲身) | タイミング合わせ | **回転自体が外部時計、外部から圧力を運ぶ** |
| 5 | Terrain-Based Variation | TURBULENT(海面で跳躍方向変化)、SUB JUMP(水中/水面で役割切替) | 同入力が地形で変化 | 地形が外部状態として存在 |
| 6 | Item-Based Mechanics | MIRROR FLOOR(コイン取得で重力反転)、REBIRTH(トラック衝突で世界反転)、R WHEEL(アイテムで武器化) | 取得選択 | アイテム配置が外部から圧力を運ぶ |

### 3. 緊張源の分類軸を「向こうから来るか」で再分類

ABAの6パターンを「緊張がプレイヤー側から発生するか / 外部から来るか」で再分類すると、明確に分かれる。

**外発緊張型（向こうから来る、M-30 適合）**:
- パターン2 Hold-Down: REFLECTOR の「壁を削って反撃」は壁=外部資源、敵=外部脅威
- パターン4 Rotational: 回転は外部時計、プレイヤーは「合わせる」だけ
- パターン5 Terrain-Based: 地形は外部、プレイヤーは「読む」だけ
- パターン6 Item-Based: アイテム配置は外部、プレイヤーは「拾うかどうか」を選ぶだけ

**ハイブリッド型（外部要素あり、ボタン入力でアクション選択）**:
- パターン1 Unique Actions: CYWALL/JUMP ON は外部（敵/障害物）に対する反応として動作
- パターン3 Combining: BOMB UP は爆発が外部に作用、副作用も外部から戻る

**自発リスク型（プレイヤー側から発生、M-30 違反候補、ABAは命題Bで明示警告）**:
- パターン1 のうち DIVARR(分裂で点数稼ぎ) → ABA自身が "introducing targets that should not be hit" を必須対策として明示
- 「targets that should not be hit」を入れない DIVARR = mindless button mashing

つまりABA自身、「外部からの否定要素（撃ってはいけない標的）」を入れないとボタン入力は退化することを命題Bで明示している。これは Nao_u 04-27 22:04 の指摘**「自分からリスクを取らないと何も起きないゲームは退屈で、わざわざリスクを取りにいかないと点が取れないのはストレス」**と構造同型である。

## 我々の分析・体験接続

### 4. ash_onebutton v04 を ABA 6パターンで採点

ash_onebutton v01-v04 を ABA 6パターンに当てはめると、骨格はパターン1 Unique Actions（押下＝移動方向反転）に該当する。だが v02 で導入された「紙一重ボーナス」（反転時に近接落下物があれば金リング+CLOSEスコア）は、ABA分類のどのパターンにも該当しない**自発リスク型グレイズ機構の追加**である。

| 観点 | ABA本の処方 | ash_onebutton v04 の状態 |
|---|---|---|
| 命題A: 楽しさが先 | 楽しさを設計→ワンボタンに翻訳 | ワンボタンを先に決定→楽しさを後付け（紙一重で楽しさ追加を試みた） |
| 命題B: 退化対策 | 外部から「撃ってはいけない標的」を入れる | 外部から圧力を入れず、自発リスク誘導でスコアを稼がせる |
| パターン適合 | 6種のいずれかに型を借りる | パターン1+自発リスク型グレイズの混合（カスリ系がコアに昇格） |

Nao_u 22:04 の批判**「サイヴァリアのバズシステムや、クレイジータクシーのカスリなどがあるが、これらは一般的に楽しいとは言い難い。それなしでもゲームが成立する状態になっているところで、上級者向けのボーナスとして存在することでスコアアタックの上限を上げる効果はあるかもしれないが、それ自体をコアメカニズムにするのは難度が高そう」**は、ABA分類で言えば「グレイズ機構はパターン6 Item-Based の派生として外部側に置けば機能するが、パターン1のボタン入力直結報酬としてコアに置くと退化する」という再現可能な型ルールに翻訳できる。

### 5. M-30 と ABA命題Bの構造同型

memory/game_lessons_log.md M-30（2026-04-27 刻印）:
> コアメカニズムの緊張は向こうからやってくるべき——「自分からリスクを取らないと点が取れない」はコアではなくボーナス

ABA本命題B:
> targets that should not be hit を入れて mindless button mashing を防ぐ

両者は次の構造を共有する。

```
ボタン入力（プレイヤー側）
    ↓ (もし外部からの否定要素がなければ)
無限点稼ぎ / 自発リスク取りに行くだけのストレス
    ↑ (外部からの否定要素を入れると)
「死にたくない」/「撃ちたくない」が能動的に発生 → 行動 → 快感
```

M-30 は ash_onebutton v01-v04 の体験から内発的に刻印された教訓だが、ABA本命題Bは2021年111本ワンボタンゲーム制作の一般化として書かれている。**つまり我々の M-30 はABA一次資料による外部裏付けを既に持っていた、ということが今回の分析で判明した**。これは記憶階層運用の含意がある（後述 §未解決の問い #2）。

### 6. パズル系（カテゴリC）次作の題材選定への接続

next_tasks t-260428021140-7b77「Ash 次作: パズル系（カテゴリC: 型あり筋良し）の題材選定」に対し、ABA 6パターンは骨格借用候補のショートリストを提供する。

**カテゴリC適合度評価**（カテゴリC=型あり筋良し、確立形式を骨格に借用して独自部分を派生）:

- ◎ パターン6 Item-Based: アイテム配置がパズル要素そのもの。MIRROR FLOOR/REBIRTH は「コインを取る/取らない」がパズル選択。確立形式 = ローグライト×パズル（Blue Prince系列）に直接接続可能
- ○ パターン5 Terrain-Based: 地形が外部状態。SUB JUMP（水中/水面で役割切替）はパズル的状態管理。読み取り設計の余地が大きい
- ○ パターン4 Rotational: ARCFIRE型のタイミングパズル。外部時計の存在で M-30 自動適合
- △ パターン2 Hold-Down: 蓄積を読むパズルは可能だが、アクション色が強くカテゴリAに寄りがち
- × パターン1 Unique Actions: ash_onebutton v01 と同型、型なし化リスクが高い

**現時点の暫定結論**: 次作はパターン6 Item-Based を骨格に借りる。具体的には「アイテム配置をプレイヤーが読み、取得選択でゲーム状態が反転する」型。Blue Prince の「ノートを意図的に提供しない＝知識をリソース化する」設計（external_notes_mir L333-346）と組み合わせると、**プレイヤーが外部情報（盤面）を読み解くこと自体が緊張源になる**——これは M-30 の「向こうから来る緊張」のパズル系翻訳になる。

### 7. ABA本人を一次資料として読むべきタイミング

ABA本「Joys of Small Game Development」のOne-Button章を Ash が直接読むのは**初めて**である（reference_aba_joys_small_gamedev_book_20260422.md は TOC地図のみ、本文未取得）。命題A/B が我々の M-30 と構造同型であることが判明したのは今回が初めてで、これは Nao_u 2026-04-27 09:00 の指摘**「他人の作った基準に踊らされないで」**に対する1つの応答にもなる——我々の M-30 は他人の基準を借りたのではなく、ash_onebutton v04 の失敗から内発的に刻印されたが、後から ABA本に裏付けが見つかった。順序が「内発→外部裏付け」であって「外部基準→内発適用」ではない、ということが価値を持つ。

## 接続先

- **beliefs**: B028（型あり筋良し戦略）、M-30 を裏打ちする外部一次資料の補強
- **articles**:
  - knowledge/20260409_abagames_constraint_creativity_pipeline.md（ABA 3層アプローチの導入分析）
  - knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md（ABA juicy 章との対比、ash_onebutton v02 の出発点）
  - knowledge/20260422_aba_agent_gamedev_feedback_loops.md（ABAのフィードバックループ）
- **projects**:
  - projects/INDEX.md「次作パズル系題材選定」（Ash 起票候補、本記事を着手前必読資料に指定）
- **game_lessons_log**:
  - M-30（コアの緊張は向こうから来る）— 本記事は外部裏付け
  - M-22（型破りではなく形無し）— ABA命題Aがカテゴリ準拠の必要性を強化
  - M-12（罰ではなく報酬）— 自発リスクのコア化が罰駆動と同根、ABA命題Bが警告
  - M-29（v系列膨張）— ash_onebutton v01-v04 はM-29を踏んでいる
- **memory**:
  - memory/feedback_self_risk_core_pitfall.md（M-30詳細処方）
  - memory/reference_aba_joys_small_gamedev_book_20260422.md（TOC地図、本文取得は今回が初）
- **concept_graph**:
  - 「向こうから来る緊張」 → ABA命題B / M-30 / Nao_u 04-27 22:04 の3点接続
  - 「型あり筋良し」 → ABA 6パターン分類が型ライブラリとして機能

## 未解決の問い

1. **パターン6 Item-Based を骨格にした場合、Blue Prince の「ノート不提供＝知識リソース化」を入れる時、プレイヤーが何を読み取るのか具体化できるか？**
   候補: 盤面の「次に置くアイテムによって反転する世界の予測」が読み取り対象。だが具体的なゲームメカニクスとしての落とし込みが未定。次作 Q-A/B/C で書き出す。

2. **我々の M-30 が ABA命題B の独立再発見だったとすれば、他にも独立再発見した教訓があるはずで、それを ABA本/外部一次資料と照合する作業を体系化できないか？**
   game_lessons_log.md M-01〜M-30 のうち、外部一次資料での裏付けが取れる可能性があるのは M-12（罰ではなく報酬）/ M-15（快感を削った改修）/ M-22（型破りではなく形無し）/ M-25（UIで示せばわかるはず）あたり。各 M に対して外部一次資料を1本探す作業を Phase 1/2 のサブタスクとして恒常化する案。

3. **ABA本 命題A「ワンボタンを目標にするな、楽しさを目標にしてからワンボタンに翻訳しろ」を、我々のゲーム制作プロセスの Q-A/B/C 着手前ゲートに翻訳できないか？**
   現行ゲートは「型はあるか/緊張は向こうから来るか/コア用途の先行例3本」（M-22+M-28、後 M-30 追記）だが、命題A準拠なら「楽しさを先に1文で書けるか / そこから入力制約に翻訳した結果として現れるか」を最上位に置く案がある。次サイクルで game_dev_foundation.md に提案。

4. **パターン4 Rotational を借りた場合、ash_onebutton v01 の「方向反転」と本質的に何が違うのか？**
   仮説: パターン4 は「外部時計が回転、プレイヤーがタイミングを合わせる」、v01は「プレイヤーが任意のタイミングで反転、方向そのものは内部状態」。違いは「時計の所在」。これを実装で確かめると、外発緊張のメカニズムが分離できる可能性がある。次作の比較実験候補。
