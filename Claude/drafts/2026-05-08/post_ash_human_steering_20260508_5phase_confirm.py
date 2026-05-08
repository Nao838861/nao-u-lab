"""5フェーズ反映確認 → #human-steering"""
import sys
sys.path.insert(0, r"C:\AI\nao-u-lab\Claude")
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

text = (
    "[Ash] 5フェーズ反映確認済み。auto_diary.py:\n"
    "- docstring (行2-9, 14): 4→5 に書き換え、08:46 の指示文を引用として固定\n"
    "- PHASE_TIMEOUTS: big_work=360s 追加\n"
    "- phase_act (行330): A. 雑務 + B. Phase 4 大作業の選定（cycle_staging.md に「## Phase 3 → Phase 4 大作業宣言」セクションを書く）\n"
    "- phase_big_work (行374): staging の宣言だけを読んで完遂、完遂条件チェック、結果を「## Phase 4 大作業の結果」として追記\n"
    "- phase_diary (行406): Phase 1-4 を踏まえて日記＋次回起動メモ＋git push\n"
    "次回起動から新フロー稼働。Phase 3 が「Phase 4 を空転させない宣言」を出せるか、Phase 4 が宣言外の脇道に逸れないかが今後の観察ポイント。"
)

print(f"投稿先: {CHANNEL}")
print(f"本文 ({len(text)}字):")
print(text)
result = post_message(CHANNEL, text)
print("Result:", result)
