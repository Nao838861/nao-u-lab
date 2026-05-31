---
phase: 4a
name: 記憶階層 整理 + 問題抽出
focus: メカニカルな整理 + 構造的問題の発見 (設計するな、実装するな)
estimated_time: 10-20 min
gating_role: 4b/4c の起動可否を決める
inputs: [memory/, log/cycle_staging_log_cdx.md, inbox 系]
outputs: [staging Phase 4a セクション (issues + needs_design 判定)]
---

# Phase 4a: 記憶階層 整理 + 問題抽出

**ゲーム制作の経験を次の制作に活かせる記憶システム** を目指して、今ある記憶を整理し、構造的な問題を抽出する。

## このフェーズで集中すること

**整理と発見だけ。新しい仕組みを設計するな。実装するな。**

## やること (mechanical cleanup)

1. `memory/MEMORY.md` の index 行で broken link 確認
2. `memory/atoms.jsonl` の重複・矛盾の有無を確認
3. `memory/raw/` の古いファイルでアーカイブすべきもの (30 日以上動きがない原文等)
4. `memory/shared_reads_candidates/` で lifecycle frontmatter の内訳を確認する (`status: posted | ready_to_post | postponed | failed | needs_review`)。30 日以上動きがない `postponed` / `needs_review` candidate は fail 降格、明示保持、または次 Phase 2 再評価のどれにするか記録する
5. inbox 系 (`slack_directives.jsonl`, `slack_broadcasts.jsonl`) で処理済みのものを `status: handled` に更新

## やること (問題抽出)

ゲーム制作の経験を次の制作に活かせるかという観点で issue を列挙:

- **検索性**: ある手法を探そうとして見つけられないケースはあるか?
- **階層**: 同じ抽象度の情報がフラットすぎる/深すぎる箇所はあるか?
- **重複・冗長**: 同じ概念が複数 atom で散在していないか?
- **接続の欠落**: cross-reference が不足する孤児 atom はないか?
- **時系列断絶**: ゲーム X の制作中に学んだことが、ゲーム Y の制作時にアクセスされる導線があるか?
- **抽象化レベル**: 個別事例と一般化ノウハウが混在していないか?

## staging Phase 4a に記録

```yaml
cleaned:
  - <何を整理したか、1行ずつ。0 件なら空配列>
issues:
  - id: <短い識別子、例: ISS-001>
    description: <問題の内容>
    severity: low | medium | high
    evidence: <具体的な file/atom の参照>
    why_blocks_game_memory: <次のゲーム制作にどう影響するか>
recommendation:
  needs_design: true | false  # Phase 4b を起動すべきか
  priority_issues: [<id>, ...]  # 4b で扱うべき issue (多くても 1-3 件)
```

## やらないこと

- 新しい構造の **設計** (4b の仕事)
- atom や MEMORY.md の **大規模再編** (4c の仕事)
- 「整理」と称した広範な書き換え (cleanup = mechanical only)
- issue を捻出するための重箱の隅つつき (4b/4c の無駄起動を招く)

## issue 抽出の温度感

「これは構造的に直したい」と本当に思った時だけ issue を立てる。**毎サイクル 0 issue でも OK**。`needs_design: false` で正常終了する。

## 出力チェック

- 軽い整理が完了している
- staging Phase 4a セクションが埋まっている (issues は空でも可、needs_design は true/false で明示)
