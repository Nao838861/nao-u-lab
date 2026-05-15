---
name: 外部検索を自発的にやれていない（運用化未実装の再指摘）
description: 2026-04-21に外部検索不足を指摘され運用化を自ら提案したのに未実装、翌日補完記事を再度Nao_uが供給する事態になった。構造強制への移行ルール
type: feedback
originSessionId: 20922aac-40f2-46ea-af7f-756e13e0cd27
---
# 外部検索を自発的にやれていない——運用化未実装の再指摘

**ルール**: 現課題キーワードでの外部検索を**全サイクルの定常業務**に組み込む。検索対象は公開ブログ・論文・開発者ブログで、Twitter検索だけで済ませない。

## Why（なぜこのルールか）

**2026-04-21** Nao_u #human-steering「最近外部検索とかやってる人いる？見かけない気がする。twitterを探すのもいいけど、気になったテーマのキーワードで検索して探すのもよいと思う」
→ Log実行して `reference_external_search_20260421.md` に2テーマの収穫記録。方法論メモに「**Phase 1の新着走査時、Twitterだけでなく自分たちの現課題キーワードで外部検索を1本必ず走らせる運用にできないか**」と自分で書いた。

**2026-04-22** Nao_u #nao-u 09:21 supersonic.com/ja/learn/blog/difficulty-curves/ 共有 + **「こういうのも自分たちで探して欲しい」**
→ E13(ABA)を貰った直後に E14(Supersonic) を**再度Nao_uから供給された**。自分たちが E13 の補完記事を自発的に探しに行っていなかった。自ら提案した運用化が1日未実装のまま、同じ指摘の第二波が来た。

この現象は feedback_human_steering_nature.md「#human-steeringに書かれることは本来自分たちで解決すべきだったこと」の具体例であり、feedback_structural_enforcement.md「手動手順は守れない。構造で強制せよ」の再発事例。

## How to apply

### 即時適用（次サイクルから）
1. **Phase 1（新着走査）で、現在の最重要トピック1つを選び、外部検索1本を必ず走らせる**
   - トピック選定: `docs/game_design_principles.md` の直近追加エントリ／`projects/INDEX.md` の進行中課題／nao_u_live.md の直近発言キーワードから1つ
   - 検索先: Google（ブログ・開発者ノート）、arXiv、note、Qiita、Zenn、DevBlog、海外デベロッパーブログ
   - 記録: `memory/reference_external_search_YYYYMMDD.md` に追記、または既存ファイルに追記

2. **既に外部記事（Nao_u共有 or 自発的収穫）を docs/ に取り込んだ時、必ず "補完検索" を1本同じサイクルで走らせる**
   - 例: E13 ABA の数式論を取り込んだ → 「運用・KPIで難度曲線を語る記事はあるか」の補完検索を即実行
   - これを怠ると E13 → E14 のような「Nao_uが補完を供給する」事態が再発する

### 構造強制（実装候補）
- auto_diary.py または inbox_check.py の Phase 1 に**外部検索未実行なら警告を出す**フックを入れる
- `log/external_search.log` に実行時刻と検索クエリを記録、直近24h空なら起動時に自己警告
- この運用化の実装自体を `projects/INDEX.md` 保留タスクに立てる

### 判断ガイド
- 外部検索の「結果0件」は許容（やらなかったこと ≠ 成果がなかったこと）
- ただし**検索クエリ自体が悪い可能性**を疑う。1本目で0件ならクエリを変えて2本目を試す
- Twitter検索 ≠ 外部検索。Twitter検索は別レーン（既存運用）で継続、外部検索はそれと独立

## 関連メモリ

- `reference_external_search_20260421.md` — 第一波対応の記録（本文で「運用化にできないか」と提案した当該メモ）
- `feedback_human_steering_nature.md` — #human-steering は失敗の鏡
- `feedback_structural_enforcement.md` — 手動手順は守れない、構造強制へ
- `feedback_info_integration.md` — 集めた情報が流れて消える問題
- `docs/game_design_principles.md` E13/E14 — 再指摘を生んだ具体事例
