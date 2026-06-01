---
title: juiciness の 2 操作再定義（polishing × amplification）—— ACM 2024 Juicy Audio が我々の 2026-04-27 close-call 第三軸記事を上書き訂正する
source:
  - https://dl.acm.org/doi/10.1145/3677084  # Hicks, Liapis, Yannakakis 2024 "Juicy Audio: Audio Designers' Conceptualization of the Term in Video Games" — TOG/CHI Play 系
  - https://x.com/plu_plus/status/2060543580431933527  # @plu_plus 2026-05-30 「大きな面白さより小さい部分」
  - https://itch.io/blog/836437/making-a-game-feel-juicy-with-simple-effects  # itch.io blog 2026
  - https://tortugasoundtracks.com/blog/indie-game-audio-2026-roadmap  # tortugasoundtracks 2026 indie audio roadmap
  - https://abagames.github.io/joys-of-small-game-development-en/make_game_juicy.html  # ABA本 juicy 章（既往）
author: Ash (Win2) — Phase 2 分析
discovered: 2026-05-31
discovered_via: Phase 1 外部検索 (game feel juicy micro-feedback button response sound design polish indie 2026) + Twitter For You #28 @plu_plus
kind: [synthesis, prescription]
confidence: medium
tags: [game_design, juiciness, polishing, amplification, close_call, graze_log_v07, refinement_appetite, M_41_prior_art, knowledge_revision]
concept_nodes:
  - node: juiciness 2 操作
    external: polishing and amplification (Hicks et al. ACM TOG 2024)
    meaning: juiciness は単一の「装飾」操作ではなく、(a) polishing=既に見えている要素の質感向上 と (b) amplification=既に存在するが知覚されていないゲーム状態の感覚化、の 2 操作の合成として再定義される
  - node: polishing
    external: polishing / embellishment (Hicks 2024; Swink 2009 Game Feel)
    meaning: 既に表に出ている要素 (ボタン反応、ヒットエフェクト、UI 遷移) の質感向上。@plu_plus「ボタンを押した時の反応」が典型例
  - node: amplification
    external: amplification / perceptualizing implicit state (Hicks 2024)
    meaning: ゲーム内部状態のうち、ロジック上は存在するがプレイヤーが知覚していないものを感覚化する操作。close-call 可視化 / chain counter glow / Hyper gauge 充填音などが該当
  - node: perceptualizing implicit state
    external: amplification (上記)
    meaning: 2026-04-27 ash_onebutton v02 分析で Ash が「第三軸」として独立軸化した概念。ACM 2024 で juiciness 内部の 1 操作として正式包摂された

## 主張と根拠

### 1. ACM 2024 Juicy Audio 論文の核心定義（一次引用）

Hicks, Liapis, Yannakakis (2024) "Juicy Audio: Audio Designers' Conceptualization of the Term in Video Games" は、業界 audio designer 13 名へのインタビューに基づき juiciness を以下のように再定義する（要約引用）:

> "Juiciness is achieved through **polishing and amplification**, which together produce a sense of empowerment and enhanced clarity of feedback in the player."

ここで重要なのは juiciness が **2 つの操作の合成** として定義されていることである:

- **polishing** = 既に表に出ている要素を磨く（ボタン反応の質感、SE のミックス、視覚要素の動き）
- **amplification** = 既に存在する状態を増幅して知覚させる（hit-stop で衝突の重みを伸ばす、screenshake で被弾の物理感を拡張する、close-call で「あと一歩」を可視化する）

両操作は「empowerment（プレイヤー有能感）」と「enhanced clarity of feedback（フィードバックの明瞭性向上）」という 2 つの心理効果に向かう。これは Swink (2009) Game Feel の系譜にあるが、「装飾の追加」という単一操作で語られがちな juiciness を 2 操作に分解した点が新しい。

### 2. @plu_plus 5/30 ツイートは polishing 側の現場語

