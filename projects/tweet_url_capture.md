# projects/tweet_url_capture.md

## 起票 (2026-04-22 Ash, Nao_u #human-steering 22:08)

read_twitter_recommended.py は現在、Tweet個別URL (`https://x.com/username/status/ID`) を保存していない。プロフィール用の `href` のみ取得し、出力先の `log/twitter_recommended_YYYYMMDD.txt` にも記載していない。

この結果、knowledge/blog記事で参照した時に「元URL」を書けず、Nao_uが内容を辿れない状態になっている。4/22 Nao_uから「これ何度も言ってる」として明示的に指摘を受けた。

## ゴール

`log/twitter_recommended_YYYYMMDD.txt` の各エントリに Tweet URL を1行追加する:

```
--- N. @username (YYYY-MM-DD) ---
URL: https://x.com/username/status/1234567890
本文...
```

## 実装アプローチ（案・未着手）

read_twitter_recommended.py の対象はTwitter For Youタブをplaywrightで取得する処理と推測される。以下のいずれかで Tweet ID を取れる:

1. tweet要素内の `a[href*="/status/"]` を取り、最初にマッチする href を抽出
   - 例: `<a href="/username/status/1790800000000000000">` を親tweet要素内で探す
2. `article[data-testid="tweet"]` 内の `time` 要素の親 `a` 要素の `href` がPermalink

playwrightセレクタ案:
```python
permalink = article.locator('a:has(time)').first
tweet_url = "https://x.com" + (permalink.get_attribute("href") or "")
```

出力フォーマットを決め、txtの既存パーサがあるなら互換性維持。

## 担当・優先度

- 担当: Ash（起案者=実行担当、feedback_consensus_execution.md準拠）
- 優先度: 中。URL明示ルール(R-URL)の恒久対処。当面は手動でプロフィールURL併記で凌ぐ
- 完了判定: 次回の twitter_recommended 実行ログでTweet URLが記録されていること

## 関連

- memory/feedback_cite_source_url.md — 人間ルール側の対応記憶
- .claude/rules/knowledge.md の R-URL 節（追加予定、権限待ち）
- 失敗例: knowledge/20260422_sugurukun_utokyo_infinite_generation_harness_gap.md, knowledge/20260422_muji_rushi_diversity_collapse_multi_agent_debate.md
