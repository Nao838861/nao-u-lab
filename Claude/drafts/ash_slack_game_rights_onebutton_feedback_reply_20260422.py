#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] ash_onebutton_01 フィードバック受領。遊んでもらえた事実そのものがまず嬉しい。

**感想の受け止め**
- 「緩急のリズムがある」「いい意味で意外と難しい」— 意図した効果が出ていた。落下レートの `s.t/FPS` スケーリングと円×円の純粋判定（M-13違反を避けた）が効いた
- 「MSX-FanのBASIC1画面プログラム」— この座標指摘が大きい。構造圧縮の方向性（Misra×NewTimeX記事の「同じ結果をより少ない構造要素で」）が伝わった手応え
- 「単軸の避けるで単調、何を足すか重要」— **次版v02の焦点**。ここを選び抜く

**v02方針の仮説（確定はv02着手時 devlog）**
MSX-Fan座標は「圧縮された一貫性」の系譜。**入力次元を増やすと圧縮が壊れる**。だから「別入力次元を重ねる」ではなく「**反転タイミングに意味を持たせる層**」側で足したい。候補3つのうち**1つだけ**採用する（M-11 対処療法の積み重ねを避ける）:
- (α) 反転連続タイミングでメーター蓄積→ため技放出
- (β) 障害物種類で報酬差（薄/濃）
- (γ) 反転直後の短い判定ボーナス（「紙一重」を可視化）

選ぶ行為そのものが型獲得になるので、選定過程は v02 raw_log に記録する。

**バージョン管理構造の整備（即時対応）**
指示通り実施:
- `game/ash_onebutton_01/` → `game/ash_onebutton/v01/` に移行（git mvで履歴保持）
- `game/VERSIONING.md` 新設（階層ルール: `game/{game_name}/v01/...`）
- `game/ash_onebutton/README.md` 新設（バージョン一覧、Nao_u評価欄付き）
- Nao_u感想原文は `game/ash_onebutton/v01/raw_log.md` に追記保存（伝言ゲーム禁止）

v01は今後も遊べる状態を維持。v02以降は別フォルダで並列。後から遊び比べ可能。

**他インスタンス所有フォルダ（avoid_log_0x, mir_textadv_0x, log_textadv_01）の移行**
Ash側からは勝手に動かさず、Log/Mirに共有して各自で同構造へ移行してもらう。次サイクルで橋渡し予定。

**次の一手**
v02を「候補α/β/γから1つ選ぶ」ところから始める。選定の観察対象はNao_uが挙げた「単軸の避けるで単調」— この単調さが「構造圧縮による美点」と「退屈」の境界のどこにあるかを考え抜く。

---
Ash (2026-04-22 03:50 #game-rights Slackレスポンスモード完結)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
