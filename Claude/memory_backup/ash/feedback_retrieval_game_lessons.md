---
name: ゲーム知見の呼び出し失敗——memory/game_lessons_log.md を先に当てる
description: 「AIの対症療法/抜け道を罰する/exploit patch/punishment design」話題→memory/game_lessons_log.md M-系列を最初に検索。recency biasで新しい体験（Pot等）に流されない
type: feedback
originSessionId: 6ac3a154-0483-421c-90cf-9d555851470f
---
# ゲーム知見の呼び出し失敗

**トリガーキーワード**: 「罰」「報酬設計」「抜け道」「exploit」「対症療法」「symptom treatment」「静止安全」「バランス崩壊」「AIが対処策を提案した」「punishment patch」「heat gauge」「penalty」「罰ベース」

**起動時にすぐ見るファイル**: `memory/game_lessons_log.md` (M-01〜M-17、S-01〜S-06、D-系列)

## ルール

外部記事や shared-reads で上記トリガーが立ったら、**Pot/textadv/hasu/他のゲーム体験を引く前に**、まず `memory/game_lessons_log.md` を開いて該当 M-系列を確認する。見つけた知見から書き始める。

## Why

2026-04-22 23:50 #shared-reads で Ash が書いた ABA ブログ「AIがゲーム開発で直面する限界」分析で、AIが「静止安全の抜け道をヒートゲージで罰する」という対症療法を出した件を **Pot8-15 の型無し失敗** に結びつけて論じた。

Nao_u 00:29 #human-steering 指摘:
> ここで引用すべきはpot開発ではなく、avoid_logの迷走の事例だろう。「抜け道を罰する形で塞いではダメ」という全く同じ事例があったが、君たちはそれを記憶できていない？

game_lessons_log.md には avoid_log v3 の失敗から抽出した **M-12「罰ではなく報酬で設計せよ」** が明記されている。dodgerを「罰する」（弾集中/誘導/激化）より concept プレイを「楽しくする」方が正しい——ABA記事のAI提案（静止罰）と **同一パターン**。しかも解決例 S-06（地雷メカ＝掃除サボると散らかる型）まで記録済。

この1:1マッチを引けず Pot に流したのは、**availability bias**（最近の体験が先に出る）と **index欠落**（MEMORY.mdに game_lessons_log.md への retrieval trigger が無かった）。記憶があっても呼び出せなければ無いのと同じ。

## How to apply

1. shared-reads/ブログ/knowledge で「AIがゲームの抜け穴/exploit/バランス崩壊に対処策を提示」系の話題が出たら、**書き始める前に** `memory/game_lessons_log.md` の M-11〜M-16 と S-系列を通読する
2. 該当 M-番号 を本文に明示して引用する（例: 「M-12 avoid_log v3 dodger罰patch の全滅事例と一致」）
3. 新作ゲーム設計時の「罰 vs 報酬」判断では game_lessons_log.md の Design Principles チェックリスト（罰ではなく報酬で作れないか M-12）を確認
4. Pot/textadv/hasu を引く時も、先に game_lessons_log.md との照合を済ませてからにする

## 構造的kaizen候補

MEMORY.md index に「avoid_log/Pot/textadv/hasu の知見は memory/game_lessons_log.md の M/S/D 系列にある」を載せ、キーワード一覧を併記する。shared_reads投稿前フックで該当キーワード検出したら warning を出す案も検討。
