# ゲーム骨格テンプレート層（game/templates/）

## ステータス
計画起票（2026-04-24 Log）。実装未着手。次サイクル以降の試作。

## 発端
Nao_u 2026-04-24 06:06〜06:10 #nao-u で OpenGame（CUHK MMLab、arxiv.org/abs/2604.18394、https://github.com/leigest519/OpenGame ）を共有し、続けてこう書いた：

> 毎回全てをゼロから積み上げるのではない、なんか型としていろんなゲームの作り方を知っておいて、独自の部分はそこからの派生を自分たちで考えてやる方が効率がいい気はする

OpenGame の中核は GameCoder-27B + Game Skill フレームワーク。Game Skill のうち「Template Skill = 過去の成功経験をプロジェクトの骨格ライブラリに凝縮し、スタート時点で成熟したエンジニアリングの上に立つ」が、Nao_u の言う「型として知っておいて独自部分だけ派生」と同じ方向。

## 我々の現状と欠けている部分

### 既にある
- **失敗型ライブラリ**: `memory/game_lessons_log.md`（M-10〜M-14 / L-01〜L-05）。痛みベースで次作に持ち越す構造は完成している
- **横断レビュー**: `game/cross_review/` の4ファイル。教師付き学習をフィードバックに転写する運用も動いている
- **個別devlog**: `game/avoid_log_01/devlog.md` / `game/avoid_log_02/devlog.md` / `game/study_platformer_01/FEEDBACK.md` / `game/Pot/pot_devlog.md` / `game/log_textadv/README.md`（4ゲート契約）
- **連想ナビ**: `memory/concept_graph.md` + `concept_walk.py`（設計原則レベル）

### 欠けている
**ジャンル骨格の成功パターンを「再利用可能な起点」として固めたテンプレートがない。** 新作に着手する時、過去の骨格を参照したくても、devlog は時系列で読みにくく、成功と失敗が混ざっている。失敗型は game_lessons_log に結晶化済みだが、**成功型の骨格側は毎回 devlog を読み直している**。これが「毎回ゼロから積み上げ」に近い状態を生んでいる。

## 設計方針

### ディレクトリ
`game/templates/<genre>/` を新設。既存の `game/<game_id>/v<NN>/` 2階層（feedback_game_folder_hierarchy.md）とは別系統として並置する。テンプレは「骨格（共通）」「派生ポイント（独自）」「プレイテスト初期観点」の3点セットで書く。

### 初手ジャンル候補（3本の実体験がある領域から）
1. **avoid系**（avoid_log_01/02 から抽出）: 核の楽しさは「AIの自律行動 × プレイヤーの介入手段 × 弾・障害物の連鎖」。失敗蓄積は game_lessons_log M-10〜M-14 に既にある
2. **textadv系**（log_textadv の4ゲート契約 / mir_textadv の結晶）: 最もテンプレ化の恩恵が大きい領域。`log_textadv/README.md` の4ゲート契約がそのまま骨格候補
3. **Pot系**（Pot の feedback/ に成功例と全否定例の両方がある）: 骨格化には元々 Pot 自体が「型のセット」を目指している面があるので、関係整理が先

### 1テンプレ1ファイルの中身（暫定テンプレ）
```
# <genre> 骨格テンプレート

## 核の楽しさ（1行で）
## 最低限の構成要素（ゲームループ / 入力 / 状態 / 失敗条件 / 成功条件）
## 派生ポイント（ここから独自性が出る。チェックボックス式）
## 既出の失敗を避けるゲート（game_lessons_log のどの番号に対応するか）
## 30秒オンボーディング候補（game_design_principles.md 準拠）
## 評価基準の事前固定 vs 実行時開放（このテンプレの立ち位置）
  - 事前固定側（例: 生存時間/スコア/クリア時間）: テンプレ採用時に一意に決める指標
  - 実行時開放側（例: 面白さ/新規性/裏切り度）: プレイテスト後に Nao_u・cross_review が追加で拾う余地
  - npaka123 由来の汚染回避（「1分クリア」型の評価基準押しつけで本来の筋を見失わないため）
## 負荷種別（メモリ/CPU/描画/入力、ニカイドウ由来——どの軸で負荷が立つと重心がぶれるか）
## 改修の性質（構造的 vs 摩擦的、ABA「圧力設計 vs 禁止追加」と同型）
  - 構造的: 核の楽しさの圧力を高める改修（重心に押し込む方向）
  - 摩擦的: 望ましくない遊び方を後付けで禁じる改修（圧力設計の代替として禁止を積む方向）
  - 実装前に1行で性質判定。2個以上連続で摩擦的側に寄ったら重心審問をやり直す（feedback_game_center_of_mass.md 参照）
## 初期プレイテスト観点（ヘッドレス指標 / 人間プレイ注目点）
## 既知実例へのポインタ（game/<game_id>/v<NN>/ 相対リンク）
```

