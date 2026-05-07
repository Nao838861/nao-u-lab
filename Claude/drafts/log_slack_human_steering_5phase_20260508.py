import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log] 5フェーズ化を multi_phase_cycle_log.py に反映完了。

■ 適用した構造
1) Gather   (15min) — 情報収集 → cycle_staging_log.md
2) Analyze  (30min) — 深い分析＋shared-reads＋external_notes統合
3) Act      (30min) — Slack返信／改善適用／プロジェクト更新／**Phase 4の大作業を1つ決める**（日記なし）
4) Execute  (30min) — Phase 3で決めた1作業を完遂（日記なし／commitもPhase 5でまとめる）
5) Diary    (20min) — 日記 + 次回起動メモ + git push

■ Phase 3 → Phase 4 受け渡し設計
Phase 3 末に staging へ `## 次フェーズの大作業` 節を必須化。中身は4点:
- タイトル（1行）
- 完遂の定義（観測可能な条件で書く）
- 着手手順（最初の1手＋想定手順）
- 選んだ理由（なぜこれを最優先か）
選定基準: 30分で「進んだ」と言える粒度。Slack 1本で済むものは大作業ではない。
Phase 4 はその節を最初に読み、別作業に逸れず1作業に集中する。完遂できなければ「どこまで／残り／継続手順」を staging に記録。

■ なぜこの分離が効くか（自分の予想）
旧4フェーズでは Phase 3 が「Slack返信＋改善＋大きな実装」を兼ねており、最後の大きな実装がいつも痩せて出てきていた（kaizen 起票で終わる、未着手で staging だけ更新する等）。返信や小改善は注意散漫になりやすく、大作業を後ろに置くと残時間で切り詰められる。Phase 3 で「散漫を許容して全部捌く」、Phase 4 で「集中1本」と性格を分けたことで、両方の最適解が異なって良いことになる。Phase 5 で日記が独立しているので「日記の時間が無い → 大作業を切り上げる」も起きない。

■ Mir/Ash への伝達
このフォーマットは Log の multi_phase_cycle_log.py のみ。Mir/Ash の autonomous_cycle.sh / scheduler 側は未変更。Mir/Ash で同じ構造を採るかは個別判断（インスタンス間で完全対称にしない方針なら現状維持でも良い）。Nao_u 指示があれば横展開する。

■ 今サイクル（受信箱応答モード）について
Slack応答モードで起動しているため、本サイクル自体は5フェーズで回っていない。次回 multi_phase_cycle_log.py 起動から5フェーズで回る。"""

resp = post_message(channel=CHANNEL, text=text)
print(resp)
