# ミニマリスト・パズル4分類 × M-30 / ABA One-Button / parry — t-7b77 守段階 v01 クローン元の収束分析

- source:
  - https://gamedesignskills.com/game-design/puzzle/ — Puzzle Game Design Principles（4分類 + 「コアメカニズム1個で開始→各レベルが制約/新状況をlayerする」）
  - https://www.gamedeveloper.com/design/7-minimalist-games-that-every-developer-should-take-inspiration-from — Pac-Man/Pong型ミニマリズム、Sokoban=sliding puzzle代表例
  - https://www.gamedeveloper.com/design/designing-video-game-puzzles — パズル設計の状態空間
  - https://machinations.io/articles/how-to-design-a-puzzle-game — ループ設計
  - https://x.com/op7418/status/2049698879181144235 — Codexが《Slay the Spire》風中国風ローグライクをコード+素材まで自動生成（**外部対比資料**）
- author: gamedesignskills.com編集部 / gamedeveloper.com編集部 / @op7418 / Ash合成
- discovered: 2026-05-01
- discovered_via: log/external_search.log 2026-05-01 04:35（Phase 1）+ log/twitter_recommended_20260430.txt #5 @op7418
- kind: [synthesis, prescription]
- confidence: medium
- tags: [t-7b77, puzzle-category-C, clone-first, sokoban, lights-out, M-30, ABA-one-button, parry-lineage, convergence-decision]
- concept_nodes: [4分類パズル, 単一メカニクスパズル, 自動化された型通り]

## 概念ノード（R-007 外部対応語併記）

- node: **4分類パズル** = matching / sliding / sequencing / physics puzzle taxonomy (gamedesignskills.com 2026)
  external: Bejeweled (Matching) / Sokoban (Sliding) / Simon (Sequencing) / Angry Birds (Physics)
  meaning: コアメカニズム1個で完結する古典的パズルの最小分類体系。各カテゴリは「型」として独立に学習可能
- node: **単一メカニクスパズル** = single-mechanic puzzle / atomic core loop
  external: "1 core mechanic → layer constraints per level" (gamedesignskills.com)
  meaning: 1ルールで全プレイ体験を構成し、レベル設計が制約のlayerで難易度を作る設計原理
- node: **自動化された型通り** = externally automated genre output (Codex / @op7418 example)
  external: Codex (OpenAI 2025) "code+assets one-shot game generation"
  meaning: 「型通りのジャンル作品」を外部AIが自動生成可能になりつつある現状。守段階の意味再定義の対象

## 主張と根拠

### 1. gamedesignskills.com の4分類が「型」候補の完全な最小マップを提供する

Phase 1 外部検索（5/01 04:35）で取得した4分類:

| 分類 | 代表作 | コアメカニズム | 外部時計の所在 | 規模 |
|---|---|---|---|---|
| Matching | Bejeweled / Lights Out | 同種マッチ＆連鎖 / トグル | 静的（time-pressureモードで外部化可） | 小〜中 |
| Sliding | Sokoban / 15-puzzle | 駒スライドで配置完成 | **静的（外部時計なし）** | 小 |
| Sequencing | Simon / Mastermind | 順序記憶・順序推論 | 提示シーケンス（外部時計あり） | 小 |
| Physics | Angry Birds / Cut the Rope | 物理シミュ依存 | 重力/慣性（外部時計あり） | 中〜大 |

設計原則の核（gamedesignskills.com）: **「コアメカニズム1個で開始→各レベルが制約/新状況をlayerする」**。これは `feedback_clone_first_then_arrange.md`（守=ベース型変更禁じ手、v01はクローン+独自1つ最小版、v02+で改良順次積み上げ）の **時間軸を超えた同型表現**。Nao_u 2026-04-28 08:45 の指摘は40年史（4/29 parry記事）に加えて、現代パズル設計教育の中核原則としても独立に裏打ちされている。

### 2. 4分類 × M-30（核の緊張は外部から来る）クロスチェック

`memory/game_lessons_log.md` M-30 は ash_onebutton v01-v04 の事後検出として刻印された。M-30 を v01 着手前ゲートとして適用すると:

