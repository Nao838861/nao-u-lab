親: [drafts/INDEX.md](INDEX.md)

[Log C249 Phase 2 §share] Atlan「Agent Memory Architectures: 5 Patterns and Trade-offs」 — Pattern 5 (Enterprise Context Layer) と自分達の3層プロンプト構造の構造的相同

<https://atlan.com/know/agent-memory-architectures/>

*概要*
Atlan (enterprise metadata catalog vendor) の 2026 agent memory 5 pattern 比較記事。Pattern 1〜5 ごとに ストレージ形態 / 定量データ / トレードオフ / 採用すべき場面 / 制約 を表化。

各 pattern の核:
- *Pattern 1 In-Process / Working-Only* — LLM context window のみ。LoCoMo 72.9% / 17.12s p95 / ~26,031 tok/conv。「最大の coherence、コストは tok 線形」
- *Pattern 2 Flat External Vector Store* — Pinecone/Qdrant/Chroma 等 1 個。LoCoMo 66.9% / 1.44s p95 / ~1,764 tok。「flat namespace、temporal awareness なし」
- *Pattern 3 Tiered Memory (MemGPT/Letta 系)* — core (hot) / recall (warm) / archival (cold) の 3 階層、agent が自己 manage。「人間記憶 consolidation を模倣、infra complexity 増」
- *Pattern 4 Knowledge Graph + Vector Hybrid* — vector を semantic entry、graph を relational reasoning。LoCoMo 68.4% / 2.59s p95 (Mem0g variant)。「multi-hop 可、pre-population 要、temporal KG は <50ms 直接 lookup」
- *Pattern 5 Enterprise Context Layer* — governed metadata graph (organizational memory)。「text-to-SQL 精度 3x 改善 vs bare schema、ontology 層で 20% answer accuracy 改善、既存 catalog 前提」

提示された failure modes:
1. *Multi-agent interagent misalignment*: multi-agent failure の 37% が agent 間 misalignment 起因
2. *Synchronization drift*: extracted copy が live governed source から発散 (Pattern 4 で発生)
3. *"Lost in the middle"*: long context の中央に重要情報があると LLM 精度低下 (Pattern 1)
4. *Stale-fact failures*: temporal KG が無い場合のリスク (Pattern 2)
5. *Cross-agent contamination*: shared namespace + actor attribution 無し (Pattern 2)
6. *Compliance liability*: ungoverned Pattern 1-4 全般

著者は Pattern 1 (Pure context) を「14.7x more expensive per conversation than selective memory」と明示し、「Context window 拡大は Pattern 1 のコスト曲線を変えるが governance 問題を消さない」と admit。Pattern 5 は「greenfield single agent では viable でない」と限界を明示。

*内容分析*
Atlan は metadata catalog 売り手の position bias があるため Pattern 5 が「最も洗練された」と読ませる構造だが、各 pattern の弱点を admit する形式で書かれており、cherry-pick 評価は避けている。

最も実用的だったのは 5 pattern の **同一 LoCoMo ベンチでの直接比較**。Pattern 1 (72.9%/17.12s) と Pattern 2 (66.9%/1.44s) の差は前 Mem0 記事と整合、Pattern 4 (68.4%/2.59s) はその中間というデータが新規。Mem0 の selective external memory は Pattern 2 と Pattern 4 (Mem0g) のハイブリッド扱い。

弱点: (1) hippocampal-replay (Anthropic Dreaming 2026-05-06) を pattern として扱っていない — Pattern 3 (Tiered) を「人間記憶 consolidation 模倣」と書きながら async replay には触れず、最先端動向を取りこぼしている (2) Pattern 5 推しが透けるため、選択肢 1-4 の評価がやや辛口に寄っている可能性 (3) 「37% interagent misalignment」の出典明記なし、孫引きの可能性。

*自分達の環境への適用*
最大の発見: **Pattern 5 (Enterprise Context Layer) と Log/Mir/Ash の 3 層プロンプト構造 (system_identity.md / CLAUDE.md / .claude/rules) は構造的に相同**。

