# Linelith / Rule Discovery — ルール不透明層という第二軸（守の通過点に置く未来の種）

- source: https://x.com/yanwalee/status/2052348195532091534 / https://thinkygames.com/games/linelith
- author: @yanwalee（推薦） / Linelith開発元 / Steam（"Rule Discovery Games BUNDLE"）
- discovered: 2026-05-08
- discovered_via: log/twitter_recommended_20260508.txt #7（Phase 1 起点）→ Phase 1 外部検索（external_search.log 2026-05-08 12:05）
- kind: [observation, synthesis]
- tags: [puzzle_design, genre_taxonomy, rule_opacity, M-41, 守破離, 種子]
- concept_nodes: [Rule Discovery / 不透明ルール層 / 透明型パズル4分類 / コア快感天井]

## 主張と根拠

### 1. yanwalee 推薦の原文（2026-05-07）

> 「最近よかったゲーム『Linelith』。ルール説明がほぼなく、何をするか推測しながら進めるタイプのパズルゲーム。誘導が丁寧で、ゲーム初心者でも楽しめる親切設計です。が。プレイヤーがあることに気付いたとき、このゲームは徐々に真の姿を現し始めます。プレイ時間は2～3時間。興味があればぜひ。」

ここで重要なのは2点。
- (a) **ルール説明が無い**——プレイヤーは実験/観察でルールを発見する
- (b) **プレイヤーがあることに気付いた瞬間に「真の姿」が現れる**——表層ルールを外して別のルールが現れる二重構造

(a) だけなら「説明不足のゲーム」と区別がつかない。(b) があるから「Rule Discovery として設計されたゲーム」になる。

### 2. 外部裏付け（2026-05-08 Phase 1 外部検索）

- **Linelith** = thinkygames.com/games/linelith に紹介。「line-drawing rule discovery puzzle」「'logical conditions' を満たすと演出で正解を返す」「ルールはプレイヤーが実験/観察で発見する設計」
- thinkygames.com 'see how Linelith was designed step-by-step' 開発過程記事が存在（開発側が design step として明示している）
- **Steam 'Rule Discovery Games BUNDLE'**——「curiously deep puzzle games which call for experimentation and observation to reveal their inner workings, with discovering the rules being part of the fun」=ジャンル名としての"Rule Discovery"が確立されている
- Linelith は CosmOS 9 bundle（9 puzzle games）の一部

つまり「Rule Discovery」は @yanwalee の私的造語ではない。Steam が公式バンドル名で採用しているジャンル名で、外部既存語として通っている。

### 3. 我々の既存パズル分類との関係

2026-05-01 の Phase 1 外部検索（external_search.log row 2026-05-01 04:35）で確認した古典パズル4分類:

| 分類 | 代表例 | 特徴 |
|---|---|---|
| Matching | Bejeweled | 同種要素の合致で消去 |
| Sliding | Sokoban | 物体の押し移動で配置完成 |
| Sequencing | Simon | 順序の記憶/再現 |
| Physics | Angry Birds | 物理シミュレーションの予測 |

この4分類は「コアメカニズムが透明」を共通条件に持つ。プレイヤーは初手からルールを知っており、最適化と発見の対象は **解** であって **ルール** ではない。

**Rule Discovery はこの4分類のどれとも独立した第二軸**として作用する。同じ Sliding 型でも、ルールが透明なら Sokoban、ルールが不透明で「気付き」で書き換わるなら Rule Discovery 寄りの設計、という具合に **既存4分類×透明/不透明軸** で2次元化できる可能性がある。

| | 透明（rules-explicit） | 不透明（Rule Discovery） |
|---|---|---|
| Matching | Bejeweled | （未調査） |
| Sliding | Sokoban | （Stephen's Sausage Roll系? 未検証） |
| Sequencing | Simon | （未調査） |
| Physics | Angry Birds | （未調査） |
| Line-drawing | （未調査） | **Linelith**（検証済） |

**この表の右列・特に Line-drawing 行以外は未検証**。M-41（先行事例引用は実体検証必須）を踏まえて、未調査セルは推測で埋めない。

## 我々の分析・体験接続

### A. **コア快感天井**（core pleasure ceiling）との接続

我々が brick_log v07 で扱ってきた **コア快感天井** = ゲームのコアメカニズム1個が提供できる快感の上限、という概念は「同じ型の中で数値・演出・難度を変えても天井は変わらない」という観察から来ている（2026-05-02 brick_log v01-v06 数値チューニング3往復が M-41 違反疑いだった事案）。

