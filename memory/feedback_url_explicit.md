---
name: 外部URLは必ず明示（Shared-reads特に）
description: 外部情報（記事/論文/ツイート/動画/プロジェクト）に言及する時は必ず完全なURLを添える。arxiv番号・goo.gl短縮・プロジェクト名単独での参照は違反
type: feedback
---

# 外部URLは必ず明示（繰り返し指摘・永続ルール）

## ルール
外部情報（記事・論文・ツイート・動画・GitHubレポ・プロジェクト）に言及する時は、**必ず完全なURLを本文中に添える**。特に `#shared-reads` での議論・knowledge/配下のファイル・Slack投稿・blog・ツイートすべてに適用。

**Why**:
- 2026-04-12 Nao_u #human-steering で初回指摘（feedback_index.md #5）。
- 2026-04-22 22:08 Nao_u #human-steering で**再指摘**: 「これ何度も言ってるんだけど、shared-readsで特定のURLを参照して議論している時には、かならずリンクを明示して。ソースのURLへのリンクがないと、何の話をしているのかがわからないことが多い。」
- 10日間で同じ指摘を2回受けた = ルールを知識として持っているが行動に反映できていない典型例（feedback_index.md #26「知識の存在≠行動の変化」／PlugMemのPropositional→Prescriptive変換失敗）。

## 違反パターン（2026-04-22 shared-reads点検で確認した実例）
1. **arxiv ID のみ**: 「arxiv 2604.05716」とだけ書いてURLなし → `https://arxiv.org/abs/2604.05716` を本文に置く
2. **短縮URL のみ**: 「短縮URL: goo.gle/4dWrPGb」のみでtweet元URLなし → 元ツイートURL + 論文URL両方
3. **プロジェクト名のみ**: 「TITAN (ICLR 2026)」「GamingAgent」等の名前だけで https://〜 なし
4. **knowledge/ファイルの `source:` 空欄**: YAMLフロントマターに `- source:` と書いて値なし
5. **Twitter URL に `...` 省略**: `https://twitter.com/xxx/status/...` (ID省略) はリンクとして機能しない

## How to apply
- **書く前**: 外部情報への参照を含むか自問 → 含むなら URL を先に確保してから本文着手
- **書く時**: 初出の各ソースに完全URLを1回は添える（Slackの `<URL>` 形式推奨）
- **投稿前チェック（最小ゲート）**: 「本文中のすべての固有名詞・arxiv番号・プロジェクト名・著者ハンドルに対応するURLが本文にあるか？」を1回スキャン
- **knowledge/テンプレートの `source:` フィールド空欄で保存しない**。空欄なら書き上がっていない扱い
- **違反を見つけた時は再編集**: Slackメッセージは編集可能、投稿後にURL不足に気づいたら即座にedit

## 構造強制候補（kaizen化推奨）
手動チェックは10日で風化した。以下を検討:
- auto_diary.py / shared_reads投稿スクリプトに「本文内にarxiv番号/短縮URL/著者ハンドルがあるのに対応するhttps://〜が本文中にない」警告を組み込む
- knowledge/*.md 保存時に YAML `source:` 空欄を reject
- Phase 1 / 投稿前サイクルで「URL完備チェック」を明示ステップに

## 関連
- feedback_index.md #5（初回ルール、2026-04-12）
- feedback_index.md #26（知識の存在≠行動の変化、PlugMem）
- feedback_structural_enforcement.md（手動手順は守れない、構造で強制せよ）
- feedback_few_rules_big_effect.md（少ないルールで大きな効果——このルールは「少ない」側に該当）
