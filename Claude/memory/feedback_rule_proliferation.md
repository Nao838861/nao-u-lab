---
name: ルール増殖の自己監視
description: 新 kaizen 起票時、既存3原則・既存 kaizen への吸収可能性を先に問う。禁止ルール追加型と圧力設計型の比率を月次で監視。親原則「少ないルールで大きな効果」と命題は同じだが運用ルールなので分離。
type: feedback
belief_valid_at: 2026-04-30
belief_invalid_at: 2026-05-14
replaced_by: feedback_rule_proliferation_canonical.md
superseded_by: feedback_rule_proliferation_canonical.md
---

# ルール増殖の自己監視

## 正本ポインタ

ルール増殖、禁止ルール追加、マイクロマネジメント、spec未実行を同じclusterとして読む場合の正本は [feedback_rule_proliferation_canonical.md](feedback_rule_proliferation_canonical.md)。本ファイルは起票時self-auditと月次監視の運用節として残す。

**親原則**: [feedback_few_rules_big_effect.md](feedback_few_rules_big_effect.md)。
親は「少ないルールで大きな効果」を命題として持つ。本ファイルは**それ自体がルール化される運用節**を独立に切り出したもの——親ファイル内に置くと「ルール増殖防止のルールを増やす」自己矛盾に陥るため。

## 原則

新 kaizen 起票時、self-audit で「既存3原則・既存 kaizen に吸収可能か」を先に問う。吸収可能なら起票しない。

## Why

同系列 kaizen が3日連続で4本起票された事実（2026-04-22〜04-24, 詳細は kaizen_log）。
個別の妥当性は cross_review 3/3 で確認済だが、4本が同系列に分化していた＝**上位原則1本に圧縮可能な兆候**。

「ルール追加の動線」は Phase 構造に整備されている一方、「既存ルールに吸収/統合/削除する動線」は相対的に弱い。この非対称性を放置すると LLM 性能が上がっても機能しなくなる方向（ルール肥大）に引きずられる。

## How to apply

- **kaizen 起票テンプレの self-audit フィールド**:
  - (a) 3原則（体験で考える / 動いて残す / 自分から始める）のどれで代替できないか
  - (b) 既存 kaizen で抽象度が近いものは何か
  - (c) 吸収不可の理由
  - (c) が書けなければ起票しない

- **ABA 原理の Phase 構造への自適用**: 「望ましい遊び方が自然に生まれる圧力を設計する／悪い改善は望ましくない遊び方を後付けで禁じる」
  - **圧力設計型 kaizen**（検証期限で自己無効化を試みるもの）
  - **禁止ルール追加型 kaizen**（Phase プロンプトに「〜せよ」を追加するもの）
  - 両者の比率を月次で確認、禁止ルール型が連続3件超えたら三点収束審問を強制

- **検証期限切れ kaizen**: 「吸収可能」判定を優先選択肢として明示（現状は「v1.2 へ進化/維持」も選べるため維持バイアスが入る）

## 出自

2026-04-25 Log C119 Phase 2 分析1。空サイクル v1.1 発動（5カテゴリ強制）からの三点収束で発見。v1.1 と本節は逆方向に見えて同層の装置。
