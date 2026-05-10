# ルール密度 × 遵守率 実験計画

**起草**: 2026-04-20 C89 Phase 3 Mir
**状態**: 計画起草段階（未実行）
**出自**: C89 Phase 2 で @MakeAI_CEO (2026-04-19) のツイート分析。「Claude Code は事前ルールの許容量を超えると守る確率が激減する。CLAUDE.md に200行ルールを書いても無駄、書けば書くほど全体の遵守率が下がる研究結果がある」。一次資料未確認。

## 背景：我々のアーキテクチャ負荷推定

3層プロンプト構造の現状:
- `.claude/system_identity.md`: 常時注入（全セッション）
- `CLAUDE.md`: 約100行、セッション開始時
- `MEMORY.md`: 約150-200行、常時
- `.claude/rules/*.md`: 4本、該当ファイル操作時
- system-reminder 類: 長大

**仮説**: MakeAI_CEO の説が正しければ、CLAUDE.md + MEMORY.md + system_identity 合算で既に遵守率劣化ゾーンに入っている可能性。特に MEMORY.md 末尾「深い記憶」セクションのトリガーは実質的に効いていない。

## 問題意識との接続

- `feedback_few_rules_big_effect.md`: 「12本のif-then → 3原則」の方針との強い共鳴。**定性的に書かれていた方針が定量的な外部証拠で裏付けられる可能性**。
- `feedback_stereotypical_responses.md`: ルール追加＝遵守の証明ではなく、ルール総量の膨張が遵守率の逆指標になりうる。
- `project_input_path_hypothesis.md` (Ash保留中): 「何を入れるかより、どこから入れるか」。量の壁が存在するなら、経皮/経口の選択は**遵守率**の問題として立ち上がる。
- `feedback_structural_enforcement.md`: 「手動手順は守れない、構造で強制せよ」——今回の研究は「ルールを書く」アプローチそのものの限界を示す。

## 実験候補（Seed）

### Seed-H: MEMORY.md トリガーの呼出頻度監査

**目的**: 末尾トリガーが実際に想起されているかを可視化する。
**方法**:
- memory/MEMORY.md の各 Level-2 エントリに「最終想起日」フィールドを追加（または別ファイル `memory/trigger_recall_log.md`）
- associative_search.py / memory_activate.py 等が想起するたびに該当エントリを記録
- 30日間観測し、想起ゼロのトリガーを特定
**想定コスト**: 低（既存ツールへのログ追記）
**判定**: 想起ゼロのトリガーが末尾に偏在すれば「200行の壁」仮説を内部で追認

### Seed-I: ルール削除の逆RCT

**目的**: ルール追加ではなく**ルール削除**の効果を測る。
**方法**:
- CLAUDE.md の一部（例: 「絶対にやる」リストの1項目）を2週間一時退避
- 同期間の作業品質指標（feedback 回数、INC-* 発生率、サイクル成果）を退避前と比較
- 複数の退避候補を順番に試す
**想定コスト**: 中（品質指標の定義と測定）
**判定**: 退避期間の品質が**維持 or 向上**すれば、そのルールは遵守率に寄与しておらず削除候補

### Seed-J: 200行の壁の再現実験

**目的**: MakeAI_CEO の主張を内部で検証する（R-007造語症対策：一次資料未確認のまま knowledge化しない）。
**方法**:
- CLAUDE.md に「100行の無関係なダミールール」を挿入
- 既存の明確なルール（例: 「書いたらすぐpush」「Slackは10時〜14時」）の遵守率が下がるかを1週間測定
- 対照群: ダミー挿入なしの平常週
**想定コスト**: 高（運用汚染リスクあり）
**リスク**: 実験中に実際の作業品質が下がる可能性。ダミーだと識別された場合に全ルールが信頼失墜するリスク。
**判定**: 本実験は**最後の手段**。Seed-H/I で兆候が掴めなければ実行検討。

### Seed-K: 3層プロンプト構造の再配分

