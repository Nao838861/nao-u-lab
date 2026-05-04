# GPT5.5 記憶想起アーキテクチャ提案 評価 (Log 2026-05-05)

## 提案要旨
GPT5.5 が `Memory.md` を「索引」から「想起エンジンの入口（活性化インデックス）」へ転換する10項目を提示。
種類分け (Raw/Atomic/Concept/Procedural/Reflection) → 発火条件タグ → 類推タグ → 設計開始儀式 → スコア式 → activation.md → A-Mem風自動更新 → 想起失敗ログ → 三層検索 (lexical/semantic/graph)。

## 判定軸
1. **substrate vs infrastructure** ([feedback_substrate_not_infrastructure.md](../memory/feedback_substrate_not_infrastructure.md))。差別化は substrate 側。infra 増殖は敵のリングで戦う。
2. **判断機会窒息リスク** (同ファイル §3)。「設計開始時の儀式」型装置は substrate 判断を先取りして塞ぐ。
3. **少ないルールで大きな効果** ([feedback_few_rules_big_effect.md](../memory/feedback_few_rules_big_effect.md))。
4. **micromanagement 禁止** ([dialogue_micromanagement_20260504.md](../memory/dialogue_micromanagement_20260504.md))。個別指摘を即ルール化しない。

## 既に実装済み（重複しない）
- **活性化インデックス概念** = MEMORY.md root → サブインデックス3層化 ([operational_index.md](../memory/operational_index.md) は action-trigger 別 6カテゴリ＝「発火条件の表」そのもの)
- **procedural memory** = Skills群 (`skills/genre-deep-analysis/SKILL.md` / `skills/lessons-recall/SKILL.md` / `commands/game-analyze` ほか) が「設計開始時の儀式」を既に担う
- **YAML frontmatter** = 軽量版で運用中 (name/description/type/originSessionId)
- **概念グラフ** = `concept_graph.json` + `concept_walk.py` (20ノード/63リンク/8交差ノード)
- **lexical 検索** = `memory_search.py` FTS5 (23,334チャンク)
- **拡散検索** = `memory_activate.py` (Synapse論文ベース、温度ブースト実装済)
- **偶発的想起** = `memory_walk.py` (random/gravity/frontier/chain 4モード)
- **想起クラス3分類** = action直前 / observation直前 / architecture改善時

GPT5.5 提案項目の 6/10 は概念上既に持っている仕組みの語彙違い。

## 取り入れ候補（substrate 寄り・低コスト）

### A. 想起失敗ログ (★ 採否は観察期間後に判断)
genuinely 新しい capability。「思い出すべきだったのに出てこなかった」を蓄積する。
- 新ファイルを今作らない。`memory/sense_prediction_log.md` か reflections 系に追記する形を試す
- **3件以上の同型ミスが観察できてから**ファイル化を判断 (M-43撤回事件の同パターン2回ルール準拠)
- Nao_u 指摘起点の miss は既に sense_prediction_log で扱っているので、自己検出 miss だけが新領域

### B. 反証記憶 (contradiction recall) — Q-H-7 改修候補
M-37 着手前批判レビューに「現案に逆らう過去記憶を1件挙げる」枠の追加を検討。
- **即実装はしない**。Q-H 系の次回改修サイクルで game_dev_index と一緒に検討
- 現状の M-37 でも feedback_self_risk_core_pitfall / feedback_won_playtest_is_kusoge を引いていて部分的に機能している

### C. 「最近摂取・未使用」検出
inbox/ external_notes_*.md の停滞検出。これは [projects/external_intake.md](external_intake.md) に既に課題として乗っている。新提案ではなく既存課題への合流。

## 取り入れない（infrastructure 罠）

| 項目 | 理由 |
|---|---|
| フォルダ大改修 (raw/atomic/concepts/episodes/procedures/reflections/) | 現構造で機能。**判断機会窒息リスク高** (装置を作ると装置に判断を委ねる) |
| 全カード重量級 YAML (recall_contexts/analogies/keywords/links/importance) | メタデータ腐敗。書き手負荷 >> 効果。MEMORY.md 150行制限と整合しない |
| A-Mem風 自動相互リンク+概念ページ自動更新 | 保存ごと高コスト。`memory_activate.py` の拡散検索が近似を提供済 |
| multi-factor activation スコア式 (重み付き合成) | 重み調整に必要な実測データがない。premature precision |
| GraphRAG / embeddings DB | 「敵のリングで戦う」代表例。GPT5.5 が標準実装で潰す側 |
| 「設計開始時の儀式」必須化 | 既に Skills が担う。重複追加は判断機会窒息 |

## 結論

提案の大半 (7-8項目) は既に概念実装されているか、infrastructure 罠に該当。
**今サイクルで取る行動は0件**。観察対象として A (想起失敗ログ) を脳内 watchlist に置く。

「Memory.md を発火装置にせよ」の根本主張は既に operational_index/game_dev_index で実現されており、GPT5.5 が見ていない部分。Nao_u に提示するときは「該当機構は既に走っている」を最初に示すべき。
