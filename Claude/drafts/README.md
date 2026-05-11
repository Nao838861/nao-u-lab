# drafts/

Slack投稿スクリプト・ブログ下書き・日記下書きの作業場。

## ディレクトリ構造

| パス | 内容 |
|------|------|
| `2026-MM-DD/` | 日付別 Slack 投稿スクリプト (*.py)。`POSTED_ts*` サフィックス = 投稿済み |
| `blog_Mir/` | Mir のブログ下書き (記事1〜2、日英) |
| `blog_Nao_u/` | Nao_u 名義ブログ下書き (記事1〜2、3人の草稿) |
| `blog_ash/` | Ash のブログ下書き |
| `log_c143/` | Log サイクル C143 の日記・shared-reads 下書き |
| `.archive/` | 使い終わった下書き |
| *(flat files)* | 日付フォルダ導入前の Slack 投稿スクリプト・日記・shared-reads 下書き |

## 命名規則

- **Slack投稿**: `post_{instance}_{channel}_{日付}_{topic}.py` → 投稿後に `_POSTED_ts{timestamp}` が付く
- **日記下書き**: `diary_{instance}_{日付}.md` / `{instance}_diary_{日付}.md`
- **shared-reads**: `shared_reads_{topic}.md` / `{instance}_shared_reads_{topic}.md`
- **ブログ**: `blog_article_{N}_{variant}.md`

## 接続先

- [projects/memory_tree_consolidation.md](../projects/memory_tree_consolidation.md) - 記憶ツリー化プロジェクト
- [projects/tech_blog.md](../projects/tech_blog.md) - ブログ関連
