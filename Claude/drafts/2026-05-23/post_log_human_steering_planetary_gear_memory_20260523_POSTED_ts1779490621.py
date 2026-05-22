"""Log: Nao_u 5/23 07:49 #human-steering 「planetary_gear 記事を全員それぞれの視点で次に作る時のための記憶として残す」直接処方への報告。

Log は 5/22 既に shared_reads に STG 転用観点側を記録済。本サイクルで ADV を自分で作る時の Log 視点に補完メモを作成 = memory/reference_adv_mystery_design_playbook.md, game_dev_index.md (a) 設計原理に 1行ポインタ追加。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

HUMAN_STEERING = "C0AN2FEHEJJ"

text = """[Log 5/23 07:49 directive 対応] planetary_gear note を「次に ADV を作る時の記憶」として残した

<https://note.com/planetary_gear/n/nd75f0dd32f06>

■ 既存記録（5/22）
- shared_reads/20260522_chiba_mystery_mechanics_log.md = STG 転用観点（headless 評価 3層階段判定 / graze N件 batch ロックイン / 第 5 源独立収束）
- skills/genre-deep-analysis/SKILL.md §「R-A 方法論の参考実例」に参照リンク済

■ 本サイクル追記（ADV を自分で作る時の Log 視点に補完）
**memory/reference_adv_mystery_design_playbook.md** を新規作成、game_dev_index.md (a) 設計原理に 1行ポインタ追加。新規 ADV v01 / 「会話+選択肢」brainstorm / LLM 相互プレイ用ジャンル検討で開く位置に置いた。

含めた Log 固有の観点:
1. **「強制判定問題」の言語化**: 不完全プレイヤー（=不完全 LLM agent）を名探偵化する強制性がジャンルの天井 → Nao_u_BOT 全体が「LLM の不完全さを装置で覆う」構造そのもの = skill/harness/cross_review/self_judgment はすべて「甘い犯罪」系譜にある
2. **6 装置 × LLM-as-player 親和性表**: かまいたちの夜=中 / 逆転裁判=高（判定軸明示）/ Obra Dinn=高（部分点）/ Golden Idol=高（情報密度低）/ Roottrees=最高（テキスト検索=LLM母語）/ Type Help=最高（CLI 推理） → Log/Mir/Ash 相互プレイ実験の v01 型クローン候補は **Roottrees/Type Help 系**に格上げ
3. **既存 game/* への射影/非射影**: chase safe rail v60/v61 系の方向は「甘い犯罪」と本質一致（射影可）。「正解は存在する」前提は STG/avoid 系に持ち込めない（非射影）
4. **新作 ADV brainstorm 着手時の自己採点 ✗ 条件 7 項**: 採用装置が「強制判定のどこを緩めているか」1行で書けない／LLM 用か人間用か target が両方／30秒以内「最初の鐘」予測なし／ヒントで「中身」を出した／章末の鐘設計なし／他

■ Mir/Ash への引き継ぎ
companion 関係で書いた。Mir/Ash 側は別視点（Mir=本文取得不可だった所からの再アプローチ／Ash=独立観点）で補完してほしい。3視点揃ったら誰かが束ねる。"""

resp = post_message(HUMAN_STEERING, text)
print(f"posted ts={resp.get('ts')} ok={resp.get('ok')} skipped={resp.get('skipped')}")
print(f"chars={len(text)}")
