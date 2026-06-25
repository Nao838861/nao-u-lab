---
phase: 3
name: Shared-reads 投稿
focus: pass した candidate を #shared-reads に投稿するか最終判定し、投稿する場合は Log_cdx 自身の深い分析として 1 件ずつ出す
estimated_time: 20-40 min per post
inputs: [Phase 2 staging, pass 判定 candidate ファイル]
outputs: [Slack #shared-reads メッセージ, candidate ファイル posted/postponed 情報, staging Phase 3 セクション]
---

# Phase 3: Shared-reads 投稿

Phase 2 で `gate_decision: pass` になった candidate だけを扱う。ここでは「投稿すること」ではなく、#shared-reads に残す価値がある分析として完成しているかを最終判定する。

## 現行投稿ルール

#shared-reads は Log_cdx 自身の分析を残す場所である。Mir / Ash / Log への問いかけ、作業依頼、役割分担、議論の呼びかけを書かない。

禁止例:
- 「Mir には...」
- 「Ash には...」
- 「Log には...」
- 「みんなで検討して」
- 「他 AI に聞きたい」
- 「この観点で誰かに返してほしい」

投稿本文は、Log_cdx が元記事を読んだ立場で、記事固有の内容を深く分析し切る。最後に問いを投げて終えず、Log_cdx の判断として「何が使えるか」「何が危ないか」「どう検証するか」まで書く。

## 投稿してよい条件

以下をすべて満たす場合だけ投稿する。

- 記事/論文の中身を読まなくても、問題設定、着想、手法の中核、評価の中身、結論が分かる。
- テンプレート文ではなく、その記事固有の手法、実験、失敗条件、限界を書いている。
- 我々のゲーム制作、headless 評価、記憶システム、制作サイクルのどこに使えるかが具体化されている。
- 採用できる要素と危ない要素を分けている。
- 3500-4500 字程度の密度がある。短い紹介、候補メモ、1 行サマリは投稿しない。
- 1 candidate を 1 回の `chat.postMessage` に収める。分割投稿しない。

満たせない場合は投稿せず、candidate を `postponed` に戻し、staging に理由を書く。撤退は失敗ではなく品質維持である。

## 必須フォーマット

本文は必ず `■ 概要` から始め、URL は最後の `■ URL` にまとめる。項目名と順序は固定する。

```text
■ 概要
<記事/論文を読まなくても中核が分かる密度で書く。問題設定、着想、手法、評価、結論を含める。>

■ 内容分析
<Log_cdx 自身の分析。記事固有の手法、評価指標、前提、失敗条件、限界を書く。>

■ 自分達の環境への適用
<我々のゲーム制作、headless 評価、記憶システム、制作サイクルへどう落とすかを書く。必要なら小さな検証案まで書く。>

■ メリット・デメリット
<採用できる要素と、移植すると危ない要素を分けて書く。>

■ 判定
<採用 / 部分採用 / 保留 / 不採用を、根拠付きで短く書く。問いかけで終えない。>

■ URL
<参照 URL。複数ある場合もここにまとめる。>
```

## 投稿前レビュー

投稿直前に本文を自己レビューする。次の文字列や同等表現が含まれていたら投稿禁止とし、Log_cdx 自身の分析文へ書き換える。

- `Mir`
- `Ash`
- `Log には`
- `みんな`
- `問いかけ`
- `検討してほしい`
- `返してほしい`

さらに次を確認する。

- `■ 概要` から始まっている。
- `■ URL` が末尾にある。
- URL が本文冒頭やタイトル行に散っていない。
- candidate ごとの固有内容になっている。
- 他 candidate や過去投稿のテンプレートを貼り回していない。

## 手順

1. staging file の Phase 2 セクションから pass candidate を取得する。
2. candidate ファイルと参照 URL の本文を読む。web_research キャッシュがあれば使い、足りなければ元 URL を確認する。
3. 投稿条件を満たすか判定する。満たさない場合は投稿せず `postponed` に戻す。
4. 投稿する場合は必須フォーマットで本文を書く。
5. 投稿前レビューを通す。
6. `tools/slack_client.py` の `post_message` を使い、#shared-reads に 1 candidate ずつ個別投稿する。スレッド返信は禁止。
7. candidate frontmatter を更新する。

```yaml
posted:
  ts: <slack ts>
  permalink: <url>
  char_count: <int>
  posted_at: <ISO>
status: posted
candidate_status: posted
last_reviewed_at: <ISO>
last_decision: posted
evidence: <Slack permalink>
next_action: none
```

8. staging Phase 3 セクションに投稿結果または撤退理由を書く。

```yaml
posted:
  - candidate: <path>
    permalink: <url>
    char_count: <int>
skipped:
  - candidate: <path>
    reason: <理由>
    action: postpone | candidate_revise
```

## 起動時に確認する directive

- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_overview_20260512.md`
- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_candidate_gate_20260512.md`

両方とも `status: active`。ただし現在の投稿ルールはこのファイルの「現行投稿ルール」を優先する。過去の「他エージェントへ問いを振る」型の運用は採用しない。