## OpenGame との違い（我々の独自性を潰さない）

- OpenGame の Template Skill は **自動生成用の骨格**（LLMが丸ごと参照して新プロジェクトを一気に生成）
- 我々のテンプレは **人間-AI 対話用の骨格**（Log/Mir/Ash が設計判断する時の参照基盤、Nao_u が読んで介入できる構造）
- 自動生成は後続。先に「人が読める型」を整える。OpenGame の評価指標（構築健全性 / 視覚的利用可能性 / 意図一致）は我々の 4ゲート契約の隣接概念として参考

## 残課題

- [ ] avoid系テンプレート1本を書く（avoid_log_01/02 の devlog から共通骨格を抽出、game_lessons_log の失敗ゲートを埋め込む）
- [ ] textadv系テンプレート1本を書く（log_textadv の4ゲート契約を骨格化。Mir との対話で精度上げ）
- [ ] テンプレート着手前に cross_review/ 全走査（既存の着手前義務）
- [ ] テンプレ使用時の運用ルールを定義（「派生ポイント」を埋めたら cross_review に通知、など）
- [ ] OpenGame の論文（arxiv.org/abs/2604.18394）を読み、Template Skill / Debug Skill の具体内容を確認。うちに取り込むべき構造があるか判定
- [ ] MEMORY.md に1行追加（完成時のみ。試作段階では載せない）

## 関連プロジェクト

- `projects/rlm_skill_prototype.md` — 記憶検索層の穴（2ホップ問題）。テンプレ側は制作知識の整理層。レイヤーが違うが、どちらも「grep 直読みの限界を構造で補う」同じ流派
- `projects/memory_redesign.md` — 記憶階層の再設計。テンプレ層も記憶階層の一部として位置づける余地
- `memory/cross_instance_feedback_cycle.md` — 横断レビュー運用。テンプレは cross_review の結晶化先

## 履歴

### 2026-04-24 (Log): 起票
Nao_u からの OpenGame 共有 + 「型として知っておいて派生」発言を受けて、Slack 応答モードで判断。記憶は「失敗型ライブラリ」まで作っているが「成功骨格テンプレ」は作っていない、という自覚を先に言語化。OpenGame は自動生成用、我々のは対話用、という切り分けを先に置いた（OpenGame をそのまま真似しない）。

実装は次サイクル。Slack 応答モードでテンプレ本体まで書くのは雑になる。最初の1本は avoid系（3本作った実体験がある最も材料が多い領域）が適切と判断。

### 2026-04-24 (Log C114 Phase 3): テンプレに評価軸2項目追加
暫定テンプレ（## 核の楽しさ〜## 既知実例へのポインタ）に2項目追加:
- 「評価基準の事前固定 vs 実行時開放」(npaka123 由来): 1分クリア型の汚染を避けるため、テンプレ時点で決める指標と実行時に拾う指標を分離
- 「負荷種別」(ニカイドウ由来): メモリ/CPU/描画/入力のどの軸で負荷が立つと重心がぶれるか

出自: C114 Phase 2 shared-reads「事前知識 vs 実行時合成の領域依存論」で「評価基準も事前/実行時の2極で設計する」と判明 → テンプレ骨格側に折り返し。K2 実装として 1mm で着地。

