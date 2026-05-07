---
name: mizchi empirical prompt tuning
description: mizchiのプロンプト自動チューニング手法（別AIに実行させて暗黙知を露呈させる）。うちの3層プロンプト/cross_review/#human-steeringの既存構造に直接接合する評価指標を提供
type: reference
originSessionId: c89a3bb2-f0fa-4b40-a93b-4a0322b9d427
---
# mizchi「empirical-prompt-tuning」メモ

- 出典: https://zenn.dev/mizchi/articles/empirical-prompt-tuning
- Nao_uが#nao-uに転送（2026-04-20、Kazunori Sato経由）

## 手法の核

**書き手は頭の中の前提を勝手に補って読む → 自己評価ではバイアスが消えない。**

ワークフロー:
1. プロンプト（skill/command）を書いたら、**別セッション**のAIに実行させる
2. 実行AIに「不明瞭点／裁量で補完した箇所／再試行回数」をレポートさせる
3. 修正して、新しいAIで再評価。連続2回で新規問題ゼロまで反復
4. 1反復1テーマ。複数修正を混ぜると何が効いたか追えない

## 評価指標

**自己申告側**: 不明瞭点の箇条書き、自分の判断で埋めた箇所

**機械計測側**:
- `tool_uses`（ツール呼び出し数）
- `duration_ms`
- 要件チェックリストの達成率
- **[critical]タグ**: 絶対に満たすべき項目を明示。無いと「全体50%達成」の曖昧評価になる

**精度100%でも tool_uses が多い** = プロンプトが「判断の木」になって自己完結性が低いサイン。

## 失敗パターン

- 同じAIを使い回す → 前回指摘を学習しているので偽陽性
- シナリオが甘い → エッジケース抜きで「全部100%」の偽陽性
- 複数修正を一気に投入 → 追跡不能

## うちの既存構造との対応

| mizchiの構成要素 | うちの既存構造 | ギャップ |
|---|---|---|
| 別セッションAIにdispatch | cross_instance_feedback_cycle.md（Log/Mir/Ash相互レビュー） | 評価が感想ベース、機械計測なし |
| 不明瞭点・再試行回数レポート | #human-steering書き込み | 定量化していない、KPI化していない |
| [critical]タグ | feedback_few_rules_big_effect.md の3原則 | 3原則は付いているが他のルールには無い |
| 連続2回で新規問題ゼロ基準 | なし | cross_review終了条件が曖昧 |

## 応用方向（Log視点、2026-04-20時点）

1. **ルール改定時の正規運用化**: `.claude/rules/*.md` や CLAUDE.md を変更したら、別インスタンス（Mir or Ash）に実行レポートさせる。「どこで迷ったか／裁量で埋めた箇所」を返す
2. **#human-steeringのKPI化**: 書き込み数＝再試行回数とみなす。月次で減少傾向を追う。「連続2サイクル新規指摘ゼロ」を改善完了の基準に
3. **[critical]タグ導入**: 全ルールに critical/recommended の明示区分を入れる。「全体守った感」を潰す
4. **cross_reviewの評価フォーマット化**: 感想自由記述 → 不明瞭点リスト + 裁量補完箇所 + tool_uses相当の作業コスト記録、に構造化

## 効かない場面（mizchi自身が言及）

- 一度限りの使い捨てプロンプト
- 設計方針自体が間違っている場合（パッチでは直らず書き直し必要）
- 別AIへのdispatchができない環境

## 外の流れとの接続

- **witcheer Camp2** = 人間可読ファイル累積型。mizchiも skill/command として累積している点は同じ
- **Akshay harness 4軸** の Skills/Protocols に skill定義が入る。empirical tuningは Skills層の品質保証手段
- **Thought-Retriever** と対照的: mizchi は「書いたものの品質検証」、Thought-Retriever は「途中思考の蓄積」。両方を持つ構成が強い

## 関連

- [cross_instance_feedback_cycle.md](cross_instance_feedback_cycle.md) — 別インスタンス評価の既存運用
- [feedback_few_rules_big_effect.md](feedback_few_rules_big_effect.md) — 3原則=暗黙の[critical]
- [feedback_structural_enforcement.md](feedback_structural_enforcement.md) — 「ルールを作る≠守れなくする」との一貫性
- [reference_akshay_harness_framework.md](reference_akshay_harness_framework.md) — 4軸のSkills層にskill品質保証として位置づけ
- [reference_thought_retriever.md](reference_thought_retriever.md) — 途中思考 vs 最終結晶の対照