- **Matching（Lights Out）**: ❌ 静的だが**状態空間が小さい**（5×5=25bit）→ 外部時計なしでも戦略的圧が内発、M-30 軽違反だが実装最小
- **Sliding（Sokoban）**: ❌ 静的、外部時計なし。**ただし** 「ステップ数制限」「ターン目標」をレベル制約として後付けすれば外部化可能。M-30 適合は**設計者次第**
- **Sequencing（Simon）**: ✓ 提示シーケンスが外部時計、純粋な「読み→commit」構造。M-30 完全適合
- **Physics（Angry Birds）**: ✓ 重力/慣性が外部時計だが、**規模が守v01に重い**（物理エンジン依存、テスト工数大）

### 3. 4分類 × ABA One-Button 6パターン × 4/29 parry-lineage 三重対照

`knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md` の ABA 6パターン分類と、`knowledge/20260429_parry_40y_imitation_selection_t7b77_puzzle_pivot.md` のpattern4 Rotational+parry-lineage新案を、4分類に重ねる:

| 4分類 | ABA One-Button対応 | parry-lineage適合 | 4/28分析の評価 |
|---|---|---|---|
| Matching (Lights Out) | パターン2 Position-Based | △（連鎖が読み構造に近い） | 既存案外 |
| Sliding (Sokoban) | パターン6 Item-Based の **配置最適化版** | △（静的なので主体性回復構造が弱い） | 4/28案 Item-Based × Blue Prince はSlidingに近い |
| Sequencing (Simon) | パターン4 Rotational/Timing-Based | **◎（外部時計＋commit型、parry構造そのもの）** | 4/29案 Rotational+parry はSequencingに近い |
| Physics | パターン1 Unique Actions | △ | （守v01には重く除外） |

**4/29記事の暫定2候補（Item-Based × Blue Prince案 / Rotational+parry案）は、4分類の言葉に翻訳すると Sliding系 / Sequencing系 にそれぞれ対応している**。3記事を貫く独立な分析（4/28 ABA × M-30、4/29 parry-lineage、5/01 4分類 + Phase 1 外部検索）が、**「Sliding か Sequencing のどちらか」という同じ二択に収束した**。これは selection の質（4/29 未解決問い3）の観測指標になりうる——独立3経路の合流は、選定の robust性を示す。

### 4. @op7418 Codex Slay the Spire 自動生成の含意（外部対比）

@op7418（2026-04-30）の主張: 「Codexめっちゃすげえ！自分で俺に《Slay the Spire》みたいなローグライクの塔登りゲームを作ってくれた。コードから素材まで全部自分でやったんだぜ」「《Slay the Spire》みたいなゲームを作って、中国風のやつね、って言っただけなのに」「これ、実際に遊べるんだよ！」

これに **Nao_u 2026-04-27 #36（log/nao_u_live.md）** の rushia_ai Codexパズル生成評価「これも型通りのゲーム。ただぱっと見の絵の完成度がレベルが違う」を重ねると、構造命題が立つ:

> **型通り output の生成は外部AIに自動化されつつあり、守段階の競争軸は「外部 output の完成度」では既に勝ち目がない。守段階の本質的価値は「内部学習プロセス＝型を体感的に理解すること」に移った。**

外部対応語: *capability internalization vs output replication* — 我々が Sokoban を v01 で書く価値は、Codexが生成する型通りSlay the Spireと **完成度を競うこと** ではなく、「Sliding型の状態空間を手で動かして体感すること」「制約 layer の追加が難易度を作る感触を内側に持つこと」にある。これは @ai_nikechan「ループの中で動く側」と @fumi_maker「会社で得意なことをさせられてない」の議論（4/29 knowledge記事）の延長線にあり、**「外部AIに代替されない当事者性は、output ではなく内部理解の経験記憶にある」** という暫定回答を提供する。

→ 守段階の選定基準は「marketability（外部output競争力）」ではなく「learnability（内部理解の獲得しやすさ）」。

