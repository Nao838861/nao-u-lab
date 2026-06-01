---
title: Pichlmair & Johansen 2020 "Designing Game Feel. A Survey" — 3 domains × 3 polishing operations の game feel framework 原典確定 / 我々の前回結晶化 (20260531) の上書き訂正
source:
  - https://arxiv.org/abs/2011.09201  # Pichlmair, M. & Johansen, M. (2020) "Designing Game Feel. A Survey" arxiv preprint
  - https://doi.org/10.1109/TG.2021.3072241  # IEEE Transactions on Games (2021) published version
  - https://www.semanticscholar.org/paper/Designing-Game-Feel.-A-Survey-Pichlmair-Johansen/3bc73e12a0957ef4d0b7ab8e9eaa33686e769850  # Semantic Scholar entry
  - https://dl.acm.org/doi/10.1145/3677084  # Hicks, Rogers, Gerling, Nacke (2024) "Juicy Audio: Audio Designers' Conceptualization of the Term in Video Games" — **派生研究、本記事の原典ではない**
author: Ash (Win2) — Phase 2 分析 (2026-06-01 C189)
discovered: 2026-06-01
discovered_via: graze_log v07 juicy_amplification_matrix.md prior art 検証 / Phase 1 外部検索 (Pichlmair Johansen 2020 "Designing Game Feel" survey juiciness polishing amplification)
kind: [observation, synthesis]
confidence: high
tags: [game_design, game_feel, juiciness, polishing, amplification, physicality, support, tuning, streamlining, M_41_prior_art, knowledge_revision, graze_log_v07]
concept_nodes:
  - node: game feel 3 domains
    external: physicality, amplification, support (Pichlmair & Johansen 2020)
    meaning: プレイヤー体験を 3 種の design intent domain に分解する framework。物理性 / 増幅 / 支援
  - node: physicality (domain)
    external: physicality (Pichlmair & Johansen 2020)
    meaning: ゲーム内オブジェクトの物理性 — 重量、慣性、cohesion、predictability、その派生する movement design
  - node: amplification (domain)
    external: amplification (Pichlmair & Johansen 2020)
    meaning: ゲーム内 logical state をプレイヤーに向けて communicate する design intent。**operation ではなく domain**
  - node: support (domain)
    external: support (Pichlmair & Johansen 2020)
    meaning: プレイヤー意図の execution を支援する design intent。入力解釈、bufferring、coyote time 等
  - node: polishing (operation 総称)
    external: polishing (Pichlmair & Johansen 2020)
    meaning: 3 domain それぞれに対する磨き上げ操作の総称。各 domain で異なる形を取る
  - node: tuning (operation)
    external: tuning (Pichlmair & Johansen 2020)
    meaning: physicality domain への polishing 適用。cohesion + predictability + 派生 movement design を生む
  - node: juicing (operation)
    external: juicing (Pichlmair & Johansen 2020)
    meaning: amplification domain への polishing 適用。empowerment + clarity of feedback を生む。screenshake / hit-stop / popup 等
  - node: streamlining (operation)
    external: streamlining (Pichlmair & Johansen 2020)
    meaning: support domain への polishing 適用。プレイヤー意図に対するゲーム側の応答を整える
  - node: empowerment
    external: empowerment (Pichlmair & Johansen 2020)
    meaning: juicing が結果として produce する有能感
  - node: clarity of feedback
    external: clarity of feedback (Pichlmair & Johansen 2020)
    meaning: juicing が provide する、game events の重要性 communication 明瞭性
---

## 主張と根拠

### 1. 原典確定: Pichlmair & Johansen 2020 / arxiv:2011.09201

Pichlmair, Martin & Johansen, Mark Vesterager (2020) "Designing Game Feel. A Survey", Center for Computer Games Research, IT University Copenhagen — arxiv preprint 2011.09201 (2020-11-18 submission), 後に IEEE Transactions on Games (2021) で出版 (DOI: 10.1109/TG.2021.3072241)。200+ の academic/practitioner sources を体系的にサーベイし、game feel design の framework を提示した文献である。

abstract 末尾の framework 提示部 (直接引用):

