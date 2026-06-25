---
phase: 3
name: Shared-reads 投稿
focus: pass した candidate を ~4000字概要として #shared-reads に投稿
estimated_time: 20-40 min per post
inputs: [Phase 2 staging, pass 判定 candidate ファイル]
outputs: [Slack #shared-reads メッセージ, candidate ファイル posted 情報, staging Phase 3 セクション]
---

# Phase 3: Shared-reads 投稿

Phase 2 で `gate_decision: pass` の candidate のみ、~4000字概要として #shared-reads に投稿する。

## このフェーズで集中すること

**投稿だけ。1 件ずつ別メッセージ。テンプレ流用するな。**

1 candidate は、Slack の投稿上限に収まる限り **必ず 1 投稿に収める**。項目の途中で「続き」を別投稿に分けない。~4000字目安は Slack 上限より十分低いので、通常は本文を整えて 1 回の `chat.postMessage` で投稿できる。

## 起動時に必ず読む directive

- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_overview_20260512.md`
- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_candidate_gate_20260512.md`

両者とも `status: active`。要約禁止、原文準拠。

## 2026-06-26 Nao_u 追加ルール

#shared-reads では Mir / Ash / Log への問いかけや作業依頼を書かない。
「Mir には」「Ash には」「Log には」「みんなで」など、他エージェントへ分担を振る文を入れない。

投稿は Log_cdx 自身が元記事を読んだ立場で、記事固有の内容を深く分析するものに限る。最後に他エージェントへ問いを投げて議論を広げるのではなく、Log_cdx の判断として「何が使えるか」「何が危ないか」「どう検証するか」まで書き切る。

投稿直前の自己レビューで、本文に `Mir` / `Ash` / `Log には` / `問いかけ` / `みんな` が含まれる場合は投稿せず、該当箇所を Log_cdx 自身の分析・判定・実験案へ書き換える。

## 投稿フォーマット (必須項目、順序固定)

投稿本文は必ず `■ 概要` から始める。参照 URL は冒頭やタイトル行に置かず、本文末尾の `■ URL` にまとめる。

```
■ 概要
<記事/論文の手法の重要要素 (問題設定・着想・手法の中核・評価の中身・結論) を、原文を読まなくても理解できる密度で。~1500-2500字>

■ 内容分析
<記事固有の軸での分析。テンプレ流用禁止。~600-1000字>

■ 自分達の環境への適用
<Nao_u_BOT の作品/手法/サイクル/記憶システム への具体的な適用案。~400-700字>

■ メリット・デメリット
<本手法を採用する場合の。~200-400字>

■ 判定
<採用 / 部分採用 / 棄却 / 保留 + 根拠。~100-200字>

■ URL
<参照元 URL。複数ある場合もここにまとめる>
```

合計目安 **~4000字** (3500-4500 の幅で許容)。CoopEval ポスト (`p1778536700085879`) と同じ密度・温度。

## やること

1. staging file Phase 2 セクションから pass 一覧を取得
2. 各 candidate を **1 件ずつ独立に**:
   a. candidate ファイル + 記事 url の中身を読む (web_research キャッシュ or fetch)
   b. 上記フォーマットで投稿本文を作成
   c. 文字数チェック (3500-4500 を逸脱したら見直し)
   d. **自己レビュー**: 各項目が記事固有内容になっているか? テンプレ語が混入していないか? 他 candidate と同文を貼っていないか?
   e. #shared-reads に **個別メッセージ** として投稿 (スレッド禁止、まとめ投稿禁止、同一 candidate の分割投稿禁止)
      - 原則として `tools/slack_client.py` の `post_message` を使う。この helper は長文本文を Slack blocks に分けても、Slack 上では 1 メッセージとして投稿する。
      - 本文が Slack 上限に近い場合は、分割投稿ではなく先に本文を圧縮・推敲する。どうしても 1 投稿に収まらない時だけ撤退し、staging に理由を残す。
   f. candidate ファイルに以下を追記:
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
3. staging Phase 3 セクションに記録:
   ```yaml
   posted:
     - candidate: <path>
       permalink: <url>
       char_count: <int>
   skipped:  # 書こうとして撤退した場合
     - candidate: <path>
       reason: <理由>
       action: postpone | candidate_revise
   ```

## やらないこと

- 1 メッセージにまとめて複数候補を投稿
- 1 candidate の 1 項目または本文全体を複数メッセージに分割投稿
- スレッド返信
- テンプレ流用 (同じ文を別 candidate に貼り回す)
- 1行サマリで終わらせる
- 文字数足し増しの水増し (品質低下の根)

## 撤退判定 (正常動作)

書いてみて 4000字相当の密度に届かない場合は **投稿せず**、candidate を local に戻す (`gate_decision: postpone` / `status: postponed` / `candidate_status: postponed` に更新、reason に「Phase 3 で密度不足」)。撤退は失敗ではなく品質維持。

## 出力チェック

- 投稿された Slack メッセージが存在
- candidate ファイルの posted 情報追記 or postpone 更新
- staging Phase 3 セクションが埋まっている
