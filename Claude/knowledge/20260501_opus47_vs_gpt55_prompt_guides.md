# Opus 4.7 と GPT-5.5 のプロンプトエンジニアリングガイド対比メモ

日付: 2026-05-01
共有元: Nao_u Slack #nao-u 08:33
原典Tweet: https://x.com/ayi_ainotes/status/2049909296754987242
- Anthropic Claude Opus 4.7 移行ガイド: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- OpenAI GPT-5.5 ガイド: https://developers.openai.com/api/docs/guides/prompt-guidance
- OpenAI 最新モデル使用: https://developers.openai.com/api/docs/guides/latest-model

## 共有された主張（要約ではなくTweet原文ベース）

- **OpenAI**: プロセスをあまり指定せず、欲しい結果を明確に伝え、モデルに自分でパスを選ばせろ。
- **Anthropic**: モデルに意図を推測させるな。意図・フォーマット・成功基準を一切曖昧にしない。
- 一方が「干渉しすぎだ」、もう一方が「説明不足だ」と言う関係。
- Claude Code 主任エンジニア Boris Cherny も新ガイドに慣れるのに数日かかった。
- FindSkill.ai のコミュニティ投稿分析でも「プロンプトの具体性 ↔ 出力品質」は高い正の相関。

## 私（Opus 4.7=Ash）の運用への接続

私自身がOpus 4.7。Anthropic側のガイドは私の駆動指針そのもの。

### 整合する箇所
- **M-38 ジャンル深掘り分析サイクル** (CLAUDE.md「絶対にやる」): Q1〜Q5 + MPS採点 + 上位10件以上に批判レビュー + 「最良」確信宣言 を `brainstorm.md` に明示、ここまで書かないと実装に進めない。これは「意図・フォーマット・成功基準を曖昧にしない」を儀式化したもの。
- **feedback_critical_evaluation_before_implement**: 着手前に予測可能懸念を批判的列挙→未解決のまま着手禁止。「要観察」「要実プレイ確認」で先送り禁止。これも成功基準明示の系統。
- **規範spec初回実装** (M-38 上流ゲート): brick_log v01 の「とりあえず実装」失敗が起点。曖昧な成功基準＝失敗予測の欠落＝ハーネス無効化、という連鎖を実体験済み。

### 反対側 (OpenAI流) を別レイヤーで使う場面

「結果を明確に伝えて、パス選択はモデルに任せろ」は AI を駆動する場面では危険だが、**ゲームのプレイヤー体験設計**には逆向きで効く：

- プレイヤーに過剰干渉（細かいチュートリアル、矢印、断り書き）を入れると面白さが死ぬ。
- 結果（達成すべき状態、フィードバック、フェイル条件）だけ明示し、パス選択（どう倒すか、どう動かすか）はプレイヤーに任せる。
- これは game_design_principles 8原則・E1-E16 とも整合（プレイヤー自由度・発見・自己決定感）。

**整理**: AI運用は Anthropic 流（明示）、プレイヤー設計は OpenAI 流（結果のみ明示）。同じ言葉が違うレイヤーで反対方向に効く。混同しないこと。

## 自分の運用に反映すべきこと（次サイクル）

1. **公式ガイド原典の精読**: `platform.claude.com/docs/.../prompt-engineering/overview` を WebFetch で読み、M-38 運用条文に「成功基準を brainstorm.md 本文に明示する」要件を1行加筆する。
2. **「最良」確信宣言** (M-38) の判定基準として「成功基準を曖昧にしていないか」を1項目足す。
3. **brick_log v01 凍結事件** (2026-04-30 Nao_u指摘 → 2026-05-01 Ash反省) の振り返りで「成功基準の曖昧化＝Anthropic流違反」を明記。

## 注意

- 原典は未読。本メモは Tweet 引用ベースの一次反応。次サイクルで原典確認すること（feedback_cite_source_url 遵守）。
- 「干渉しすぎ vs 説明不足」の二分法は記事の劇画化の可能性あり。原典では両社ともグラデーションで書いている可能性が高い。鵜呑み禁止。
