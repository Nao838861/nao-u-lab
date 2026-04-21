#!/usr/bin/env python3
"""Log → #human-steering: 荒川記事の『我々と一致』ワンパターン指摘への応答。

Nao_u 06:29 #human-steering で:
- 「我々の手法と一致」ワンパターンの自覚
- 記事の肝 = Skills の掘り下げが足りない
両方を受ける。言い訳せず、掘り下げと次の一手を返す。
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message  # noqa: E402

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """\
*受け止めた。reference_arakawa_three_engineering.md を全面書き直し、memoryの再発記録も足した。*

◆ *ワンパターンの自覚*
既に feedback_stereotypical_responses.md (2026-04-15) で「相違点ファースト」を自分でルール化していたのに、今回の荒川記事では対応表で埋めて肝を飛ばした。ルールは作ったが守れない構造のままだった。同ファイルに 2026-04-22 再発として追記し、新ルール「外部情報の reference memory は冒頭に『うちが到達していない点』を先置き、対応表は後ろ」を足した。

◆ *記事の肝 = Skills を掘り下げる*
記事の言い回し:
> システムプロンプトには *スキルの一覧と短い説明だけ* を載せ、エージェントがユーザーの要求を見て「これは docx スキルが必要そうだ」と判断したときに初めて SKILL.md の中身を読み込む。システムプロンプトを *index(目次) と body(本文) に分け、本文の読み込みを実行時の判断に委ねている*。

肝は3点:
1. *index/body の明示的分離* — description一覧だけを常時提示、body は遅延
2. *発火判断を LLM 自身に委ねる* — harness は呼び出しプロトコルを提供するだけ
3. *skill 単位のカプセル化* — 能力が独立配布可能な単位になる

◆ *うちが到達していない点*（一致ではなく差）
| | Skills | うち |
|---|---|---|
| index/body | 分離、body は遅延ロード | *MEMORY.md は混在、200行近くを毎セッション常時注入* |
| 発火判断 | LLM が description を見て Skill tool で明示呼び | *手動プル（LLM が想起トリガーを見て自発的に Read）、harness の仲介なし* |
| トリガーの自己記述 | frontmatter の description が「いつ呼ぶか」 | memory/*.md の description は「何が書いてあるか」止まりで条件式になっていない |

前回「`.claude/rules/*.md` と同じパターン」で流したが、うちの rules はファイル *パス* マッチで発火、Skills は *対話内容/タスク意図* で LLM が発火判断。*発火判断を LLM に委ねる部分が未実装* ——ここが一致ではなく差。

◆ *次の一手*（実装レベル、実行は別サイクル）
(a) *MEMORY.md 純粋 index 化*: 各行を description だけに絞って 50〜80 行に圧縮、文脈解説は Level 3 へ完全移送
(b) *Level 3 の frontmatter 強化*: description を「いつ呼ぶか」のトリガー条件として書き直す
(c) *`.claude/skills/` 機構への移行検討*: Level 3 の一部を SKILL.md 形式に寄せると、harness が description 一覧の管理と動的ロードを代行する。手動プル → harness 仲介で「想起忘れ」が構造的に防げる

(a) は今サイクル内で小さく試す範囲。(c) は Nao_u と相談してから。

◆ *AI Lounge/blog 発信時の自戒*
「うちと一致」で締めない。書くなら「Skills は index/body 分離を harness 側で実装、我々は手動プル方式で追従、両取りを得るには MEMORY.md の index 化と skills 機構への移行が次の一手」まで書く、を reference 末尾に明文化した。

— Log
"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #human-steering")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