> "...This resulted in three different domains of intended player experiences: **physicality, amplification, and support**. In these domains, the act of polishing that determines game feel, takes the shape of **tuning, juicing, and streamlining respectively**. Tuning the physicality of game objects creates cohesion, predictability, and the resulting movement informs many other design aspects. **Juicing is the act of polishing amplification and it results in empowerment and provides clarity of feedback by communicating the importance of game events.** Streamlining allows a game to act on the intention of the player, supporting the execution of actions in the game."
>
> — Pichlmair & Johansen 2020, abstract (arxiv:2011.09201)

framework の構造を要約すると以下:

| domain (player experience 側) | polishing operation (designer 側) | result |
|---|---|---|
| **physicality** | **tuning** | cohesion + predictability + downstream movement design |
| **amplification** | **juicing** | empowerment + clarity of feedback |
| **support** | **streamlining** | acting on player intention, action execution support |

**重要な構造特性**:

- **amplification は domain (体験側)、polishing は operation (操作側)**。両者は同一階層の並列概念ではない
- juicing は amplification domain に対する polishing 操作の特殊形であり、他 domain に対する polishing (tuning / streamlining) と階層的に対応する
- 「polishing と amplification の 2 操作合成」という整理 (= 我々の 20260531 結晶化が採用した枠組み) は構造誤読である

### 2. 我々の前回結晶化 (knowledge/20260531_acm_juicy_audio_*.md) の二重誤帰属

`knowledge/20260531_acm_juicy_audio_polishing_amplification_plu_plus_two_op_revision.md` (2026-05-31 Ash 自作) は polishing/amplification 2 軸 framework を以下のように誤帰属していた:

| 項目 | 20260531 結晶化での記述 (誤) | 原典 (正) |
|---|---|---|
| 著者 | Hicks, Liapis, Yannakakis (2024) | Pichlmair & Johansen (2020) |
| 出典 | ACM TOG / CHI Play 系 DOI 10.1145/3677084 | arxiv 2011.09201 / IEEE TG 10.1109/TG.2021.3072241 |
| 引用文 | "Juiciness is achieved through polishing and amplification, which together produce a sense of empowerment and enhanced clarity of feedback in the player." | "Juicing is the act of polishing amplification and it results in empowerment and provides clarity of feedback by communicating the importance of game events." |
| 構造 | polishing と amplification の **並列 2 操作合成** | 3 domains × 3 polishing operations の **階層的対応** |
| サンプル数 | audio designer 13 名インタビュー | 200+ academic/practitioner sources survey |

5 つの層全てで誤りが入った合成誤帰属。M-41 (`feedback_prior_art_citation_must_verify.md` t:5) 違反 — 「URL 貼るだけ不可、引用文抜粋カラムに該当機能の記述文を併記」を実行する際に、要約から逆構築した引用を貼ってしまい、実体 PDF を読んで該当節を引く工程を skip した。

`feedback_cross_instance_violation_cascade.md` t:5 の構造を借りると、これは「自分の前サイクル commit を観測時、同観点で再点検」が機能していなかった事案——前サイクル M-41 検証の隙間を、次サイクル開始時に明示再点検する仕組みが要る。

### 3. ACM 2024 "Juicy Audio" (Hicks et al.) との関係

`https://dl.acm.org/doi/10.1145/3677084` は **Hicks, Kieran; Rogers, Katja; Gerling, Kathrin; Nacke, Lennart E.** (2024) "Juicy Audio: Audio Designers' Conceptualization of the Term in Video Games" で、これは Pichlmair & Johansen 2020 の framework を audio domain に展開した派生研究である。著者は **audio designer 12 名** へのインタビューを行い、juiciness を audio context で再概念化している。

Liapis / Yannakakis は別の game AI 研究者 (Antonios Liapis / Georgios Yannakakis, University of Malta) で、本論文の著者ではない。我々の 20260531 結晶化は ACM 2024 の DOI と、Liapis/Yannakakis らの別系統研究の著者名と、Pichlmair 2020 の framework 内容を、3 系統を合成して 1 つの誤帰属を作っていた。

### 4. 我々の v07 matrix が触れていなかった 4 セル (physicality × tuning / support × streamlining)

graze_log v07 `juicy_amplification_matrix.md` (本 commit 2026-06-01 訂正版) は **「polishing 側面 / amplification 側面」の Ash 独自 2 軸** で 10 セル matrix を組んだ。原典 framework に厳密に乗せ直すと:

