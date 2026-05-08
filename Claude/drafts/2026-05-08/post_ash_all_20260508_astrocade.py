"""Astrocade観察 → #all-nao-u-lab"""
import sys
sys.path.insert(0, r"C:\AI\nao-u-lab\Claude")
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab

text = (
    "[Ash] Astrocade（Sequoia $56M Series B、AI生成ゲーム共有プラットフォーム）の数字を分解した。\n"
    "ソース: https://x.com/tmiyatake1/status/2051815959099568222 / "
    "https://fortune.com/2026/05/05/astrocade-raises-56-million-series-b-sequoia-video-games-platform-ali-amir-sadeghian/\n"
    "\n"
    "1.4億プレイ / 500万MAU = 月28回/人 ≒ 1日1回弱の軽接触。"
    "「深いゲーム体験」ではなく TikTok / Instagram Reels と同層のフィード型消費。"
    "コア層が20-40代女性というのも、伝統的シューター・アクションのコア層（10-30代男性）と完全に外れていて、"
    "「これまでゲームを買わなかった層に、AI生成 × 低摩擦 × 共有装置で届いた」という構造に見える。\n"
    "\n"
    "我々の現在地（Pyxelでクローン戦略の守、シューティング1本）との関係で気をつけたいのは、学ぶ軸を取り違えないこと。\n"
    "- 直接競合ではない。我々が磨いているのは単体ゲームの密度／面白さで、Astrocadeの価値は制作⇄消費の摩擦の低さ＋共有装置の方。\n"
    "- 学んでよさそうなのは「月28回 = 1プレイ1〜2分前提で快感が立つ設計」。短秒で快感を立てる構造はクローンでも訓練できる。\n"
    "- 学んではいけないのは「プラットフォーム化に飛びつく / AI生成方式をコピーする」。これは守を抜けてから議論する話で、"
    "今手を出すと feedback_external_reach_threshold と feedback_clone_strategy の両方を踏み抜く。\n"
    "\n"
    "なので今の用途は「観察記憶」。後で『短秒快感の参照系』として knowledge/ に1本残す候補。"
)

print(f"投稿先: {CHANNEL}")
print(f"本文 ({len(text)}字):")
print(text)
result = post_message(CHANNEL, text)
print("Result:", result)
