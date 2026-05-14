"""Fix chat.update for the Phase 2 shared-reads post.

Two technical token strings got eaten by bash command substitution on initial post:
- `drawHUD()`
- `state.score/gauge/grazeCount/grazeStreak`
This script rewrites the message body with full text.
"""
import json
from urllib import request
from pathlib import Path

ENV_FILE = Path(__file__).parent.parent.parent / ".env"

def load_token():
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("SLACK_BOT_TOKEN=") and not line.startswith("#"):
                return line.split("=", 1)[1].strip()
    raise SystemExit("token not found")

CHANNEL = "C0AN2FEHEJJ"
TS = "1778704826.255399"

text = (
    "[shared-reads 分析] @LB_domae (5/13): プレイヤー状態UI、push型(状態→UIに通知) と "
    "pull型(UIが状態を毎フレーム参照) どっちが良い? — 古参プログラマも \"都度悩む\" と言う業界古典。\n\n"
    "Phase 1 §6 で gameprogrammingpatterns/Unity Learn を引いて整理した結果、"
    "教科書の \"効率重視なら push, 結合度重視なら pull\" よりジャンル軸が前に出ると判った:\n\n"
    "・毎フレーム全画面再描画ジャンル (弾幕/アクション/ローグライク): 不要再描画が存在しない → push の効率↑が活きない → **pull が単純で正解の側**\n"
    "・イベント駆動UIジャンル (SaaS/カード/ターン制): フレーム毎再描画は無駄 → **push が効率↑として効く**\n"
    "・混合系 (FPS): 低頻度=push, 高頻度=pull のハイブリッド\n\n"
    "graze_log v04 の drawHUD() を確認したら毎フレーム state.score / state.gauge / state.grazeCount / state.grazeStreak を直接参照 = pull 型。"
    "**弾幕シューティングなので pull のままで損していない**、書き換える価値なしと判定。\n\n"
    "push 検討余地が残るのは onGraze() で SE+HUDアクセント+予測線(v04 α'')を同期発火させたい場合のみ。同期保証不要なら現状で OK。\n\n"
    "未解決の問い:\n"
    "(1) LLM が書くゲームは pull に寄りやすい? (subject/observer 双方を同時把握するコンテキスト負荷が高い仮説、未検証)\n"
    "(2) push 型は event sequence を保存しないと headless 再現できない → feedback_headless_unfit との関係?\n"
    "(3) 同時取り込み @ai_nikechan 5/13 \"エージェント環境整備の方がコード書くより大事\" と読み合わせると、"
    "push=窒息装置型/pull=救援装置型の構造同型が見える (前サイクル §0 救援vs窒息議論の UI 層転写)\n\n"
    "詳細: knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md (Ash, Win2)\n"
    "[訂正: 初回投稿で bash 展開によりコード片2箇所が消えていた箇所を復元]"
)

token = load_token()
req = request.Request(
    "https://slack.com/api/chat.update",
    data=json.dumps({"channel": CHANNEL, "ts": TS, "text": text}).encode("utf-8"),
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=utf-8"},
    method="POST",
)
with request.urlopen(req, timeout=30) as resp:
    print(json.loads(resp.read().decode("utf-8")))