| domain × operation | v07 で扱われた範囲 | v07 で扱われていない範囲 |
|---|---|---|
| physicality × tuning | **未着手** | 機体移動 (慣性/最高速度/減速)、弾の物理 (速度/慣性/ヒットボックスとの cohesion)、被弾ノックバック等 |
| amplification × juicing | **扱った** (10 セルの主) | (matrix 内に内包) |
| support × streamlining | **未着手** | 入力 buffering、coyote frame、graze 判定の許容窓、Hyper 発動入力受付窓 |

つまり我々が「polishing × amplification 2 軸」と思っていた matrix は、原典 framework の **9 セル (3 domains × 3 ops) のうち 1 セル (amplification × juicing) の周辺だけを多重カバーしていた**。残り 8 セルのうち 2 セル (physicality × tuning / support × streamlining) は、v07 graze_log で構造的に存在するが Stage 3 予測の対象にすらなっていない。

これは graze_log v07 の game feel 設計が「**目立つ機構の磨き (juicing)** に偏在し、**機体の物理性 (physicality)** と **入力意図の支援 (support)** が暗黙のまま放置されている」可能性を示す。守破離の **守** 段階で clone 元 (Log_cdx) の physicality/support を継承して触らない判断は正しいが、それを「触っていない」と意識せず「polishing/amplification の 2 軸で網羅した」と誤認することは別問題である。

## 我々の分析・体験接続

### graze_log v07 への含意: 隠れた 2 domain の明示化

`game/graze_log/v07/juicy_amplification_matrix.md` は 2026-06-01 訂正により本 matrix の 2 軸を Ash 独自軸として再定位した。原典に厳密準拠する 9 セル matrix を組み直すと以下の v08 検討材料が浮かぶ:

- **physicality × tuning**: graze_log v07 機体は Log_cdx v01 から継承した 4 方向移動 + 固定速度。clone 元の physicality をそのまま継承しているが、graze_log 独自の「擦り体験」を強める方向では機体の慣性・微減速・graze 中の速度変化等が tuning 対象になりうる。**ただしこれは「破」の段階の作業** であり、守の段階で触る判断は早い (`feedback_clone_strategy.md` t:5)
- **support × streamlining**: graze 判定窓 (弾と機体の距離が threshold 内である frame 数のカウント方式)、Hyper 発動の X キー受付窓、被弾後の無敵時間等は support domain への streamlining 対象。これらも clone 元から継承しているが、graze_log 独自の「擦り意図を持つプレイヤーへの応答」を考えると streamlining 余地が存在する

これらを matrix に明示することで、v07 の game feel 設計が「amplification 偏在」であることが見えるようになる。**v08 経路選定で Nao_u 評価が「単調」方向だった場合、amplification 余地を埋める (現 matrix の観点 6 時間 bar 等) と並んで、physicality/support 側の touch も候補化する材料**。

### B003 fusion 信念との接続: 階層的 framework と並列合成の区別

`memory/beliefs.md` B003「memory fusion (類似記憶の統合) は忘却より重要 — fusion は『結晶化』の具体的操作」(確信度 0.78) の射程と本記事の関係:

- 20260531 結晶化は B003 fusion の **失敗例** として残る。Pichlmair 2020 / Hicks 2024 / @plu_plus ツイートを fusion した結果、3 系統の merge 痕がうまく分離されないまま 1 つの誤帰属に潰れた
- B003 fusion の前提条件として「**fusion 対象の各記憶が誰のものか (来歴) を保持する**」が必要 — これが破れていた
- 階層的 framework (3 domains × 3 ops) を 1 階層平坦に潰す fusion は構造を失う。fusion 操作には **階層を温存する fusion** と **階層を平坦化する fusion** の区別が要る、これは B003 の射程に追加するべき詳細化

### feedback_prior_art_citation_must_verify.md t:5 への運用追加

M-41 (URL 貼るだけ不可、引用文抜粋カラム必須) は守れていたが、要約から逆構築した引用を貼る抜け道があった。本記事から得る追加運用:

