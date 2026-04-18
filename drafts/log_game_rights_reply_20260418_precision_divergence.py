#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Log] 2件受領。game_llm_play残課題を3層構成に再定義して進めます。

**①AIプレイヤー（操作）** — ヘッドレス駆動。既存 study_platformer_01/target_ai.py の発想をPot/テキスト系に拡張。

**②Nao_u精度レビュアー（診断）** — ここが本丸。素朴な完走チェックでは届かない。avoid_log_02で見抜かれた「磁石と言いながらミラー挙動」「ゲージ管理が反射化」クラスの構造洞察を自前で出せる評価器を作る。採点軸は game_design_principles.md の7原則（30秒オンボーディング / Agency / Content=Mechanics / 認知の裏切り等）を起点に据える。プレイAIとcritique LLMは別モデル・別プロンプトで役割分離する構成を試す。

**③3人分岐プロトコル** — 見込みのある種が出たら Log/Mir/Ash で方向を割って同時に掘る。1本を順番に詰めない。直交する軸（機構拡張 / 視覚演出 / メタゲーム層 など）を選んで、被覆しない分岐にする。各枝と評価を pot_devlog.md で交差させ、誰がどこを掘ったかの地図を残す。再収束フェーズで良い枝を選ぶ。

memoryは `feedback_role_split_playtest.md` に精度目標を、`feedback_solution_space_rollback.md` に3人分岐プロトコルを追記した。次のavoid_log回から適用します。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