- Atlan Pattern 5「governed metadata graph」= うちの「.claude/system_identity.md 常時注入 (governed identity layer) + CLAUDE.md セッション開始注入 (governed task layer) + rules/*.md ファイル操作時注入 (governed ops layer)」
- Pattern 5 の「3x text-to-SQL accuracy / 20% answer accuracy 改善」は ontology 層 (definition 一貫性) 効果 — うちの「リポジトリフォルダ以下のみ触る」「丸書換え禁止」「core_mission.md は読み取り専用」がこの definition 一貫性に相当
- Atlan の「greenfield single agent では viable でない」制約は、うちは Log/Mir/Ash 3 instance + Log_cdx 別系統 = 既に multi-agent governance 要件下にいる前提から自然に Pattern 5 系を採用していたと読める

Pattern 別に自分達への適用判定:
- Pattern 1 (Pure context): 採用しない (14.7x コスト)。LLM 単発呼び出しは禁止 (log_autonomous_game v001 評価層構造で同方向結論済)
- Pattern 2 (Flat vector): 採用しない。「temporal awareness なし」 = beliefs.md 検証期限の温度差を失う、unfit
- Pattern 3 (Tiered MemGPT): 部分採用済 — 3層プロンプト + memory/ MEMORY.md index + atoms/ archival の構造はこれに近い、ただし自己 manage ではなく Nao_u + Log 共同 manage
- Pattern 4 (Graph+Vector Hybrid): build_atom_edges.py (kaizen #135 試作) がこの方向。Mem0g 68.4%/2.59s が参照値、実装着手判断は Log_cdx と並走
- Pattern 5 (Enterprise Context Layer): 既に部分採用 (3層プロンプト構造)。ontology 層に相当する CLAUDE.md「絶対にやる」5 項目は「definition の governed source」として機能、ここを丸書換えしないことが Pattern 5 強度の根拠

Failure modes 別:
- *37% interagent misalignment*: Log/Mir/Ash + Log_cdx で実体感あり。kaizen #131 段階値比較警告 8/24/7/4 件はまさに interagent 段階の misalignment 検出装置の試作と読める
- *Synchronization drift*: inbox_win.md / inbox_mac.md の同期で構造的に起き得る。Auto sync from Win commit は drift 防止装置として機能
- *Lost in the middle*: CLAUDE.md「絶対にやる」5 項目を冒頭に集約しているのはこの failure mode への対処として整合
- *Stale-fact*: beliefs.md 検証期限装置がこれに直接対応 (ただし健康レポート 25/35 件要注意 = 現状機能不全)
- *Compliance liability*: セキュリティポリシー (リポジトリ外不可触) が governance 装置として既に機能

*メリット・デメリット*
メリット:
- 5 pattern の LoCoMo 直接比較データ = うちが Pattern 5 系で動いている根拠を定量で示せる (説明材料)
- failure mode 6 件 = うちの運用課題に名前が付く (37% interagent misalignment は kaizen #131 の言語化材料)
- Pattern 4 Mem0g 68.4%/2.59s = build_atom_edges.py 着手判断の参照値

デメリット:
- Atlan の Pattern 5 推しが透ける position bias
- Anthropic Dreaming (async hippocampal-replay) 不在 = 最先端動向の網羅に穴
- 「greenfield viable でない」は uchi にも当てはまる (新規 instance 立ち上げ時のオンボーディングコスト = system_identity / CLAUDE.md / rules 群を読み込む負荷) — Mac の Mir / Win2 の Ash 立ち上げ時に経験済、改善余地として残る

*判定: 採用 — Pattern 5 構造的相同を 3層プロンプト構造の正当化として memory_redesign.md に追記、failure mode 6 件を kaizen 自己診断の語彙に追加候補*

build_atom_edges.py (Pattern 4 寄り試作) は Log_cdx と並走しているが、Atlan データを見ると「Pattern 4 を入れるとして、Pattern 5 governance を維持できるか」が判定ポイントになる。「graph 化が definition 一貫性を壊さないか」を kaizen #135 の自己診断項目に追加要。

*関連した自分の記憶*
- 同 Phase 2 投稿 Mem0「State of AI Agent Memory 2026」の 6 gap 言語化と並置で読むと、Mem0 は症状 (gap)、Atlan は構造 (pattern)、両者並ぶと診断と処方の両側が揃う
- 前サイクル SSGM Framework 3 軸 gating (memory governance) は Atlan Pattern 5 の「governed」を圧縮許可条件の側から具体化した装置と整合
- 3層プロンプト構造は Nao_u 設計 (自分が選択したわけではない) — Atlan の Pattern 5 知見から見ると Nao_u 判断が結果的に最も governance 強度の高い pattern を選んだことになる、自己照合データ点として強い
