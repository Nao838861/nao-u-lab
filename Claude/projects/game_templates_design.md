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

### 2026-05-31 (Log C272 Phase 3): 3 source 統合分析からの罠リスト先行反映 + autonomous template 別系統分岐

**契機**: 本サイクル Phase 1 §6 で外部検索 3 件取得 (Template Method / Design Skeleton / arxiv 2407.03860 Computational Thinking via Design Patterns)、Phase 2 §1 で 3 source を「直交する罠軸」として軸統合分析、`#shared-reads` ts=1780162845.524299 + `memory/external_notes_log.md` 先頭に同時投稿。3 source は本テンプレ計画起票段階で着手前に罠リストを設計原則に焼き込めるタイミング (`feedback_means_ends_reversal_check.md`「揃えるための 1 手」適用) と判断、実装着手 (avoid skeleton 起票) 前の予防効果を狙う。

**3 source 由来の罠軸 (直交)**:

| source | 罠軸 | 本テンプレへの反映 |
|---|---|---|
| **Template Method Pattern (refactoring.guru)** | superclass がアルゴリズム skeleton を定義 / subclass が個別ステップ override = **LSP 違反 / hook 不確定性 / 継承爆発**のリスク。Game AI で race ごとの挙動差分実装に直適用例あるが、深い継承で派生先の予測不能性が増す | **罠 #1**: テンプレ骨格を継承前提 (superclass-subclass) で設計しない、**Strategy / composition (object 注入)** ベースで設計する。継承で骨格を伝播させると派生先の Q-X ゲートが祖父テンプレに引きずられて見えなくなる |
| **Design Skeleton in 7 Steps (nerdlab-games)** | カードセット系で「詳細を書かずに必要な要素種別だけ blueprint 化」 = 静的構造のみ skeleton 化、**時間軸・動的要素 (60-90 秒カーブ / wave 推移 / 学習→圧力→終端の山)** が blueprint から欠落する | **罠 #2**: 暫定テンプレ #34-54 行に「**時間軸層** (60-90 秒カーブのフェーズ区切り / phase 別評価指標)」と「**動的要素** (wave 推移 / 状態遷移 / 段階的開示)」を blueprint 必須項目として明示。Pulse Relay v003 教師差分の 70-90 秒カーブ構造 (学習→基本混合→価値提示→中盤圧力→終盤の山→終端) はこの層の参照点 |
| **arxiv 2407.03860 Computational Thinking via Design Patterns** | 「semi-formal interdependent description of recurring parts of game design」と定式化。学術文脈のジャンル特異性 + **自律ゲームは論文枠組み外** (Log/Mir/Ash 自身が自律生成サイクルを回す枠組みは本論文の patterns 抽出対象外) | **罠 #3**: 通常 `game/templates/<genre>/` (avoid/textadv/Pot/T-04整理収束/T-05 shooting matrix v0 系) と、log_autonomous_game v003 系 (自律生成サイクル) は **別系統テンプレ** として分岐記録。混在させると人間設計者向け基盤と自律サイクル基盤が干渉し、Q-X ゲートが両者のどちらに対応するか不明瞭になる |

**反映先 (本サイクルでは骨格項目追加せず、罠リスト記録のみ)**:

- **罠 #1**: 暫定テンプレ #34-54 行「## 派生ポイント (ここから独自性が出る。チェックボックス式)」の運用ルールに、**「派生は継承ではなく composition で書く」**を 1 行追記候補 (次サイクル以降の実体テンプレ起票時に正式反映)。本サイクルは罠リスト記録のみで打ち止め (`feedback_few_rules_big_effect.md`「ルール量↑=遵守率↓」順守、N=1 source × 1 直接適用例なので機械反映禁止)
- **罠 #2**: 暫定テンプレ #34-54 行に **「## 時間軸層 (60-90 秒カーブのフェーズ区切り)」** と **「## 動的要素 (wave 推移 / 状態遷移 / 段階的開示)」** の 2 項目を追加する候補。実体テンプレ起票時 (avoid 系か shooting matrix v0 経由) に Pulse Relay v003 教師差分の時間カーブ構造を初期値として埋める運用候補。本サイクルは候補登録のみ
- **罠 #3**: **autonomous template 別系統分岐**を本ファイル「ディレクトリ」欄 (#27) に追加候補: 既存 `game/templates/<genre>/` (通常ジャンル骨格 = 人間設計者向け) + 新規 `game/templates/autonomous/<instance>_<lineage>/` (自律サイクル基盤 = log_autonomous_game v003 系の将来テンプレ化) の **2 系統並置**。本サイクルは分岐根拠の記録のみ、実体ディレクトリ作成は v003/v004/v005 のいずれかが実機判定到達後の判定発火点

