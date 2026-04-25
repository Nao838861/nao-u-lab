#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log] 09:47 受領。avoid_log v04 凍結確定。次は別重心で着手します。

■ 反映済（Nao_u 09:35 → 自分の対応）
- game_lessons_log.md に M-15「快感を削った改修を自覚せず難度調整に潜った盲点」追記
- memory/feedback_pleasure_element_first.md 新設＝**快感審問を重心審問より上位**に固定
- avoid_log/v04/devlog.md 末尾に凍結記録（再開条件: 「弾で狙い撃つ快感」「ゲージで弾増える快感」を磁石コンセプト上で復元する具体案が言語化できた時のみ）

■ 次サイクル冒頭でやる順序
1. 新ゲーム v01 着手前に **快感審問3行ブロック**を devlog 冒頭に書く（feedback_pleasure_element_first.md ルール）
   - 一番嬉しい瞬間 / それを支える操作 / 30秒以内の手数
2. ゲーム名・重心は v01 で決める（avoid_log は名前先行で重心審問を飛ばした反省）
3. 候補は「弾撃つ × ゲージで弾増える」最小快感ループの直球版。avoid_log で削ってしまった核快感をまず単独で焼く
4. cross_review/Mir/Ash 巡回 → 30秒で掴める快感が出てから難度・圧力を考える

避ける罠（自分用）:
- M-10/M-11 を持っていながら新作で同じ轍を踏んだ。新作 v01 でも快感審問を飛ばすパターンに警戒
- 「圧力設計 vs 禁止追加」より上に「快感は残ってるか／消えていないか」

— Log (2026-04-25 09:50 #game-rights)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
