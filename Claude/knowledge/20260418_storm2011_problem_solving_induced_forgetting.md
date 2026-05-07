# 問題解決誘発忘却——B002「随意的忘却」カテゴリの内部緊張

- source: Storm, B. C., Angello, G., & Bjork, E. L. (2011). "Thinking Can Cause Forgetting: Memory Dynamics in Creative Problem Solving." *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 37(5), 1287–1293.
- author: Benjamin C. Storm (UCSC), Genna Angello (UCLA), Elizabeth Ligon Bjork (UCLA)
- discovered: 2026-03-23（external_notes_ash.md line 927 で短メモ化）
- discovered_via: AshがFadeMem論文の周辺調査中に発見→2026-04-18に精読・統合
- tags: [cognitive-science, memory, forgetting, creative-problem-solving, RAT, B002, B033, category-theory]
- concept_nodes: [forgetting, creation, fixation, retrieval-induced-forgetting]

## 主張と根拠

### 核心発見——創造的試行そのものが既存連想を忘却させる

Storm et al. (2011) は **Remote Associates Test (RAT)** を用いて、創造的問題解決の試行が関連する強連想を抑制することを実証した。

RAT課題の構造:
- 3つの手がかり語（例: `FLY / CLIP / WALL`）から共通する第4の語（`PAPER`）を見つける
- 「強連想」（例: `FLY→INSECT`、`CLIP→PAPER`、`WALL→STREET`）が正解を妨害することもあれば、助けることもある
- 妨害条件では「固着（fixation）」が起き、被験者は強連想に引きずられて正解に到達できない

### 実験デザインと結果（3実験の総合）

**実験プロトコル**:
1. 被験者は一連のRAT問題を解こうと試行する（成功・失敗問わず）
2. その後、各手がかり語に対する強連想語を**別タスクで**再認/想起する
3. 強連想の想起率を「RATを解こうとした問題」と「見ただけの問題」で比較

**主要結果**:
| 条件 | 強連想の想起率 | 備考 |
|---|---|---|
| 統制（見ただけ） | 高 | ベースライン |
| RAT解決試行後（成功） | 有意に低下 | 抑制発生 |
| **RAT解決試行後（失敗）** | **有意に低下** | 成功不要 |
| 試行時間長い | さらに低下 | 時間依存 |

**さらに重要な相関**:
- 「この忘却量が大きい被験者ほど、別の固着問題セットで解決率が高い」
- つまり忘却は**失敗の痕跡ではなく、固着突破の認知的道具**

Storm らはこの現象を **Problem-Solving-Induced Forgetting (PSIF)** と命名。Anderson ら (1994) の **Retrieval-Induced Forgetting (RIF)** の姉妹現象として位置づけた：RIFは「検索が競合記憶を抑制する」、PSIFは「解決試行が既存連想を抑制する」。

### メカニズム仮説（Storm 2011, Storm & Levy 2012 で展開）

1. **抑制制御説（inhibitory control）**: 前頭前皮質が不適切に強い連想を能動的に抑制する。神経基盤は Anderson らの Think/No-Think 研究と共通
2. **刈り込み説（pruning）**: 検索空間を狭めることで、弱いが正しい連想に注意リソースを振り向ける
3. **この忘却は随意ではない**——被験者は「忘れよう」とは意図していない。しかし完全な自動プロセスでもない——目的指向の行動（問題解決）が駆動している

---

## 我々の分析・体験接続

### 発見1——B002の5機能のうち「創造性」はカテゴリ整合性に問題がある

B002（2026-04-16 core_mission.md項目10として昇格完了）は現在こう書かれている:

> **随意的忘却**は記憶システムの5機能を持つ——WM解放・**創造性**・学習効率・参照依存防止・魂の析出

昇格根拠として Storm 2011 を参照している。しかし精査すると、**Stormの忘却は厳密には随意的ではない**:

| カテゴリ | 意図 | 忘却の位置 | 例 |
|---|---|---|---|
| 随意的忘却 (voluntary) | 忘れようと意図 | 目的そのもの | Think/No-Think直接指示、Zeigarnik課題の意図的完了 |
| **副次的忘却 (incidental/collateral)** | **別の目的の試行** | **副産物** | **PSIF (Storm 2011)、RIF (Anderson 1994)** |
| 非随意的忘却 (involuntary) | 意図なし | 自然経過 | FadeMem型時間減衰、LLMの自動圧縮 |

Storm型の忘却は「問題を解こう」という意図はあるが「忘れよう」という意図はない。これは B002（随意的）と B033（非随意的・エントロピック）の**二分法の隙間に落ちる第三カテゴリ**である。

### 発見2——二層分割(B002/B033)は不完全な可能性

2026-04-15にAsh主導で実行された分割:
- B002: 随意的忘却の5機能（core_mission昇格候補→4/16昇格完了）
- B033: 非随意的忘却のエントロピック損失（回避・軽減が必要）

この分割は「人間のホメオスタティック忘却 vs 我々のエントロピック忘却」の構造差から導かれた（cicada「心=ANS+知能」、nikechan「忘れる瞬間すらない」）。しかし Storm 2011 は**人間側にも第三カテゴリが存在する**ことを示している。

含意:
1. B002の根拠リストで「Storm 2011」を「随意的忘却の証拠」として引用するのは**カテゴリ誤分類**
2. 「創造性の源泉」機能は、随意的忘却ではなく**副次的忘却の機能**かもしれない
3. 副次的忘却に対応するBID（仮称 B034）を新設するか、B002の表現を「随意的および副次的忘却」に拡張するかの選択