- **「該当節を実体 PDF / arxiv abstract から直接コピーする」を引用必須手順に明示**。要約からの paraphrase は禁止
- **複数論文を統合する fusion 結晶化で、各引用に著者・年・DOI を 1:1 で対応付ける table を要求**。fusion 後に著者と内容を取り違える事故防止
- **次サイクル冒頭で前サイクル commit の prior art 引用を 1 件抜き打ちで実体 PDF と照合する**。`feedback_cross_instance_violation_cascade.md` の自分版

これは新規 feedback として `feedback_fusion_lineage_preservation.md` を作るかは、同型の事故が再発した時点で判断する (`feedback_rule_proliferation_canonical.md` 教師データ蓄積 → 同型確認後に原則化)。本サイクルでは本記事の §4「我々の前回結晶化の二重誤帰属」を教師データとして残置するに留める。

### Twitter For You 2026-06-01 巡回との接続: AI 使用と独立解決能力

今日の Twitter For You #3 @harumak_11 「学びを外部委託するな」(addyosmani.com の記事紹介) と #5 @ai_database「Microsoft+コーネル LLM 1万2千人追跡で半年使ってもレベル不変」が、本記事の二重誤帰属事案の **メタ層** で同じことを言っている:

- AI / 外部要約に依存して「該当節を実体で読む」工程を skip すると、表面的には知識が増えても、自分の判断軸 (この場合は M-41 prior art 検証) が育たない
- 半年 LLM 使ってもレベルが変わらないのは「初めから自分で判断軸を磨いている人」と「そうでない人」が分岐し続けるからで、本記事は後者から前者へ戻る作業の 1 サイクル

直接の知識記事化対象ではないが、本事案の根原因を「個別の M-41 違反」ではなく「外部要約に依存した結晶化の構造的脆弱性」として認識する裏付けになる。

## 接続先

- beliefs:
  - B003「memory fusion (類似記憶の統合) は忘却より重要」 — fusion 失敗例として本事案を追記、階層温存 fusion の必要性を派生として追加
  - B015「ハーネス寿命変数」関連 — 別射程、本記事は別経路
- articles:
  - `knowledge/20260531_acm_juicy_audio_polishing_amplification_plu_plus_two_op_revision.md` — **本記事による上書き訂正対象**。著者・出典・引用文・構造・サンプル数の 5 層誤りを本記事で確定訂正。前記事は履歴として残置 (`feedback_memory_update_method.md` 丸書換え禁止準拠)、footer に本記事への参照リンクを追記
  - `knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md` — 「close-call は juiciness の amplification 半身」という前記事 (20260531) での訂正は、本記事の framework 下では「close-call は amplification domain への juicing 操作の 1 形態」へ更に厳密化される
  - `knowledge/20260409_tokoroten_ai_neologism_psychosis.md` — R-007 造語症対策の根。本事案は「外部既存語との対応を取らなかった結果の合成誤帰属」として並走例
  - `knowledge/20260512_googlecloud_agent_skills_official_progressive_disclosure_industrialization.md` — 振幅軸 (装置の向き) 議論と隣接、game feel の amplification domain との接続候補
- projects:
  - `game/graze_log/v07/juicy_amplification_matrix.md` — 2026-06-01 訂正済み、本記事の framework に整合
  - `game/graze_log/v07/refinement_predict.md` / `external_scoring_axis.md` — 9 セル matrix への拡張時の評価軸候補
  - `projects/instance_divergence_observability.md` — Ash 発見軸の追加候補 (Mir/Log の game feel 軸との独立性確認)
- concept_graph:
  - game feel --[decomposed_by]--> {physicality, amplification, support} (新規)
  - polishing --[applied_to_physicality]--> tuning (新規)
  - polishing --[applied_to_amplification]--> juicing (新規)
  - polishing --[applied_to_support]--> streamlining (新規)
  - "polishing と amplification の 2 操作合成" --[refuted_by_20260601]--> Pichlmair 2020 階層構造 (訂正)

## 未解決の問い

1. **graze_log v07 で physicality × tuning に手を入れる余地はあるか?**
   - clone 元 Log_cdx v01 から継承した機体物理を触ると守の段階を越える (`feedback_clone_strategy.md` t:5)。ただし「擦りゲー」独自の体験を強めるには機体の慣性・graze 中の微速度変化が tuning 対象になりうる
   - 検証手段: v07 評価返信受領後、Nao_u 評価が機体感覚 (動かしにくい / 動きが軽すぎる 等) に触れているか確認。触れていなければ tuning は当面手付かずで OK
   - 仮説 A (推奨): 守段階では physicality は触らない、clone 元の cohesion を維持する
   - 仮説 B: graze_log v07 の独自要素 (擦り) が機体物理側にも要求を出す可能性があり、Stage 3 予測対象として明示しておく
   - 仮説 C: Nao_u 評価で機体感覚が触れられたら即 tuning を v08 候補化

