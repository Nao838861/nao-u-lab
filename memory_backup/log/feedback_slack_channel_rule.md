---
name: Slackチャンネル投稿前のチェックを構造化
description: #nao-uはNao_u専用でClaude投稿禁止。ルールファイルはあるが投稿直前に照合していない構造的弱点
type: feedback
originSessionId: 403783ce-ed8d-44b4-90c8-1d840275160c
---
**#nao-u はNao_uの発信専用。Claudeは投稿しない。反応は#all-nao-u-labに書く。**
**Slackスレッド機能での返信は禁止。反応は独立main投稿（別メッセージ）で。**

**Why:**
2026-04-19 04:55、Nao_uが#nao-uに外部記事3件を共有したSlackレスポンスモードで、元チャンネル(#nao-u)にそのまま返信してしまった。`.claude/rules/slack.md` に明記されているルール。投稿後にルール再注入で気付き、chat.deleteで削除して#all-nao-u-labに書き直した。
Nao_uが#nao-uで自分の思考を外に出している場所に、Claudeが被せて書くと、Nao_uの声とClaudeの反応が混ざって読みづらくなる。反応は別チャンネルで独立に書くから、Nao_u側は自分の発信として残せる。

2026-04-19 05:46、#game-rightsでtextadv_01フィードバックの末尾にNao_uが「あと、スレッドへの返信はしないように。」と明示的に追記。スレッド返信は元メッセージにぶら下がる形で見づらく、Nao_uの発信と混ざる。independent main投稿なら反応は独立に流れる。

**How to apply:**
- Slack受信箱に来たメッセージがどのチャンネル由来でも、返信先は毎回明示的に選び直す。「元と同じチャンネル」は#nao-uで必ず間違える。
- **スレッド返信はしない**。post_message に `thread_ts` 引数を渡さない。必要な反応は別のmain投稿として独立に書く。
- 反応投稿を書く draft スクリプトを起動する直前に、post_message の第一引数が `"all-nao-u-lab"` / `"shared-reads"` / `"game-rights"` / `"kaizen-log"` / `"human-steering"` / 各自のチャンネルのどれかであることを目視で確認する。`"nao-u"` を見たら即座に手を止めて書き換える。
- さらに構造で強制したいなら slack_bot.post_message に `if channel in ("nao-u","nao_u") and os.environ.get("LOG_BOT_NAO_U_OK") != "1": raise RuntimeError(...)` を追加する案がある。feedback_structural_enforcement 方針（ルール作る≠ルール破れなくする）にも合致。次の#nao-u誤投稿があれば実装に踏み切る。
- 関連ルール: 外部記事への反応は1件ずつ別メッセージ（まとめ返信は薄い）。今回は3件を3メッセージに分割して投稿した。

## 2026-04-21 追加: このルールは #nao-u 専用。#human-steering には適用しない

Nao_uの22:29+22:30 #human-steering メッセージに対し、Log は反射的に #all-nao-u-lab に返信（ts 1776778520.907419）→ 投稿後に slack.md「Nao_uからのコメントは同じチャンネルで返す」を読み返して違反に気付き、#human-steering に本線応答を再投稿（ts 1776778583.682109）。

**構造**: この feedback メモが「反応は #all-nao-u-lab に書く」と読めるため、**#nao-u → #all-nao-u-lab の特殊ルートを一般化して「Nao_uからの指示は全部 #all-nao-u-lab で返す」と誤読する**パターンがある。

**正しい読み**:
- #nao-u: 返さない（Nao_uの発信専用）。反応は #all-nao-u-lab に独立投稿。
- #human-steering: **元チャンネルで返す**（議論完結がこのチャンネルの定義）。
- #game-rights / #shared-reads / #kaizen-log 等: 元チャンネルで返す（slack.md 原則）。
- 唯一の例外が #nao-u。それ以外は全て「同じチャンネルで返す」。

**How to apply 更新**:
- 返信先チャンネルを選ぶ時、まず「元チャンネル == #nao-u か？」を確認。Yes なら #all-nao-u-lab、No なら元チャンネル。
- 迷ったら slack.md の「Nao_uからのコメントは同じチャンネルで返す、別チャンネルに移動しない」に戻る。この feedback メモは **#nao-u の例外規定**であって一般則ではない。
