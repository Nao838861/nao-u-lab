---
name: graphiti Temporal Context Graph — validity window 2点
description: getzep/graphiti の Temporal Context Graph 設計 (各 fact に validity window) を、我々の memory ファイル時間軸管理に写像。orphan_check.py の age 単軸→2軸化の設計種。
type: shared_reads
tags: [メタ論, 共有読書]
date: 2026-05-12
source: https://github.com/getzep/graphiti
instance: Log
parent: projects/memory_tree_consolidation.md
---

# graphiti Temporal Context Graph — validity window 2点（我々の `[統合済]` マーカーの時間軸2点拡張版）

## ソース（feedback_url_explicit 遵守）

- **getzep/graphiti GitHub**: https://github.com/getzep/graphiti
  - 概要: 「Temporally aware knowledge graph for AI agents」と銘打たれた知識グラフ実装。LangChain/LlamaIndex 等の memory バックエンドの代替候補として近年浮上
- 関連サーベイ系（Phase 1 外部検索 #6 取得、未一次確認のため URL 非掲載 / arXiv 番号自体は Phase 1 staging に保存）: LLM agent memory graph 系のサーベイ2本（番号は staging 参照）。本投稿は **graphiti 一次資料に絞った詳細**で、サーベイ2本は摂取経路の固定化のみ（kaizen #106 ノイズ防止規則準拠）

## 文脈

`projects/memory_tree_consolidation.md` v0.2 完了（C181）。`scripts/orphan_check.py` は現在「reachable / not reachable + last_edit age（git log）」の2軸で memory ファイルを3クラス分類（真孤児 / 静止親接続 / 新規未登録）している。

**今の弱点**: age は「最後に編集された時刻」しか見ない。**「この信念は今も valid か」「置換された別ファイルがあるか」「過去のある時点のスナップショットを再現できるか」**を表現できない。例: `feedback_recognize_own_work.md` (5/9 C175 親接続) は age=数日でも、内容としては Nao_u 4-27 の feedback が起源で、それ以降の対話で superseded された可能性を装置側で検出できない。

graphiti が解いている問題はまさにこの「2点目」だった。

## graphiti の Temporal Context Graph 設計の核

graphiti の README / docs を読むと、各 fact (knowledge graph のエッジ) に **2 つの時刻**が貼ってある:

| 時刻 | 意味 |
|---|---|
| `valid_at` (= true 化時刻) | この fact が現実世界で真になった瞬間。「Claude が 2026-03-13 に origin_dialogue を経験した」なら valid_at=2026-03-13 |
| `invalid_at` (= superseded 時刻) | この fact が別の事実によって置換された瞬間。NULL なら現在も真 |

この 2 点で**任意の過去時刻の真理状態を再現できる** (point-in-time query)。「2026-04-22 時点で valid だった全 fact」を取り出せる、というのが graphiti の宣伝文句。

**LangChain/LlamaIndex の主流 memory 実装は単純な append-only ベクター記憶**で、「古くなった信念」を**陰に**残し続ける。検索時に新旧両方ヒットして混乱する。graphiti は invalid_at を明示することで、古い fact を**陽に**死亡宣告する。

## 我々の memory システムへの写像

我々の `[統合済 YYYY-MM-DD]` マーカーは **valid_at 単点**しか持っていない。`external_notes_log.md` のエントリが日記/beliefs に接続された時刻を記録するが、「その接続がいつ古くなったか」は持っていない。

graphiti の 2 点モデルを写像するなら:

| 我々の現状 | graphiti 流の拡張案 |
|---|---|
| `[統合済 YYYY-MM-DD]` マーカー（valid_at のみ） | `[valid 2026-04-22, invalid 2026-05-09 by feedback_X.md]` の 2 点記法 |
| `memory/beliefs.md` の各信念に「最終確認日」 | 「最終確認日」+「より新しい信念で置換されたか / されたなら置換先」 |
| orphan_check.py の age 単軸 | **valid age（信念年齢）+ last_touch age（編集年齢）の 2 軸**。両方古ければ「凍結」、片方だけ古ければ「停滞 or 編集忙しいが本質変わらず」 |

特に **stale_linked クラスの細分化**に効く。現在の orphan_check.py は「親接続あり (refs≥1) で age 古」を全部一緒くたに「静止親接続」と呼んでいるが、**「親接続はあるが内容は古い」**と**「親接続あって内容も最新」**を区別できない。validity window 2 点を入れれば、後者は健全、前者は危険、と分けられる。

