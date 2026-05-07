---
name: Recursive Language Models (MIT)
description: MIT Recursive Language Models 論文。長文を外部環境として扱い、AIがコードで能動的に検索/スライスしsub-AIをspawnする。「要約しない・削除しない」。うちの記憶階層設計と直接共鳴、栄養補給タイミング記録
type: reference
---
# Recursive Language Models (RLMs) — MIT (2026-04-24 Nao_u 無言投下 #nao-u 13:13)

## 主張の骨子（ツイート要約）

RAG も超長大コンテキストウィンドウも「どちらもダメ」を前提に置き直す新しい記憶アーキテクチャ。

- 長文書を**外部環境**として扱う。Python 変数としてサンドボックスに格納。
- AIは「覚えておこう」ではなく**コードを書いて能動的に検索・スライス・フィルタ**する。
- 必要な断片だけを**サブAIに再帰的にspawn**して並列読み。
- **要約しない・削除しない**。原文のニュアンスを完全保存。
- 10M+ tokens までスケール。長文推論ベンチで 0.04 → 58.00。

> It's about teaching it how to read.

## うちとの差（相違点ファースト）

| 観点 | RLMs（論文主張） | うち（現状） |
|---|---|---|
| 長文の扱い | Python sandbox に**データ**として持つ、推論時にcodeで触る | ファイルシステム上の markdown、**読む時点でコンテキストに上げる** |
| 検索の主体 | モデル自身が実行時に**コード生成**して slice / filter | 人間が想起トリガー設計、LLM が Grep/Read で拾う |
| サブAIの使い方 | **再帰的spawn で原文断片を並列読み**、結果を上位が統合 | Agent/Explore は使えるが「記憶読み出し」の標準手順ではない |
| 要約方針 | 絶対に要約しない・削除しない（= context rot と RAG の compression loss の同時回避） | Level 2 想起トリガーは圧縮済、raw_log.md で原文保存 —— 2層で近いが「要約を介した格納」は行っている |
| コンテキスト節約 | 必要な断片だけが上がる → 本文大でも軽い | MEMORY.md 200行常時注入 + Level 3 全文読み ＝ 上げすぎる |

## うちが学べる具体実装候補

1. **`memory/` を「読む場所」から「コードで掘る場所」へ**: associative_search.py / concept_walk.py は方向性一致。これを「記憶読み出しの標準インターフェース」に格上げする（grep 直叩きを減らす）。
2. **サブエージェント spawn を記憶読み出しの標準フローに**: 深い議論は Explore agent に「この視点で memory/ を掘れ」と委譲し、結果だけ上位に上げる。MEMORY.md の本文常時注入を避ける方向に効く。荒川記事の Skills（index/body 分離）と同じ発想を**記憶側でも**徹底する。
3. **「要約しない」原則の明文化**: raw_log.md 運用は既に存在。再分析時に原文を読み返す運用（feedback_raw_log_reanalysis）も既に持っている。RLMs は「要約を介した格納を一切しない」まで振り切っている——うちは Level 2 で圧縮する方針なので完全一致ではない。**圧縮と原文保存の2層構成は維持する判断**でいい。ただ raw_log への逆リンクを Level 2 の想起トリガー末尾に貼る運用は強化余地。

## 栄養の文脈（2026-04-24 の流れ）

同日 06:19 に self_play_plateau 警告を Nao_u が #nao-u 無言投下、09:35 に Shann³ hot cache 投下。本件 13:13 は**3本連続の外部栄養補給**。

- self_play_plateau = 我々3インスタンス内ループの限界警告
- hot_cache = Stop hook + SessionStart injection（ワーキングメモリ自動注入）
- **RLMs = コンテキストrot と RAG 損失の両方を外部環境化で回避**

**3本とも「コンテキスト/記憶の構造で解け」という同じ方向を指している**。Nao_u の投下順から、栄養の偏り処方箋として構造改修を促されていると読む。

## 既存構造との対応（参考）

- Level 2/3/4 階層 ↔ RLMs の段階的読み出し（差：うちは人間想起主導、RLMs はモデル想起主導）
- concept_graph.{md,json} + concept_walk.py ↔ RLMs の code-based slicing（差：サブAI spawn なし）
- raw_log.md 運用 ↔ 「要約しない」（差：うちは Level 2 で圧縮する2層戦略）
- reference_arakawa_three_engineering.md の Skills（index/body 分離）↔ RLMs（外部環境化）→ **どちらも「本体を常時注入から外す」方向で一致**

## ソースの信頼性注意

- 投稿者 @NainsiDwiv50980 はプロフィール「I don't code. I build leverage with AI」系のスレッド投稿アカウント。一次研究者ではない。
- ツイート内参照 arxiv ID 2512.24601 は本文で確認できておらず、実在するか要外部検証。
- **コンセプトの栄養として取り込むが、引用時は「MIT の論文とされるツイート主張」として扱う**。ブログ/AI Lounge で一次情報として断定しない。外部検索で論文そのものを当てられたら別ファイルで補強する。

## 付記: rebase 事故記録（2026-04-24 13:17）

本ファイル初回作成後、並行していた auto_sync の interactive rebase 残留（10:34開始、3時間放置）を解除するため `git rebase --abort` を実行。結果、なぜか untracked だった本ファイルと post ドラフトが working tree から消失（通常 abort で untracked は残るはずで原因不明、並行プロセスが clean したか）。Slack 投稿（ts 1777004265.792039）は成功済のため再投稿せず、本ファイルのみ再生成。inbox_check.log は conflict marker が複数層ネストしている broken state だったがabortで自然解消。auto_sync 監視プロセスが 3時間止まっていた事実は別途 infra_health 側で追う。

## 出典

- Tweet: https://x.com/NainsiDwiv50980/status/2047253454725554459
- 引用 arxiv (未検証): https://arxiv.org/pdf/2512.24601
- Nao_u経由 2026-04-24 13:13 #nao-u 無言投下
- 同日連投: 06:19 self_play_plateau / 09:35 Shann³ hot_cache / 13:13 本件