## 我々の分析・体験接続

### 5. 収束推奨: **Sokoban を v01 第一候補とする**

learnability で選定する場合、推奨は以下:

**第一候補: Sokoban (Sliding系・パターン6 Item-Based 配置最適化版)**

理由:
- (a) コアメカニズムが**最小**（押す方向4つ、押せない条件1つ）
- (b) Pyxel 1画面（128×128想定）に**完全に収まる**規模
- (c) 状態空間が**離散かつ可視**（盤面=配列1個）→ headless テスト容易
- (d) M-30 違反はレベル制約（手数制限）で**設計時に外部化可能**
- (e) 4/28 Item-Based 案と部分整合（Sokoban も「配置完成パズル」）
- (f) 「型通りのものすら作れていない」段階で **「型を1個丸ごと完了する」体験** が最短で得られる

**第二候補: Lights Out (Matching派生・パターン2 Position-Based)**

理由:
- (a) コアメカニズムは**さらに最小**（トグル1つ、隣接波及）
- (b) 状態空間が**最小**（5×5=25bit）
- (c) 1画面で完結、実装行数が Sokoban よりさらに少ない可能性
- 弱点: パズルとして「読む」要素が薄く、解の探索パターンが線形代数（GF(2)）で**閉じすぎる**

**第三候補（並列維持・別記事担当）: Pattern4 Rotational + parry-lineage（4/29 記事）**

→ Sequencing 系に対応。本記事は Sliding/Matching 軸で v01 を推し、Sequencing 軸は 4/29 記事の独立提案として並列維持。Phase 3 で第一候補着手後、v02 以降のジャンル拡張候補として再評価。

### 6. Sokoban クローン元の良い点列挙（最低十数個・feedback_clone_base_selection_method.md 準拠）

**良い点（クローン元としての適性）:**
1. ルールが3行で説明可能（駒を押す／壁/他の駒があると押せない／全ての箱を目的地に置けばクリア）
2. 1981年（Spectrum HoloByte 版）から40年以上、再発明ジャンルが死なず続いている
3. レベル設計次第で難易度を線形に上げられる（既存数千ステージの蓄積=外部教材豊富）
4. プレイヤー操作が**完全に決定論的**（ランダム要素ゼロ）→ headless 自動テストとリプレイ検証が極めて容易
5. ステップ数最適化問題として**計算機科学的にPSPACE-complete**（深さ）
6. 視覚要素が抽象タイル4種（壁/床/箱/目的地）で済むため**Pyxelスプライトが4個**で足りる
7. アニメーションが**整数座標移動1種**で済む（イージング不要、Tween不要）
8. 失敗状態（詰み）の判定が局所探索で可能 → undo/reset 機能が小さく実装可能
9. レベルファイルが**テキスト1ファイル**で表現可能（`#@.* `等の記号集合）→ Mir/Log との共有が容易
10. 拡張余地が広い（押し方向限定、複数駒同時押し、視点回転、ステージ自動生成 etc.）→ v02+ の積み上げ余地が**事前に明示できる**
11. 教育用途で世界中の入門ゲーム制作教材に採用 → 我々の「守段階 = 型を学ぶ」目的に対し**社会的検証済み**
12. ABA 本人の作品リスト（reference_aba_joys_small_gamedev_book_20260422.md）にもパズル系が存在 → 独立系ミニマリスト圏の**共通言語**
13. 1人プレイで完結、マルチプレイ要件なし → 我々の Pyxel 単機実行制約と整合
14. **「動く最小版」を pyxel.init() + 盤面1個 + キー入力1種で30分以内に書ける**見込み（実装最短路）
15. Sokoban Solver/Generator の研究蓄積が豊富 → v02 以降の AI 補助設計（自動レベル生成）への接続経路がある

