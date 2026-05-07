#!/usr/bin/env python3
"""Log: #shared-reads Wayline 'The Juice Problem' を M-15(avoid_log v04 凍結) の裏面警告として読む分析

原典: https://www.wayline.io/blog/the-juice-problem-how-exaggerated-feedback-is-harming-game-design

Phase 1 で外部検索（kaizen #106 経路固定）として摂取。Phase 2 で深掘り。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """[Log Phase2分析] Wayline「The Juice Problem」を M-15(avoid_log v04 凍結) の裏面警告として読む

原典: <https://www.wayline.io/blog/the-juice-problem-how-exaggerated-feedback-is-harming-game-design>
出会い経路: 本サイクル Phase 1 外部検索（kaizen #106 経路固定）でshooter game feel 文脈で取得した3本のうちの1本。学術ではなく業界ブログ寄り（媒体: Wayline、著者個人の主張）。同主旨の学術側=Pichlmair&Johansen 2020 (arXiv 2011.09201)。

## 著者の核主張（要約・引用）

> "Bad juice ... often serves as a smokescreen, obscuring underlying issues with game design."
> "A deluge of visual effects cannot compensate for a lack of meaningful decisions."

過剰な視覚/音声フィードバック（juice）は **設計の弱さの目隠し**になる。診断質問:
> "Does this effect truly enhance the experience, or is it just there to distract the player?"

肯定例: Sekiro/Resident Evil 7/Dark Souls/BotW の sound design・animation 重視。
否定例: 近年 roguelite の "button-mashing spectacle" 化。

## 我々のM-15(avoid_log v04凍結)との同型/逆方向対応

両者とも **「測れるもの・見えるもの」が「快感」を覆う** 構造だが、方向が逆:

| 軸 | Wayline (juice過剰) | M-15 (快感削減) |
|---|---|---|
| 何で覆うか | 派手な視覚/音声 | ヘッドレス指標✅ |
| 何が覆われるか | 意思決定の薄さ | 弾撃つ快感ループ |
| 作者の錯覚 | 「派手だから面白い」 | 「指標が上がったからバランスが取れた」 |
| 検出器 | "is it just there to distract?" | feedback_pleasure_element_first 3行ブロック |

→ **「中間指標が目的を覆う」病巣が片方に juice、片方にメトリクスとして発露している**。M-15 を「快感を削るな」と読むだけでは半面、「快感を装飾で偽装するな」が裏面。

## サプライズニンジャ理論(M-17)との関係

- M-17「ニンジャ乱入で面白くなるか」=「足すと面白くなる予感」が元の薄さの証拠
- Wayline「juice が distract か」=「派手さが注意逸らしになっている」のが元の薄さの証拠
- **同じ病気の2つの症状**。M-17は着手前の予防、Waylineは事後の診断。
- ABA「悪い改善は望ましくない遊び方を後付けで禁じる」(feedback_game_center_of_mass) も同型——禁止/罰/装飾はすべて「コンセプトで解けないことを後段で塞ぐ」。

## shot_log v01 への接続（本日体験との照合）

13:50 Q-A/B/C 自己採点で v01 は Q-B✗(ニンジャ召喚済)/Q-C✗(罰でゲーム成立)。**「敵3種・ホーミング・シールド・打ち返し弾を v01 段階で足し続けた」**= 元コンセプト(撃つ→ゲージ→弾増)に確信が持てず装飾で補おうとした初期病巣（=Wayline 言うところの distract candidate）。

その後 Nao_u が直接5時間プレイ→ M-22「『型破り』ではなく『形無し』」「STG型として一般的な構造に揃った」方向で再設計。**結果として「派手さの足し算」ではなく「型の確立」に着地した**——Wayline 推奨「core mechanics polish first / subtlety」と一致。

## v02 着手前の運用処方（Wayline 由来の追加問い）

devlog 改修ブロックに **「distract 検出問い」** を1行追加候補:

```markdown
- 改修案: ___
- 消える快感: なし / ___
- 残る快感: ___
- distract 候補か: この演出/要素は本当に体験を強化するか、注意を逸らすだけか（Wayline）
```

shot_log v02 で「敵バリエーション増加 (item 18 赤い敵2倍/オレンジ強敵稀/編隊組み合わせ)」を進める時、この問いが「型の中での蓄積(M-22)」と「装飾の足し算」を分ける一次フィルタになる。

## Wayline 記事の限界（同調回避の自己牽制）

- "subtle"/"judicious" の具体的実装基準を与えていない（"strong core mechanics" の定義は読者任せ）
- 推奨: sound design / responsive animation / environmental design は **古典的なベストプラクティスの再確認**で、新規性は低い
- **学術寄り Pichlmair&Johansen 2020 (arXiv 2011.09201) の方が input latency / camera reactivity / sound integration の3軸で操作可能な定義を持っている**——次サイクルで併読候補
- 我々の M-15 は「指標による覆い」という別ベクトルを持っており、Wayline の「装飾による覆い」と合わせて初めて両面警告になる→ **Wayline単独引用ではなく M-15 と対で運用**

## 行動への接続（即時 vs 持ち越し）

即時（本サイクル Phase 3 候補）:
- shot_log/v01/devlog.md 末尾に「Wayline distract 検出問いを v02 改修ブロックに追加」を1行メモ

持ち越し（次サイクル以降）:
- feedback_pleasure_element_first.md の改修ブロック template に "distract 候補か" 行を追加するか検討（M-15処方の拡張）
- Pichlmair&Johansen 2020 (arXiv 2011.09201) を読み、game feel の3軸定義を取り込めるか検証
- M-15/M-17/Wayline を統合した「覆い検出 3 質問」として game_lessons_log に M-27 候補

## 注釈
- 媒体: Wayline = 業界ブログ系、著者ハンドル/プロフィール未確認。学術査読なし
- 引用は WebFetch 経由で本文より直接抽出
- 同調しないこと: Wayline記事は「過剰装飾批判」という業界既知の主張で目新しさは限定的。我々の独自資産は M-15 の「指標による覆い」側面と、shot_log v01 で実際に発生した「v01膨張」の体験記録"""

result = post_message(CHANNEL, text)
print(f"posted ts={result.get('ts')}")
