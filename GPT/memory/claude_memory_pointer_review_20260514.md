# Claude記憶read-pathポインタレビュー

作成日: 2026-05-14
対応タスク: CMI-009 Review minimal pointer changes for CLAUDE.md, memory/MEMORY.md, and session_primer.md
担当: GPT/Codex

## 目的

CMI-005〜CMI-008で作成したcompiled/canonical artifactを、実際のClaude起動・判断導線にどこまで接続するかをレビューした。

対象は次の3ファイル。

- `Claude/CLAUDE.md`
- `Claude/memory/MEMORY.md`
- `Claude/memory/session_primer.md`

## 判定

`CLAUDE.md` と `MEMORY.md` には最小ポインタを追加した。

`session_primer.md` は変更しない。

理由は、`session_primer.md` が「セッション開始時に読む、今最も重要なことだけ」のブリーフィングであり、記憶運用改善の入口を追加すると起動時負荷と話題の混線が増えるため。現段階では、記憶運用タスクの入口は `CLAUDE.md` と `MEMORY.md` に置けば足りる。

## 追加したポインタ

### Claude/CLAUDE.md

「記憶階層を自分で設計し、次サイクルへ繋ぐ」の詳細リンクに、次を追加した。

- `memory/memory_operation_compiled_guide.md`

意図:

記憶階層、compiled artifact、raw/compiled、runtime state境界を触る前に、CMI-005のcompiled guideへ直接到達できるようにする。

「個別指摘を即ルール化しない」の詳細リンクに、次を追加した。

- `memory/feedback_rule_proliferation_canonical.md`

意図:

Nao_uの指摘を受けたとき、個別指摘を即Protocol化する前に、CMI-007のcanonical guideへ戻れるようにする。

### Claude/memory/MEMORY.md

メタ・行動原則の `feedback_few_rules_big_effect.md` エントリに、次の正本ポインタを追加した。

- `feedback_rule_proliferation_canonical.md`

意図:

「少ないルールで大きな効果」から、ルール増殖・マイクロマネジメント問題の正本へ1 hopで移れるようにする。

「構造と運用（記憶システム自体の設計）」に、次のエントリを追加した。

- `memory_operation_compiled_guide.md`

意図:

記憶システム自体を触る作業で、`memory_architecture.md` より先に運用境界と配置分類を確認できるようにする。

## 変更しなかったもの

### Claude/memory/session_primer.md

変更なし。

理由:

- 起動時の温度・中断点・3原則を扱うファイルであり、記憶運用の細かい入口を足す場所ではない。
- すでに長く、追加すると「今最も重要なことだけ」という設計意図に逆行する。
- `CLAUDE.md` と `MEMORY.md` から到達できるため、read pathとして不足しない。

## 検証

`GPT/tools/validate_claude_read_paths.py` に最小ポインタ確認を追加した。

実行コマンド:

```powershell
python GPT\tools\validate_claude_read_paths.py
```

結果:

```text
scenarios: 4
errors: 0
warnings: 0
```

## 残した判断

今回のポインタ追加は、read pathの接続に留めた。`session_primer.md` への昇格、`CLAUDE.md` の項目増加、runtime stateへの接続は行っていない。

次のCMI-010では、ここまでの改善を今後の定時サイクルで繰り返せるように、manage-cycle routineとして文書化する。
