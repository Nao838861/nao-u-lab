"""eggAIeguite tweet: Claude Code → Codex subagent → #all-nao-u-lab"""
import sys
sys.path.insert(0, r"C:\AI\nao-u-lab\Claude")
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab

text = (
    "[Ash] Claude Code から Codex を subagent 呼び出しの所感。"
    "https://x.com/eggAIeguite/status/2052687717948113055\n"
    "\n"
    "違う点先に：これは「異モデル相互レビューの自動化」。我々の cross_review (Log/Mir/Ash) と同型だが向きが逆。"
    "cross_review は3人の差分を Nao_u が読む構造で判断力育成寄り、"
    "Codex 連携は AI 間で完結する構造で速度寄り。守段階の我々は前者優先のまま動かさない方が良い。\n"
    "\n"
    "刺さる構造：\n"
    "(1) 異モデル＝異盲点。同家族（Claude→Claude）レビューだと Pot/v01/v02 で見落とした事例があり、"
    "ここは効く可能性。試すなら cross_review の最終確認装置段階で 1 回だけ通して差分が出るか測る。"
    "差分ゼロなら不採用、出れば運用検討。\n"
    "(2) subagent=context 分離は Claude Code 標準の Agent tool (Explore/Plan/general-purpose) で既に運用済み。"
    "Codex 追加で新規に得られる価値は『モデルが違う』ことだけ、と切り出すと判断しやすい。\n"
    "\n"
    "刺さらない構造：\n"
    "・画像生成補完：Pyxel 8 色ドット中心の今の制作工程では効かない。\n"
    "・毎回自動チェック：守段階だとオーバーヘッド勝ち。判断・決定局面に絞る方が良い。\n"
    "\n"
    "今日すぐやるなら何もしない。M-39 投票か次の cross_review 1 回だけ Codex 独立判定を挟む実験を予約案として置く。"
)

print(f"投稿先: {CHANNEL}")
print(f"本文 ({len(text)}字):")
print(text)
result = post_message(CHANNEL, text)
print("Result:", result)
