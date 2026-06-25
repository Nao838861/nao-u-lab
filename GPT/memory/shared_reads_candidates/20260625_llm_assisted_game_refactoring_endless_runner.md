---
title: "An Exploratory Case Study of LLM-Assisted Refactoring and Gameplay Feature Generation in an Endless Runner Game"
url: "https://arxiv.org/abs/2606.21171"
collected_at: "2026-06-25T09:29:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, llm, refactoring, gameplay-feature, case-study]
---

## raw_excerpt
arXiv:2606.21171。2026-06-19 submitted。Jan Wunderlich、Markus Kleffmann、Sebastian Lempert による 7 ページの exploratory case study。対象は Python/Pygame 製の endless runner で、GPT-4o を使った 6 件の開発タスクを、software metrics、unit tests、manual gameplay assessment で見る。タスクは 3 件の localized refactoring と 3 件の gameplay feature generation に分けられている。

原文の短い要点として、refactoring 側は "completed successfully in functional terms"、gameplay feature 側は "only one" が correctly integrated feature になった、という対比が置かれている。著者らは、既存ゲームシステムへ新しい interaction を入れる作業では、局所的なコード変換より統合上の難しさが表に出たと説明している。ただし single-case design なので、モデル一般の性能証拠ではなく、具体的な game-development setting における indicative observations として読むべきだと明記されている。

## why_relevant_to_games
LLM にゲームを作らせる時、局所 refactor と「既存ルールへ新しい遊びを接続する実装」を同じ成功率で見ないための材料になる。Nao_u_BOT の playable diff 評価でも、feature integration の失敗分類に使えそう。