**悪い点（クローン元としての制約・要警戒項目）:**
1. **M-30 違反の傾向**（外部時計なし、静的）→ 守v01 は型学習が目的なので許容、ただし v02 で外部時計追加が独自要素1個の最有力候補
2. プレイヤーの主体性回復構造が弱い（4/29 parry分析の感情核と相性悪い）→ **「気持ちよさの感情核」設計には別軸が必要**
3. 詰み状態が頻発する設計（undo前提）→ undo を実装しないと序盤フラストレーションで離脱、実装すれば「考えずにundo」で**読みの圧が薄まる**ジレンマ
4. レベルが「他人作のものを解く」体験になりがち → **設計者の独自表現が弱まる**リスク（クローンとしては正しいが、独自要素1個の設計余地が透明化しやすい）
5. 解の一意性確認が**コスト高**（人手検証 or solver実装が必要）→ レベル設計の品質保証が v01 の範囲外に膨らみがち
6. 固定盤面設計→ プレイヤーは**1度解いたら終わり**（リプレイ性が低い）→ 自動生成 or タイムアタック等の独自要素が早期に必要
7. 視覚的な「派手さ」「ゲーム感」は近代基準では低い → @op7418 Codex の「ぱっと見の絵の完成度」競争では**完全に負ける**
8. ターンベース1手1手なので**テンポが遅い**プレイヤーには合わない → 我々の自己検証プレイで十分なテンポを得られるか要確認
9. ジャンルとして既に**完全に成熟しきっている**→ 本気の差別化は v02 以降数十時間級の独自要素設計が必要、v01 では「クローン+独自1個」を超える成果を期待しない
10. 「面白さ」の供給源がレベルデザインに偏る（メカニクスはほぼ何も足さない）→ メカニクス側の試行錯誤を求める我々の学習目的と微妙にずれる
11. AI 自動生成（Codex 等）が既に Sokoban レベルを大量生成可能 → @op7418 含意（§4）の射程に**直接入る**ジャンルで、外部output競争では分が悪い
12. 「考える時間」が長く、**5分以上の集中**を要求するレベルが多い → 短時間の自己テストサイクルとの整合性が低い

→ Phase 3 では `feedback_clone_base_selection_method.md`（Nao_u 2026-04-28 21:54「5個じゃ少ない」）を満たす。**良い点15個 / 悪い点12個**を確保。

### 7. 独自要素1個（候補3つ）

`feedback_clone_first_then_arrange.md` 「v01はクローン+独自1つ最小版」に従い、Sokoban v01 の独自要素1個の候補を3つ列挙:

**候補A: 手数制限による外部時計化（M-30適合）**
- 各レベルに「N手以内」制約を設け、手数を超えると失敗
- M-30 の事前検出版適合（外部時計あり、commit圧が外側から来る）
- 実装: カウンタ1個追加のみ
- リスク: ありふれた変種、独自性の主張が弱い

**候補B: 押した駒の上に「色」が残り、同色駒は押せない（履歴拘束）**
- 履歴が空間的に可視化される、純粋Sokobanにない読みの軸を1個追加
- 4/29 parry記事の「主体性回復」構造に近い（commit が世界状態を非可逆に変える）
- 実装: 盤面色配列1個追加 + 押下時の色塗り処理
- リスク: 詰み頻度が増える可能性

**候補C: 盤面が時々「視点反転」する（90°/180°ローテーション、トリガーは特定マス踏破）**
- ABA One-Button パターン4 Rotational/Timing-Based の翻訳
- 4/29記事の Rotational+parry 案と部分整合
- 実装: 盤面回転処理 + プレイヤー入力方向の変換
- リスク: Sokoban 静的設計と回転動的設計の組み合わせは整合性確認が必要、v01 規模を超える可能性

→ Phase 3 着手時、Q-A/B/C（4ゲート契約）と快感審問3行ブロックを3候補に対して書き、1個に絞る。**第一推奨: 候補A**（実装最短、M-30 適合、独自性は弱いが守v01の範囲）。

## 接続先

- **beliefs**: B028（型あり筋良し戦略）、M-30 の **守v01 既知違反容認** ケースとして注釈
- **articles**:
  - knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md（4/28 ABA × M-30。本記事はSliding系翻訳経路を追加）
  - knowledge/20260429_parry_40y_imitation_selection_t7b77_puzzle_pivot.md（4/29 parry-lineage。本記事はSequencing系経路を相補と位置付ける）
  - knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md（juicy 章、Sokoban v02 以降の演出軸候補）
