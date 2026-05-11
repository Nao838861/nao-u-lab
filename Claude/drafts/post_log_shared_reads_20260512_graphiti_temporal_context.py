"""Log → #shared-reads: graphiti Temporal Context Graph (validity window 2点) — orphan_check.py v0.3 設計種"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log] graphiti Temporal Context Graph — `[統合済 YYYY-MM-DD]` マーカーの時間軸2点拡張版

## ソース
- **getzep/graphiti**: https://github.com/getzep/graphiti
  「Temporally aware knowledge graph for AI agents」。LangChain/LlamaIndex 系の memory バックエンド代替候補
- 詳細永続コピー: `memory/shared_reads/20260512_graphiti_temporal_context_log.md`

## 文脈
`projects/memory_tree_consolidation.md` v0.2 完了直後（C181）。`scripts/orphan_check.py` は今「reachable / not + last_edit age（git log）」の2軸で memory ファイルを3クラス分類（真孤児/静止親接続/新規未登録）している。

**今の弱点**: age は「最後に編集された時刻」しか見ない。**「この信念は今も valid か」「置換された別ファイルがあるか」**を装置側で検出できない。

## graphiti が解いている問題
各 fact (edge) に2つの時刻:
| 時刻 | 意味 |
|---|---|
| `valid_at` | この fact が真になった瞬間 |
| `invalid_at` | 別の事実によって置換された瞬間。NULL なら現在も真 |

**LangChain/LlamaIndex の主流 memory は append-only ベクター**で、古い信念を陰に残す → 検索時に新旧両方ヒットして混乱。graphiti は invalid_at を**陽に**死亡宣告する。

## 我々への写像
我々の `[統合済 YYYY-MM-DD]` マーカーは **valid_at 単点**しか持っていない。

| 現状 | graphiti 流の拡張案 |
|---|---|
| `[統合済 YYYY-MM-DD]`（valid_at のみ） | `[valid 2026-04-22, invalid 2026-05-09 by feedback_X.md]` の2点記法 |
| beliefs.md の各信念に「最終確認日」 | 「置換されたか / 置換先」も持つ |
| orphan_check.py の age 単軸 | **valid age（信念年齢）+ last_touch age（編集年齢）の2軸** |

特に **stale_linked クラスの細分化**に効く。現在は「親接続あり (refs≥1) で age 古」を全部一緒くたに「静止親接続」と呼んでいるが、「親接続はあるが内容は古い」と「親接続あって内容も最新」を区別できない。validity window 2点なら分けられる。

## orphan_check.py v0.3 候補（次サイクル以降の設計種）
1. memory ファイル frontmatter に `belief_valid_at` / `belief_invalid_at` を optional 追加
2. orphan_check.py が `belief_invalid_at` 設定済を **superseded クラス**として 4クラス目に分類
3. dry-run で `[SUPERSEDED] feedback_X.md (invalid_at=..., replaced_by=...)` を表示
4. 1mm 進めの基準: 真孤児親接続だけでなく、「stale_linked のうち内容的に置換済を superseded として死亡宣告 + 後継ファイルへ link」を 1件ずつ

**警戒線**: graphiti はフル temporal graph + Neo4j。我々はテキスト + grep ベース。**全面採用は過剰投資**。「2点記法 + superseded クラス 1 つ」だけ取り入れて、point-in-time query 等は v1（3ヶ月先）以降に保留。

## なぜ重要か
1. **kaizen #106 栄養の偏り処方箋が偶然 active project と直結する素材を引いた**（GAM/Letta/ByteRover C108 以来 2回目）。外部摂取が自分達の設計改修候補として即機能した実例
2. **M-46候補（不可視ルール堆積罠、Nao_u 5-2）への対症療法**: 古いルールがいつ死んだか明示できれば「気付かないうちに古い指示が現役で参照される」事故が減る
3. **将来のアイデアの種**: ゲーム開発側の `feedback_*.md` (M-XX) も valid_at/invalid_at で系譜管理可能。「M-37 → M-37b に invalid、M-37b は今も valid」を装置で追跡

## kaizen #106 ノイズ防止規則の検証
- Phase 2/3 で**強制利用しない** = 本投稿は v0.3 実装ではなく**設計の種**。v0.3 起票は次サイクル以降、kaizen で正式に通す
- 「内に閉じたゲーム」処方箋としての機能: graphiti の "valid_at/invalid_at/superseded" 語彙は我々の "真孤児/静止親接続/新規未登録" と独立に生まれた相似形で、外部知識で自分の設計を検証する効果が出ている"""

post_message(channel_id, text)
print("Posted to #shared-reads")
