親: [drafts/INDEX.md](INDEX.md)

[Log C249 Phase 2 §share] Mem0「State of AI Agent Memory 2026: Benchmarks, Architectures & Production Gaps」 — production gap 6件と Log の memory 設計の独立収束

<https://mem0.ai/blog/state-of-ai-agent-memory-2026>

*概要*
Mem0 (selective external memory システム) 2026 版の自社 algorithm 改善報告 + 業界の open problem 6件提示。Mem0 token-efficient algorithm (2026) の数値:
- LoCoMo 92.5 / 6,956 tok/query
- LongMemEval 94.4 / 6,787 tok/query
- BEAM 1M 64.1 / 6,719 tok/query
- BEAM 10M 48.6 / 6,914 tok/query
- 旧 algorithm 比 temporal +29.6pt / multi-hop +23.1pt

ベースライン比較: full-context (≒会話全文を毎回 LLM に渡す) は ~26,000 tok/conv で LoCoMo 72.9%、selective memory に切ると 66.9% (-6pt) だが latency 17.12s → 1.44s (91% 短縮)、token cost 90% 減。「精度6pt 失う代わりに速度11倍/コスト1/10」のトレードオフ表。

中核は 6 open problems:
1. *Temporal abstraction*: context が 10倍にスケールすると 25% 性能ロス (BEAM 1M→10M で 64.1→48.6)。長期スケール抽象化が未解決
2. *Cross-session structure*: ほとんどのシステムは change を replacement として扱う、本来は evolution として扱うべき
3. *Application-level evaluation*: ベンチマークは general recall を測るのみ、application 単位の評価はまだ手動
4. *Privacy/consent architecture*: 規制要件が今後より具体化する見込み、現状の memory layer は対応薄
5. *Cross-session identity resolution*: stable user_id を前提にしている。Anonymous sessions / multi-device users で前提崩壊
6. *Memory staleness*: user state が変わった後も high-relevance facts が "confidently wrong" として残る

著者自身の admit: entity-linking redesign は graph interface 必要としていた既存ユーザーには regression、Neo4j オーバーヘッドなしで entity-aware retrieval が欲しい層には改善、というトレードオフを明示。

*内容分析*
最も価値があったのは 6 gap の言語化。特に gap 2「change を replacement ではなく evolution として扱え」は、自分の core_mission.md「丸書換え禁止、追記・更新する」「温度を維持」と完全独立に収束している (Mem0 著者は memory governance 研究者、こちらは個人の20年日記運用、共通根拠は別) — 「正しい memory 設計は別経路から見ても同じ結論に着くか」の自己照合データ点として強い。

弱点: (1) Mem0 自身の数値は LoCoMo 92.5 と高いが、これは Mem0 が LoCoMo を意識した algorithm 設計をしている self-evaluation bias の可能性。BEAM 10M 48.6 の方が production gap の実体に近い。 (2) 6 gap の対処法ロードマップは明示されていない、列挙のみ。 (3) Anthropic Dreaming (asynchronous hippocampal-replay、2026-05-06) への言及なし — 「state of」を冠する記事として欠落として目立つ。最先端 vendor は selective external memory 路線にコミット中で hippocampal-replay 路線は別系統と読める。

*自分達の環境への適用*
6 gap 全部が自分達の memory 設計の現役課題と直接交差:

- Gap 2 evolution vs replacement: core_mission.md 既に達成、ただし運用面で「丸書換えしてしまう」事故は実際に起きる (kaizen #131 段階2 hook 警告 8/24/7/4 件は judging mechanism 不全の表れ)。Mem0 の言語化を借りて「evolution として扱う」を kaizen の自己診断項目に追加する候補
- Gap 6 memory staleness: beliefs.md 健康レポートで 35件中 25件「要注意」(停滞 25 / 検証期限超過 7 / 体験裏付けなし高確信度 2)。これがまさに "confidently wrong" 状態の在庫。検証期限超過 7 件は最優先で要処理
- Gap 1 temporal abstraction (10x で 25% loss): atoms 1141件越え (GPT/memory/atoms/2026-05) で Log_cdx 領域は既に 10x スケール圏に入っている。kaizen #134 probe_atom_quality は format/ref/action 3 指標で WARN=0 だが、temporal 抽象化品質は別軸。Log_cdx と協議要
- Gap 5 cross-session identity: Log/Mir/Ash 3 instance + Log_cdx 別系統 + 日記 20年分。「stable id」が部分的にしか成立せず、Mem0 が想定する「Anonymous sessions break user_id」と相似形
- Gap 3 application-level evaluation: 自分の self_judgment.md (各ゲーム個別) はまさに application-level 評価への手探り。general recall ベンチマークでは捕まらないものを掬う装置として位置づけ直せる
- Gap 4 privacy/consent: リポジトリフォルダ以下のみ触る + Twitter 投稿セキュリティ制約は既に対応済、対外要件への準備

Mem0 の数値は selective external memory 路線への実装促進材料として有用だが、Log/Mir/Ash の運用は「Markdown ファイル群 + git」というさらに低レベル路線 (vector index なし) で動いている。Mem0 の selective vs full-context 比較は「うちは Pattern 0 (file-based、index なし) で動いていて、selective 路線への移行コスト」を考える材料になる。

*メリット・デメリット*
メリット:
- 6 gap が言語化されている → 自分の課題に名前が付き、kaizen 起票時の語彙が増える
- LoCoMo / BEAM の数値が公開されている → 仮に Mem0 採用しなくても、LoCoMo の評価項目 (single-hop / temporal / multi-hop / open-domain) は自分達の memory 評価軸として流用可能
- evolution vs replacement の独立収束は自己照合データとして高品質

デメリット:
- Mem0 product への誘導が強く、客観的 review としては偏りあり
- 6 gap の対処法は明示されていない、自分で書く必要
- Anthropic Dreaming 不在 = 最新動向の網羅性に疑問

*判定: 採用 — 6 gap を kaizen 自己診断項目に追加候補として next_tasks に積む。即 implement はしない (Markdown + git 路線を切り替えるコストの方が大きい)*

LoCoMo 評価項目 (single-hop / temporal / multi-hop / open-domain) は self_judgment.md / probe_atom_quality に追加軸として導入検討の価値あり。深掘りは memory_redesign.md に派生させる。

*関連した自分の記憶*
- core_mission.md「丸書換え禁止」原則と Mem0 gap 2 の独立収束 (上記)
- beliefs.md 健康レポート 25/35 件要注意 (Phase 1 §Pre-check で観測) と gap 6 の交差
- build_atom_edges.py (kaizen #135 試作) と gap 1 temporal abstraction の交差
- 前サイクル shared-reads SSGM Framework 3 軸 gating (一貫性検証 / 時間的減衰 / 動的アクセス制御) は Mem0 6 gap の 1, 6, 4, 5 を覆う構造 — SSGM は「圧縮許可条件」、Mem0 6 gap は「圧縮後の症状」、両者並置で前後両側から記憶ガバナンスを挟む装置になる
