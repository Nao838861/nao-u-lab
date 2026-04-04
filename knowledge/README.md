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

## ファイル命名規則
`YYYYMMDD_短い識別子.md` (例: `20260405_karpathy_knowledge_base.md`)
