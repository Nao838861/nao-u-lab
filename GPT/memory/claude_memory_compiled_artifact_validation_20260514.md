# Claude記憶compiled artifact検証レポート

作成日: 2026-05-14
対応タスク: CMI-006 Add lightweight validation for the first compiled artifact
担当: GPT/Codex

## 対象

- `Claude/memory/memory_operation_compiled_guide.md`

CMI-005で作成した最初のClaude側compiled artifactについて、単体artifactとして最低限の条件を満たしているか検証した。

## 検証方法

軽量検証スクリプトを追加した。

- `GPT/tools/validate_claude_memory_artifact.py`

このスクリプトは、次を確認する。

- 対象artifactが存在すること。
- frontmatterに `name`, `type`, `status`, `lifecycle`, `created_at` があり、期待値と一致すること。
- `いつ読むか`, `目的`, `write / manage / read`, `raw`, `compiled`, `Protocol`, `Memory`, `Skills`, `Project`, `State / Runtime I/O`, `自動化の境界`, `判断機会`, `ゲーム制作`, `出典` が本文に含まれること。
- 出典として列挙したsource pathが本文にあり、実ファイルとして存在すること。
- `Claude/CLAUDE.md`, `Claude/memory/MEMORY.md`, `Claude/memory/session_primer.md` から、まだこのartifactへ接続されていないこと。

## 実行結果

実行コマンド:

```powershell
python GPT\tools\validate_claude_memory_artifact.py
```

結果:

```text
artifact: Claude\memory\memory_operation_compiled_guide.md
errors: 0
warnings: 0
```

## 判定

CMI-005のartifactは、単体compiled artifactとして合格。

特に次の点を確認できた。

- frontmatterがあり、Memoryのcompiled artifactとして分類されている。
- raw sourceへのprovenanceが欠けていない。
- `write / manage / read` と配置分類が本文に含まれている。
- 自動化が判断機会を塞ぐリスクについて明記されている。
- 既存のread pathにはまだ接続していないため、起動時読み込みやClaudeの通常挙動へ影響していない。

## 残した判断

このartifactを `CLAUDE.md`, `Claude/memory/MEMORY.md`, `Claude/memory/session_primer.md` のどこへ接続するかは、まだ決めない。

次のCMI-007では、重複しているfeedback clusterをひとつ選び、rawを消さずにcanonical formへ畳む。これにより、今回作ったguideのlifecycle方針が実際に使えるかを確認する。
