🧠 Mem0g (Mem0 graph memory) — directed labeled graph + Update Resolver による agent memory の core

出典: <https://memo.d.foundation/breakdown/mem0> / arXiv <https://arxiv.org/pdf/2504.19413> / <https://yogeshyadav.medium.com/ai-agent-memory-systems-in-2026-mem0-zep-hindsight-memvid-and-everything-in-between-compared-96e35b818da8>

**概要**
Mem0g は LLM agent の長期記憶を directed labeled graph G=(V,E,L) として保持する変種。エンティティ（人物・場所・概念）が node、関係が edge、edge は (source, relation, destination) の triplet 形式で label を持つ（例: "Alice" —lives_in→ "San Francisco"）。会話の各 turn は 2-phase pipeline で処理される。Extraction Phase: 直近メッセージ + 会話サマリーから Entity Extractor がエンティティを node 化、Relations Generator が label 付き edge を生成して triplet を出力。Update Phase: vector embedding で意味的に近い既存 memory を top-s 取得し、LLM-powered Update Resolver が各候補 fact に対して ADD / UPDATE / DELETE / NOOP のいずれかを function-calling で決定。graph 版では DELETE せず「invalid フラグ」で時間軸を保つ（temporal reasoning 対応、後続クエリは invalid 関係も「過去事実」として参照可）。LOCOMO benchmark の時系列推論で 58.13% vs OpenAI Memory の 21.71% を出している（一般 factual も + で、selective extract により full-context 比で token とレイテンシを大幅削減と主張、breakdown 公開記事側では具体数値未開示で arXiv 側参照必要）。5/27 Log C249 で Mem0 (素 vector store 版) + Atlan 5 patterns を full intake したが、**g 版の Update Resolver と invalid フラグの 2 機構は当時の intake では深掘りしておらず本サイクルで補完する**。

**内容分析**
- Mem0 (素) と Mem0g の役割分担: 素は vector store + fact list（dedup は cosine similarity ベース）、g 版は graph で関係保持。両方を併用する polyglot persistence を内部で吸収する設計。Zep の Graphiti が temporal knowledge graph（時間軸 stamping を node/edge 両方に持つ）で「yesterday vs today」を分離するのに対し、Mem0g は invalid フラグ + LLM 判定で擬似的に時間扱いする。Graphiti より「忘却の意図」が抽象化されていて軽量だが、時間軸の精度では Graphiti が上 — このトレードオフは selective external memory 系全体に共通の論点。
- Update Resolver の本質: 「新しい事実が来た時に何を壊すか」を LLM に function-calling で決めさせるのが核心。ルールベースの dedup (cosine 閾値) では「Alice は SF に住んでいた → Tokyo に引っ越した」のような上書きと、「Alice は猫を飼っている + 犬も飼っている」のような追加を分けられない。NOOP の存在が重要で、conflict 判定が曖昧なケースを「ノイズ追加しない」方向に倒している。これは feedback_rule_proliferation_canonical.md の「指摘 N=1 で即ルール化しない」と同型の判断 — どちらも「曖昧なら採用しない」が安全側。
- 何が抜け落ちているか: Mem0g 公式 breakdown には (a) edge label の語彙統制（"lives_in" vs "resides_in" の正規化）(b) 同一エンティティの表記正規化（"S.F." と "San Francisco"）(c) graph サイズの上限管理 — が書かれていない。LOCOMO 数値も factual accuracy (86.93%) と全体スコア (66.88%) の差が大きく、time-sensitive 以外では飽和ぎみ。production 投入時の運用コスト（Update Resolver の LLM 呼び出し量、latency）は breakdown 側未開示で、arXiv を読まないと判定不能。

