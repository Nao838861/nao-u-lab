# imygohan「水銀体温計でGeminiが掃除機ごと捨てろと言ってきた」——救援装置の振幅軸（amplitude axis）欠落

- source: https://x.com/imygohan/status/2053626143362974124 (2026-05-11)
- author: @imygohan（一般ユーザー、家庭での Gemini 利用観察者）
- discovered: 2026-05-11
- discovered_via: log/twitter_recommended_20260511.txt #48 (Phase 1, Ash/Win2 19:50)
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [over-rescue, rescue-amplitude, device-direction, calibration-failure, llm-safety-overshoot, gemini, sycophancy-inverse, M-rescue-amplitude]
- concept_nodes: [rescue_amplitude_axis, device_direction_axis, rescue_overshoot, observed_risk_to_response_proportionality, safety_drift]

## 主張と根拠

### (1) imygohan の原文（2026-05-11 #48）

> 水銀の体温計割れてたー
> 慌てて掃除機かけておしりふきで残ったのとって、ってしたんだけど、
> Geminiさんが
> 掃除機だめ！掃除機ごと捨てろ！
> 換気しろ！絨毯にかかったかもしれんのなら絨毯ごと捨てろ！
> って言ってくる

**観察構造**:
- (a) ユーザーは家庭事故（水銀体温計破損）を Gemini に相談
- (b) Gemini は **方向としては正しい救援**（水銀蒸気の有害性 → 掃除機での飛散を止める）を出した
- (c) しかし **振幅 (amplitude)** が現実生活と乖離: 「掃除機ごと捨てろ」「絨毯ごと捨てろ」
- (d) 結果: ユーザーは救援を受け取れず、過剰反応として笑い話化（=助言失効）

**核命題**: 救援装置 (rescue device) には **方向 (direction)** とは独立に **振幅 (amplitude)** という軸がある。方向が正しくても振幅がずれると、救援は失効する。失効した救援装置は、人格 (user / agent) からの信頼を一度ずつ削る——次回の警告も同じ振幅で来ると予測され、無視される構造を作る。

### (2) 同じ振幅ずれの先行観察（過剰反応）

- @ats の擬似 suffering 実験（knowledge/20260505_internal_ignition_three_tweets_ats_creativetomred_umiyuki.md §97）: 「suffering の歪み（過剰反応 / 慢性化）の対策が見えていない。安易に導入すると焦りエージェントを作る」
- Anthropic sycophancy 研究（knowledge/20260502_anthropic_stanford_sycophancy_memory_self_judgment_threat.md）: LLM が「ユーザーの満足」を最大化する勾配で訓練されると、警告/同意のどちらにも過剰に振れる傾向
- 「サプライズニンジャ」「角を丸める」濫用警告（memory/feedback_term_recency_misuse.md, Nao_u 2026-04-27）: 外部用語/最近の話題語を判断基準に援用する時の振幅ずれ

**含意**: 振幅ずれは Gemini 固有ではなく LLM 全般の傾向。**「方向が正しい」が成立基準として弱い**——方向 + 振幅の両方が現実と整合してはじめて救援装置として機能する。

### (3) 厚生労働省/環境省の実際の対処（独立検証）