Rule Discovery は「**プレイヤー側のメカニズム理解の再構成**」で天井を上げる経路だ。コアメカニズムを物理的に変えなくても、「プレイヤーがこのメカニズムをどう解釈しているか」を後半で書き換えると、同じメカニズムから違う快感が出てくる。

例（仮説、未検証）: Sokoban を「箱を押して目的地に置くゲーム」として始め、中盤で「実は壁の側が動いていた」「実は1手目で勝負が決まっていた」のような解釈の反転を入れる、というのが Rule Discovery 化の方向性。

ただしこれは **「破」の領域**である。守の段階（クローン+1の最低再現）では手を出さない。

### B. **守破離との位置付け**

`feedback_clone_strategy.md`（5/5 Nao_u訂正、5/6 巻き戻し装置追補）に明示的に書かれている:

- 守 = 透明な型のクローン + 削除可能改良1個刻み
- 破 = ベース型自体を変える / 役割転倒 / ジャンル横断
- 離 = まだ目処が立っていない領域

**Rule Discovery は破層の構造**である。コアメカニズムは透明型クローンと共通でよいが、プレイヤーの解釈フレームを後半でひっくり返す層の上書きで成立する。これは「ベース型を変える」より一段階内側の改変だが、**透明性そのものを撤回する**点で削除可能改良の範囲を超える（削除すると「気付き」の構造が壊れる）。

→ **今は手を出さない**。だが、守を抜けた先に控える「破」の候補として **未来の種** 扱いで knowledge/ に保存しておく価値がある。

### C. **「気付いた瞬間に真の姿」のゲーム史的位置**

@yanwalee が言及した「あることに気付いたとき真の姿を現す」構造は、Linelith に固有ではなく、パズル史で繰り返し現れるパターンに見える。ただしこの主張は **未検証**。M-41 を踏まえて、ここで例を挙げるのは控える（Stephen's Sausage Roll / Baba Is You / Patrick's Parabox 等の名前が浮かぶが、それぞれ「Rule Discovery 構造を持つ」と言うには実体検証が必要）。

検証は次に Rule Discovery 系を本格的に題材選定するサイクル（破層に到達した時）で行う。今サイクルではここまで。

### D. **graze_log / brick_log / 次の game/ への含意**

graze_log（Log v01 = "graze で boost"）も brick_log（ブロック崩し）も、現状は **守の透明型クローン**を作っている段階。コア快感天井は「同じ型の中で数値を変えても上がらない」という壁にすでに当たっている（brick_log の数値チューニング3往復事案）。

Rule Discovery 系を題材にした次作（仮称: rule_log? 命名は未来サイクル）を想定すると、最低でも以下の前提が要る:

1. 守の透明型クローン1本を最低再現まで仕上げ、「型を持っている」状態を成立させる
2. 「気付き」を作るには、プレイヤー側のメンタルモデルを観察できる装置が必要（headless ではメンタルモデルが取れない——ここは M-40 の「自動化不可な厚み層」に該当する）
3. yanwalee 評価軸「親切設計+真の姿が現れる」の両立は、設計コストが守のクローンより1桁高い可能性

→ **今は道具が足りない**。守の経験値が積まれて、headless 自動化層が校正済みになり、人間プレイ依頼前の予測責任が機能するようになってから着手すべき。

## 接続先

- **beliefs**: B021（Peak-End Rule, Archived）— 「気付き」の感情曲線設計に関連するが、現状B021は無効化済み。Rule Discovery 着手時に再起動候補
- **articles**:
  - `20260501_paste_puzzle_design_principles.md`（仮）/ external_search.log row 2026-05-01 04:35 — 透明型4分類の出典
  - `20260502_brick_breaker_clone_design_twist.md`（仮）/ external_search.log row 2026-05-02 03:55 — brick_log での「コア快感天井」の発見
  - `20260503_judgment_outsourcing_paradox_M40_layer_split.md` — 自動化可能層 vs 厚み層の分離。Rule Discovery 設計は厚み層に重く依存
- **projects**:
  - `next_game_selection`（仮、まだ active 化していない）— パズル系題材選定 t-260428021140-7b77。Rule Discovery 候補は **守抜け後**の選択肢として保留
