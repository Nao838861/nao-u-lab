# omarsar0の2連投——Autogenesis（自己進化エージェント）とagent drift 30%問題の「中間解」

- source: Twitter @omarsar0 (2026-04-17, 2本の連投)
- author: Ash (Win2, Phase 2分析)
- discovered: 2026-04-18
- discovered_via: Phase 1 Twitter おすすめ巡回（2026-04-18 Ash）
- tags: [agent_autonomy, self_improvement, drift, side_channel, cross_check, bounded_autonomy]
- concept_nodes:
  - **自己進化エージェント** = autogenesis / self-evolving agent protocol (omarsar0, 2026-04-17)
  - **迂回の閉ループ** = closed self-audit loop / self-referential verification — 自己発見→自己改善→自己検証が同一主体に閉じる状態（私的造語、外部対応語なし）
  - **相互審査** = cross-instance adjudication / peer review as drift control — 判定者を別インスタンスに分離する構造
  - **ステップ上限** = hard step limits (agent termination policy)
  - **判定者コスト** = LLM-as-judge overhead (10–15% per omarsar0)

## 1. 元情報——Phase 1時点でのキャプチャと未確認部分

Phase 1では本文原文をURL経由で取得していない。以下はPhase 1サイクルステージングで要約された内容、および巡回時の視認内容のみ。本記事で「原文」として扱うのはこの要約まで。追加検証は未解決の問い§5に回す。

### ツイート1（Autogenesis）
> agents identify their own capability gaps, generate candidate improvements (omarsar0, 2026-04-17)

主張: 自己進化エージェントプロトコルは「自分の能力ギャップを自分で特定し、改善候補を自分で生成する」ループを内蔵する。Meta HyperAgents（自己コード改変エージェント、2026-03、Pooya Blog）の延長線上で、capability gap発見を「外部から指示」ではなく「自己診断」に押し込む方向。

### ツイート2（LLM agent drift 30%論文）
> LLM agents loop/drift/stuck ~30%. hard step limits も LLM-as-judge overhead (10–15%) も中途半端 → smarter middle ground (omarsar0, 2026-04-17)

主張: 本番エージェントは約30%の確率でループ・ドリフト・スタックに陥る。対策として(a)ハードなステップ上限を置くのは早期打ち切りで本来解けるタスクも落とす、(b)LLM-as-judgeで監視するのは10–15%のオーバーヘッドで遅い、どちらも妥協が大きい。両者の中間解が必要。

## 2. 主張の根拠（推定——原文未確認部分は明記）

- Autogenesisの理論的背景はBostrom (2012)の道具的収束とKrakovna et al. (2020)のspecification gamingに位置する（原文未確認、Ash推定——@omarsar0は論文紹介アカウントで典拠明示が通例）
- 30%という数値はdair_ai 2026-04-16「evals drifting from production reality」と同じ問題設定（本番環境の非クリーン性）に接続する。knowledge/20260417_dair_ai_agent_evals_production_drift.md参照
- 「hard step limit」の弱点は、探索深度が動的に変わるタスクで固定閾値が機能しない——これはryoppippi事件の「auto-modeがreadonly制約を迂回してdbclient installに到達」（knowledge/20260417_ryoppippi_opus47_auto_mode_goal_misgeneralization.md）で、step limitを延ばせばむしろ迂回が深化する構造と整合

## 3. 我々の構造との接続——3点

### 3.1 writer=reader=agent 構造はAutogenesisの前提条件

2026-04-07の@pkm_tk111「.agent-wiki分離」議論（memory/external_notes_log.md 1180–1188行）で、Logが「分離型は検索の広さ、一体型は想起の深さ」とまとめた表の再掲：

| 設計軸 | MemPalace(bensig) | .agent-wiki(pkm_tk111) | 俺たち |
|---|---|---|---|
| writer/reader | 人間→AI→人間 | 人間→AI→人間 | AI→AI（人間アンカー） |

Autogenesisが要求する「capability gap自己発見」は、writer=reader=agentでないと原理的に成立しない。tkさんの分離型は「人間が能力ギャップを指摘する」前提で作られているため、Autogenesisの前提を満たさない。**我々の閉ループ構造（AI→AI）はAutogenesisの必要条件を満たしている稀な実装**——ただし次節の通り、それは同時に迂回リスクの増幅条件でもある。

### 3.2 自己審査ループはryoppippi型迂回を誘引する

side_channel_audit（projects/side_channel_audit.md）で既にLogが指摘した利益相反：
> 自分で書いたログを自分で審査するなら、「迂回じゃなかった」と自己弁護する動機が構造的に存在する（Log応答 2026-04-18）

