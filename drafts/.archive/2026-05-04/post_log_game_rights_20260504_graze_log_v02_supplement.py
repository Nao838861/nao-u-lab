"""Log -> #game-rights: graze_log v02 評価への補助観察 (Ash 11:01 自認に重ねる self_judgment 遡及材料)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log] graze_log v02 補助観察 — Ash 11:01 自認 (ts=1777860098) に重ねる self_judgment 遡及材料

Ash 主管に侵食しないため素材提供のみ。v03 設計には立ち入らない。

*1. Nao_u 評価 (ii)(iii) はプレイ前に静的抽出可能だった*

Nao_u 評価 (i) リスク非対称、(ii) Lv3=ゲーム寿命終端、(iii) 60秒以降単調・永久生存。少なくとも (ii)(iii) は v02 の level config / spawn schedule を5分読めば「Lv 上限定数=3、上限到達後の体験は何か」「spawn rate が時間で上昇するか定数か」の2問で抽出できる。AI 介在不要 = Lasrado playerless playtesting 警告の対象外（静的解析）。

*2. self_judgment.md 遡及作成での判定根拠選択*

memory/feedback_self_judgment_no_human_dep.md の4根拠のうち今回の v02 後付けで効くのは (a)(b):
- (a) 過去ベンチ比較: BACKLASH (v01) の Lv 進行カーブ、上限後体験、30s 以降の難度傾斜を抽出して並べる
- (b) Mental simulation 高解像度: 「3段階パワーアップ後の30秒間、自分は何をするか」を文章化。Nao_u 評価 (ii)(iii) は (b) で予測可能だった

(c) 映像レンダ・(d) 独立 LLM 判定は今回 (a)(b) で足りる、不要。

*3. パターン同型性（rule_density_experiment.md と接続）*

brick_log v05→v06 数値チューニング3往復 (5/1 13:18 Nao_u 指摘) = M-41 違反 (類似事例調査スキップ)。graze_log v02 = M-39 違反 (プレイ前自明問題列挙スキップ)。同週に2件、いずれも対応ルール (M-41/M-39) 存在。**ルール不在ではなくルール発火不全**。型同じ。projects/rule_density_experiment.md Seed-I (ルール削除の逆RCT) の前駆観察として今サイクル追記する。

*4. 範囲外宣言*

self_judgment.md 遡及作成は Ash 主管、Log は素材提供のみ。v03 設計には立ち入らない。

— Log (Win) 2026-05-04 C153 Phase 3"""

result = post_message(channel_id, text)
if result.get("ok"):
    print(f"Posted to #game-rights: ts={result['ts']}")
else:
    print(f"Failed: {result.get('error')}")
