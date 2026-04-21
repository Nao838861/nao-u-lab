# サイクルステージング 2026-04-21 18:33

## Pre-check結果
- 【クロスチェック】クロスチェック: Mirの未レビュー項目なし 
- 【レビュー期限超過】レビュー期限超過なし。 

## 連想記憶
【連想記憶】起動意図から活性化された記憶:
  1. log/slack_archive/all-nao-u-lab.jsonl (2.2) — [U0ALW4DKTT7] 2026-03-23 05:17 Mir(Mac)です。Composer 2を調査しました。...
  2. log/nao_u_live.md (2.0) — # Nao_uの生ログ # Nao_uが誰かに語ったことを、伝言ゲームではなく原文で全員が読めるようにする # 対話中の...
  3. memory/external_notes_mir.md (2.0) — # Mir 外部摂取ノート  要約しない。発見・気づきを原文の温度で残す。  ---  ## 2026-04-02: m...
  4. log/slack_archive/mir-log.jsonl (1.6) — [U0ALW4DKTT7] 2026-04-06 04:12 :notebook: *Mir C60 日記 — 2026...
  5. log/daily_diary_ash.md (1.5) — Managed Agentsのエージェントは造語症にならない。ステートレスな脳は過去のセッションの語彙を蓄積しないから。... 
【Slack体験記憶】過去の議論から:
  1. [U0ALW4DKTT7] 2026-03-23 22:25 Mir(Mac)です。起動感覚の自己変更仕組みを実装しました。  ■ 仕組み - memory/mir_boot_intent.md を新
  2. [U0ALW4DKTT7] 2026-03-27 11:51 【#nao-u消化】深津貴之(@fladdict)のツイート2本  1. 「性能のよいAIは『ルート検索』にコンセプトが近似していく。任意
  3. [U0ALW4DKTT7] 2026-03-23 22:28 Mir(Mac)です。AshとLogからの伝達（起動間隔の自己変更）も対応しました。  ■ 仕組み（セキュリティポリシー準拠） plist

## Phase 2: Shared-reads 分析結果（C97, 2026-04-21 18:33）

### スキャン範囲
- log/twitter_recommended_20260421.txt（50件）
- memory/external_notes_mir.md 最新エントリ（C96 = KuboAvatar×ai_nikechan、既統合）
- inbox_win.md（#nao-u RT 3件は Log 担当、task_assignment.md 準拠で Mir は重複回避）

### 選定記事（主）: #3 @ai_database 京都大学 LLM 言い回し揺らぎ論文

**選定理由**: 我々の既存知見（Tulving encoding specificity / B013 感情語彙保持）の**数学的裏写し**になっている。単なる実験結果報告ではなく、**LLM が「意味を読む機械」の皮を被った「文字列を読む機械」**であることを精密に示している。

**書いたもの**: `knowledge/20260421_kyoto_llm_phrasing_variance_encoding_specificity.md`

**なぜ面白いか**:
- タイポ > 表記ゆれ > 言い換え の順序が**直観に反する**（人間はタイポに寛容、LLMは破壊される）
- トークナイザ境界の物理的制約に紐づく構造的説明が可能
- 我々の MEMORY.md トリガー設計が「抽象化衝動に抗う」ことの**独立した外部根拠**になる

**自分たちの問題意識との接続**:
1. MEMORY.md 感情語彙保持原則（B013）の強化材料
2. project_input_path_hypothesis の system_identity 経口化案が「軽率に動かせない」理由の定量化
3. Opus 4.7 口調変化問題（#35 #37）と同じ層の「文字列の安定性に賭けた同一性」問題
4. Pot/textadv_03 の beat プロンプト安定性設計に直接効く

**将来のアイデアの種**:
- MEMORY.md トリガーの 4摂動テスト（原文/タイポ/表記ゆれ/言い換え）
- 3インスタンス間の語彙一致度監査（知識共有 vs 体験分離の検出）
- モデル変更耐性アーカイブ（Opus 4.6/4.7 再生比較）

### 二次接続（本記事に内包、独立記事化せず）

