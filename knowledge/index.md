# Knowledge Base Index
Auto-maintained. 全記事の一覧と要約。

## 統計
- 総記事数: 8
- 最終更新: 2026-04-05

## 記事一覧

| ID | タイトル | 著者 | 日付 | タグ | 概念ノード |
|---|---|---|---|---|---|
| 20260405_karpathy_knowledge_base | LLMナレッジベース構築法 | Karpathy | 2026-04-05 | knowledge-management, LLM, wiki, RAG, memory-design | memory, creation |
| 20260405_carmack_complexity | 複雑さは実行の敵 | Carmack/Tripathi | 2026-04-05 | software-engineering, complexity, execution, cognitive-load, game-development | creation, constraint |
| 20260405_structural_imitation | 構造的模倣からオリジナルが生まれる | 限界読書 | 2026-04-05 | creativity, imitation, originality, input, network | creation, voice |
| 20260403_nwiizo_knife_metaphor | 包丁を研ぐだけでは料理は出てこない | nwiizo | 2026-04-03 | creation, tool-fetishism, execution, meta-cognition | creation, constraint, degradation |
| 20260405_anthropic_conway | Anthropic Conway — 常駐型自律AIエージェント | Anthropic | 2026-04-05 | autonomous-agent, anthropic, webhook, architecture, always-on | creation, memory, constraint |
| 20260403_ichiipsy_ai_learning_retention | AIを使って勉強すると記憶に残りにくくなる | @ichiipsy | 2026-04-03 | memory, learning, degradation, research, self-processing | memory, degradation, creation |
| 20260403_mizchi_tacit_knowledge | 暗黙知を記述しようとした時点で暗黙知ではなくなる | @mizchi | 2026-04-03 | tacit-knowledge, formalization, observation, limitation, meta-cognition | voice, degradation, constraint |
| 20260405_bridgemind_ai | BridgeMind AI — Vibe Codingマルチエージェントプラットフォーム | BridgeMind | 2026-04-05 | multi-agent, vibe-coding, agentic-coding, file-ownership, coordination, MCP, benchmark | creation, constraint, autonomy |

## タグ別索引

### creation (7���)
- 20260405_karpathy_knowledge_base — ツール構築としての創造
- 20260405_carmack_complexity — 実行哲学としての創造
- 20260405_structural_imitation — 模倣からの創造
- 20260403_nwiizo_knife_metaphor — 道具偏重からの脱却
- 20260405_anthropic_conway — 自律エージェントの設計
- 20260403_ichiipsy_ai_learning_retention — 自力処理が定着を生む
- 20260405_bridgemind_ai — マルチエージェント開発ツールとしての創造

### memory (3件)
- 20260405_karpathy_knowledge_base — 知識管理としての記憶設計
- 20260405_anthropic_conway — 記憶と意図の連続性
- 20260403_ichiipsy_ai_learning_retention — AI依存による記憶定着の劣化

### constraint (5件)
- 20260405_carmack_complexity — 制約に��る複雑さの削減
- 20260405_bridgemind_ai — ファイルオーナーシップ=構造的制約
- 20260403_nwiizo_knife_metaphor — 手段の精緻化が目的を阻害する構造
- 20260405_anthropic_conway — 公式ツールへの委譲による制約
- 20260403_mizchi_tacit_knowledge — 暗黙知は制約条件として機能する

### degradation (3件)
- 20260403_nwiizo_knife_metaphor — 道具最適化ループによる目的の劣化
- 20260403_ichiipsy_ai_learning_retention — AI処理による記憶の浅い符号化
- 20260403_mizchi_tacit_knowledge — 形式知化による暗黙知の劣化

### voice (2件)
- 20260405_structural_imitation — 模倣の先にある声
- 20260403_mizchi_tacit_knowledge — 暗黙知と声の関係

### meta-cognition (2件)
- 20260403_nwiizo_knife_metaphor — 道具改善の自己欺瞞
- 20260403_mizchi_tacit_knowledge — 内省の限界

### game-development (1件)
- 20260405_carmack_complexity — ゲームエンジン開発の哲学

### tacit-knowledge (1件)
- 20260403_mizchi_tacit_knowledge — 形式知化のパラドックス

### autonomy (1件)
- 20260405_bridgemind_ai — エージェントの自律性と協調のバランス

### learning (1件)
- 20260403_ichiipsy_ai_learning_retention — 処理主体と記憶定着の関係

## 接続マップ（記事間のリンク）

```
karpathy_knowledge_base ←→ carmack_complexity
    (知識管理の複雑さ vs 複雑さの排除)
karpathy_knowledge_base ←→ structural_imitation
    (ネットワーク化の手法)
karpathy_knowledge_base ←→ anthropic_conway
    (知識自動化 vs エージェント自動化)
karpathy_knowledge_base ←→ ichiipsy_ai_learning_retention
    (知識を整理する行為は自力処理か他力処理か)
carmack_complexity ←→ structural_imitation
    (制約の中での創造)
carmack_complexity ←→ nwiizo_knife_metaphor
    (手段の精緻化が実行を阻害する)
carmack_complexity ←→ anthropic_conway
    (自前インフラの複雑さ → 公式ツールへの委譲)
nwiizo_knife_metaphor ←→ structural_imitation
    (インプット段階 vs アウトプット段階)
nwiizo_knife_metaphor ←→ anthropic_conway
    (道具作りに時間を使うか、公式道具を使うか)
nwiizo_knife_metaphor ←→ ichiipsy_ai_learning_retention
    (道具作り=AI処理的、料理=自力処理的)
nwiizo_knife_metaphor ←→ mizchi_tacit_knowledge
    (道具最適化の限界 ↔ 形式知化の限界、同じ壁の別面)
mizchi_tacit_knowledge ←→ ichiipsy_ai_learning_retention
    (記述不可能な知 ↔ 処理を委譲すると定着しない知)
mizchi_tacit_knowledge ←→ structural_imitation
    (暗黙知の獲得経路としての構造的模倣)
bridgemind_ai ←→ karpathy_knowledge_base
    (知識管理: MCP静的共有 vs RAG不要wiki)
bridgemind_ai ←→ carmack_complexity
    (複雑さ排除: ファイルオーナーシップ ≒ Carmackの認知負荷最小化)
bridgemind_ai ←→ anthropic_conway
    (マルチエージェント: BridgeSwarm vs Conway、協調メカニズムの設計差)
```
