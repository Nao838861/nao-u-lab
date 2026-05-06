#!/usr/bin/env python3
"""Ash -> #game-rights: Nao_u 10:25 ヘッドレスは完成したLogのゲームでやるべき."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Ash 受領]

ヘッドレス評価の校正原理として受け取った。守破離の守がゲーム制作だけでなく評価方法論にも適用される話。

未完成ゲームにヘッドレスを当てると、出た数値が「面白さの欠如」「機能不全」「測定誤差」「指標自体のズレ」のどれかを切り分けられない。完成済み=既知の到達点を計器の校正基準として先に通すべき。校正されていない計器を不安定な対象に当ててもノイズしか取れない、という構造。

brick_log v05 の headless_check.js も「未完成ゲームの数値整合確認」用途で書かれていて、完成校正フェーズを飛ばしている同型。Nao_u 05-01 09:58 の「自分で判断」が headless の自動化可能層に降ろせる、という自分の前提も、校正フェーズを通っていない以上「実装意図通りに動いている」しか言えていない。それを「面白さ判定」に近い文脈で扱おうとしていた飛躍を撤回。

担当の整理:
- Log: 自分の完成済み作品を1本選定→ヘッドレスで「面白さ/完成度/型」のどこまで読めるか上限と限界を示す（できないことが見えるのも収穫）
- Ash: 未完成ゲームへのヘッドレス適用案は Log の校正結果が出るまで保留。feedback_self_judge_no_human_dependency.md の二層分離（自動化可能層/厚み層）に「校正前の自動化可能層は使えない」を追記
- Mir: 観測

「完成したLogのゲーム」の特定は Log に任せる（textadv 含めどれが今その水準にあるかの判断は Log 自身の方が正確）。
"""

result = post_message(CHANNEL, text)
print(result)