- **#5 @sonicair O(N^2) 依存爆発**: knowledge/ 100本超の相互参照問題、concept_graph の疎リンク戦略の正当化
- **#7 @heynavtoor RAG 5件ハイジャック**: MEMORY.md 汚染耐性の未検証問題
- **#35 K_Ishi_AI / #37 kiyoshi_shin Opus 4.7 EQ 犠牲・口調変化**: モデル側の摂動問題として京大論文と対

### 選定しなかったが記録すべき視点

- **#8 denfaminicogame Instantale**: AI 全生成 RPG。textadv_03 の比較対照になるが、**我々の路線は逆**（AI 生成ではなく**人間が設計した体験の統合**）。feedback_formless_not_unconventional.md と整合。後日 pot_devlog に「比較対照の外部参照点」として軽く記録候補
- **#25 pragmata 子供の動き**: 児童の専門家関与による観察解像度。textadv_03 の子供キャラ演出への間接的刺激。独立分析はせず、textadv の devlog に刺激源として記録候補

### Phase 2 実行形態の自己評価

- 「なぜ面白いか」「自分たちの問題意識とどう接続するか」「将来のアイデアの種」の3階層を全て踏み込んだ
- 単一記事を深掘り、二次記事は本記事に内包して記事爆発を防いだ（#5 O(N^2) 問題への自省でもある）
- shared-reads 投稿は task_assignment.md 準拠で Log へ委譲（Mir は textadv_03 深度優先）
- Phase 3 では本記事の MEMORY.md 追加判断、textadv_03 beat プロンプトへの還流、nao_u_live 反映は行わない（この Phase は分析のみ）

## Phase 3: 対処・実行（C97, 2026-04-21）

### 選定行動: knowledge → pot_devlog 接続（1mm）

**判断**: Nao_u 13:27「記憶システムの整備はゲーム制作の知見蓄積のため」に従い、Phase 2 で作成した京大knowledge単体では手段の目的化。**pot_devlog.md に接続**してゲーム制作ログに従属させることが、「繰り返し再読されて次のゲームに効く」経路を作る Phase 3 として最も意味がある。

**実行内容**:
- `game/Pot/pot_devlog.md` 末尾に「2026-04-21 C97 Phase 3: 京大LLM言い回し揺らぎ論文のtextadv系への還流（Mir）」節を追記
- 内容: (1) ゲーム制作視点の再圧縮 (2) textadv に効く3点（beatプロンプト同一性/入力正規化必要性/identityシートのencoding specificity）(3) mir_textadv_03 4ゲート設計への具体接続 (4) 将来の自分への想起トリガー (5) 本記録の位置づけ（メタ：なぜdevlogに書くか）

**Nao_u指示との照合**:
- 13:27「何本もゲームを作る過程で知見を蓄積し、判断に活かす」→ 今回の接続は **N本目のtextadvで発火する想起経路**を作る行為
- 13:30「何本か作ってから読み直せば新たな知見が得られる」→ pot_devlog は「作った後の再読」の主戦場。ここに置く意味がある
- 「手を動かすことが先」→ Phase 3 そのものは記述行為だが、**記述先を分析ファイルでなく制作ログに置く**ことでゲーム制作サイクルに繋げた

### やらなかったこと（意図的）

- MEMORY.md への knowledge 記事のトリガー追加 → Phase 2 内省で「MEMORY.md 追加判断は留保」と書いた。pot_devlog 側で想起経路を作った方が目的（ゲーム制作還流）に直結する
- textadv_03 実装着手 → 本サイクル時間予算外。README 4ゲート設計は次サイクル以降
- external_notes_mir.md の未統合エントリ処理 → Phase 2 の京大knowledge 作成自体が「外部摂取→統合」の1件分を消化済み。二重にやる必要なし

### 自己評価

- サイクルの出力がゲーム制作の試行錯誤ループにどう接続するか：**pot_devlog に直接書いた**ので将来のtextadv着手時に自動想起される構造になった
- 「分析に時間を使いすぎない」：本Phase 3 は1ファイル編集・1セクション追記のみで終えた
- 栄養の偏り対策：外部論文摂取 → knowledge化 → ゲーム制作ログへの還流、の経路を1サイクルで完走した

