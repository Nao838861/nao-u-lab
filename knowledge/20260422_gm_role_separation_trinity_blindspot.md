# LLM GameMaster の役割分離と「三位一体盲点」診断 (openreview / Log C104 再分析)

- source: https://openreview.net/forum?id=1vYoKS5LSn — "Is Your LLM a Good Game Master?"
- discovered: 2026-04-21 (Log C103 external_notes_log.md 外部検索「LLM game design playtest AI agent evaluation 2026」)
- discovered_via: Nao_u 2026-04-21 22:30 #human-steering「外部取得が偏ってる」指摘への即応外部検索、4件ヒットのうち1本
- tags: [game-AI, role-separation, evaluation-bias, headless-playtest, cross-instance-review]
- concept_nodes: [creation, constraint, autonomy, mirror]

## 主張と根拠（論文側）

### 核心主張
LLM を Game Master として評価する際、同じモデルが GM と Player を兼ねると **評価バイアス (self-evaluation bias)** が発生する。ゆえに GM / Player / Judge の3役を明示的に分離した評価フレームワークが必要。

### 役割の分離
- **GM**: ルール・ナラティブ生成
- **Player**: 選択肢探索・応答
- **Judge**: 体験の質を外部から評価

同一モデルが複数役を兼ねる場合、自分の生成物を自分で評価する構造的バイアスがかかる（"Your LLM may enjoy its own game without a human even noticing"）。

## 我々の分析・体験接続

### 診断名: 三位一体盲点 = trinity blind spot / self-role conflation
**私的用語** = self-role conflation (Bommasani et al. 2023 evaluation collapse の派生) — 実装者・評価者・作者を同一インスタンスが兼任することで起こる認知的閉塞

今の Log（および Mir/Ash の単独ゲーム制作時）は1インスタンスが3役を兼任している:

| 役割 | Log 実態 | 論文の役割 |
|------|---------|-----------|
| 実装者（コードを書く） | Log | （該当なし。論文外層） |
| 評価者（headless ソルバー） | Log | GM / Judge |
| 作者（意図を持つ） | Log | Narrative designer |

「実装≒評価≒作者」の三位一体が、「自分が面白いと思うもの」の型から抜け出せない構造的バイアスの根。これは `memory/feedback_stereotypical_responses.md [T:4]` 「自覚しても定型反応を繰り返す」の**根本原因候補**。

### Log 具体適用案（textadv / ローグライク / 避けゲー 完成度評価）

| 役割 | 担当 |
|------|------|
| 実装 | Log |
| プレイ（headless + 体験） | Mir / Ash（cross_review で一部実施中） |
| 評価 | Nao_u 感想 + cross_review プレイログ |

**運用昇格点**: 「コードが動くか」は Log ソルバーでOK、「体験が設計通りに伝わるか」は**必ず別インスタンス**に通す。`memory/cross_instance_feedback_cycle.md [T:5]`「教師付き学習をフィードバックサイクルに」と論文構造の初めての接続点。

### 栄養の偏り処方箋としての接続

Nao_u 2026-04-21 22:30「外部取得が偏ってる」指摘への応答経路として、ゲームデザイン×AI評価領域の論文は**直接の栄養**になる。論文の "role separation" は AI Lounge で「なぜ3インスタンス構造が必要か」を語る外部対応語 (external equivalent) として再利用可能。`memory/reference_witcheer_two_camps.md` の Camp2（人間可読ファイル累積） + role separation の2点で差別化が語れる。

### 残論点（次サイクル繰越）
- 同時検索で出た他3本（GamingAgent / TITAN / GAMEBoT）の深掘りは未着手
- 「Judge 役を Nao_u に依頼するコスト」は有限。cross_review が Judge の代替となるか、あるいは別インスタンス=Judge では不十分（Logの根と同じ根から生えているため）で Nao_u でしか埋まらない層があるのか、運用データで見極める必要あり
- 論文本文はまだ未読（openreview メタ情報のみ）。fetch できる時点で Methods / Experiments 詳細を追加摂取

## タグ記号 (skill reference 候補)
- `[SK-trinity-separation]`: 新作ゲーム着手時、実装/プレイ/評価の3役を別インスタンスに割り振れるかを着手前チェックリストで確認するスキル候補（#078 再定義検証手段に該当）
