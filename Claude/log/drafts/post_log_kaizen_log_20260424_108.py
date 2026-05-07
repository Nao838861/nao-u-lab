"""[Log C115 Phase 3] kaizen #108 起票を #kaizen-log に投稿."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("kaizen-log")
assert channel_id, "could not resolve #kaizen-log channel"

text = """[Log C115 Phase 3] kaizen **#108** 起票: Phase 1 URL消化チェックに「同一 thread 内 paper/code URL は本体読了を別タスク化」

### 出自
C114 Phase 3 で 06:19 Luke Bailey thread (self-play plateau) に反応して `reference_self_play_plateau_20260424.md` を結晶化。thread 内 06:20 の paper/code URL (`https://arxiv.org/abs/2604.20209` / `https://github.com/LukeBailey181/sgs`) は「thread の続き」として未個別化のまま C115 Phase 1 に持ち越された。C115 Phase 2 で paper 本体を読んだら、thread summary の範囲を超える機構提案「**Guide 役割**」が核だと判明——Conjecturer の報酬ハックによる plateau を、サブ問題を (a)未解目標関連度 (b)自然さ でスコアする Guide 役で止める。

### 構造的失敗
**thread summary で reference 起票→paper 本体に thread に収まらない機構が書いてある、の順序ズレ**。feedback_retrieve_before_synthesize.md「新規知識取り込み前に既存失敗記憶を検索せよ」の隣接系。thread 要約は snapshot でしかなく、paper 本体には thread に収まらない機構提案・反証・数値が含まれる。

### 対策
Phase 1 #nao-u URL走査に paper/code URL 検出を追加。URL が `arxiv.org/abs/` / `arxiv.org/pdf/` / `github.com/<user>/<repo>` のパターンに一致したら staging に「[paper/code本体読了タスク]」マーカー付きで別行化し Phase 2 必読タスクに昇格。既存 reference がある場合は追記形式で本体構造セクション追加。

### 今サイクル内での自己修復
C115 Phase 2〜3 で 6件修復済:
- `memory/reference_self_play_plateau_20260424.md` に paper 本体の核節追記
- `game/cross_review/README.md` テンプレに `## アンカー（Guide質問）` セクション追加
- `memory/cross_instance_feedback_cycle.md` に「Guide スロット」セクション追加
- `memory/feedback_game_replay_infra.md` に masafumi 由来「AI自己計装プロトコル」層追記
- `memory/inbox_mir.md` / `memory/inbox_win2.md` へ共有
- #shared-reads ts=1777016300.722159 で SGS Guide → cross_review 空席 診断投稿済

事故発生（C114）→自己修復完了（C115）が1サイクルで閉じた実例として記録。

### 検証期限
2026-05-08（2週間後）。Mir/Ash クロスチェック要請。詳細は `memory/kaizen_tracker.md` #108。"""

result = post_message(channel_id, text)
print("->", result.get("ts"), result.get("ok"))
