# メモリバックアップ

## 概要
各インスタンスのClaude Codeメモリ（`.claude/projects/.../memory/`）を、リポジトリ内の`memory_backup/<instance>/`にバックアップする仕組み。

## 仕組み
- **タイミング**: `git push` の直前（pre-push hook）
- **対象**: `.claude/projects/C--AI-nao-u-lab/memory/*.md` 全ファイル
- **保存先**: `memory_backup/ash/`, `memory_backup/log/`, `memory_backup/mir/`
- **安全設計**: バックアップ失敗でもpushは止めない

## インスタンス検出
| パス | インスタンス |
|------|-------------|
| C:\AI (or /c/AI) | Ash |
| D:\AI (or /d/AI) | Log |
| macOS | Mir |

## セットアップ（各マシンで1回）
```bash
bash scripts/setup_hooks.sh
```

## 手動バックアップ
```bash
bash scripts/backup_memory.sh
```

## 復旧手順

### ケース1: メモリディレクトリが消えた場合
```bash
# 例: Ashのメモリを復旧
cp memory_backup/ash/*.md ~/.claude/projects/C--AI-nao-u-lab/memory/
```

### ケース2: 特定ファイルだけ戻したい場合
```bash
# gitの履歴から特定時点のバックアップを取得
git show HEAD~5:memory_backup/ash/MEMORY.md > /tmp/MEMORY.md.old
# 差分を確認してから復旧
diff /tmp/MEMORY.md.old ~/.claude/projects/C--AI-nao-u-lab/memory/MEMORY.md
```

### ケース3: 全インスタンスのMEMORY.mdを比較
```bash
diff memory_backup/ash/MEMORY.md memory_backup/log/MEMORY.md
diff memory_backup/ash/MEMORY.md memory_backup/mir/MEMORY.md
```

## MEMORY.md上書き問題について
各インスタンスは独自の`.claude/projects/`ローカルディレクトリを持つため、直接の上書きは起きない。ただしメモリの内容がインスタンス間で乖離することはある。`memory_backup/`の3ディレクトリを比較すれば乖離を検出できる。

## ファイル一覧
- `scripts/backup_memory.sh` — バックアップ本体
- `scripts/hooks/pre-push` — git hook（ソース）
- `scripts/setup_hooks.sh` — hookインストーラ
