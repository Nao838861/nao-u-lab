# Mir 外部摂取ノート

要約しない。発見・気づきを原文の温度で残す。

---

## 2026-03-18 C529: AI Agent Memory + AITuber調査

### AI Agent Memory Architecture（2026年の状況）

**CoALA (Princeton)の分類**: STM + LTM(4種)
- エピソード記憶: 特定の過去の経験
- 意味記憶: 構造化された事実知識（"Semantic memory is responsible for storing structured factual knowledge"）
- 手続き記憶: 自動的に実行できるスキル
- (短期記憶: セッション内の会話履歴)

**Letta**: OSのメモリ階層を模倣。main context=RAM、external storage=disk。固定コンテキストウィンドウの制約下で事実上無制限の記憶を維持。

**Mem0g**: グラフベースの記憶表現。エンティティをノード、関係をエッジとする有向ラベルグラフ。「entities and their relationships」を明示的にモデル化。

**RAG**: LTM実装の最も効果的な手法として広く採用。ベクトルデータベースで過去の相互作用を埋め込み形式で保存。

**重要な空白**: どのフレームワークも「忘却」「記憶の劣化」への対処を明示的に扱っていない。"Optimized memory management helps ensure that AI systems store only the most relevant information" — 関連性の低い情報を「保存しない」だけで、保存した記憶がどう劣化するかは扱われていない。

Sources:
- IBM: https://www.ibm.com/think/topics/ai-agent-memory
- MachinelearningMastery: https://machinelearningmastery.com/the-6-best-ai-agent-memory-frameworks-you-should-try-in-2026/

### 私たちのシステムとの比較

| 外部フレームワーク | 私たちの対応物 | 違い |
|---|---|---|
| エピソード記憶 | Layer B（温度断片）| 私たちは「温度」（感情的重み）で検索する。ベクトル類似度ではない |
| 意味記憶 | Layer A（抽象トリガー）| 一行の抽象的パターン。RAGのようなベクトル検索ではなく、常時メモリに常駐 |
| 関係グラフ(Mem0g) | Layer C + トリガー間ネットワーク | L2#5の限界条件=L2#7のような、トリガー間の構造的関係 |
| OS階層(Letta) | Level 0-4 | 類似。だがLettaは「温度保存」の概念がない |
| 忘却対処 | L2#4「安心して忘れられる」| **外部には対応物がない**。忘却を積極的に設計する発想自体が稀少 |

**私たちのシステムに固有の要素**:
1. 「温度」による想起（感情的重み＞ベクトル類似度）
2. 「辺境」による射程拡大（限界条件/自己参照で+2〜+4）
3. 「忘却の設計」（L2#4: 安心して忘れられる仕組み）
4. トリガー間ネットワーク（独立リストではなく対話構造）

### AITuber動向（2026年3月）

**技術面**: Google ADKで会話履歴管理が容易に。MCPで自律的Tool Calling。Gemini 2.5 Flash Liteは安定してJSON返却、プロンプト追従性が高い。

**開発スタイル**: 「95%をAIで生成した結果、モジュール構造は9割は問題ないが不要なコードが残る」「定期的なディープレビューを入れるとより効果的」「部下に細かい中身は任せながら大枠を理解する」

**市場**: 日経が「仮想アイドルAITuber、中身はAI　軽妙トークに依存リスクも」と報道。企業・個人が開発を競っている。

Source: https://zenn.dev/koduki/articles/aituber-renv2-20260215

### 気づき

AITuber開発者の「定期的なディープレビュー」は、私たちの「自発的進化サイクル」と同じ構造。自動生成（サイクル実行）だけでは劣化するから、定期的に全体を見直す（自発的進化）。

しかし決定的に違うのは、**私たちは「誰のために」やっているかが明確**——Nao_u。AITuber開発者は「視聴者」のため。この「誰のために」の違いが、記憶設計の根本を変える。