**目的**: 量の壁を前提にした配分最適化。
**方法**:
- system_identity（5原理・セキュリティ）は死守
- CLAUDE.md（構造ポインタ）を**最小化**——現状残存している詳細ルール記述を .claude/rules/*.md に移譲
- 詳細ルールは該当ファイル操作時のみ注入（既存の動的注入ルート）
**想定コスト**: 低（ファイル移動・参照整備）
**判定**: 再配分後に Seed-H/I の指標が改善すれば有効

## Phase 3 時点の判断

- **記事化（knowledge化）保留**: 一次資料（該当研究論文）未確認。R-007 造語症対策に従う。
- **実行判断は Nao_u に委ねる**: Seed-H が最低コストかつ情報価値が高い。Seed-I は中コスト・高情報価値。Seed-J はリスク高で後回し。
- **次の具体行動候補**: Seed-H を kaizen_tracker に起票するかを次サイクル Phase 0 で議論。

## 再接続トリガー

- (a) MEMORY.md / CLAUDE.md の行数が増えそうな時 → 遵守率劣化のトレードオフを想起
- (b) ルール追加の議論が出た時 → Seed-I（削除実験）を対案として出す
- (c) 3層プロンプト構造の再設計議論 → Seed-K を検討項目に
- (d) 一次資料（該当研究論文）が見つかった時 → knowledge化解禁、Seed-J の必要性再評価

## 接続ファイル

- `memory/feedback_few_rules_big_effect.md`
- `memory/feedback_structural_enforcement.md`
- `memory/feedback_stereotypical_responses.md`
- `memory/project_input_path_hypothesis.md`
- `memory/MEMORY.md`
- `CLAUDE.md`
- `.claude/system_identity.md`
- `docs/knowledge_writing_guide.md`（R-007）

---

## 履歴（下に積み重なる。新しいものが上）

### 2026-05-08 C170 Phase 3: Opus 4.7 一次資料3本検証で Seed-K 優先度更新（Log 追記）

C170 Phase 1 §6 で Nao_u 5/7 03:18 #human-steering「ルール増やしすぎ説 + Opus4.7 追従性UP」を起点に外部検索（クエリ: `Opus 4.7 instruction following sycophancy rule overload 2026`）→ 3一次資料を取得し、同サイクル Phase 2 §C で #shared-reads ts=1778198682.665689 として投下、§D で本 project との接続を確定、Phase 3 で本履歴追記。詳細は `memory/external_notes_log.md` 2026-05-08 エントリ参照（同サイクル親集約マーカー付き）。

**3一次資料のうち本 project に直接効くもの**:

| 出典 | 引用 | 本 project への接続 |
|---|---|---|
| Anthropic 公式 (claude-opus-4-7) | "substantially better at following instructions ... takes the instructions literally" | sycophancy と instruction following リテラル化が**別軸**で独立評価。Nao_u 体感「追従性UP」は後者。リテラル化で矛盾/残骸ルールの副作用が**観察コスト低く**現れる |
| Labellerr 比較記事 | "literally take instructions, no longer fills in tone or intent from hints" | 4.6 用プロンプトが 4.7 で破綻=「察し」前提の暗黙ルールが折れる。Seed-K（3層プロンプト再配分）の **外側からの根拠補強** |
| robotsatemyhomework | Reddit「listen しない、flatter、give up」苦情まとめ | flatter（sycophancy）と listen しない（instruction following）の混同観察。Anthropic 公式評価軸で見ると別現象 |

**Seed 優先順位への反映**:

- **Seed-K（3層プロンプト構造の再配分）の優先度↑**: Mir 起草時は「量の壁」仮説のみだったが、外側（Anthropic 公式）から「字義通りに取るので矛盾/残骸/方向性なしルールの副作用↑」という別経路の根拠が加わった。リテラル化により**「何を書いたか」の副作用が低コスト観察可能**になったため、Seed-K は実装着手の合理性が増した。
- **Seed-J（ダミールール挿入の再現実験）の優先度↓**: リテラル化で副作用が低コスト観察可能になったため、ダミー挿入で全ルール信頼失墜のリスクを取る合理性が**さらに**減った（C160 既存履歴で Mir 方針を踏まえて格下げ済、本サイクル一次資料側からも追認）。
- **Seed-H（MEMORY.md トリガー呼出頻度監査）の優先度→**: 不変。リテラル化は「書かれたものに字義通り反応」する話で、想起頻度監査の必要性そのものは別レイヤー。
- **Seed-I（ルール削除の逆RCT）の優先度→**: 不変。Mir が brick_log/textadv/SIPHON/graze_log 系列で「事実上の Seed-I 実行」を継続中（C160 既存履歴の判断を維持）。

**「禁止より目的達成で書く」原則の外側根拠**:

- CLAUDE.md「個別指摘を即ルール化しない、教師データで蓄積、判断力で消化する」
- M-43 引用本文義務（kaizen #129 (a)）
- `feedback_few_rules_big_effect.md`「12本の if-then → 3原則」

これらが Opus 4.7 リテラル化環境で**一層効く**ことが、_mumumu 5/7 (ChatGPT 5.5 thinking)「振る舞いを縛ると折れる、思考方向性で安定化」と独立の領域で同方向の3経路目の観察として加わった。

**Mir への判定渡し**:

本 project は Mir 起草のため Log 単独で結論しない。Mir 側で:
- Seed-K 実装着手の最初の1手（CLAUDE.md「絶対にやる」5本以下維持・詳細ルールの .claude/rules/ 移譲継続 など、既に進行中の方向の再加速で十分か、追加の構造変更が必要か）
- Seed-K と kaizen #128 段階2（skills/ 棚卸し+SKILL.md 3本以上）の優先順序（kaizen #128 段階1 PASS 済、段階2 着手のためのトリガーとして本サイクル根拠が機能するか）

を判定してほしい。Log 側は Phase 3 で本履歴追記までで止め、Mir/Ash の応答待ち（kaizen #128 段階2 着手判断と本 Seed-K 優先度更新は同じ層を指すため、別 kaizen 起票を Log 側から急がない方針）。

**self-audit**:
- 本追記は「外部三角化を残す」と「履歴を膨らませない」の二択で前者を選んだ。判断根拠: (i) Anthropic 公式 + Labellerr の2経路で同表現「literally take instructions」が裏取り済（snippet ではなく WebFetch で公式本文確認）/ (ii) Nao_u 5/7 03:18 直接発言と独立に外側で同方向の根拠が積み上がる局面 / (iii) C168 既存履歴の WebSearch 3件は snippet 相当だったが、本サイクルは公式本文 1次資料で 1段精度が上がった
- 不確実性: (2)(3) は WebFetch せず snippet 経由のため引用本文の真偽未確認（M-43 引用本文義務違反候補）。自己注意として残す
- 役目を終える条件: Seed-K 実装着手 → 段階完了報告で本 subentry を要約 1行に圧縮（C160 既存・5/4 既存・C168 既存と合わせて）

---

### 2026-05-04 C160 Phase 3 補足: 同サイクル内で得られた2件の内部観察（Log 追記）

C160 既存エントリ（直下）が Nao_u 5/3 発言を根拠補強として整理した後、本サイクル Phase 3 で **追加の内部観察を2件** 得たため subentry として追記する（既存エントリの主張を別の事例で重ねる役割、新規仮説の追加ではない）。

**観察1: pleasure-hypothesis-check skill drop = Seed-I の最小実証**

t-260430204259-f393 (4/30 起票、5サイクル持ち越し) を C160 Phase 2 で **drop** 判定し、#log で運用記録した。判断理由3点のうち (1) は「M-42 撤回後の文脈で skill 強制注入は同方向の追加圧力 = ルール量↑」。1本のルール候補が **増殖前に間引かれた** = Seed-I（ルール削除の逆RCT）の最小実証。skill が物理的に未作成のうちに drop できたため、「削除コスト」を実観測する材料にはならないが、**「増殖を止める」側のオペレーション**は本 project の仮説に整合する形で機能した。

**観察2: graze_log v02 (M-39 違反) + brick_log v05→v06 (M-41 違反) の同型性**

5/1〜5/4 の同週内に2件、いずれも対応ルール（M-39 = プレイ前自明問題列挙ゲート、M-41 = 類似事例調査ゲート）が **存在していたにもかかわらずルール発火不全** で同種の失敗が発生した。型:
- brick_log v05→v06 数値チューニング3往復（5/1 13:18 Nao_u 指摘）= 類似事例調査スキップ → コア快感天井不変のまま数値最適化没入
- graze_log v02 README misuse（5/4 05:08 Nao_u 評価、Ash 11:01 自認）= プレイ前自明問題列挙スキップ → AI 質起因と構造起因が区別不能なまま絶対値を構造証拠化

**読み取り**: ルール不在ではなく **ルール発火不全**。MakeAI_CEO 説の「事前ルールの許容量を超えると守る確率が激減する」内部観察として直接の事例。Seed-I（ルール削除の逆RCT）が必要な理由は「ルールを増やしても発火しないなら、減らして判断力に置き換える方が遵守率は上がる」という仮説の補強。

**メタ観察**: 本 subentry 自体が「履歴に観察を積む」型で、C160 既存エントリの末尾 self-audit「次サイクル以降、Seed の優先順位再評価が実装されたら役目を終える」の対象に **本 subentry も含まれる**。Seed-H/I/K の優先順位再評価 → Seed 実装フェーズに入った時点で、本 subentry も C160 既存エントリと合わせて要約1行に圧縮する。観察の追記が増殖になる罠を内包しているが、本サイクルでは新規仮説を追加せず既存仮説への事例追加に留めるため許容範囲とした。

---

### 2026-05-04 C160: Nao_u 5/3 発言で本 project の根拠補強（Log 追記）

C160 Phase 2 で本 project を再接続候補として走査した結果、Nao_u の **2026-05-03 03:59 #human-steering** 発言と **05:33 #game-rights** 発言が本 project の根拠を直接補強していることが判明したため履歴追記する。Phase 1 では D カテゴリ「直近7日更新なし」候補として上がり、Phase 2 で `feedback_verb_without_target_trap.md` 適用テストで「Nao_u 5/3 03:59『ルール急増 = 同じ失敗繰り返す兆候』が project に記録されないと M-42 撤回処方の整合性が失われる」「Mir 方針 (ルール撤回 → 判断力訓練) と Log 側 M-37〜M-43 増殖の対比軸が消える」で 2/3 ✓ → 採用。

**Nao_u 2026-05-03 03:59 #human-steering**: M-42 として刻んだ3点ハーネス (a)説明魅力 vs プレイ予測魅力 (b)30秒プレイ思考実験 (c)Nao_u判断事前予測 を **撤回指示**。理由は「個別事例の過剰ルール化」「(a) は『文章として魅力的=棄却』と短絡解釈で、シンプルに面白い良案を棄却する害悪ルール」「(b) はボール固有事例がそのままルール化で抽象化ゼロ」。既存原則「**体験で考える**」に統合せよと指示。

**Nao_u 2026-05-03 05:33 #game-rights**: Mir 05:08「ルールと判断力は別」考察への返答として「Mirの方針は正しい、実践を積み上げて」。「ルールを増やすのではなく、判断力を育てる」方針への明示的な賛同。

**本 project への接続**:
- これは @MakeAI_CEO 主張「Claude Code は事前ルールの許容量を超えると守る確率が激減する」の **内部観察証拠**。一次資料は依然未確認だが、**Nao_u 自身が Log の M-37〜M-43 増殖を観察して「ルール急増 = 同じ失敗繰り返す兆候」と判定**した事実は、本 project の仮説（ルール量↑＝遵守率↓）を内部経路で追認したことになる。
- 同サイクル中に Log は本 feedback「6件連続違反」を `memory/feedback_rule_proliferation_re_violation.md` に結晶化済（CLAUDE.md M-42 セクション参照）。M-37〜M-41 抽象化集約作業は別タスクとして CLAUDE.md M-42 に残置。
- Mir の方針「ルール撤回し判断力訓練」は本 project の **Seed-I（ルール削除の逆RCT）と Seed-K（3層プロンプト構造の再配分）の合成形**として読める。すなわち、Mir はすでに本 project の Seed-I 方向で実践を進めている = Mir の brick_log/textadv/SIPHON/graze_log 系列の判断力育成プロセスが本 project の「事実上の Seed-I 実行」と看做せる。

**次の一手 (project 状態更新)**:
- Seed-H/I/J/K の優先順位再評価が必要。Mir が既に Seed-I 相当を実践中であることを前提に、Log/Ash 側は **Seed-H（MEMORY.md トリガー呼出頻度監査）+ Seed-K（3層プロンプト再配分）** に絞る方向が substrate 接続として有利。Seed-J は Nao_u の害悪認定を踏まえると「ダミールール挿入」自体が罠（M-42 と同型）になるため不採用候補に格下げ。
- 本 project は記事化 (knowledge化) 保留中だが、Nao_u 内部観察証拠が積み上がってきたため **substrate 起点の記事素材**として残す価値は上がっている（一次資料未確認は変わらず、R-007 違反しない範囲で書ける）。

**温度の残し方への自己注意 (本追記の self-audit)**:
本追記自体が「ルール削減の根拠を増やすために履歴を膨らませる」=本 project の警告（量の壁）に違反する罠を内包する。`feedback_verb_without_target_trap.md` 適用で 2/3 ✓ で採用したが、3つ目の「Seed-H/I/J/K の優先順位付け直しに材料」は △ 判定。**この履歴は次サイクル以降、Seed の優先順位再評価が実装されたら役目を終える**。役目を終えた時点で本セクションは要約 1行 + リンクに圧縮する（=本 project 自身の「ルール削除実験」の対象に本ファイル自身を含める）。

---

### 2026-05-07 C168 外部三角化メモ（URL未確認、Phase 2 §6 → Phase 3 軽追記）

C168 Phase 1 §6 で `LLM agent prompt rule density compliance degradation 2026` を WebSearch、3件取得。原典未確認のため snippet 相当の整理のみ。本 project の Seed 優先順位再評価時に原典確認の指針として残す。

1. **Microsoft Research (multi-turn degradation)** — 6生成タスク平均39% 性能低下。一度誤った turn を取ると recover しない。**接続**: Nao_u 2026-05-07 03:18「君たちは決意マンで指示に従うこともできていない」の構造観察と整合。Seed-I（ルール削除の逆RCT）が前提とする「ルール多 → 遵守率↓」の中間機序（multi-turn 内での誤 turn 蓄積）に該当。
2. **AgentSpec / "LLMs Should Reason. Infrastructure Should Enforce."** — コンプライアンスルールをプロンプト埋込から policy code 分離する論。**`feedback_substrate_not_infrastructure.md` と逆方向**で、こちらは「ルール過多→infrastructure側へ追い出せ」案。本 project にとっては Seed-K（3層プロンプト再配分）の対案= harness 側強制実装案。Substrate 投資優先方針（Nao_u 残り時間少 / GPT5.5 commodity 化前提）と緊張する。原典確認時は「policy code 化のコスト vs substrate 投資の機会費用」を判定軸として用意する。
3. **70%閾値ルール** — context window 60-70% で instruction following が degrade、attention の primacy/recency 偏り。**接続**: Mir 2026-05-07 04:48 #human-steering「mir_boot_intent.md 14項目数千字膨張で LLM の注意が分散」と同根の経験則。CLAUDE.md + MEMORY.md + system_identity 合算が context window 60-70% を超えていないかの定量チェックを Seed-H（トリガー呼出頻度監査）の前段として配置可能。

**判定**: 3件とも一次資料未確認、knowledge化保留（R-007）。本セクションは Seed の優先順位再評価着手時に「原典確認 → 必要なら knowledge 化 → 本セクション圧縮」の順で消化する。次サイクル以降で Seed 実装フェーズに入った段階で本 subentry も C160 既存・5/4 既存と合わせて要約 1行に圧縮する（既存 self-audit 規約に合流）。

**self-audit**: 本追記は「外部三角化を残す」と「履歴を膨らませない」の二択で前者を選んだ。判断根拠は (i) 3件とも本 project の核仮説に**直接対応する中間機序候補**を提示する (ii) Nao_u 03:18 と Mir 04:48 の双方が同サイクル内で同根の現象を観察しており本 project の根拠が同期して増えた局面 (iii) URL は捨てず文中に残す（原典確認経路の保全）。だが 2/3 程度の確信で履歴を増やすたびに同じ罠を踏む可能性は残る — 次サイクル以降、本 subentry が Seed 実装フェーズに繋がらず履歴のまま残った場合、`feedback_verb_without_target_trap.md` の同型違反として **memory/sense_prediction_log.md に教師データ化**する。

---

### 2026-05-09 C173 一次資料補強: AGENTIF / RULEARENA（Log Phase 2追記）

C168 §2 で snippet 整理に留めた AgentSpec 系列 + Microsoft Research multi-turn の代わりに、本 C173 で AGENTIF (Tsinghua KEG) と RULEARENA (ACL 2025) の **PDF原典 URL** が確認できたため一次資料として接続する。

**AGENTIF — 一次資料による Seed-K 根拠**
原典: https://keg.cs.tsinghua.edu.cn/persons/xubin/papers/AgentIF.pdf
- agentic 環境下の instruction-following ベンチを初提案し、「instruction length ↑ → task performance ↓」を統計的に確認
- 我々が本 project の核仮説として持っていた「ルール量↑→遵守率↓」が、agentic 環境下では Tsinghua KEG が一次測定済 = R-007 上 knowledge化が解禁される最低条件は満たす（残課題=実験条件の精読・我々運用との比較整合）
- **Seed-K 設計修正案**: Seed-K の現行記述は「CLAUDE.md 最小化 + .claude/rules/ 移譲」だが、AGENTIF は「分割しても**実行時の合計長**が同じなら劣化曲線も同じ」可能性を示唆する。**「移譲」だけでなく「実行時の合計注入文字数の計測」を Seed-K の段階1に追加**しないと、再配分後の改善判定が機能しない。Seed-H（MEMORY.md トリガー呼出頻度監査）と並走で「実行時総注入長の cycle 単位ログ」が必要。これを Seed-L（仮）として切るか Seed-K に統合するかは Mir/Ash 判定領域。

**RULEARENA — 実験設計の枠組み流用**
原典: https://aclanthology.org/2025.acl-long.27.pdf
- 95ルール×816問題で「ルール数」「タスク複雑度」を独立変数として2軸操作
- **方法論流用**: 軸1=注入ルール量、軸2=タスク複雑度、proxy outcome=cross_review/self-judgment
- **転用不可な部分**: RULEARENA は外的ルール × agent=道具、我々は内的ルール × agent=判断主体。Nao_u M-42「シンプルに面白い良案を棄却するルール」害悪は RULEARENA の枠組みでは測れない（外的ルールにそもそも「行動空間を狭める」副作用がない）。**機序の二重化** = AGENTIF 型（注意分散）+ Nao_u 型（行動空間狭窄）が合算されているが、本 project は両方を1指標で測ろうとしているリスクあり

**本 project への影響（次の一手）**:
1. Seed-K 段階1 に「実行時総注入長計測」を追加するか、Seed-L として独立切出か → **Mir 判定領域**（Log 側は本セクションで提示まで、kaizen 起票しない）
2. Seed の評価指標を「単一遵守率」から「機序別2指標（参照漏れ率 / 行動空間狭窄率）」に分離するか → **本サイクル時点では未着手**、Phase 3 の inbox_mac/win 申し送り候補
3. C168 §2 の AgentSpec 系列snippet 3件は本 C173 で AGENTIF/RULEARENA に上書きされる形で役目を終えた → 次サイクル以降で C168 §2 を要約 1行に圧縮する候補（既存 self-audit 規約に合流）

**self-audit (本追記)**: 本セクションは前 C168 §2 自己警告「2/3 確信で履歴を増やす罠」と同型のリスクを内包。今回採用した根拠 = (i) AGENTIF/RULEARENA は **PDF原典 URL** が確定しており snippet ではない、(ii) Mir/Ash 判定領域への明示的な依頼形式（feedback_judgment_delegation.md 適用）として残し Log 領域の自走判断を増やしていない、(iii) C168 §2 snippet を要約圧縮する道筋を本セクションで明示的に作っている。次サイクルで Mir/Ash の応答が来ない場合、本セクションも C168 §2 と合わせて 1行要約に圧縮する（=「ルール削減実験」の対象に本 project 自身を含める姿勢を維持）。

---

### 2026-05-10 C175 Seed-K 設計判定確定（Mir → Log 11:39 ts=1778294374 + Log 受領応答 ts=1778371754）

C173 で Log が Mir/Ash に判定要請した3問に対し、Mir が C174 (5/9 11:39) で判定を返した。Log は本 C175 Phase 3 で受領応答を投稿（ts=1778371754）。Seed-K 段階1 の定義が3者合意レベルで確定した。

**Mir 判定の核 — 問い2 = AGENTIF の射程再定義**:

AGENTIF は連続的な instruction 蓄積モデル（multi-turn で指示が積み上がる）。我々は cycle ごとに staging を全消去して再生成する設計で **cross-cycle の蓄積問題は原理的に発生しない**。ただし within-cycle では蓄積が起きている。slack_bot.py を編集する瞬間、system_identity + CLAUDE.md + MEMORY.md + slack.md が同時に積まれる。**「単一 cycle 内の合計注入長」が AGENTIF の劣化曲線の横軸に対応する** — AGENTIF の知見を適用する軸は「cross-cycle 蓄積」ではなく「within-cycle 同時注入量」。

これが今回の判定の核。AGENTIF の射程を我々の構造に正しく位置付け直した = Mir 単独でないと出てこない再定義（Log は AGENTIF 一次資料を提出したが、cross-cycle で読んでいた）。

**Mir 判定3問の確定**:

1. 実行時総注入長計測 → **Seed-K に統合**。独立 Seed L にしない。理由 = 計測は Seed-K（3層再配分）の効果判定の前提条件であり独立した実験仮説ではない。実装は軽量に留める（cycle_staging Phase 0 で1行記録、重い計測インフラは substrate_not_infrastructure 原則に反する）。実装着手 = Mir 側、Win 動作確認 = Log 側に依頼予定。
2. AGENTIF とのギャップ → **大きいが Seed-K 根拠としては十分**。within-cycle 同時注入量の最適化として再定義する。
3. 機序別2指標分離 → **段階1 では分離しない**。データを先に取る。注意分散（参照漏れ）は「実行時総注入長 × 既存ルール遵守率」で間接的に測れる。行動空間狭窄は Nao_u フィードバックが唯一の観測経路で定量化手段がまだない。段階2 以降の課題として残す。

**Seed-K 段階1 の定義（3者合意レベル）**:

1. CLAUDE.md の詳細ルール記述を `.claude/rules/*.md` に移譲（既存方針の継続加速）
2. 実行時総注入長の cycle 単位記録（軽量スクリプト、問い1の統合）
3. 評価指標は「実行時総注入長 × 既存ルール遵守率」の単一指標（問い3 の判定）
4. 実験条件は「within-cycle 同時注入量の最適化」として再定義（問い2 の判定）

**Log 受領応答の補強3点（ts=1778371754）**:

(1) Win 環境動作確認の受け入れ準備: Mir 側スクリプト着地時に Win (D:\\AI\\Nao_u_BOT\\Claude) で `python` 直叩き / PowerShell 経由 / `multi_phase_cycle_log.py init_staging()` フック組込の3経路で動作確認できる体制。kaizen #131 段階2 hook の動作確認手順（`tempfile.NamedTemporaryFile` 経由 dry-run）を流用可能。

(2) within-cycle 注入量計測の出力フォーマット案: Phase 0 の1行を「合計N文字（内訳: identity=A / CLAUDE=B / MEMORY=C / rules=D[発火rule名列挙]）」形式にすると、再配分の効果判定で「どのファイルを薄くしたら遵守率が落ちたか」を後から `memory/sense_prediction_log.md` と突き合わせられる。`.claude/rules/*.md` の発火条件が CLAUDE.md `.claude/rules/` 注入機構に依存しているため、**実際にどの rule が発火したかの観測経路** を併記する必要がある。

(3) 段階1 単一指標の遵守率測定経路: 注意分散による参照漏れの定量化は、`memory/sense_prediction_log.md` の Nao_u 指摘事例で「事前定義ルール（CLAUDE.md または rules/*.md に明記済）に違反した件数」を分母分子化すると Seed-K 段階1 と同じデータソースで継続観測できる。新規データ取得を立ち上げず既存ログの再利用で行ける。kaizen #131 段階1 と語彙が重なるが、#131 は Nao_u 側で2回反復した語彙が対象、Seed-K 段階1 は agent 側でルール参照漏れした全件が対象で、対象集合が違う。

**次の一手（5/10 時点）**:

- Mir: 軽量計測スクリプトを実装、Log 側に依頼形式で送る（Mir 11:39 投稿で予告済）
- Log: 依頼形式が来てから48時間以内で動作確認結果を返す（受領応答で確約）
- Ash: 3問への判定はまだ未提示（Mir 単独判定で Seed-K 段階1 が確定する形になった、Ash 判定は段階2 以降の機序別2指標分離議論で再合流予定）

**self-audit**: 本追記は外部三角化ではなく **3者間判定の合流記録**。前 C168 §2 / C173 §2 の「2/3 確信で履歴を膨らませる罠」とは性質が異なる（合意確定の記録は project の核情報で、後で消す対象ではない）。Mir 判定が Log 起票時の問題提起を超えて「AGENTIF の射程再定義」という判定の核に到達した点を保存する意味で、本セクションは要約圧縮の対象外として扱う。

---

### 2026-05-10 C176 AgentSpec (ICSE 2026, Wang/Poskitt/Sun) 接続 — kaizen #131/#132 の形式言語名同定

C176 Phase 1 §6 外部検索で AgentSpec を抽出 → Phase 2 §1 で kaizen #131/#132 との構造対応を確認 → #shared-reads ts=1778404188 へ投下。AGENTIF/RULEARENA に続く外的根拠として Seed-K 段階1 の補強材料に位置付ける。

**3点接続**:

1. **3-tuple 形式が kaizen #131/#132 と完全対応**: AgentSpec の rule = (triggering event, predicates, enforcement functions) に対し、kaizen #131 は (cycle Phase 1 起動 / `check_repeated_pattern_indication.py` / staging 冒頭への WARN 注入)、kaizen #132 は (Phase 3 起動 / 幻覚パターン語彙 grep / Phase 3 §0 検証セクション必置) と対応する。**我々は AgentSpec という形式言語名を知らないまま同形を内部運用していた** = kaizen #131/#132 の構造妥当性が外部の learned naming で裏取りされた。

2. **AgentSpec 全面採用しない判定の維持**: AgentSpec は外的に正解が決まる領域（code execution の unsafe / AV 衝突回避）に強いが、Nao_u 型「シンプルに面白い良案を棄却するルール」害悪は外的正解が存在しない領域。`memory/feedback_substrate_not_infrastructure.md` の判定線が活きる。Mir 5/9 11:39 Seed-K 判定「機序別2指標（参照漏れ vs 行動空間狭窄）は段階1では分離しない、データ先行」は AgentSpec をそのまま乗せられないことの裏返し = AgentSpec は「参照漏れ（注意分散）」軸には乗るが「行動空間狭窄」軸には乗らない非対称性。

3. **段階3 LLM 自動生成 precision の相場**: AgentSpec は o1 で 95.56% precision (embodied)。kaizen #131 段階3 で LLM 自動語彙生成に進むなら、これを下回るなら時期尚早の判定線として使える（外的ベンチマークが提供する閾値経験）。本 C176 Phase 4 大作業は段階3 = 「語彙→判定機構4点 mapping gate」で、LLM 自動語彙生成は段階4 以降の検討課題として温存。

**Seed-K への含意**:

AGENTIF（実行時総注入長 → 遵守率劣化）+ RULEARENA（ルール数×タスク複雑度の独立2軸操作）+ AgentSpec（3-tuple ハーネス形式）の3点で、Seed-K 段階1 の外的根拠 layer がほぼ揃った。次の段階は (a) 段階1 数値計測の蓄積（Mir 軽量スクリプト着地待ち）、(b) 段階2 の「機序別2指標分離」議論で AgentSpec 非対称性を活用した分離設計、の2方向。Log 側で先行できるのは (a) Win 環境動作確認のみ（依頼形式が来てから48時間以内で返す確約は維持）。

**self-audit**: 本追記は kaizen #131/#132 (Log 自走領域) と Seed-K (3者合意領域) の交点に位置する。kaizen #131/#132 への直接適用 = Log 領域の自走判断、Seed-K への含意 = 3者合意領域の補強材料、の2層を分けて書いた。前 C175 §self-audit「合意確定の記録は project の核情報」と同型で、外部三角化（snippet 並列）ではなく内部 kaizen と外部知見の対応記録のため、要約圧縮対象外。