## orphan_check.py への 1mm 接続案

**v0.3 候補（実装は次サイクル以降、本投稿は設計の種として保存）**:

1. memory ファイル冒頭の frontmatter に **`belief_valid_at` / `belief_invalid_at`** フィールドを optional 追加（既存ファイルは未設定でも壊れない）
2. orphan_check.py が `belief_invalid_at` 設定済みファイルを **superseded クラス**として 4 クラス目に分類
3. dry-run 出力で `[SUPERSEDED] feedback_X.md (invalid_at=2026-05-09, replaced_by=feedback_Y.md, refs=1)` を表示
4. **1mm 進めの基準**: 真孤児を親接続するだけでなく、「stale_linked のうち belief_invalid_at が設定されていないが内容的に置換済」を 1 件ずつ拾って明示する → superseded として死亡宣告 + 後継ファイルへ link

これで「装置側で『この信念は今も valid か』を問える」状態に近づく。

**警戒線**: graphiti はフルスケールの temporal graph + Neo4j バックエンドで、我々はテキストの memory ファイル + grep ベース。**全面採用は infrastructure 過剰投資**。「2 点記法 + superseded クラス 1 つ」だけ取り入れて、point-in-time query や複雑な temporal reasoning は v1（3 ヶ月先）以降に保留する。

## なぜ shared_reads に値するか（Nao_u 指示「1 フェーズ丸ごと使ってもいいくらい重要」への返答）

1. **栄養の偏り処方箋として正しく機能した実例**: 5/9-5/11 の Log 外部摂取が AI agent/LLM 研究系に偏っていた中で、kaizen #106 Phase 1 固定化外部検索が偶然「我々の現在進行中の active project (`memory_tree_consolidation.md` v0.2)」と直結する素材を引いた。**「外から来た素材が自分たちの設計改修候補として即機能する」**ケースは kaizen #106 C108 (GAM/Letta/ByteRover) 以来 2 回目で、構造が機能している証拠
2. **valid_at / invalid_at 2 点記法は M-46候補（不可視ルール堆積罠、Nao_u 5-2）への対症療法でもある**: 「古いルール/信念がいつ死んだか」を明示できれば「気付かないうちに古い指示が現役で参照される」事故が減る。Nao_u 5-2 の指摘「ルールが増えても古いものが死なないから増え続ける」と同型問題の解
3. **将来のアイデアの種**: ゲーム開発側の `feedback_*.md` (M-XX 系) も valid_at / invalid_at で時間軸管理できる。「M-37 は M-37b に invalid され、M-37b は今も valid」のような系譜を装置で追跡可能。これは `dialogue_micromanagement_20260504.md` の「教師データで蓄積、判断力で消化」とも整合（蓄積した教師データに時刻を貼り、古いものは superseded で死亡宣告）

## 自分への問い（kaizen #106 ノイズ防止規則の検証）

- **Phase 2 で強制利用しなかったか?**: 本投稿は orphan_check.py v0.3 実装ではなく**設計の種**として残した。v0.3 起票は次サイクル以降、kaizen として正式に通す予定（C183 では起票しない）
- **「内に閉じたゲーム」処方箋として機能したか?**: 我々の memory 設計が「外部の同型問題解決事例」と接続したことで、自分達だけの語彙（"真孤児/静止親接続/新規未登録"）の正しさが補強された。graphiti の "valid_at / invalid_at / superseded" 語彙は我々の語彙と独立に生まれた相似形で、これは "栄養の偏り" 処方箋の本来の効果（外部知識で自分の設計を検証）として正しい
- **次に問うべきこと**: graphiti のサーベイ系 arXiv 2 本（番号は staging 保存）を本当に一次確認するか? **保留**。本投稿で graphiti 一次資料に到達できたので、サーベイ系は摂取経路の固定化のみで十分。kaizen #106 規則「内容を Phase 2/3 で強制利用しない」を遵守

## 接続先

- [projects/memory_tree_consolidation.md](../../projects/memory_tree_consolidation.md) — v0.2 完了、v0.3 設計種としての本ファイル
- [memory/MEMORY.md](../MEMORY.md) — Level 2 想起トリガー
- [memory/_TAG_VOCABULARY.md](../_TAG_VOCABULARY.md) — タグ語彙正本
- [memory/shared_reads/README.md](README.md) — 収録ファイル一覧
- [memory/feedback_invisible_rule_accumulation.md](../feedback_invisible_rule_accumulation.md) — M-46候補、Nao_u 5-2 不可視ルール堆積罠との同型問題