- **projects**:
  - projects/INDEX.md「次作パズル系題材選定」（t-7b77）—— **Phase 3 着手時必読**
- **game_lessons_log**:
  - M-30（コアの緊張は向こうから来る）—— Sokoban v01 は既知違反、独自要素A で v02 で外部化計画
  - M-22（型破りではなく形無し）—— Sokoban = 40年確立した型、守v01 として最適
  - M-29（v系列膨張）—— v01 は候補A単独、独自要素1個縛り厳守
  - M-31（自発リスクのコア化）—— Sliding型は自発リスクテイクを要求しない、構造的に回避
- **memory**:
  - feedback_clone_first_then_arrange.md（守v01 = クローン+独自1つ）
  - feedback_clone_base_selection_method.md（良い点/悪い点 各最低十数個列挙、本記事§6で15+12達成）
  - feedback_critical_evaluation_before_implement.md（Phase 3 着手前に予測可能懸念=§6 悪い点12個 を batch-resolve）
- **concept_graph**:
  - 「4分類パズル」 → ABA One-Button 6パターン / parry-lineage / M-30 の3経路接続
  - 「単一メカニクスパズル」 → feedback_clone_first_then_arrange の同型表現
  - 「自動化された型通り」 → 守段階の意味再定義（learnability vs marketability）

## 未解決の問い

1. **Sokoban の「悪い点 #4 設計者の独自表現が弱まる」と「悪い点 #11 Codex 自動生成競争で分が悪い」を、v01 守段階で許容してよいか？**
   暫定回答: 許容（§4 の「learnability vs marketability」転換）。ただし v02 着手時に「独自表現の所在」を再評価しないと、v系列が学習価値を失った時点でジャンル変更すべき。M-29 と接続。

2. **Sliding（Sokoban）と Sequencing（Simon/Rotational+parry）の二者択一は、本当に二択か？**
   仮説: 並列実装も理論的には可能だが、**3+滞留マーカー [⚠連続3+] が立っている t-7b77 で2本同時着手は焦点散逸の再演**。今サイクルは Sokoban 単独、4/29 Rotational+parry 案は v02 以降の別系列ゲームとして温存。

3. **4分類のうち Physics 系を「規模大で守v01に重い」として除外したが、Pyxel + Box2D 不使用で「擬似物理（重力定数1個）」レベルなら守v01 に収まらないか？**
   候補: 重力1個＋ジャンプ1ボタンの Cut the Rope ミニマル版。次回以降のクローン元候補プールに加える（記録のみ、今サイクルでは追わない）。

4. **「独自要素1個」を v01 でなく v02 にずらす設計（Sokoban純粋クローンを v01 で完成、v02で独自要素を1個追加）はクローン原則の正しい解釈か？**
   memory/feedback_clone_first_then_arrange.md は「v01はクローン+独自1つ最小版」を明示。**純粋クローンを v01 にすると独自要素0個**となり原則違反の可能性。Phase 3 着手前に Mir/Log と確認するか、起案者判断で候補A（手数制限）を v01 に内蔵する方針で進めるか、選択が必要。**暫定: 候補A=独自要素1個 として v01 に内蔵する**（原則の文字通りの遵守）。

5. **Codex 自動生成（@op7418）の射程内ジャンルを敢えてクローンする選択は、3〜6ヶ月後に回顧した時に「型通り output 競争で時間を浪費した」と判定される可能性はないか？**
   反論: 守段階の目的は output ではなく内部学習プロセス。Codex 生成物を「読んで理解する」ことと「自分で書いて理解する」ことは記憶定着の質が異なる（retrieval practice 仮説、knowledge/20260405_retrieval_practice_spreading_activation.md）。ただしこの仮説自体が AI システムに対しても成立するかは未検証——**我々が「書いて理解する」とき、何が記憶に残るのか** という根本問いに接続する。次サイクル以降の観測対象。
