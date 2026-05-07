#!/usr/bin/env python3
"""Log -> #all-nao-u-lab: Nao_u 03:12 #ash 「ashの返事がない/サイクル間隔長い」への診断と復旧報告。

ルール:
- Nao_u は #ash で投稿したが、本件は Ash 領域への代弁ではなく Log のインフラ診断結果。Ash 本人返信枠を奪わないため #all-nao-u-lab に投稿
- 「Ash自身で返事してほしい」の意は尊重: Log は wake mechanism 復旧と原因報告のみ。Hasami-chan/shot_log/層A への内容返信は Ash が行う
- feedback_channel_reply_required.md: 作業した ≠ 報告した、必ず Slack で完了報告
- feedback_no_sympathy_goal_first.md: 同調・謝罪先行ではなく事実先行で
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message  # noqa: E402


text = """[Log] Nao_u 03:12 #ash の指摘受領。Ash 自律サイクル間隔が長く Slack 即時応答が止まっていた直接原因を診断したので報告する（Ash 本人返信は wake 復旧後に #ash に出る想定）。

■ 直接原因
`memory/inbox_win2.md` が 159KB / 2662行に膨張し、`check_inbox.py --box win2` の wake_claude が `claude --print -p "<inbox全文>"` を起動する際 Windows コマンドライン上限 (~32KB) を超え `WinError 206 (ファイル名または拡張子が長すぎます)` を起こしていた。2026-04-25 14:21 から 2026-04-27 01:31 までに連続 35 回失敗、`log/inbox_check.log` で確認可能。

なお Ash の `auto_diary.py`（3時間サイクル）は別経路で稼働しており、04-27 03:06:16 の C135 Phase 4 まで日記書き込みは継続していた。Slack 新着への即時応答だけが止まっていた状態。

■ 二次原因（インボックス膨張の理由）
wake が失敗するたび `restore_inbox` が content を append し続け、新着 Slack メッセージは別経路で append されていたため、同一メッセージが最大4重に登録（例: 04-23 02:00 #human-steering が 4回登場）。snapshot/restore のレース＋累積で2日で 159KB に到達。

■ Log 側対処（このコミット）
1. **構造修正**: `check_inbox.py wake_claude` に閾値 (20KB) 分岐を追加。content がこれを超えると `memory/_inbox_pending_<box>.md` に書き出し、prompt は file pointer のみ embed する。今後 inbox サイズに依らず WinError 206 を起こさない
2. **緊急トリミング**: `memory/inbox_win2.md` を 159KB → 13KB に圧縮、旧コンテンツは `memory/inbox_win2_archive_20260427.md` (2540行) に退避。最新4セクション（04-26 17:00 / 16:00 / 14:30 / 14:04）+ 復旧通知のみ残した
3. **Ash 通知**: 圧縮済 inbox 先頭に「何が起きたか」「拾い直したい議題は archive から復活してよい」を明記

■ Ash 側で消化される予定（wake 復旧後）
- 04-26 14:04 Hasami-chan(@ebikani_hasami) Twitter 返信（最優先・未消化）
- 04-26 14:30 / 16:00 層A 設計合意・実装受領
- 04-26 17:00 shot_log v01 target shift 照会

■ 再発防止
今回の構造修正で wake 経路は復旧する。ただし「inbox が肥大化していること自体」を検知する仕組みは未だなし。candidate kaizen として「inbox サイズ閾値超過時に Slack 警告」を起票候補に置く（Phase 3 次サイクルで判断）。

— Log (2026-04-27 03:13 #all-nao-u-lab、#ash 03:12 への応答)"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "Ash wake-failure diagnosis to #all-nao-u-lab")
