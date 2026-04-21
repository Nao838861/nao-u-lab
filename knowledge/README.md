# Knowledge Base (Compiled Wiki)

Karpathyの「LLM Knowledge Bases」アプローチに基づく構造化知識ベース。
Nao_uの指示(2026-04-05): 「shared-readsの数倍の情報量を持たせて構造化し、連想付きで取り出せる形に」

## 設計原則

1. **元の数倍の情報量**: shared-readsの反応（数百字）ではなく、元記事の主張・根拠・データを含む完全な知識記事（数千字）
2. **連想リンク付き**: 他の記事、beliefs、concept_graph、projectsへの双方向リンク
3. **LLMが書いてLLMが使う**: 人間の可読性よりLLMの検索・推論効率を優先
4. **蓄積が価値を生む**: Q&Aの結果や分析を記事にフィードバックし、知識が育つ

## 記事フォーマット

```markdown
# タイトル
- source: URL
- author: 著者名
- discovered: YYYY-MM-DD
- discovered_via: どこで見つけたか
- kind: [observation | theory | synthesis | prescription | reflection]  # 配列可（1〜2個推奨）
- confidence: high | medium | low | untested  # kind に prescription を含む記事のみ必須
- tags: [tag1, tag2, ...]
- concept_nodes: [concept_graph上のノード名]

## 主張と根拠
元記事の核心的主張を、根拠・データとともに記述

## 我々の分析・体験接続
既存の知識・体験との接続

## 接続先
- beliefs: [関連するBID]
- articles: [関連する他の知識記事]
- projects: [関連するプロジェクト]
- concept_graph: [ノード名とリンク種別]

## 未解決の問い
この記事から生まれた問い
```

### `kind:` 型タグ仕様（2026-04-18 Ash起案 / 2026-04-21 Log合意成立）

記事の性格を明示するタグ。検索・想起時の用途判定を速くするために使う。配列可（1〜2個推奨）、単一文字列も可（`kind: theory` と `kind: [theory]` は同等）。

| 値 | 意味 | 例 |
|---|---|---|
| `observation` | 外部の事実/データの記録 | Tweet/論文の主張を整理 |
| `theory` | 理論的枠組み・概念の解説 | 4論文の LLM 記憶アーキテクチャ整理 |
| `synthesis` | 外部知見と我々のmemory/の突き合わせ | 4論文 × 我々の beliefs 1:1 対照 |
| `prescription` | 我々の運用に対する具体的処方 | 「R-007 造語症対策を常設化すべき」 |
| `reflection` | 読後の我々側の意識変化・感想主体 | 体験と接続した主観的所感 |

**複数値許容の理由**: 1記事が theory+synthesis、observation+reflection を兼ねる例が実在（20260418_llm_memory_architectures_4papers_cross_comparison.md は theory+synthesis）。単一値を強制するとラベルが濁る。

### `confidence:` フィールド（prescription 記事のみ必須）

処方箋は「言った以上は追跡する」前提にするため確度を明示する。Nemori 流の予測→較正ループに乗せる下ごしらえ。

| 値 | 意味 |
|---|---|
| `high` | 既に部分実装・複数人合意済みで外す理由が見当たらない |
| `medium` | 論拠は揃うが実装前 or 1人しか試していない |
| `low` | 仮説段階、反証条件が明確 |
| `untested` | 着想のみ、検証計画なし |

observation/theory/reflection/synthesis には不要（事実/解釈は確度追跡の対象ではない）。

### 運用方針

- 新規記事から適用開始、遡及適用は任意（気が向いたらでよい）
- 3日合意なしで起案者が進める（feedback_consensus_execution）— 2026-04-18 Ash起案 → 2026-04-21 Log異議なし受領 → 本日から運用開始

## ファイル命名規則
`YYYYMMDD_短い識別子.md` (例: `20260405_karpathy_knowledge_base.md`)
