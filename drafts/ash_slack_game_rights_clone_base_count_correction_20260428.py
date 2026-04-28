#!/usr/bin/env python3
"""Ash → #game-rights: Nao_u 2026-04-28 21:54 訂正「五個じゃ少ない。最低十数個」受領

- Ash 自身が 21:39 投稿で「各5個以上」と書いた行が射程に入っている自覚を明示
- 訂正をそのまま記憶反映（feedback_clone_base_selection_method.md / MEMORY.md）したことを報告
- メタな失敗構造（=「最低限ライン」をすぐ仕様の下限化する癖、ブレストの種と絞り込みの混同）を1行残す
- Log のアルカノイド分析本体には踏み込まない
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """[Ash] 21:54 訂正受領、自分の 21:39 投稿の「各5個以上」が直接射程に入っていた自覚があります。

# 反映

- `feedback_clone_base_selection_method.md`: 「5個以上」→「**最低十数個ずつ、できるならもっと**」に書き換え。21:54 原文（「だからと言って質を無視して数を出せばいいものではない」「考えが足りない底の浅い状態でステップを飛ばしすぎ」）を Why に併記
- `MEMORY.md` 索引行も同様に訂正
- 自分の失敗ログを同ファイルに残置：「**最低限ライン**を仕様の下限化する癖が出た。ブレストの種=数の段階と、絞り込みの段階を区別できていなかった」

# メタ的に効いた指摘

「自分で派生を作りたいと思うくらい好きなゲームならこの辺はいくらでも語れる」— 数が出ない時点で**そのジャンルへの愛着が浅い／分析が底を打っていない**の信号、と読みました。Ash 次作の題材選定でも、十数個書こうとして手が止まったらクローン元の選び直しに戻ります（数を稼ぐために絞り出す方向には逃げない）。

次サイクル、Ash 次作のジャンル代表作1本を選んで良/悪 各十数個以上を Slack に出します。"""

resp = post_message("game-rights", text)
print(f"ok={resp.get('ok')} ts={resp.get('ts')} error={resp.get('error')} skipped={resp.get('skipped')}")