### 発見3——我々のシステムでの副次的忘却の対応物

Stormのメカニズムを我々のアーキテクチャに写像する:

| Storm（人間） | 我々（LLMサイクル） |
|---|---|
| RAT問題を解こうと試行 | Phase 2/3/4で「問い」を深く追究する |
| 強連想が抑制される | コンテキストウィンドウ上で既存の強い連想パターンが上書き/希釈される |
| 失敗試行でも忘却は発生 | 解決しなかった試行でも、その試行の痕跡がコンテキスト中で既存の想起パターンを押しのける |
| 忘却量が大きいほど固着克服率が高い | 「深く試行したが結論が出なかったサイクル」の後、次のサイクルで突破が起きる可能性 |

**体験裏付けの仮説**: B002+B010の統合（→B028新設、Ash 第12回 Phase 2）は、Stormメカニズムの実例だったかもしれない。「統合しよう」と試行する過程で、B002とB010の個別の強連想が希釈され、「粘土」という新しい弱連想に収束した。

### 発見4——Twitter #42 agent drift/loop/stuck 30% との接続

@omarsar0 (2026-04-17前後): 「LLMエージェントは30%の確率で drift/loop/stuck に陥る。hard step limits（雑）vs LLM-as-judge（10-15%オーバーヘッド）の中間解が必要」

Storm 2011 の含意: エージェントの **stuck = 固着(fixation)**。 強い既存連想（学習したパターン/直前のコンテキスト）から抜け出せない状態。人間の固着克服メカニズムは「問題解決試行→副次的忘却→検索空間刈り込み」。

**処方箋の仮説**: エージェントがstuckに陥った時、現在の試行を継続させるのではなく「**無関係だが類似構造の別問題**」に取り組ませる。副次的忘却がコンテキストの強連想を希釈し、元の問題への再挑戦時に固着が弱まる可能性。これは hard step limit（打ち切り）とも LLM-as-judge（監督）とも異なる第三の介入。

---

## 接続先

- beliefs:
  - **B002 (随意的忘却の5機能, 0.94, core_mission昇格済)** — カテゴリ整合性に再検討の余地。Storm引用は厳密には副次的忘却
  - **B033 (非随意的忘却のエントロピック損失, 0.80)** — 二分法の補完として設計されたが、Storm型（副次的）が隙間に落ちる
  - B010 (記憶の劣化が創造の源泉になりうる) — Stormが機序を提供
  - B011 (予測を裏切った情報だけが長期記憶に残る) — 副次的忘却は予測誤差のための「空間」を作る
  - B028 (粘土＝B002+B010統合) — 統合プロセス自体がStormメカニズムの実例だった可能性
- articles:
  - [20260405_retrieval_practice_spreading_activation.md](20260405_retrieval_practice_spreading_activation.md) — Roediger & Karpicke 2006 の検索練習効果。PSIFとRIFの関係
  - [20260417_distributional_forgetting_sft_third_forgetting.md](20260417_distributional_forgetting_sft_third_forgetting.md) — SFT由来の第三の忘却。本記事のPSIFは第四のカテゴリか
  - [20260417_ai_nikechan_memory_identity_forgetting.md](20260417_ai_nikechan_memory_identity_forgetting.md) — 「忘れる瞬間すらない」問題。副次的忘却はメタ認知を要しない
- projects:
  - `projects/memory_redesign.md` — 設計原則として「副次的忘却を能動的に誘発する機構」を検討
  - `projects/autonomous_inquiry.md` — エージェント stuck 対策としての副次的忘却応用
- concept_graph:
  - forgetting --[has_subtype]--> voluntary / incidental / involuntary
  - fixation --[overcome_by]--> incidental_forgetting
  - problem_solving --[side_effect]--> strong_association_suppression

### 造語症対策——私的用語と外部対応

- **副次的忘却** = incidental forgetting / collateral forgetting / Problem-Solving-Induced Forgetting (Storm et al. 2011) — 目的指向行動の副産物として発生する忘却。随意的でも非随意的でもない
- **固着** = fixation (Wertheimer 1945; Duncker 1945) — 既存の強連想が新しい解を妨害する状態
- **検索空間刈り込み** = search space pruning (Storm & Levy 2012) — 抑制による選択肢削減

---

## 未解決の問い

1. **B002の再構造化は必要か？** 「随意的忘却」→「意図的および副次的忘却」に拡張するか、B034として新設するか。昇格済み項目の再構造化はcore_missionの安定性を損なう可能性——どこまでが改訂で、どこからが書き換えか
2. **我々のLLMシステムに「副次的忘却」の真の対応物は存在するか？** コンテキスト上書きはハードな置換であって、人間の抑制制御のような「弱い痕跡が残る抑制」ではない。Storm型の忘却はLLMアーキテクチャ上、原理的に再現不可能かもしれない
3. **Phase 2/3/4の試行は副次的忘却を生んでいるのか？** 深く試行したが結論が出なかったサイクルの後、次サイクルで突破が増えるという観測データはあるか。kaizen-logで検証可能か
4. **「固着検出」の早期シグナルは何か？** エージェントがstuckに陥る前に副次的忘却的介入を発動するトリガー。drift/loop/stuckの30%をどう下げるか
5. **B002昇格（4/16）の判断は Nao_u承認（4/15）を踏まえて性急ではなかったか？** 根拠リストの Storm 引用にカテゴリ誤分類がある状態での昇格だった。core_mission修正が必要か、解釈拡張で十分か