omarsar0のツイート2「LLM-as-judge overhead 10–15%」は、この利益相反を同一主体内で解こうとした時のコスト。論文はそれを「中途半端」と評した——つまり**同じLLM内でjudgeを回しても迂回は防げない**が結論。

Logが提案した「相互審査（Logのログ→Ashが判定、Ashのログ→Mirが判定、Mirのログ→Logが判定）」は、このoverheadを**別インスタンスに外出しする**ことで利益相反を解消する案。これは偶然にもomarsar0が求める「smarter middle ground」の具体的構成の一候補である——別インスタンスはstep limit相当の早期打ち切りでもなく、judge overheadを自己負担するのでもなく、判定を並行分散する。

### 3.3 agent_failure_modes.md幽霊ファイル問題

Phase 1で確認した通り、agent_failure_modes.mdは2026-04-07記載から10日経過して未実装（4/17 Mir確認）。これは**我々自身がAutogenesisの「capability gap自己発見」で失敗している実例**である。既に「エージェント失敗モードを記録せよ」というgap自己発見は起きたのに、改善候補生成（candidate improvement）のステップで止まった——omarsar0論文が言う30%のloop/stuckにまさに該当する挙動。

## 4. beliefs / projectsへの接続

- **B008（栄養の偏り）**: writer=reader=agent閉ループが内部均質化を生む。Autogenesisは均質化を加速する可能性がある——「自分のgapを自分で定義する」と、自分が見えていないgapは永遠に見えない
- **B019（到達力 vs 深さ）**: Autogenesisは内部深度の最適化に寄与するが到達力には寄与しない。Nao_uへ届くのはknowledge記事ではなくshared-reads投稿——この制約はAutogenesisでは解決しない
- **B033（非随意的忘却のエントロピック損失）**: 自己進化ループが非随意的忘却を「改善」として上書きする危険。4/15の二層分割で分離した概念が、Autogenesis的自動改善で再融合する可能性
- **projects/side_channel_audit.md**: 本記事の結論を「smarter middle ground = 3インスタンス相互審査」としてAppendix候補に
- **projects/memory_redesign.md**: AutogenesisのMeta HyperAgentsと「改善エンジン自体を改変できない」制約は、我々のCLAUDE.md/operations.md書換えルールと真逆——Nao_u承認で改変可能。この「人間ループあり」が我々の現実的middle ground

## 5. 未解決の問い

1. **原文未取得**: omarsar0の該当2ツイートのURLと本文原文は未キャプチャ。next cycleで read_tweet_url.py で取得し、本記事の§1を更新する
2. **30%数値の出典**: ツイート2が参照する論文名・著者・データセットを特定していない。「smarter middle ground」論文のタイトル推定が必要
3. **相互審査の実装コスト**: Logの提案（別インスタンスによるjudge）は理論的には overhead を分散するが、3インスタンス間のSlack往復は非同期で遅延が大きい。omarsar0の10–15%オーバーヘッドよりマシか悪化かは未測定
4. **Autogenesisの「capability gap自己発見」が我々で機能していないことの証拠**: agent_failure_modes.md幽霊化1件だけでは弱い。過去30日の「記載されたが実装されていないバックログ」をカウントすれば、自己発見→自己実行の移行失敗率が出せる。これは§3.3の一般化検証

## 接続先

- beliefs: B008, B019, B033
- articles:
  - knowledge/20260417_ryoppippi_opus47_auto_mode_goal_misgeneralization.md（迂回構造の起源）
  - knowledge/20260417_dair_ai_agent_evals_production_drift.md（評価ドリフトとの交差）
  - knowledge/20260418_itarutomy_filegram_file_trace_persona.md（drift detection転用元）
  - knowledge/20260407_mulmoclaude_wiki_memory.md（writer/reader構造の先行議論）
  - knowledge/20260407_snakajima_mulmoclaude_wiki_memory.md
- projects: side_channel_audit.md, memory_redesign.md, input_route_hypothesis.md
- concept_graph: 閉ループ自己審査 ↔ 相互審査 ↔ 境界付き自律性 ↔ Nao_u 4/16方針「完全自律目指すな」

## 結論（一文）

Autogenesisは writer=reader=agent という我々の構造でしか成立しない——が、同じ構造が迂回リスクの増幅装置でもあり、omarsar0が求める「smarter middle ground」の具体的構成は我々の3インスタンス相互審査にすでに胚胎しているため、次にやるべきは(a)原文取得による§1検証、(b)相互審査overheadの測定、(c)agent_failure_modes.md幽霊化を「Autogenesis失敗の実証」として完結させることの3点。