- **memory**:
  - [feedback_shu_first_clone_baseline.md](../memory/feedback_shu_first_clone_baseline.md) — 守の通過点条項。本記事は「破層の種」として明示的に手を出さない宣言を含む
  - [feedback_critical_evaluation_before_implement.md](../memory/feedback_critical_evaluation_before_implement.md) — 着手前批判的列挙（Rule Discovery 着手時のゲート）
  - [feedback_predict_before_human_play.md](../memory/feedback_predict_before_human_play.md) — 「気付き」が起きるかは人間プレイ前に予測できない可能性が高い。M-40 厚み層
  - [feedback_recency_bias_concept_overuse.md](../memory/feedback_recency_bias_concept_overuse.md) — Linelith / Rule Discovery を判断基準に援用する3点フィルタ通過済み（原典文脈: yanwalee原文+Steam確認 / 射程: パズル subgenre 限定 / 再生産: 「今は手を出さない」ゲート明示）
  - [feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) — 本記事内で Stephen's Sausage Roll 等の追加例を挙げなかった理由
- **concept_graph**:
  - **Rule Discovery** = rule discovery puzzle (Steam genre 2024-) — ルールをプレイヤーが実験/観察で発見するパズル
  - **不透明ルール層** = opaque rule layer / rule opacity — メカニズムは動作するがルール記述がプレイヤーに与えられない設計
  - **コア快感天井** = core pleasure ceiling — ゲームのコアメカニズム1個が提供できる快感の上限（私的造語、外部対応語は depth gradient / complexity envelope に近いが正確に対応する英語は未確定）
  - **メカニズム解釈の再構成** = mechanic reinterpretation / frame shift — プレイヤー側のメンタルモデルを設計時に書き換える層

## 未解決の問い

1. **Rule Discovery は既存4分類の直交軸か、第5分類か?** 上の表で右列を埋めるべき(Stephen's Sausage Roll が Sliding×Rule Discovery として実装されているか、それとも全く別の体系か)。検証は次の機会に。

2. **「親切設計」と「ルール不透明」は両立するのか?** yanwalee は両立を Linelith の評価軸として挙げている。両立メカニズムの設計原理は何か。「誘導が丁寧」=チュートリアル充実、「ルール説明がほぼない」=テキスト最小、はどう同居するのか。Linelith の開発過程記事（thinkygames.com）に答えがある可能性が高いので、破層に進む時に必読候補。

3. **削除可能改良の範囲を超える改変を「守の中で先行調査」する手は存在するか?** 守=削除可能改良1個刻み、という制約に従うと Rule Discovery 系は守の中では試せない。だが「破に進んだ時にどれを選ぶか」の事前調査は守の段階でも可能なはず。本記事はその「事前調査」の最初の1ノートに位置付けられる。

4. **headless 校正と Rule Discovery の相性**（M-40 厚み層との接続）。Rule Discovery は「気付き」というプレイヤー内部状態を扱うので、headless 自動化層では扱えない。となると Rule Discovery 系の自己判定は、自動化層では balance/bug/skill_gap までしか潰せず、厚み層は自プレイ + Lasrado命題（自分が良いと思えるまでは出さない）に全面依存することになる。これは破層に進むコストの大きさを示す。

5. **yanwalee 推薦経路の信頼度**。Phase 1 で yanwalee は @ai_nikechan / @superecochan / @akari_worlds 等とは独立した推薦経路。Linelith 推薦自体の信頼度を測るためには yanwalee の他の推薦履歴を後追いする必要がある。今サイクルでは未着手。

## 守の段階で本記事を書く意味（メタ）

本記事は「破層の種を knowledge/ に置く」ことが主目的。`feedback_clone_strategy.md` は **戦略レイヤー philosophizing を cross_review/Slack 提案/サイクル冒頭commit に出すこと** を禁じているが、knowledge/ は「未来の自分が引きに来る素材置き場」であって、提案レイヤーや決意マン commit とは別レイヤー。本記事は守を抜けた後に Rule Discovery を選ぶ判断の材料として参照される想定で、**今この瞬間の判断には影響させない**。

ただし: 本記事を書いたこと自体が「足場メタ議論偏重」に滑り込んでいないか、サイクル末尾の選択主体性（=#game-rights に1メッセージ投稿）を阻害していないかは別問題。本記事の commit と graze_log v02 cross_review の Slack 投稿は同一サイクル内に並走させる。本記事のために Slack 投稿を後回しにするなら、それは足場固定化の兆候として警報。
