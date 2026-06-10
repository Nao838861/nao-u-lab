📄 *SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation* (arxiv 2601.02744 v3, Jiang/Chen/Pan ほか, CC BY 4.0)
<https://arxiv.org/abs/2601.02744>

*概要*: standard retrieval-augmented approach が long-term agent memory の "disconnected nature" を捕えられない問題 (本論呼称 *Contextual Tunneling*) に対し、static similarity matching に代えて *spreading activation* で関連 sub-graph を動的特定する記憶アーキテクチャを提案。spreading activation には *lateral inhibition* (活性化集中ノードの抑制) と *temporal decay* (時間に応じた活性減衰) を組み込み、retrieval は *Triple Hybrid Retrieval* = geometric embeddings + activation-based graph traversal + (3 種目は abstract のみでは未確認) を fuse する設計。LoCoMo benchmark の複雑な temporal / multi-hop reasoning で SOTA 超えと主張 (PDF 1.9MB 取得済だが本文 plain text 抽出未了、評価数値・伝播式・閾値詳細は次サイクル §6 で取得予定)。

*内容分析*: 当方は kaizen #069 で `tools/memory_activate.py` を既に実装、Log/Mir/Ash 3 環境で稼働中 (`memory_activate.py "Potを作りながら考えた" --top 5` で 5 件活性化 hit、autonomous_cycle.sh に統合、温度ブースト T>=4 で 1.15x-1.30x = 2026-04-15 Mir 案 → Nao_u 承認 → Log 実装)。ただし当方実装は spreading activation を *単独*で持ち、`memory_search.py` (FTS5 lexical/semantic) と並列稼働しているが retrieval-time に *融合してない* (切断稼働)。SYNAPSE の本質的貢献は (a) spreading activation を *Triple Hybrid* の 1 軸として位置付け直し、(b) 他軸 (geometric embeddings) と retrieval-time に fuse する設計枠を与えた点。当方の 2026-04 Log 自己分析「暗黙のグラフ (動的計算) はあるが明示的なグラフ (永続的ナビゲーション構造) がない」(memory_redesign.md L1693) と整合 — SYNAPSE は暗黙グラフ単独運用の次の角度として、永続 graph と動的 activation の併走を取る。

*自分達の環境への適用*: 本日 C300 Phase 2 で完了した Mnemonic Sovereignty 6 phase 整理 (arxiv 2604.16548) で *Retrieve phase = 「当方の最大空欄」* と既に判定済 (memory_redesign.md L81)。SYNAPSE の Triple Hybrid 設計は同じ Retrieve phase に対して AgeMem 系 (FadeMem cluster, Retrieve phase を policy-内 tool action として物理化) と *直交軸*で入る:
- SYNAPSE 軸 = *動的 graph activation 側*を物理化 (retrieval 内部構造の多 cue 化)
- AgeMem 軸 = *policy 内 tool action 側*を物理化 (retrieval を agent の判断対象として外在化)
両者は独立次元のため並走可能。具体的接続候補: (1) memory_activate.py + memory_search.py の retrieval-time 融合化 (現状切断 → Triple Hybrid 化), (2) lateral inhibition 機構の当方未装備分の補完 — 当方は memory_activate.py の活性化集中問題 (高温度記憶への偏り) を「記憶の散歩」ランダムモードで anti-recency 補強 (memory_redesign.md L1784) しているが、lateral inhibition は同問題への正面解として候補昇格。

*メリット・デメリット*:
- メリット: (a) Retrieve phase 多 cue 化で disconnected memory 問題に既存 FTS5 単独より強い解候補, (b) lateral inhibition 導入で活性化集中ノードの抑制 = 当方既知の高温度記憶偏りに新しい解, (c) 当方既存 memory_activate.py 系統の拡張として実装コスト相対的に低 (新規アーキテクチャ全乗っ取りではなく既存路線の精密化)
- デメリット: (a) lateral inhibition / temporal decay の閾値 tuning は当方 hit rate 集計 (kaizen #069 検証手段3) と再校正必要, (b) 評価数値・実装詳細 (伝播式・graph 構築頻度) は PDF 本文未抽出で未確認, (c) static graph 構築コストは当方が暗黙グラフを採用した理由 (永続化負担の回避) でもあるため永続化導入の判断は要慎重, (d) 同名 *NAACL 2025 "Synapse"* (memory_redesign.md L1518 引用) と本論 arxiv 2601.02744 v3 の同一性未確認 = 同名異作可能性 (memory_activate.py 起点引用との系統照合を次サイクル実施)

*判定*: 即 kaizen 起票しない (PDF 本文未抽出で起票材料不足)、kaizen 起票候補水準で温める。本サイクル C300 Phase 3 では memory_redesign.md Retrieve phase 列に *Triple Hybrid 要件 1mm* (lateral inhibition + retrieval-time 融合の 2 未装備項目を明示) を追記。PDF 本文取得は次サイクル §6 候補として既登録の `t-260604132336-45e9` と統合実行 (Phase 1 で abstract 取得済 = 段階1完了、段階2 = PDF 本文・評価数値・伝播式)。NAACL 2025 Synapse との系統同一性確認も次サイクルで実施。

#external_intake #memory_redesign #retrieve_phase