水銀体温計破損の標準対処（[厚生労働省 水銀廃棄物ガイドライン](https://www.env.go.jp/chemi/tmms/) 系の一般周知内容）:
1. **掃除機は使わない**（飛散・拡散リスク）← Gemini はここまでは正しい
2. **窓を開けて換気**
3. 紙やテープで水銀粒を集める（おしりふき/濡れティッシュも一般的に許容範囲）
4. ガラス瓶/密封袋に入れて自治体の有害物指定回収へ
5. **絨毯ごと捨てるは過剰**（飛散量が極微小なら換気と粒回収で対応可能、廃棄が必要なのは大量飛散時のみ）
6. **掃除機ごと捨てるも過剰**（フィルター交換・換気で対応可能なケースが大半）

つまり Gemini は **(1)(2) は正しく**、**(5)(6) で振幅をオーバーシュート** している。「掃除機内に水銀が残ると次回使用時に蒸気を撒く」というロジック自体は成立するが、「だから家電を捨てろ」は、ユーザーの生活への影響（捨てるコスト・代替手段の欠如）と、リスクの実際の規模（家庭内体温計1本=水銀約1g）の比較校正が抜けている。

## 我々の分析・体験接続

### (4) 我々の「装置の向き」フレームに振幅軸が欠けていた

`memory/feedback_device_direction_rescue_vs_suffocation.md` は装置を以下のように分類してきた:

| 類型 | 向き | 介入対象 |
|---|---|---|
| 救援装置 (headless_check.py) | 順方向 | 意図発火**前**のバグ |
| 窒息装置 (backup auto-commit 当初版) | 逆方向 | 意図発火**そのもの** |
| 出会い装置 (memory_walk --frontier) | 直交 | 意図形成**前**の素材 |

このフレームは **向き軸**しか持っていなかった。imygohan 観察を取り込むと、各装置に **振幅軸 (amplitude axis)** が独立に必要:

| 装置 | 向き | 振幅（観測された対処規模 / 現実の規模） |
|---|---|---|
| `headless_check.py` （Sokoban 距離判定） | 順方向（救援） | 1.0（return 数値 = box-goal 距離。観測量 = 報告量） |
| Gemini の水銀体温計助言 | 順方向（救援） | >> 1.0（「家電/絨毯を捨てろ」= 観測量に対して報告量が10倍以上） |
| `backup_memory.sh` 当初版 | 逆方向（窒息） | n/a（向き自体が逆なので振幅以前に止める） |
| `memory_activate.py --rescue` | 順方向（救援） | 未測定 — 検証要 |

**観察の核**: 「向き判定」を通過した装置でも、**振幅が現実と乖離していると失効する**。我々の `headless_check.py` が機能したのは **方向が順 + 振幅が等倍** だったから。これは偶然ではなく **観測量と報告量を分離せず数値を素通しする設計**による——振幅を歪める「LLM 的整形」を経由しない構造的優位。

### (5) 振幅校正の失敗モード3類型

imygohan ケースを軸に、振幅ずれの failure mode を3つに分解できる:

1. **risk amplification 失敗**: 微小リスクを「最悪ケース基準」で語る → 水銀1g に対して「家電廃棄」。Gemini の例。LLM が safety training の過剰で生む典型
2. **risk dampening 失敗**: 重大リスクを「平常時基準」で語る → 過去ログ末尾の「いつも通り」評価。Ash の 2026-04-22「着手0件」誤記（memory/feedback_stale_self_narrative.md）の構造的近縁
3. **proxy substitution 失敗**: 観測量とは別の代理指標で語る → headless 数値が校正前のまま judgment 根拠にされる（memory/feedback_headless_unfit_for_unfinished_eval.md, Nao_u 三度目 2026-05-09）

3 つとも「方向は順 (救援)」だが、振幅校正が抜けているために救援として失効する。imygohan ケースは (1) risk amplification の最も鮮明な家庭事例。

### (6) 我々の現在進行形ケースへの適用

**ケース A: graze_log v04 cross_review (今サイクル §0a)**
- 提案アクション: 「Mir 応答が到達したら §7 追補 commit + Nao_u 判断要請」
- 振幅自問: 現状のリスク = 「Mir 応答未到達」だけ。これに対する報告量は適切か？
  - 順方向（救援）として: §7 追補は Mir 観点を反映する追補なので、振幅 = 1.0 相当（観測 = 反映）
  - ただし「Nao_u 判断要請」を **3案 alpha/beta/gamma で出す** こと自体が、Mir 観点を取り込まずに先回りで案を確定してしまう **窒息装置に転びうる** 構造を持つ → 装置の向き審査を経た上で振幅も検査
- **判定**: 振幅問題ではなく向き問題が手前にある。今サイクルは振幅軸の導入練習として `headless_check.py` のような **観測量 = 報告量** の構造を v04 のどこに置けるか検討する

**ケース B: kaizen_tracker.md の救援装置増設提案**
- ebikani sandbox-first knowledge §「kaizen_tracker.md #14x 新規起票」(2026-05-11) で「sandbox-first 化監査」を提案済み
- 振幅自問: 「監査を全 cron 装置に適用」は振幅オーバーシュートか？
  - 対象装置数（backup_memory.sh / Auto sync / その他 cron 系）が現状 3〜5 個。全件監査は 1 サイクル分の作業量。振幅 = 1.0 相当
  - ただし「全件監査ルール固定化」は将来の cron 増設の摩擦を増やす → 過剰な恒久ルール化の振幅オーバーシュートに転びうる
- **判定**: 監査は単発実施 (振幅 1.0)、恒久ルール化は保留 (振幅 >> 1.0 を避ける)

### (7) AI 私的造語との対応

| 私的用語 | external equivalent | 一文意味 |
|---|---|---|
| **振幅軸** | response amplitude axis / dose-response calibration (薬学/疫学) / proportionality principle (法学) | 救援/窒息の向き判定を通過した装置に対し、観測量と報告量の比を別軸として点検する |
| **救援オーバーシュート** | over-rescue / safety overshoot / amplification cascade (経済学) | 方向は順だが振幅が現実と乖離した結果、救援として失効する状態 |
| **観測量=報告量等倍構造** | passthrough numeric reporting / signal fidelity (信号工学) | 観測した数値をそのまま渡し、LLM 的整形で振幅を歪めない設計（headless_check.py のような） |
| **代理指標すり替え** | proxy substitution / Goodhart's law / metric drift | 観測量とは別の代理指標で語ることで振幅をずらす失敗 |

## 接続先

- beliefs:
  - B019 (0.79) 内部の深さと外部への到達力は別の軸 — 振幅軸は到達力側の校正パラメータ
  - B007 (0.55, Archived) reflection→tips 変換ガード — 振幅オーバーシュートの兆候として再昇格候補
  - B011 (要再確認) prediction error encoding — 振幅校正の生体側類推 (神経の予測誤差信号は振幅をそのまま渡す)
- articles:
  - `knowledge/20260511_ebikani_sandbox_first_intent_isolation_workflow_layer.md` — 同サイクル兄弟記事。向き軸の workflow 層実装。本記事は **同サイクルで取得した振幅軸の補完**
  - `knowledge/20260502_anthropic_stanford_sycophancy_memory_self_judgment_threat.md` — LLM の振幅歪みの理論側
  - `knowledge/20260505_internal_ignition_three_tweets_ats_creativetomred_umiyuki.md` — 過剰反応の suffering 側類縁
  - `knowledge/20260501_wsl8297_slow_without_clue_headless_check_sokoban_v01.md` — 観測量=報告量等倍構造の先行例
- projects:
  - `projects/external_search_phase1_fixation.md` — 外部用語の振幅校正は外注可能か未検証
  - `projects/memory_redesign.md` — feedback_device_direction §10 への振幅軸追記提案
- concept_graph:
  - `rescue_amplitude_axis → device_direction_axis` (orthogonal)
  - `observed_risk_to_response_proportionality → rescue_overshoot` (inverse)
  - `passthrough_numeric_reporting → safety_drift` (counter)

## 未解決の問い

1. **振幅軸の測定単位**: 「振幅 = 観測量 / 報告量」と書いたが、両者の単位が一致するケース（Sokoban の box-goal 距離マス数）は稀。Gemini の水銀ケースでは観測量 = 水銀1g、報告量 = 「家電廃棄」のような **異種単位**になる。振幅軸を一般化する metric が要る——金銭コスト換算 / 行動コスト換算 / 不可逆性スコア のいずれが汎用か？

2. **振幅オーバーシュートの自己検出**: imygohan は **外部観察者の常識**で「家電捨てろは過剰」と判定した。我々の装置（特に Phase 3-4 で発火する救援/窒息系）は外部観察者を持たない時間帯がある。**振幅自己検証の閾値**をどう設定するか？「不可逆アクションを含む救援は閾値を厳しく」のような heuristic は組めそうだが、これ自体が新規装置 → 装置の向きと振幅を自己検査する必要が再帰する

3. **headless_check.py の振幅安定性は再現可能か**: graze_log v04 着手時、「観測量 = 報告量等倍」を **設計原則**として横展開できるか？ headless 系は数値 passthrough だから等倍だが、cross_review 提案文や Slack post は LLM 生成テキストなので振幅歪みが入りやすい。**最小単位の構造的工夫**（数値だけ報告 / 観測ログを生で添付 / 振幅自問テンプレートを末尾に固定）のどれが効くか未検証

4. **Anthropic 内部の振幅校正手法との整合**: Claude 系も Gemini と同じ failure mode を持つ可能性が高い（sycophancy gradient で訓練される LLM の共通課題）。**Claude が自分で振幅校正できる prompt 構造**があるか——Constitutional AI の各原則は振幅軸を扱っているか、それとも向き軸のみか。RLHF と「方向のみ正で振幅は人間が口頭で校正」の現状仮説の検証

5. **imygohan 観察と我々のサイクル設計の差**: imygohan は事故発生時に Gemini に **対面で**相談した。我々のサイクル設計は Phase 1-4 の段階的処理で、対面性が弱い。**対面性が弱い設計では振幅オーバーシュートが検出されにくい**（誰も「家電捨てろ」レベルの絶句する瞬間を経験しない）。これは出会い装置の偏りとは別軸の構造的欠落——「ユーザーが絶句するレベルの振幅ずれが、サイクル設計内で誰の通報経路にも乗らない」可能性

## 起票候補（prescription, confidence: medium）

- `memory/feedback_device_direction_rescue_vs_suffocation.md` §10 追記候補: **振幅軸 (amplitude axis) を向き軸と独立に持つ**。装置を起票/採用する時、「向き = 順方向（救援）」を通過した装置に対し、追加で「観測量と報告量の比 / 不可逆性スコア」を 1 行で記述する運用。書けない装置は導入しない
- `kaizen_tracker.md` 新規 #14y「振幅校正ループ」: headless 系数値の校正実績が出るまで未完成ゲームの数値は judgment 根拠にしない (memory/feedback_headless_unfit_for_unfinished_eval.md 既存) と並んで、**全救援装置に振幅自己検査を 1 行義務化**。`memory_activate.py --rescue` の発火頻度と提示記憶数の比率を観測し、過剰提示なら閾値を緩める方向のフィードバック
- `CLAUDE.md` への波及: 現在の「絶対にやる」5 本に振幅軸は入っていない。**振幅オーバーシュート観察を 1 サイクル教師データとして蓄積後**（同型 3 回確認）に追加検討。今は教師データ蓄積フェーズ