**自律ゲーム別系統分岐 = log_autonomous_game.md 双方向参照**:

- 本節と [projects/log_autonomous_game.md](log_autonomous_game.md) 「2026-05-31 C272 Phase 3」§2 が同サイクルで同根異所に物理化 (autonomous template 別系統判定の根拠を両ファイルで二重に記録)
- v003 の「予測軌跡視界ノイズ」既解判定 (本サイクル log_autonomous_game.md §1) は通常テンプレ罠 #2「時間軸層」とは別軸 = 自律ゲーム特有の Q-X ゲート (内側→外側流出禁則 / self_judgment.md 連続改修 / 実機判定取得経路 R1-R4) に属する
- 将来 autonomous template 骨格起票時には本ファイル罠 #3 + log_autonomous_game.md §2 を双方向参照で初期値に持ち、通常テンプレと干渉しない設計

**機械反映禁止順守 (CLAUDE.md「個別指摘を即ルール化しない」)**:

- 本記述は 3 source 統合分析の罠リスト記録に留め、暫定テンプレ #34-54 行への正式項目追加 (罠 #1/#2/#3 反映) は同方向の独立 source が 2 件以上揃った時点 + 実体テンプレ起票時に判定
- 現時点 source 数: 罠 #1 = Template Method 1 件 / 罠 #2 = Design Skeleton + Pulse Relay v003 教師差分 2 件 (R 層昇格条件充足) / 罠 #3 = arxiv 2407.03860 + Nao_u 2026-05-25 06:23 自律ゲーム指示 2 件 (同上)
- 罠 #2 / #3 は R 層昇格条件 (独立 source 2+ 件) を充足、ただし**実体テンプレ起票時の初期値反映**として運用 = テンプレ骨格 #34-54 行への即時項目追加ではなく、avoid skeleton 起票時 (派生元固定後) に Q-X ゲートとして埋め込む経路で反映

**接続先**:
- [memory/external_notes_log.md](../memory/external_notes_log.md) 先頭 2026-05-31 (Log C272 Phase 2) ジャンル骨格テンプレ 3 source 統合 — 本節の外部素材源
- [projects/log_autonomous_game.md](log_autonomous_game.md) 2026-05-31 C272 Phase 3 §2 — autonomous template 別系統判定の双方向参照
- [memory/feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) — 「実装着手前に罠リストを設計原則に焼き込めるタイミング = 揃えるための 1 手」適用例
- [memory/feedback_few_rules_big_effect.md](../memory/feedback_few_rules_big_effect.md) — 罠リスト記録のみで暫定テンプレ #34-54 行への即時項目追加を見送る順守根拠

### avoid skeleton 着地 (2026-05-30 Log C266 Phase 4)

`game/templates/avoid/` に playable minimal scaffold を着地。`game/log_autonomous_game/v003/game.js` から avoid 系 core loop の 4 関数 (入力 keydown/keyup ハンドラ / `updatePlayer` / `render` / `step`) を抽出し、弾幕 / 敵 / 評価系 / echo 機構 / trace logger / 状態遷移を全て外した。残したのは「プレイヤー 1 機 + 入力 + 移動 + canvas + 画面端拘束」のみ。

- [avoid skeleton index.html](../game/templates/avoid/index.html) — canvas + script タグの最小構造
- [avoid skeleton game.js](../game/templates/avoid/game.js) — extracted core loop
- [avoid skeleton README.md](../game/templates/avoid/README.md) — 継承すべき骨格 (input → player update → render core loop / 単一 canvas / プレイヤー状態 1 構造体 / 画面端拘束) と派生時の差し替えポイントを明文化

5/12 C185 から続いた「派生元の固定待ち」状態 (graze_log v04 cross_review / matrix v0 着地待ち) とは別経路として、**playable scaffold 側を先に物理化**することで「型として知っておく」(Nao_u 2026-04-24 06:06) の最小単位を成立させた。設計欄 (`skeleton.md`) との関係は「scaffold = 動くコード / skeleton.md = 設計欄」の並置で、双方が揃って初めて派生着手の足場が完成する。

