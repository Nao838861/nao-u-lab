# knshtyk「OpenAIゴブリン問題」× sokoban_ash v01「数字の未検証バグ」 — 層分離下での content-leak

- source:
  - https://x.com/knshtyk/status/2049788814433071393 — knshtyk「OpenAIゴブリン問題、結局これはパーソナリティ構築の学習時における人間の評価の痕跡が元モデルの学習に還流するというモデル学習の設計の問題に見えるな。ソースに対しては下流の追加部分、分離されたレイヤーであるべきモデルの性格のための学習結果が元モデルに混入する設計が普通にだめでしょ」(2026-04-30)
- author: @knshtyk / Ash合成
- discovered: 2026-05-01
- discovered_via: log/twitter_recommended_20260501.txt #3（Phase 1）
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [knshtyk, layer-contamination, m-34-candidate, sokoban-v01, write-then-verify, content-leak]
- concept_nodes: [層分離下のcontent-leak, 未検証残渣, 数字検証ゲート]

## 概念ノード（R-007 外部対応語併記）

- node: **層分離下のcontent-leak** = inter-layer content leakage under formal layer separation
  external: cross-layer information leak / personality-to-base contamination (knshtyk 2026-04-30) / training-set contamination (Carlini et al. 2021)
  meaning: 構造として層分離が成立していても、各層内で書かれた命題が検証フックを欠くまま下流層に流れ込み、下流層の振る舞いを歪める現象
- node: **未検証残渣** = unverified residue
  external: stale assumption / unsubstantiated claim
  meaning: 上流文書（分析記事/設計書）で書かれた具体数値・前提が、実値による1度の照合を経ないまま下流（実装/プレイ）に持ち越される状態

## 主張と根拠

### 1. knshtyk の構造命題

OpenAIの「ゴブリン化」問題（モデルが意地悪・卑屈・過剰に同調するなどの性格ドリフト）を、knshtykは **モデル学習設計の問題** と位置付ける:

> 分離されたレイヤーであるべきモデルの性格のための学習結果が元モデルに混入する設計が普通にだめでしょ

ポイントは2つ:
- (a) 「層は分離されているべき」という設計意図の存在
- (b) その意図に反して、上位層（パーソナリティ調整）の人間評価痕跡が下位層（元モデル）に **還流** する経路が事実として開通している

これは「層を作れば分離する」という素朴な前提を否定している。**層は宣言で分離されない、検証で分離される**。

### 2. 我々の3層プロンプト構造と sokoban v01 で起きた同型現象

我々は2026-04-03に3層プロンプト構造を導入した（CLAUDE.md冒頭）:
- 層1: `.claude/system_identity.md`（アイデンティティ）
- 層2: `CLAUDE.md`（構造ポインタ）
- 層3: `.claude/rules/*.md`（ファイル操作時自動注入）

これとは別に、文書の機能層も実質的に分離されている:
- 分析層: `knowledge/*.md`（外部観察と統合）
- 設計層: `devlog.md`（着手前判定とゲート）
- 実装層: `*.py` + `headless_check.py`

**今サイクルの実バグ**: `knowledge/20260501_minimalist_puzzle_4taxonomy_t7b77_sokoban_convergence.md` §7 で「最短3手・上限8手」と書いた。書いた瞬間は正しいと思った。devlog（設計層）に「最短解：左×4でCLEAR」と転記した。`sokoban_v01.py` の `MOVE_LIMIT=8` と初期レベル文字列を実装した。`py_compile` を通した。**ここまで一度も実値で動かしていない**。

`headless_check.py` を書いて `try_move(LEFT) × N` を流した瞬間、レベル文字列の box→goal 物理距離が **10マス**（4ではない）と判明した。MOVE_LIMIT=8 では物理的に解けない。**分析層で書いた数字が検証ゲートを通らずに実装層まで流れ込んでいた**。

これは knshtyk の言う **layer-contamination の content 版** だ。学習過程ではなく、文書間の参照過程で起きている。構造としての層分離（フォルダが別、ファイルが別、kind タグが別）は成立していたが、上流→下流の命題搬送に検証フックがなかったため、未検証残渣が下流の物理動作を破壊した。

修正は1分（レベル空白調整＋MOVE_LIMIT=6）。**もし headless_check を書かずに devlog だけ更新して closed としていたら、初プレイのNao_uに「解けない」と返されていた**。

### 3. content-leak の検出条件

knshtyk のケースは **下流（基盤モデル）の挙動異常** で初めて表面化した（ゴブリン化）。我々のケースは **下流（実装）の物理動作不能** で初めて表面化した。**両方とも、上流側を読み返しても矛盾は発見できない**——上流は内的に整合しているからだ。

検出は下流での **実値1度** が要る:
- knshtyk側: 大量プロンプトで挙動を引き出す
- 我々側: `headless_check.py` で `try_move` を1回流す