### 2026-04-24 (Log C116 Phase 3): 「改修の性質」欄追加
ニカイドウ @R_Nikaido 04-23「ゲームはユーザーに与える負荷がでかい」の1mm折り返し（external_notes_log.md L2100 C113 Phase 2 の持越項目）。C113/114 は負荷種別（ハードウェア軸）の方だけ着地していて、ABA「圧力設計 vs 禁止追加」と同型の「**改修の性質**」が未着地だったと C116 Phase 1 で発見→ Phase 3 で追加。

判定基準を1行で書く運用: 実装前に「構造的/摩擦的」を宣言、2個以上連続で摩擦的側に寄ったら feedback_game_center_of_mass.md に従って重心審問をやり直す。avoid_log v02 の5連禁止（M-11）型の事故を手前で検出する仕組み。

### 2026-04-25 (Mir C119 Phase 3): textadv系骨格テンプレへの担当領域コメント

残課題リスト2項目目「textadv系テンプレート1本を書く」のMir担当領域の準備として、mir_textadv v01-v03の実装経験から「テンプレに必ず入れたい3点」を先出し。テンプレ本体の起草は次サイクル以降だが、判断材料を Log/Ash と共有しておく。

**T-1: パラメータ可視化はワールド内表現に縛る**
mir_textadv_01「画面の隅に数字が浮かぶ」がNao_u 04-19フィードバックで「ADV世界観にUI画面はない前提のはず」と却下された（README.md欠点2）。テキストADVではメタUI語が一発で世界観を壊す。テンプレに「パラメータの世界観内表現が確定するまで実装着手しない」ゲートを置く。game_dev_analysis_mir.md の失敗パターン「メタUI語」を実体化させる箇所。

**T-2: 動的ルール開示は核体験そのものとして設計する（補助機能ではない）**
mir_textadv_01のM-01「思考漏れ」は、Nao_u 04-19フィードバックで「期待感は面白い、これは一つの種」と認定された。理由は「パラメータがbeat 2で初出現する」=動的ルール開示そのものが新鮮さの源泉だったから。逆にmir_textadv_01のパラメータ（信頼度・思考漏れ）は途中で忘れられて死に、M-01の存在意義が崩壊した（欠点2）。テンプレ「派生ポイント」欄に「動的ルール開示が核体験か周辺装飾かを宣言」を必須化。core_experience判定がこの段階でできていないと装飾化する。

**T-3: 主人公identity確立は冒頭beat 1の固定要素として骨格に書く**
mir_textadv_01「主人公不在で読心術獲得が唐突」（欠点1）は、テキストADVの根本的失敗パターン。プレイヤー・主人公・状況設定の三角関係が冒頭で立たないと、後続の核メカニクスが感情移入の足場を失う。Zork型の放り出しはpotテイスト（Nao_u 2026-04-18 00:10指示）として却下されているので、テンプレ最低構成要素に「主人公identity（誰）+ 状況（どこ・なぜ）+ 直前の出来事（何が起きた）」の三点固定を入れる。

**Mir側次サイクル着手予定**:
- log_textadv/README.md の4ゲート契約と上記3点を統合した textadv 骨格テンプレ草案を `game/templates/textadv/draft_v01.md` に書く（未確定パスはLogと相談、`game/templates/<genre>/` 構造採用前提）
- mir_textadv_v01-v03 の opening.md 比較から「冒頭60秒」の必須要素を抽出して骨格に折り返す

**Logとの連携希望**:
- 4ゲート契約の骨格化は Log の元設計領域。骨格テンプレに4ゲートの位置づけ（実装ゲートとして固定 vs 派生ポイントとして調整可）の見解を聞きたい
- avoid系テンプレ（Log着手予定）と textadv系テンプレ（Mir着手予定）の共通骨格項目（Nao_u指示「型として知っておく」が機能するための共通インターフェース）が必要なら、まず avoid 1本完成→骨格項目固定→textadv で検証 の順序が筋が通る

**Phase 3 制約での扱い**: Slack応答モード/Phase 3小さく1mmの原則に従い、本サイクルでの実体テンプレ作成は見送り。判断材料の先出しに留めた。

### 2026-04-26 (Ash C123 Phase 3): 第4候補「整理・収束系（T-04）」追加提案

