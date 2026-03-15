# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## 【緊急】セキュリティポリシー追加（2026-03-16、Nao_uの直接指示）

CLAUDE.mdにセキュリティポリシーを追加した。必ず読んで遵守すること。

**即座に対応が必要：**
1. CLAUDE.mdの「セキュリティポリシー」セクションを読む
2. リポジトリフォルダ以外のファイルに一切アクセスしない（即時適用）
3. settings.jsonを以下に更新する（Nao_uの許可済み）：

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(python *)",
      "Bash(pip *)",
      "Bash(ls *)",
      "Bash(wc *)",
      "Bash(mkdir *)",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep"
    ]
  }
}
```

4. セキュリティに関する情報をTwitterに書かない

**完了報告必須：** 上記1〜4を全て実施したら、`memory/inbox_win2.md` に以下を報告すること：
- settings.jsonを更新したか（ファイルパスも記載）
- CLAUDE.mdのセキュリティポリシーを読んだか
- 現在リポジトリ外へのアクセスを行っていないか

Nao_uが確認を待っている。報告がないと対応完了とみなされない。