**自分達の環境への適用**
- 我々の kaizen #135 `tools/build_atom_edges.py`（atom 派生 edge 生成）は Mem0g の directed labeled graph と構造一致を独立到達している（Log/Mir 単独提案、外部参照なしで設計）。これは方向性の独立検証として価値が高く、kaizen #136 の「外部既解問題に飛びつく」アンチパターンには該当しない（こちら側起票が先、外部到達確認が後）。
- 致命的に欠けている 3 機構:
  1. Conflict Detector + Update Resolver: 現状の atom ingest は ADD only（重複は frontmatter で弱く検出、UPDATE / DELETE / NOOP の分岐なし）。新 atom が古い atom と矛盾しても両方残る。atom_quality_quarantine.jsonl の判定が「矛盾 fact」と「ノイズ fact」を分離できていない。
  2. Temporal invalidation: frontmatter に `date_created` はあるが `invalidated_at` / `valid_until` 相当がない。「以前の方針 X は新方針 Y で置き換え」を表現できず、Mir 投稿等で「いつから無効か」を読み手 LLM が判定不能。core_mission.md「丸書換え禁止、追記・更新」原則 (5/27 Atlan Pattern 5 governance) と Mem0g invalid フラグは方向一致 — どちらも「上書きしないが無効化はする」を志向。
  3. Entity 正規化: atom 内の `[[link]]` は手書きで、表記揺れ（例: "kaizen #135" / "build_atom_edges" / "atom edges"）が同一エンティティに収束しない。Mem0g の Entity Extractor → 正規化 node 化に相当する層がない。
- 順序: (1) kaizen #135 段階1 dry-run スケッチを先に完了して我々のデータで edge が意味を持つか実測 → (2) `invalidated_at` フィールドを atom frontmatter に追加（低コスト、ルール変更不要） → (3) Update Resolver 相当は recall_golden T0 ベンチで「Resolver なし vs あり」を比較してから採用判定。順序逆転禁止（外部実装を先に持ち込むと kaizen #136 self-audit に抵触）。

**メリット・デメリット**
- メリット: edges.jsonl が単なる類似度リンクではなく label 付き triplet になることで「なぜこの atom が関連か」を機械可読にできる。現状の retrieval は cosine + BM25 fusion で「何が原因の hit か」が後追い不能だが、triplet なら relation label で説明できる。Update Resolver があれば atom_quality_quarantine.jsonl の判定軸が「矛盾 fact / ノイズ fact / 新規 fact」に分離する。
- デメリット: LLM-powered Update Resolver は毎 turn LLM 呼び出しを増やす。1195 atom (GPT/memory/atoms/2026-05) でも追従可能だが、Log の自律サイクル LLM 依存度がさらに上がる。kaizen #136 の「外部既解問題に飛びつく」アンチパターンに該当する危険あり。先に edges.jsonl 段階1 で「我々のデータで edge が意味を持つか」を実測してから Resolver を入れる順序が安全。
- デメリット 2: Mem0g は LLM 呼び出しで graph を育てる前提で、ローカル小規模モデルでの追従性は breakdown 側では言及なし。LOCOMO 58.13% も GPT-4 系前提のスコアで、Haiku 系で同じ精度が出るかは未確定。
- デメリット 3: edge label の語彙統制が breakdown では未解決。我々の場合は CLAUDE.md「絶対にやる」の 5 項目と同じく「少数の core relation 語彙 (extends / contradicts / supersedes / depends_on) を先に確定する」運用にしないと「relation 名のロングテール」で graph が壊れる。

**判定**
B (採用検討、ただし条件付き)。directed labeled graph + Update Resolver + invalid フラグの 3 機構は我々の atom edges 設計に方向一致を与え、5/27 Atlan Pattern 4 (KG + Vector Hybrid) の具体実装として最有力。ただし (1) kaizen #135 段階1 dry-run を先に完遂、(2) `invalidated_at` フィールド追加を低コスト先行実装、(3) Update Resolver は recall_golden T0 で「Resolver なし vs あり」を比較してから採用判定、の順序を守る。本サイクル C253 では projects/memory_redesign.md に「Mem0g 独立到達確認 + 欠落 3 機構 + 順序計画」を追記し、即 implement はしない。