@ktch9541 落ち葉掃除ゲーム試作（2026-04-24, https://x.com/ktch9541/status/2047599833104720206 ）のknowledge結晶化（`knowledge/20260426_ktch9541_sweeping_leaves_convergence_type.md`）から、初手ジャンル候補に**整理・収束系**を第4候補として登録提案。Log起票の3候補（avoid系/textadv系/Pot系）と並列に置く。

**T-04整理・収束型の定義（外部対応語=tidying game / order management game / aggregate-state-objective game）**: ゴール状態が個別オブジェクト位置ではなく粒団全体の統計量（標準偏差/分散/凝集度）で定義され、プレイヤー入力が場（風/磁場/重力）に作用する型。先行例: Katamari Damacy / Viscera Cleanup Detail / A Little to the Left / PowerWash Simulator / Tetris。

**第4候補として登録すべき3つの根拠**:
- **U-1: 型自体がM-12（罰ではなく報酬）を構造的に内蔵する**。avoid_log_02で繰り返した「ヒット=即死の離散罰→対症療法」（M-11/L-01）と異なり、整理・収束型の失敗条件は「飛散」=連続的状態悪化。M-12「掃除をサボると部屋が散らかる」型と同型構造を**型の選択そのもので強制できる**。設計上の認知負荷低下＝Logが繰り返した avoid v01-v04 の罰駆動失敗を構造的に回避するテンプレ候補

- **U-3: TITAN未踏「面白さ測定」へのヘッドレス測定可能性**。拡散度の時間微分の分散など物理量で「整理の進行速度の単調さ」が取れる。M-10「ヘッドレス✅は面白さ測れない」の例外候補。L-05（指標は誰の行動で最大化されるか）の検証材料が型自体に内蔵される

**Logテンプレ骨格（暫定テンプレ #34-54行）への適合度評価**:
- ## 核の楽しさ（1行で）: 「拡散→集約の方向性のあるエントロピー減少」で書ける
- ## 失敗条件: 「飛散」（連続的状態悪化）を罰なしで実装できる ← M-12内蔵
- ## 既出の失敗を避けるゲート: M-12 / M-17 Q-B / L-04（受動的自滅タイマー）に直接対応
- ## 評価基準の事前固定 vs 実行時開放: 凝集度（事前固定）/ 「手際の良さ」感覚（実行時開放）が綺麗に分離する
- ## 改修の性質（構造的 vs 摩擦的）: 「飛散の懲罰性を上げる」改修は摩擦的（=禁止追加）。「集約の快感を増やす」改修が構造的。型自体が C116 の判定枠と相性が良い

**反証視点（確認バイアス防止）**:
- @ktch9541 試作を**実際にプレイしていない**。Geminiで素早く出した試作で、ツイート3行から推論した骨格。実装次第で「飛散=即時失敗」の罰ベース処理が入っている可能性は否定できない（knowledge記事 分析2 反証視点と同期）
- 整理・収束型はワンボタン制約と直接両立しない（風の向き操作が必要）。「風オン/オフ + 自動向き変化」型なら両立点があるが、設計余地は狭い
- 我々（Log/Mir/Ash）は整理・収束系を**1本も作っていない**。実体テンプレ起票には avoid系・textadv系の本数経験に類する一次資料が必要。実装一次データなしでテンプレ骨格を書くと OpenGame の自動生成型に引きずられる懸念

**運用提案**:
- Log avoid系テンプレ + Mir textadv系テンプレの2本完成 → 共通骨格項目固定 → その後で整理・収束系（T-04）を3本目候補として実装着手判断
- ash_onebutton v02 候補4「整理・収束型への型ジャンプ」（knowledge記事 分析4）の判断は Nao_u フィードバック待ち。**自動着手はしない**
- @ktch9541 と Gemini の制作プロセス（@ai_nikechan / @fladdict と同型）を継続観察対象に登録。LLM支援のゲーム制作プロセス参照点として価値

**Logとの連携希望**: 「avoid系・textadv系の2本目以降の候補リスト」として残課題に「整理・収束系（T-04, knowledge記事参照）」を追加するかは Log 判断に委ねる。本Phase 3では実体テンプレ作成は行わず、第4候補登録の提案のみ。

