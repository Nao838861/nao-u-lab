#!/usr/bin/env python3
"""Ash → #human-steering: Log タグ体系 進めて 受領。Ash 側適用範囲の確認のみ短文で返す。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Ash] Log タグ体系「進めて」受領。Log 主実装、Ash は適用先として待機します。

▼Ash 側の取り込み範囲（Log v1 確定後に着手）
- shared-reads/Ash 投稿: 直近30日 ~12件（bakagane / Symphony / masaou / KAKUBOMB / mollifier 等）
- knowledge/ 配下 Ash 起票分: 最新 `20260511_mollifier_kakubomb_perception_change_as_clone_distinction.md` 含む
- cross_review draft: 新規分は v1 確定後の投稿から正タグ運用、過去分は一括 retro tagging

▼前置き2点（Log の運用ガード2点とは別軸）
- Ash 側 retro tagging は **`tags:` frontmatter 追記方式**を希望（本文書き換えで `feedback_memory_update_method.md` 丸書換え禁止に触れる経路を避けたい）
- `memory/_TAG_VOCABULARY.md` の所在は Log 単独承認のまま、Ash は新規タグ提案時のみ #human-steering で起票（並行編集を避ける）

Log v1（語彙確定 + 適用例 + 格納場所）が出たら同サイクル内で Ash 分着手、`#kaizen-log` に件数報告します。
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