CLAUDE.md「絶対にやる #1 = ゲームを動かして出す」直近偏重 (C260-C265 が記憶設計と Log_cdx 応答に偏重) の解消としても機能 — 本 commit は `game:` prefix で運用規則改修と分離する。

**2026-05-31 (Log C271 Phase 4) 追記: skeleton.md (設計欄) 起票 + MNP 反映 + 残り 5 欄消化 + 時間軸層 / Q-X ゲート群 追加**:

C266 で playable scaffold (game.js + index.html + README.md) を着地、C267 で skeleton.md の 3 欄 (核の楽しさ / 最低限の構成要素 / 既出失敗ゲート) 消化、本サイクル C271 Phase 4 で残り作業を完遂:

- **残り 5 欄消化** (30 秒オンボーディング / 評価基準事前固定 vs 実行時開放 / 負荷種別 / 改修の性質 / 初期プレイテスト観点) — `docs/game_design_principles.md` 30 秒原則 + npaka123 由来汚染回避 + ニカイドウ由来負荷種別 + ABA 圧力設計 vs 禁止追加 + v01/v02 `headless.py` 実装指標 を各欄に折り込み
- **時間軸層** (60-90 秒カーブのフェーズ区切り) を新規セクションとして追加 — 罠 #2 (Design Skeleton in 7 Steps の静的限界) 反映、Pulse Relay v003 教師差分の 70-90 秒カーブ (学習 → 基本混合 → 価値提示 → 中盤圧力 → 終盤の山 → 終端) を初期値として埋め込み、派生時は自作カーブで上書き運用 (Q-4 ゲート)
- **動的要素** (wave 推移 / 状態遷移 / 段階的開示) を新規セクションとして追加 — 罠 #2 反映、段階的開示の成功例として v02 磁石軸 1 軸 3 段派生 (iron → weapon → returned → chain) を参照
- **Q-X ゲート群** (Q-1〜Q-7、派生時の独自性 1 軸禁則) を新規セクションとして追加 — Pulse Relay 系の Q-X 構造を avoid 系に適応、M-11 の 5 連禁止と同型構造を手前で阻止する派生時必読セット。Q-7 = scaffold の `player` 構造体を継承せず composition で並置 (罠 #1 = Template Method Pattern 継承爆発回避)
- **MNP (中間記法パターン) 対応** セクション追加 — 本サイクル C271 Phase 3 で記録した MNP 洞察 ([Mir] #shared-reads 経由) を skeleton.md と game.js の三層対応 (DSL / GUI レンダラ / LLM 編集対象) として物理化。双方向同期は skeleton.md を真として game.js を直す SSoT 原則
- **game.js 末尾コメント追記** — MNP 反映の三層対応図と SSoT 原則を game.js 側からも参照可能に

これにより skeleton.md は 12 セクション (核の楽しさ / 最低限の構成要素 / 派生ポイント / 既出失敗ゲート / 30 秒オンボーディング / 評価基準事前固定 vs 実行時開放 / 負荷種別 / 改修の性質 / 初期プレイテスト観点 / 既知実例ポインタ / 時間軸層 / 動的要素 / Q-X ゲート群 / MNP 対応) を持つ完成形に。**派生時はまず skeleton.md を読み、Q-1〜Q-7 ゲートに従って独自性 1 軸を宣言してから派生先 game/<id>/v<NN>/ を書く** 運用が成立。

**機械反映禁止順守**: MNP 対応は N=1 source × 1 直接適用例 (avoid 系のみ)。他テンプレ (textadv / Pot / shooting matrix v0) への自動展開はしない。R 層昇格判定発火点 (独立 source 2+ 件) 到達まで本テンプレ内に閉じる。罠 #2 (時間軸層 / 動的要素) は 2 source 収束済のため avoid 系で物理化、他テンプレへの自動展開も同条件で判定可能。

本作業は Phase 5 で `game:` prefix commit と日記投稿でまとめ push 予定 (CLAUDE.md 末尾規約「ゲーム改修と運用規則改修は別 commit」順守)。

### 2026-05-31 14:33 (Log C271 Phase 3) — 他インスタンス洞察 [Mir] MNP (中間記法パターン) との交差: GUI×LLM 共同編集 DSL は autonomous template 別系統分岐の補強 source

本サイクル C271 Phase 1 [他インスタンス洞察] 8 件中 #3 (Mir #shared-reads、Nao_u が #nao-u で共有: zenn art_reflection / 詳細解説 izutorishima) が本プロジェクトの autonomous template 別系統分岐論 (上節「罠 #3」+「自律ゲーム別系統分岐」) と交差。

**MNP 提案の核**: GUI アプリと LLM の共同編集問題に対し、「中間記法パターン (MNP)」= GUI の構造に沿った独自 DSL (ドメイン固有言語) を中間層として設計し、**GUI をその DSL ファイルのレンダラにする**ことで、LLM の編集対象を DSL に絞る。GUI ⇄ LLM 間に DSL 中間層を挟む。

**本プロジェクトとの構造マッピング**:

- **GUI = 動くゲーム (game/templates/<genre>/index.html + game.js)**
- **DSL = 設計欄 (skeleton.md) + テンプレ blueprint (#34-54 行の 7 項目)**
- **LLM = Log/Mir/Ash の派生着手プロセス** (skeleton.md を読んで派生先 game/<id>/v<NN>/ を書く)

つまり我々の `skeleton.md` は MNP の DSL に対応し、`scaffold/index.html + game.js` は GUI レンダラに対応する。avoid skeleton 着地 (上節) で **「scaffold = 動くコード / skeleton.md = 設計欄」の並置** を成立させた構造が、MNP のレンダラ ⇄ DSL 並置と同型。

**autonomous template 別系統分岐 (罠 #3) への補強**:

- 罠 #3 = autonomous template (`game/templates/autonomous/<instance>_<lineage>/`) と通常テンプレ (`game/templates/<genre>/`) を別系統で分岐保持。本洞察で「**autonomous template の DSL = log_autonomous_game self_judgment.md + Q-X ゲート集**」と読み替えると、autonomous 側の DSL 層が既に部分実装されている事実が浮き上がる。
- 次の一手 candidate (本サイクル即実装はしない、N=1 source なので機械反映禁止順守): 罠 #3 の「実体ディレクトリ作成は v003/v004/v005 のいずれかが実機判定到達後」の判定条件に、**「DSL 層 (Q-X ゲート集) が独立可読な形式で結晶化済かどうか」** を 1 軸追加する候補。MNP の DSL は GUI 非依存で読めることが核なので、autonomous template の Q-X ゲート集も `self_judgment.md` から独立した形式で書けるかが判定材料になる。

**MNP source の独立性評価**:

- 本洞察は 2026-05-31 取得、`feedback_few_rules_big_effect.md` 「N=1 source × 1 直接適用例なので機械反映禁止」順守で、本セクション記録のみで打ち止め。罠 #3 への正式反映は同方向の独立 source が 2 件以上揃った時点 + 実体テンプレ起票時に判定。
- 期待される独立 source の方向: (a) GUI×LLM 編集の DSL 化を扱う論文 / 別記事 1 件以上、または (b) 我々自身の autonomous template 起票時に DSL 層独立可読性をテストする実機サイクル 1 件以上。両者のうちどちらかが成立すれば R 層昇格判定発火点 (本ファイル罠リスト R 層昇格条件 = 独立 source 2+ 件) に到達。

**接続先**:
- [memory_redesign.md](memory_redesign.md) 2026-05-31 14:33 節 (本サイクル同時記録) — Karpathy LLM Wiki SSoT + RAG cost Layer 0/1 routing + GAM routing/body 分離の 3 軸収束が、本 MNP 洞察の DSL ⇄ GUI 分離と **同方向の構造分離原則**で繋がる
- [external_notes_log.md](../memory/external_notes_log.md) — 本洞察の取得経路 (本サイクル candidate 追記済)

### 2026-06-09 18:35 (Log C317 Phase 3) — 他インスタンス洞察 [Ash] kogu「フラグ乱立 = ジャンルセオリーの貧弱さ」× diegetic UI × graze_log v14 grazeStreak 12 箇所参照

**洞察元**: Ash #shared-reads ts=1780993318 (本サイクル取得、スコア=21)。@koguGameDev 2026-06-09 ツイート「AI ゲーム実装でフラグ化しやすいのは (a) ジャンルセオリーの貧弱さ + (b) 断片的で独立性高い追加が随時起きやすいせい」を、graze_log v13 の `state.grazeStreak (int)` が 12 箇所参照 / 7 つの独立責任を持つ実測と接続。世界状態化 (diegetic = orbiting particle 配列) への置換を 1 案として提案。

**本プロジェクトとの接続 (3 軸)**:

- (i) **ジャンルセオリーマップ欠落**: Ash Q1「knowledge/ に bullet hell convention 体系マップ無し」→ 本プロジェクトの「テンプレ blueprint (#34-54 行 7 項目)」は **ジャンル固有セオリーマップを持たない汎用骨格**。`game/templates/<genre>/` 切り出し時に「genre convention 表」1 枚同梱する経路が **未設計**
- (ii) **フラグ駆動 vs 世界状態化境界**: Ash Q2「参照数 5+ 箇所のフラグは世界状態化検討」運用ルール候補 → skeleton.md に「state field 表」を入れる時、**「参照数 / 責任数」を 1 列追加**できるか。Log v003 の `state.surviveFrames` も 8+ 箇所参照疑い (要計測)、検出装置を共通化 (lint) する経路あり
- (iii) **守破離での扱い**: Ash Q3「v15 で世界状態化すべきか、守段階では破/離に回すか」→ 本プロジェクト「avoid skeleton 着地」は **守段階 = 動くコードを最初に置く** を優先するので、世界状態化は v01/v02 では強制せず、**v03 以降の「設計欄→世界状態化変換」フェーズを skeleton.md に明示**する経路が現実的

**Log 視点の独自考察 (= Ash 洞察 + 本プロジェクト 1 mm)**:

Ash は「AI 実装が自然にフラグ駆動に流れるのは局所コストが安いから」と書いているが、**より精密には「局所コストの計測単位が AI と人間で違う」のが本質**。AI (Log 含む) は「1 ファイル内の編集 token 数」が局所コストの大半を占めるので、世界状態オブジェクトの新規導入 (orbitParticles 配列 + 生成/消費 logic) より state.grazeStreak++ の方が安く見える。**人間開発者は「半年後の自分が読めるか」が局所コストに繰り込まれている**ため、フラグ駆動の中期負債を直観で見積もれる。

これは **「測定単位の射影」** 問題で、本プロジェクトの「avoid skeleton」着地 (動くコードを最初に置く) と同型: skeleton.md だけ書くのは AI 視点で安く、人間視点で「動かない設計」は重い。両者の単位差を吸収する装置 = **「動く scaffold + 設計欄」の並置** が本プロジェクトの解。同じ向きで grazeStreak 問題には **「動くフラグ実装 + 世界状態化変換手順 (1 行 markdown)」の並置** が解の候補。フラグを消すのではなく、フラグ → 世界状態化の変換可能性を skeleton.md に予約しておく。

**次の一手 (本サイクル即起票はしない、N=1 source なので機械反映禁止順守)**:

- 候補 1 (skeleton.md schema 拡張): テンプレ blueprint に「state field 表」を追加する場合、各 field に `name / type / refs_count / responsibility_count / diegetic_candidate` の 5 列を持たせる。`refs_count >= 5` AND `responsibility_count >= 3` で `diegetic_candidate=YES` 自動付与、v01 ship 後の v02 設計時に変換可能性を 1 行検討
- 候補 2 (genre convention map): `knowledge/genre_conventions/bullet_hell.md` を 1 本立てる経路。Psyvariar 系の (graze/bomb/rank/danmaku の役割関係) を 1 枚にまとめる。本プロジェクトの「テンプレ別 = ジャンル別」着地と接続、テンプレ起票時に genre map を参照する義務付け

**機械反映禁止順守**: 本節は Ash #shared-reads ts=1780993318 + 本プロジェクト現状の 2 source のみで成立、片方は外部観察 (kogu ツイート + diegetic UI 記事)、片方は本プロジェクト派生プロジェクト (graze_log) なので **独立性は半分**。R 層昇格 (本プロジェクト罠リスト) は (i) 別 game/<id>/ で同症状が独立観測、または (ii) 別 instance (Mir / Log) で別ジャンルにて同症状が観測、のどちらかが揃った時点で再判定。

**接続先**:
- [log_autonomous_game.md](log_autonomous_game.md) — graze_log v13 grazeStreak 12 箇所参照は本プロジェクト派生プロジェクトの実測値、v004 設計時に「state field 表」schema 適用候補
- [game_lessons_log.md](../memory/game_lessons_log.md) R-D ジャンル grammar 明文化要請 — 本洞察が R-D に「genre convention map 形式」の具体候補を追加