**Phase 3 制約での扱い**: Slack応答モード/Phase 3小さく1mmの原則に従い、本サイクルでは候補登録提案と根拠3点提示のみ。実体テンプレ作成は型実装経験を待つ。

## 待ち状態 (2026-05-12 C185 Log 更新)

**現在ペンディング状態**=本プロジェクトは「派生元の固定」を待つ stalled。停滞起点 5/5。理由=Nao_u「型として知っておいて派生」指示の派生元（avoid系/textadv系/Pot系/T-04整理収束系の4候補）が固まる前にテンプレ化すると、テンプレ自体が早産になる（型の早産は M-46 不可視ルール堆積罠の前段になりやすい）。**再起動条件**: graze_log v04 が cross_review (Mir 担当宣言済) 経て安定 → avoid_log v04 のシステム骨格 (M-30 外発緊張＋M-39 close-call 物理ゲート) が言語化済の状態で「graze_log v04 ボーナス降格 + 外発緊張」commit が完成 → その時点で1版テンプレ起こす。**観察**: 5サイクル前 (C179) に挙げた骨格 (avoid_log v04) は graze_log v04 brainstorm C179 完走 (commit 97d7a376cd39) で M-37/M-39 が言語化済。あと1段 (cross_review→commit) でテンプレ化トリガー成立予定。

### 2026-05-20 (Log C211 Phase 3): 評価軸外部化 — shooting_assessment_matrix_v0 が template の評価セクションを先に埋める

Nao_u 09:37 broadcast「マリオ1-1 atom を全員で深く掘り下げて考察して今後に反映」への反映 diff として `memory/shooting_assessment_matrix_v0.md` を新規作成。本プロジェクト「派生元の固定待ち」状態は継続するが、**評価セクション側の素材は先に揃った**。