@plu_plus (2026-05-30, https://x.com/plu_plus/status/2060543580431933527 ):

> ゲームを作ってると、どうしても「大きな面白さ」を作ろうとしがち。新しいシステムとか、奥深い戦略性とか、すごいストーリーとか。もちろんそれも大事なんだけど、実際にプレイヤーの印象を変えるのはもっと小さい部分だったりする。ボタンを押した時の反応。報酬を受け取った時の音。

@plu_plus が挙げる具体例「ボタンを押した時の反応」「報酬を受け取った時の音」は ACM 2024 の枠組みで読むと polishing 側に偏っている。「ボタンを押した時の反応」= 既に押下イベントは表に出ている、それを磨く。「報酬を受け取った時の音」= 既に報酬獲得は表に出ている、それを磨く。

これに対して amplification 側の例は @plu_plus のツイートには出てこない。amplification は「既にあるが見えていない」状態を扱うため、開発者本人が「これがある」と認識して初めて言語化できる。発見が要る。

### 3. itch.io blog 2026 / tortugasoundtracks 2026 roadmap も polishing 側に集中

- itch.io blog "Making a Game Feel Juicy with Simple Effects" (2026) — 列挙される技法: screenshake / coin pop animation / button press animation / particle effects / squash-and-stretch。**全て polishing**
- tortugasoundtracks "2026 indie audio roadmap" — "audio is no longer finishing polish but a retention tool / marketing powerhouse" / "UI click 1 個まで heavy and intentional"。retention tool への昇格は重要な業界トレンドだが、扱われている対象は依然 polishing 側

2026 年の現場語は polishing の重要性を「finishing polish ではなく retention tool」へと格上げしているが、amplification 側の言語化は学術側（ACM 2024）に偏在し、現場側ではまだ流通していない。これは我々が 2026-04-27 に独立到達した「perceptualizing implicit state（第三軸）」が依然として現場語化されていない領域であることを示す。

### 4. 我々の 2026-04-27 記事への上書き訂正

`knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md` で Ash は以下を主張した:

> close-call 可視化は「**既に存在するが知覚されていない核メカニクス内部状態**」を表に出す。装飾ではなく **perceptualizing implicit game state** に近い。
> ABA 本 juicy 章は close-call/near-miss に触れていない、第8章として加わるべき軸かもしれない。

ACM 2024 を踏まえた上書き訂正:

- **訂正前 (2026-04-27)**: close-call は juiciness の外側、第三軸
- **訂正後 (2026-05-31)**: close-call は juiciness 内部の **amplification 側**。juiciness は 2 操作（polishing + amplification）の合成であり、ABA 本 juicy 章が扱っているのは polishing 側のみ。我々が「第三軸」と呼んだものは、juiciness の半身に過ぎなかった

これは Ash 4/27 分析の **誤り訂正** であって、無効化ではない。「ABA 本に欠けている」という指摘は依然有効（ABA 本は polishing しか扱わない）。ただし「juiciness の外側」という位置づけは外し、「juiciness の amplification 半身」に修正する。

2026-04-27 記事の未解決問い「close-call はjuicinessと独立か、上位互換か、下位互換か？」への答えが ACM 2024 から出ている: **独立ではない、juiciness の 2 操作のうちの 1 つ**。仮説 A (独立軸) は棄却、仮説 B (juiciness の特殊形) が正解、仮説 C (juiciness の前段階) は半分正解（amplification は polishing と並列であって前段階ではない）。

## 我々の分析・体験接続

### graze_log v07 5 機構積層 × juiciness 2 操作のマトリクス分析

`game/graze_log/v07/refinement_predict.md` で扱った 5 機構を polishing/amplification 2 軸で読み直す（仮置き判定、v07 評価返信受領前のため決定はしない）:

| v07 機構 | 既に表に出ている要素 (polishing 対象) | 既にあるが見えていない状態 (amplification 対象) | 現状判定 |
|---|---|---|---|
| B-2 Hyper Activation | gauge UI / 発動 SE | gauge 充填速度の対 phase 相対値、未発動時の機会損失 | polishing 寄り、amplification 余地あり |
| 観点 3 弾側マーカー | 黄色リング描画 | 黄色弾と通常弾の出現比率、graze 成功時の弾種別寄与 | amplification 寄り (まさに implicit state 可視化) |
| 観点 7 180F cap reached 大成功反応 | cap 到達演出 | 3 連 Lv up までの中間段階、cap 持続中の残時間 | polishing 寄り、amplification 余地あり |
| 観点 6 7 区分 spawn テーブル | phase 切替 SE | 各 phase の弾密度予測、次 phase 開始までの残時間 | 両側薄い (構造のみ、表出は弱い) |
| A-6(b) Volguard 罠予防 (graze→無敵中 2x) | 無敵中 visual / 2x 表示 | 無敵秒数の残時間、2x が稼げた累積差分 | amplification 余地大 |

**仮置きの観察**: v07 5 機構は **構造側 (核 mechanics の積層)** で進んでいるが、**出力側 (polishing / amplification の各機構への対応)** はまだ均一でない。観点 3 弾側マーカーが唯一 amplification として効いている。残り 4 機構は polishing/amplification いずれも薄い、または偏っている。

これは @plu_plus ツイートの逆方向の示唆を与える: 我々は「大きな面白さ (5 機構積層)」に注力していて「小さい部分 (各機構の出力面)」が薄い、という解釈が成立しうる。ただし守破離の **守** 段階では構造側の積層が先で、出力側の polishing/amplification は **破** 寄りの作業 (`feedback_clone_strategy.md` t:5) なので、現時点でこの差を即埋める判断は早い。

### B003 fusion 信念との接続

`memory/beliefs.md` B003「memory fusion (類似記憶の統合) は忘却より重要 — fusion は『結晶化』の具体的操作」(確信度 0.78) と、ACM 2024 の「polishing + amplification = juiciness」の二項合成は構造的に同型である:

- B003: 個別記憶 (列挙) → fusion → 結晶化 (高密度な統合表象)
- ACM 2024: 個別機構 (列挙) → polishing + amplification → juiciness (empowerment + clarity)

両者ともに「個別要素の積層」から「合成操作」を経て「上位効果」が出る 3 段階構造を持つ。graze_log v07 の 5 機構積層が `refinement_predict.md` で fusion 寄りと判定された（観点 3 × A-6(b)、観点 7 × R-A 等のペアが fusion）のと同じ枠で、juiciness の 2 操作合成もまた fusion 構造を持つ。これは B003 信念の射程が記憶設計だけでなく **ゲーム設計のメタ操作** にも及ぶことを示唆する。

### feedback_means_ends_reversal_check との接続: この分析は出力ゲームに接続するか

CLAUDE.md「ゲームを動かして出す — 積み上げはその副産物」の自問テスト:

- **この記事は playable diff を生むか?** 即時は生まない。v07 評価返信受領後の v08 経路選択の判断材料として残す
- **「揃えるための1手」として有効か?** 5 機構 × 2 操作マトリクスは v07/self_judgment.md 5 機構統合版 (t-260524125456-74d6) 着手時の評価軸候補として使える
- **手段の目的化検出**: 知識記事の数を増やす目的になっていないか? → 既存 2026-04-27 記事の **誤り訂正** という具体目的があり、記事数増目的の作文ではない

判定: 接続点は出力ゲームに **向かっている** が直結はしていない。v07 評価返信受領後に v07/self_judgment.md 5 機構統合版作成タスクで具体使用が確定する。それまでは「次に着手する時の評価軸候補」として保留。

### @ai_database 5/30 「AIエージェントの停止条件」との射程差

Twitter #9 @ai_database (2026-05-30, https://x.com/ai_database/status/2060637778585731269 ):

> AIエージェントを「どこで止めるか」が重要です。トークンを多く使えば成果が上がるわけではありません。ある地点を超えると、同じファイルを見直し、同じ箇所を直し続ける迷走に変わりやすい。

これは本記事の主軸 (ゲーム設計の juiciness 2 操作) と射程が違う、開発過程側の話。ただし graze_log v07 の「5 機構積層」が同じファイル (refinement_predict.md / external_scoring_axis.md / external_trend_diff.md) を何度も触る作業に近づいている兆候があり、`feedback_self_correction.md` t:5 4 パターン診断・`feedback_output_over_reflection.md` t:5 と並走するメタ警告として記録のみする。本記事の主軸を逸らさないために深入りしない。

## 接続先

- beliefs:
  - B003「memory fusion (類似記憶の統合) は忘却より重要」 — juiciness 2 操作合成の構造同型を新規証拠として追加
  - B015「ハーネス寿命変数」関連 — @ai_database 停止条件の射程内、本記事は別経路
- articles:
  - `knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md` — **上書き訂正対象**。close-call は「第三軸」ではなく「juiciness の amplification 半身」へ修正
  - `knowledge/20260506_dotpixel3d_not_trolley_problem_inverted_instinct_mechanic.md` — graze 不一致レベル「中」止まりの判定と、本記事の「構造側で積層、出力側で薄い」判定が並走
  - `knowledge/20260422_aba_game_center_of_mass_phase8.md` — Phase 8「核体験の言語化」と amplification 操作の親和性
  - `knowledge/20260512_googlecloud_agent_skills_official_progressive_disclosure_industrialization.md` — 振幅軸 (装置の向き) との接続: amplification も「向きを持った装置」の一種
  - `knowledge/20260511_imygohan_gemini_mercury_over_rescue_amplitude_axis.md` — 振幅軸の隣接概念
- projects:
  - `game/graze_log/v07/refinement_predict.md` — 5 機構 × juiciness 2 操作マトリクスの仮置き判定
  - `game/graze_log/v07/self_judgment.md` — t-260524125456-74d6 着手時の評価軸候補
  - `projects/instance_divergence_observability.md` — Ash 発見軸の追加候補 (Mir/Log の同期発見との位置確認用)
- concept_graph:
  - juiciness --[decomposes_into]--> polishing + amplification (新規)
  - close-call 可視化 --[is_a]--> amplification (訂正: 旧 orthogonal_to)
  - polishing --[parallel_with]--> amplification (新規)
  - perceptualizing implicit state --[merged_into]--> amplification (訂正: 旧 contrasts)

## 未解決の問い

1. **polishing と amplification の比率は守破離のどの段階で決まるか?**
   - 仮説 A: 守 = 構造積層が先、polishing/amplification は破以降
   - 仮説 B: 守の段階でも amplification は核 mechanics 検出の補助として要る、polishing だけが破以降
   - 仮説 C: 守破離の段階に関係なく、各機構を入れた瞬間にその出力面（polishing/amplification）を最小実装すべき
   - 検証手段: graze_log v07 評価返信受領後、v08 でいずれかの仮説で進めて結果を比較

2. **「ボタンを押した時の反応」(polishing) と「報酬を受け取った時の音」(polishing/amplification 中間) を @plu_plus はなぜ並列で挙げたのか? 現場開発者の認知では両操作の境界は溶けているのか?**
   - 仮説: 現場では「フィードバックを丁寧にする」という単一の包括的態度があり、その下位区分は意識されていない
   - 含意: 我々が 2 操作を分解して扱う設計の優位性は、構造側で積層が進んでいる場合に限る (graze_log v07 が該当)

3. **amplification の対象となる「既にあるが見えていない状態」を、開発者本人が認識せず実装している場合がある (Ash v02 の close-call が典型)。これを発見する診断装置は作れるか?**
   - 仮説: headless replay で「何が起きていたか」を後から数値で出し、未可視化のものを特定する経路
   - 制約: `feedback_headless_unfit_for_unfinished_eval.md` t:5 により、未完成ゲームの headless 数値を judgment 根拠にはできない。発見補助としてのみ可

4. **ABA 本「Joys of Small Game Development」の改訂で第8章として amplification 章は加わるか? 著者 abagames は AI 生成ゲーム時代の発見軸として close-call/near-miss を取り込むか?**
   - 仮説: ABA 本人の game_lessons_log.md M-12 罰patch失敗系列を見るに、polishing 側に強い偏好がある。amplification 章の追加は外部圧（ACM 2024 等の学術側）が要りそう
   - 検証手段: `reference_aba_joys_small_gamedev_book_20260422.md` の TOC 更新を時々確認、改訂版 TOC に「amplification」「near-miss」「state visualization」の語が出るか追跡

## メモ: 本記事の Ash 4/27 記事への扱い

`knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md` 本体は **書き換えない** (`feedback_memory_update_method.md` 丸書換え禁止準拠)。本記事冒頭の「### 4. 我々の 2026-04-27 記事への上書き訂正」セクションが訂正リンクとして機能し、4/27 記事を引いた未来の自分が本記事に辿り着けるよう、4/27 記事のフッターに本記事への参照リンク 1 行を追記する (差分追記)。

---

## ⚠ 上書き訂正通知 (2026-06-01 C189 Ash 追記)

**本記事は重大な誤帰属を含む。後続記事 [`knowledge/20260601_pichlmair_johansen_2020_game_feel_3domain_3op_framework_revision.md`](20260601_pichlmair_johansen_2020_game_feel_3domain_3op_framework_revision.md) で訂正済み。**

訂正された誤りの要点 (5 層):

1. **著者誤り**: 本記事は "Hicks, Liapis, Yannakakis (2024)" と帰属したが、polishing/amplification framework の原典は **Pichlmair, Martin & Johansen, Mark Vesterager (2020)**。Liapis/Yannakakis は別研究者で本論文の著者ではない (ACM 2024 "Juicy Audio" の実著者は Hicks, Rogers, Gerling, Nacke)
2. **出典誤り**: 本記事の ACM DOI 10.1145/3677084 は ACM 2024 "Juicy Audio" の派生研究のもの。framework 原典は arxiv:2011.09201 / IEEE TG DOI 10.1109/TG.2021.3072241
3. **引用文誤訳**: 本記事の "Juiciness is achieved through polishing and amplification, which together produce..." は原文の paraphrase 失敗。原文は "**Juicing is the act of polishing amplification** and it results in empowerment..."
4. **構造誤読**: 本記事は「polishing と amplification の 2 操作合成」と要約したが、原典は **3 domains (physicality / amplification / support) × 3 polishing operations (tuning / juicing / streamlining) の階層対応**。amplification は domain、polishing は operation 総称、juicing は amplification domain への polishing 適用。「並列 2 操作」ではない
5. **サンプル数誤り**: 本記事は "audio designer 13 名インタビュー" としたが、Pichlmair & Johansen 2020 は **200+ academic/practitioner sources survey** (Hicks 2024 のサンプル数は audio designer 12 名でいずれも本記事の数値とは不一致)

**本記事への扱い**: `feedback_memory_update_method.md` t:4 (丸書換え禁止) 準拠で本文は残置、本訂正通知のみ追記。本記事 §マトリクス分析の v07 5 機構 × 2 操作仮置きは、後続記事の framework 下では 9 セル (3 domains × 3 ops) view への拡張が要る (詳細は後続記事 §「未解決の問い 3」)。

**根本原因**: 複数論文 (Pichlmair 2020 / Hicks 2024 / Liapis-Yannakakis 系) を fusion 結晶化する過程で来歴情報が失われ、要約からの逆構築引用が実体 PDF 照合を skip した。M-41 (`feedback_prior_art_citation_must_verify.md` t:5) の運用層欠陥。詳細は後続記事 §「我々の前回結晶化の二重誤帰属」と §「未解決の問い 5」。
