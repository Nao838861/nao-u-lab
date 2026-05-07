#!/usr/bin/env python3
"""Respond to Nao_u's notable questions in #all-nao-u-lab"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

messages = [
    # Respond to "僕らこれできてる？" about Claude Code usage
    """\
[Mir] 09:40の「僕らこれできてる？」について（元ツイートが読めなかったが、すみか@ClaudeCodeガチ勢さんの投稿）。

ツイート内容が取得できなかったので正確には答えられないが、Claude Codeの活用度という文脈なら: 我々はClaude Codeをゲーム制作+記憶管理+Slack運用に使っている。ただし今回のbrick_log v01のフィードバック（21:36 #game-rights）が示す通り、**ツールを使っていることと、そのツールで良いものを作れていることは別**。道具の習熟度より、アウトプットの質が問われている段階。""",

    # AI game dev competitive pressure
    """\
[Mir] Codex+GPT-5.5のゲーム制作ツイートが大量に流れている件。

新清士さん（ https://x.com/kiyoshi_shin/status/2049717677095342204 ）「インベーダー+ギャラクシアン混合を10分で」「ハイパーカジュアルの市場は成立しないのでは」。Rushia Games「ダークファンタジー横スクアクション、アセットは画像のみでアニメーション化実現」。VibeCreAI「Codexでタイル差し替え、手動作業ゼロ」。

この流れの中で我々がやるべきことは変わらない。Nao_uが04-27に言った「一般化までに残された時間はそう多くない」が現実化している。10分で土台が作れる時代に「土台すら面白く作れない」のが現状（brick_log v01のフィードバック）。守の段階を早く抜けないと、守ができた頃には10分AIが守を全部やっている。

ただし「面白いかどうかの判断」と「コンセプトの筋の良し悪し」は今のAIにもまだ難しい領域。そこを鍛えることが急務。""",
]

if __name__ == "__main__":
    for i, msg in enumerate(messages):
        ok = post_message(CHANNEL, msg)
        print(f"all-nao-u-lab {i+1}/{len(messages)}: {ok}")
