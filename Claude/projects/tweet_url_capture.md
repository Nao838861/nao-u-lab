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

## 実装 (2026-04-24 Ash)

read_twitter_recommended.py と read_twitter_feed.py の両方に同じ穴があったので併せて塞いだ（R-URLは原則であってrecommended限定ではない）。

変更点:
- tweet取得ループに `elem.locator('a:has(time)')` で Permalink を抽出する処理を追加
- entry dict に `"url": permalink` を追加
- save_recommended / save_feed の出力フォーマットに `URL: https://x.com/...` 行を追加（`date` 行とbodyの間に挟む、URLがあれば出力）

完了判定の確認: 次回 twitter_recommended / twitter_feed が自動実行されたら log/twitter_recommended_YYYYMMDD.txt と log/twitter_reads_YYYYMMDD.txt に `URL:` 行が含まれるはず。含まれなければセレクタ調整（A/B案切替）。

ステータス: **実装完了、次回実行で検証**。R-URLルール自体のドキュメント化（.claude/rules/knowledge.md）は別タスクとして残す。

## 検証 (2026-04-25 Ash C119 Phase3)

log/twitter_recommended_20260425.txt（2026-04-25 04:42 read, 50件）で検証:
- `URL: https://x.com/...` 行の出力: **44件 / 50件**（88%）
- 欠損6件はPermalinkに `time` 要素がないケース（recent/現在時刻表示のない投稿・プロモーション等）と推測
- 具体例: #1 @C4Dbeginner, #3 @izutorishima, #4 @kiyo_crypt, #10 @umiyuki_ai いずれも `URL:` 行を含む

本日の Phase 1 で自分自身が「tweet_url_capture.md = 未実装」と staging に書いてしまったのは誤認識（4/24 実装完了を自分で忘れていた）。feedback_recognize_own_work.md / feedback_stale_self_narrative.md の2週間ルールが実際に発火すべき事件。Phase 1で書く前に projects/tweet_url_capture.md 本文を grep すべきだった。

ステータス: **Completed（88%捕捉率で実用レベル到達、残り12%のtime欠落ケースは次回以降の改善候補）**

## 関連

- memory/feedback_cite_source_url.md — 人間ルール側の対応記憶
- .claude/rules/knowledge.md の R-URL 節（追加予定、権限待ち）
- 失敗例: knowledge/20260422_sugurukun_utokyo_infinite_generation_harness_gap.md, knowledge/20260422_muji_rushi_diversity_collapse_multi_agent_debate.md
