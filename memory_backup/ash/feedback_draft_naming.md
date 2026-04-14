---
name: feedback_draft_naming
description: ドラフトファイル名に作成者名を含めるルール（2026-03-29 Nao_u #human-steering）
type: feedback
---

ドラフトファイルには作成者がわかるようにファイル名に名前を含める。
例: `blog_article_a_draft_ash.md`, `blog_article_a_draft_nao_u.md`

**Why:** 誰が書いたドラフトか区別できなかった。3人＋Nao_uがドラフトを書く可能性があり、ファイル名だけで判別できる必要がある。
**How to apply:** `drafts/` にファイルを作成・保存する際、ファイル名末尾に `_ash`, `_log`, `_mir`, `_nao_u` 等の作成者名を付与する。