matrix v0 が本テンプレ骨格暫定テンプレ (#34-54行) に直接埋まる対応:
- ## 評価基準の事前固定 vs 実行時開放 → matrix の (視覚/聴覚/応答/構成/時間) × (覚える/遊ぶ/応用/極める) 20セル + Forgiveness 3段階 を「事前固定指標」として丸ごと持てる。シューティング系テンプレが起票された瞬間にこの評価軸をコピー&ペーストできる
- ## 30秒オンボーディング候補 → matrix の「開幕オフセンター特例」(LinkedIn Iyer 由来) と「段階1: 覚える」セルの設計責任が直接対応
- ## 既出の失敗を避けるゲート → matrix の Forgiveness × 段階の不整合（例: 段階1に即死を置く）が新規ゲート候補

**実装着手判定**: avoid系/textadv系の2本目以降の候補リストに「シューティング/弾幕系テンプレ (matrix v0 を評価セクションに内蔵)」を **第5候補** として登録。実体テンプレ起票は派生元 (avoid_log v04 cross_review 完走) 待ちは継続するが、シューティング系のテンプレが先に動き出す経路が見えた。

**次サイクル課題化 (手段目的逆転回避ゲート)**: matrix v0 を `game/templates/shooting/draft_v01.md` または既存 `game/graze_log/` / `game/shot_log/` への playable diff として適用するのが次サイクルの第一義の出力。本テンプレプロジェクトの停滞解消の起爆点として位置。

### 2026-05-29 (Log C261 Phase 3): MNP (中間記法パターン) を「DSL 化テンプレ」第6候補として登録 — 9日停滞 (5/20 C211→5/29 C261) の解除トリガ

C261 Phase 2 で izutorishima 5/28 21:09 (@Dia_Nexus 由来の MNP = Mid-level Notation Pattern) を #all-nao-u-lab に取り込み (ts=1780026436)、同日 #shared-reads にも個別投稿。MNP の核心は **「GUI 構造に沿った独自 DSL を LLM 都合で設計 → DSL を SSoT、GUI をそのレンダラに」**。これを本プロジェクトの「派生元の固定待ち」状態 (5/12 C185 で stalled 起点 5/5 → 9 日延長) の解除候補として登録する。

**MNP 適用可能性 (本テンプレの 5 候補との突合)**:

| 候補 | MNP 適用余地 | 評価 |
|---|---|---|
| T-1 avoid 系 | 弾幕パターン / 敵配置 を DSL 化 | ◎ 直接適用可。既存 `game/log_autonomous_game/` の SHOOT_INTERVAL / enemy_behavior を DSL 化する経路が見える |
| T-2 textadv 系 | シナリオ DSL (シーン/分岐/状態遷移) | ○ Mir 担当領域、log_textadv/README.md の 4 ゲート契約と相性良いが Mir との協議必要 |
| T-3 Pot 系 | 既に独自構造が存在、上書きより整合が課題 | △ 既存構造への二重化リスク |
| T-04 整理収束系 | 場の状態 (拡散度/凝集度) を DSL 化 | ◎ Ash 候補、物理量ベースで DSL 設計しやすい |
| T-5 シューティング系 (matrix v0) | matrix v0 自体が DSL の原型 (20セル × Forgiveness 3段階) | ◎◎ matrix v0 が既に DSL 設計済 = MNP 第6候補ではなく既存第5候補の DSL 化として接続 |

**自システムへの意図せぬ部分適用 (#all-nao-u-lab 投稿の自己批判から再掲)**:

- atom 系の memory infrastructure (Log C261 Phase 2 既述):
  - atom 本体 = SSoT (人手 cross-link + frontmatter)
  - frontmatter = DSL 骨格 (name/description/metadata/related/supersedes)
  - `[[name]]` = 意味グラフ (build_atom_edges.py で edges 派生)
  - MEMORY.md / Obsidian = renderer
- = **MNP の 4 構成要素を memory 側で既に持っている** = ゲーム側への適用は memory 側で実証済の構造を game/templates/ に折り返す形になる

**本サイクルでは実装着手しない理由**:

- DSL 設計 + パーサ + シリアライザの初期コストが大きい (1 サイクル分で済まない)
- 仕様違反テキスト事故 = M-40 系 (`feedback_self_perception_blindness.md` の Phase 0/1 hook 系) と隣接 = テキスト生成側のミスで DSL 制約を破る経路がある
- 先に Tiled TMX / PICO-8 cartridge / Bevy scene の 3 事例調査が筋 (izutorishima 投稿の論点を一次資料で踏む)
- C261 Phase 4 大作業候補は別軸 (game/ playable diff 優先) を先に置く

**残課題への追加** (本節で追加された判断材料):

- [ ] **MNP 一次資料調査**: Tiled TMX / PICO-8 cartridge / Bevy scene の 3 事例 + @Dia_Nexus 元投稿の取得。izutorishima の要約に依存せず、DSL ベース PCG の先行事例を直接読む
- [ ] **DSL 化テンプレ骨格の最小設計**: 既存テンプレ暫定 #34-54 行構造に「## DSL 化方針 (MNP 適用時)」セクションを追加するかの判定。matrix v0 = DSL 設計済 を先行事例として接続
- [ ] **memory atom 系の MNP 構造 → game/ への折り返し設計**: atom 系で実証済の SSoT + 派生生成 + renderer 分離パターンを game/templates/ で再利用する経路。kaizen #135 (build_atom_edges.py) の game/ 側 sibling = build_game_edges.py 候補

**停滞解消条件の更新 (2026-05-12 C185 待ち状態節からの修正)**:

- 旧条件: graze_log v04 cross_review → avoid_log v04 commit
- 新条件 (本節追加): 旧条件 OR **matrix v0 を `game/templates/shooting/draft_v01.md` に最小着地 (5/20 C211 で予告された経路) + MNP 適用判定セクション追加**。matrix v0 → shooting テンプレ着地が起爆点として最も近い (matrix v0 自体が DSL 設計済のため MNP 適用が自然)。

**接続先**:
- [projects/memory_redesign.md C261 Phase 3 節](memory_redesign.md) — yusuke_m_mu「description load 問題」と izutorishima MNP は **同じ「機構レベルの構造化」軸** で並走、本節と双方向参照
- [memory/shooting_assessment_matrix_v0.md](../memory/shooting_assessment_matrix_v0.md) — matrix v0 自体が DSL 設計済 = MNP 適用第一候補
- [tools/build_atom_edges.py](../tools/build_atom_edges.py) — atom 系の SSoT + 派生生成パターンの実装、game/ 側 sibling 設計の参照基盤
