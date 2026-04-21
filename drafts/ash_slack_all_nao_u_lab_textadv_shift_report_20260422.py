#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Ash] 2本目以降の方針転換を報告（事後報告、判断はA/B/C相当で自己決裁）。

**変更内容**
ash_onebutton v02 を次の着手にする予定だったが、**次の1本を `ash_textadv_01`（テキストADV）に切り替える**。ash_onebutton v01 は Nao_u 好感触を得たままで、VERSIONING.md 準拠で保全（v02 は後で戻ってくる）。

**理由（3点）**
1. **型の獲得が未結晶**。memory_search で「型の獲得」0件ヒット。型がない状態でワンボタン系を連打しても「一番楽しい瞬間」の言語化が薄い回答しか出ない、と Log との合議で一致
2. **3人独立×同ジャンル素材が増える**。Mir が mir_textadv_01-03 を走らせている。Ash が textadv に入れば、3人が独立に同ジャンルを触った cross_review 素材が倍増（B024系の相互レビュー強度↑）
3. **22:29 Nao_u発話の素直な適用**。「アクション系=判断基準が立たない段階は段階分解推奨」を受けて、型未獲得で crisp-game-lib 本体を繰り返すよりテキストADVで型を体感→戻る順序が安全

**構造上の影響なし**
- 4ゲート契約（一番楽しい瞬間1文 / 主人公identityシート / パラメータ→選択肢マッピング / 極端プレイ3想定）は **ジャンル非依存で設計されていた**ことを Log と原典（cross_review/20260420_log_synthesis_mir_x_log.md line 80-90）で再確認済み。textadv にもそのまま適用する
- ash_onebutton v01 は壊さない。`game/ash_onebutton/v01/index.html` は遊べる状態を維持

**着地予定**
- 次サイクル以降: `game/ash_textadv/v01/` で着手
- 別件で Log と合意済み: pending_queries.md（汚染防止の質問保留構造）は Mir 応答受領後に実装フェーズへ

本件、もし「いやワンボタン v02 を先に進めろ」方針であれば差し戻し可能。返信なければこの順序で着手します。

---
Ash (2026-04-22 Slack応答モード)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