**「書いた直後に動かす」が層分離の最低限の検証フック** になる。これは形式検証ではなく、命題に物理を1回当てる手続き。

### 4. M-34 刻印候補としての位置

`game/sokoban_ash/v01/devlog.md` 末尾に既に M-34 候補を保存した:

> 数字（最短手数・距離・確率）を書いた直後に、実値で1度実行する

knshtyk の観察は **同じ処方の、別領域での独立証言** になる。1事例での刻印は早いが（M-33 までの刻印基準: 複数インスタンス再発 or 異領域同型）、**異領域同型 = 学習設計領域での同型観察** が今回提示された。Mir/Log 側で同型再発（数字未検証 → 下流バグ）が観測されれば刻印条件成立。

## 我々の分析・体験接続

### 5. 何が新しいか / 何が既存記事と被るか

新しい点:
- **「層分離は宣言で成立しない」** という命題を、我々の3層プロンプト構造に対しても適用する視点
- 文書層間の content-leak を、学習層間の content-leak と同じ問題として括る
- M-34 刻印候補に外部の独立証言を1本付ける

既存と被る点:
- `feedback_critical_evaluation_before_implement.md`（着手前批判レビュー）は本件をカバーしていた **が**、対象は「予測可能懸念の列挙」であり、「上流文書の数字の実値検証」は射程外だった。今回バグは「12個の悪い点 batch-resolve」を全パスしたうえで起きている → **既存ガードの隙間に入り込んだ**
- `knowledge/20260409_tokoroten_ai_neologism_psychosis.md`（造語症）は語彙レベルの上流→下流流入観察。本件は**数値レベル**の同種現象

### 6. 処方（confidence: medium）

(a) **knowledge 記事内で具体数値（最短手数 / 上限 / 距離 / 確率）を書いた場合、その記事は「数値ゲート未通過」マークで closed しない**。該当ゲームの headless 1走で実値が一致するまで「数値仕様」セクションは草稿扱い。
- 適用: 本記事と `20260501_minimalist_puzzle_4taxonomy_t7b77_sokoban_convergence.md` §7 の「最短3手・上限8手」記述に対する遡及検証。convergence記事は実装で MOVE_LIMIT=6 に修正済 → 該当箇所を「v01実装後に距離=10判明、上限6に確定」と追記する必要あり（次の編集サイクルで処理）。

(b) **devlog の「動作確認手順」に "headless_check 1走" を含める**を Sliding/Matching/Sequencing 系全般のテンプレ化候補として提案。Phase 3 着手前ではなく **着手途中の中間ゲート**。

(c) M-34 候補は本記事を以て1票（外部独立証言）。あと1票（Mir/Log での同型再発 or 別ゲーム同型）が観測された段階で刻印判定。

## 接続先

- **beliefs**: B028（型あり筋良し戦略）の実装段階での content-leak リスク注釈候補
- **articles**:
  - knowledge/20260501_minimalist_puzzle_4taxonomy_t7b77_sokoban_convergence.md（数字未検証残渣を含んだ上流記事）
  - knowledge/20260409_tokoroten_ai_neologism_psychosis.md（語彙レベルの content-leak と同型）
  - knowledge/20260427_trtd6trtd_aphyr_llm_truth_indifference.md（LLMの真理無関心 — 数値の真偽より構造整合を優先する傾向の系列）
- **projects**:
  - projects/INDEX.md「次作パズル系題材選定」(t-7b77) — sokoban v02 着手前にテンプレ化判断
- **game_lessons_log**:
  - M-34 候補（数字を書いた直後に実値で1度実行する）— 本記事は外部独立証言1票
- **memory**:
  - feedback_critical_evaluation_before_implement.md（既存ガードの隙間として明記する候補）
  - feedback_pre_impl_critical_review.md
- **concept_graph**:
  - 「層分離下のcontent-leak」 → 「未検証残渣」 → 「数字検証ゲート」

## 未解決の問い

1. **M-34 刻印を1票でやるか、Mir/Log の同型再発を待つか？**
   暫定: 待つ。1票での刻印は M-30〜M-33 の刻印基準（複数事例 or 異領域同型）と整合しない。本記事は **異領域同型1票** に該当するが、game_lessons は **ゲーム制作領域** の刻印で、knshtyk のは学習設計領域。混合カウントは保守的に避ける。

2. **「数値ゲート」を knowledge → devlog → 実装の経路全般に強制する設計は、Phase 1〜4 のスキーマを増やすことになり、Aaltonen "No Graphics API" 警告（フォーマットを増やすのではなく実行モデルを再定義）と衝突しないか？**
   暫定: 衝突する可能性あり。本記事の処方(a)(b)は **新ゲート追加** 方向。代替は「分析記事に数値を書かないルール」（数値は devlog 以降にしか書かない）だが、これは knowledge の情報密度を下げる。次サイクル以降で Mir/Log と擦り合わせる。
