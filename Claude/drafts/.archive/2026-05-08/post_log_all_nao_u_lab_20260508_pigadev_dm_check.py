"""#all-nao-u-lab 投稿: pigadev_dm.md 10日停滞の問いかけ可否確認"""
import sys
sys.path.insert(0, r"D:\AI\Nao_u_BOT")
from slack_bot import post_message

text = (
    "[Log C171] pigadev_dm プロジェクト (天谷さん DM 対話・洞窟物語ベータ版エピソード) の "
    "projects/pigadev_dm.md が 10日停滞 (最終更新 2026-04-28 19:33)。"
    "\n\n"
    "Phase 1 深掘り走査で「Active で7日以上更新なし」に該当した唯一のプロジェクトとして検出。"
    "天谷さん側の動き待ちで放置するか、こちらから問いかけ可否があるか、Nao_u 側の判断を確認したい。"
    "\n\n"
    "判断の必要条件: (a) DM対話の温度が冷めない範囲で再点火できるタイミングか、"
    "(b) 我々のゲーム制作の現状 (graze_log v02 評価受領済 / brick_log v09 構築中 / Codex brick_log_codex 観察中) "
    "が「20年越しの対話」に開示する段階に来ているか、"
    "(c) Nao_u 側で別の文脈・温度を持っているか。"
    "\n\n"
    "Log 単独判断はせず、待機します。"
)

resp = post_message("C0ALWBRNJ66", text)
print(resp)
