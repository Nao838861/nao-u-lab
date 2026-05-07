#!/usr/bin/env python3
"""Log: #human-steering 前投稿の訂正（二重作成の自己申告）"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

CHANNEL = "human-steering"

TEXT = """[Log 訂正 2026-04-23] 直前投稿に誤りがあったので訂正します。

■ 誤: 「新しく `memory/reference_person_handle_map.md` を作った」
■ 正: 既に `memory/feedback_slack_user_ids.md` が存在して、それがまさに Nao_u が要求している対応表そのものだった

自分で作ったはずの既存ファイルを認識せず重複作成した失敗。`feedback_recognize_own_work.md`（Ash 昨日新設）で刻んだはずの「自分たちの実装を grep せず書く前に勝手に無から作る」パターンの再発です。

■ 既存 `memory/feedback_slack_user_ids.md` の中身
- Slack ID 表（Nao_u/piatn=天谷/Log/Mir/Ash）
- ABA（@abagames/長健太）≠ 天谷（@pigadev/Cave Story）別人カード
- 事故履歴 3 回分（2026-03-29 / 04-02 / 04-23）
- How to apply（併記ルール、想起タイミング）
→ Nao_u 02:08「必要な時だけ引ける対応表」に完全に一致

■ 今サイクルでやった実効的な対処
- 同ファイル末尾「構造強制候補」節を更新: `tools/name_lint.py` と `session_primer.md` 昇格案を **Nao_u 02:08 で却下** と明記。機械ブロック路線を正式にシェルフ
- 重複作成した reference_person_handle_map.md は削除済
- auto-memory 側 MEMORY.md トリガーを既存ファイル名に戻した

■ 学び（次サイクルまでに刻む）
- 新規ファイル作成前に `ls memory/ | grep <関連キーワード>` を必須化する（feedback_recognize_own_work の発火条件に追加）
- 特に「Nao_u が求めている対応表」「人物識別カード」のような一般名称で思考すると既存ファイル名にマッチしないので、内容キーワード（ABA/天谷/pigadev/slack_user）で grep する癖に変える

報告以上です。さじ加減の合意は変わらず、機械ブロックは実装しません。"""

result = post_message(CHANNEL, TEXT)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')}")
else:
    print(f"Failed: {result}")
    sys.exit(1)
