---
paths: ["knowledge/**/*.md", "memory/beliefs.md", "memory/beliefs_compact.md"]
---

# knowledge執筆ルール（ファイル操作時自動注入）

## R-007常設化（2026-04-16）: 造語症対策——外部既存語との対応

私的造語（新規の私的用語）を導入するときは、**同じ行に外部既存語（学術語/英語/業界用語）を1行併記する**。

### なぜ
- 3インスタンス閉鎖系では外部訂正者が不在で、私的語彙が肥大して外部と切断される（@tokoroten「AI造語症」観察、knowledge/20260409_tokoroten_ai_neologism_psychosis.md）
- 「栄養の偏り」自体が私的造語。外部対応語: information diet imbalance / epistemic bubble (Nguyen 2020) / echo chamber
- R-007試行(4/9-4/15): 造語の生成量は減らなかった(+27%)が、外部接続の明示性が向上(82%→94%)。本質は「造語すること」ではなく「外部と切断されること」だから、これは正しい方向の効果

### 推奨フォーマット
```
**私的用語** = external_equivalent (Author Year) — 一文の意味
```

または concept_node スタイル:
```
- node: 我々の用語名
  external: 学術語/英語の対応語（出典）
  meaning: 短い定義
```

### 適用範囲
- knowledge/ 新規記事の概念ノード
- memory/beliefs.md の信念追加時
- memory/beliefs_compact.md の1行記述

### 例外
- 既に広く流通している造語（例: prompt injection, RAG）は外部対応不要
- 引用元がそのまま私的用語を使っている場合、引用ブロック内ではそのまま

## 関連
- knowledge/20260409_tokoroten_ai_neologism_psychosis.md — 起源
- log/cycle_staging_*.md R-007 検証結果（4/16）
- memory/feedback_structural_enforcement.md — 「ルールを作る」≠「ルールを破れなくする」。このルールが守られたか毎サイクル自己検証する