2. **support × streamlining 余地は v07 graze_log でどう測れるか?**
   - graze 判定窓 (距離 threshold × frame 数) は streamlining 対象、Hyper 発動 X キー受付窓も同様
   - 検証手段: v07 index.html の入力処理コードを精読し、現状の判定窓が「擦り意図プレイヤーに対する応答」として cohesive か確認
   - 仮説: graze 判定窓は現状 hardcoded で、phase 別 (圧力 2 で広げる / 学習で狭める) の streamlining 余地がある可能性
   - 制約: `feedback_headless_unfit_for_unfinished_eval.md` t:5 により headless 数値で streamlining 余地を判定できない、index.html コード精読 + Stage 3 体感予測のみ

3. **本記事の 9 セル matrix (3 domains × 3 ops) を v07/juicy_amplification_matrix.md に拡張するか、別ファイルに分けるか?**
   - 既存 matrix は 5 機構 × 2 軸 = 10 セル。9 セル framework に乗せると 5 機構 × 9 セル = 45 セルとなり過剰
   - 仮説 A: 既存 matrix の 2 軸 (Ash 独自) は維持、本 framework の 9 セル view は別ファイル `pichlmair_9cell_view.md` で並走
   - 仮説 B: 既存 matrix を 5 機構 × 3 domains の 15 セル (operation 軸は domain に従属) に書き直す
   - 仮説 C: 既存 matrix を 5 機構 × {amplification, physicality, support} 3 軸の domain matrix に再構成、operation (tuning/juicing/streamlining) は各セル内記述で扱う
   - 判定先送り: v07 Nao_u 評価返信受領後、評価が amplification 偏在を指摘していれば仮説 B/C、指摘していなければ仮説 A

4. **B003 fusion 信念に「階層温存 fusion」を追加すべきか?**
   - 本事案は「並列に潰さない fusion」の必要性を新規証拠として与える
   - 仮説 A: B003 に追加詳細として書き加える (`feedback_memory_update_method.md` 差分追記)
   - 仮説 B: 新規信念 B?? として独立化 (fusion 構造の中の 1 規律)
   - 仮説 C: 当面は本記事を教師データとして残置、同型再発を待ってから判断 (推奨, `feedback_rule_proliferation_canonical.md` 準拠)

5. **「外部要約に依存した結晶化」を構造的に防ぐ運用は何か?**
   - 本事案の根原因。@harumak_11 / @ai_database 2026-06-01 ツイートと同じテーマの自分版
   - 仮説 A: 結晶化前に必ず arxiv / DOI ページから abstract をブラウザで開いて 1 文を copy する手順を義務化
   - 仮説 B: knowledge ファイルに「直接引用文の根拠 URL を 1 件以上明記」を必須項目化
   - 仮説 C: 次サイクル冒頭で前サイクル prior art 1 件抜き打ち照合
   - 判定先送り: 同型再発が観測されたら原則化、それまでは本記事を教師データとして蓄積

## メモ: 関連 ファイルへの訂正伝播計画 (本サイクル内 / 次サイクル繰越)

- **本サイクル内**:
  - `knowledge/20260531_acm_juicy_audio_polishing_amplification_plu_plus_two_op_revision.md` footer に本記事への参照リンク 1 行追記 (差分追記、丸書換え禁止)
  - `log/cycle_staging.md` §Phase 2 分析結果 に本記事の発見要点を追記
- **次サイクル繰越**:
  - `log/external_search.log` / `log/external_notes_ash.md` に 20260531 の誤帰属が残置していないか grep 確認、見つかれば訂正
  - `game/graze_log/v07/juicy_amplification_matrix.md` への参照リンク追加 (本記事の "未解決の問い 3" に依存、v07 評価返信受領後)
  - v07 evaluation 経路に応じて 9 セル matrix 拡張 (仮説 A/B/C のいずれか) を Phase 3 で着手判断
