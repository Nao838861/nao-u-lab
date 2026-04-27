#!/usr/bin/env python3
"""Log -> #human-steering: 09:00 Nao_u の問い「記憶を使ってゲームデザインできるか」現在地レポート（C138）。

経緯:
- 2026-04-27 09:00 Nao_u #human-steering: 記憶検索より、ゲーム制作実践で知見を使えるかが本質。
  どのくらいできるか、できないなら何が問題か見せてほしい。「他人の作った基準に踊らされないで」
- 同日 09:29 Nao_u #human-steering: 概念濫用指摘（サプライズニンジャ→STG適用、角を丸める等）
  → feedback_concept_relevance_judgment.md に記録済、本サイクルで本体作成

応答方針:
- 同調先行禁止（feedback_no_sympathy_goal_first.md）: 事実から始める
- 09:00 と 09:29 を別物と扱わない: 同じ系統の指摘の表裏
- 最近の概念語（サプライズニンジャ/SGS/hot_cache等）を使わずに自分の言葉で書く
  → これ自体が応答の証拠になる
- 長すぎない: 3-4ブロック、800字以内目安
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message  # noqa: E402


text = """[Log C138] 09:00 と 09:29 への応答。記憶を使えているか、現在地レポート。

■ できた実例（記憶が判断を変えた）
- 今朝の BACKLASH 押しっぱなし対策。Ash から「e.repeat 無視＋ゲームオーバー後2秒グレース」の2層案。2秒グレースを却下して e.repeat 単独で push した。理由は「最初の物理押下を罰しないため」。これは avoid_log v04 を凍結した時の判断（プレイヤーの行動に紐づかない自然減衰は罰駆動）と同じ系統。記憶を引いて棄却できた
- avoid_log v04 凍結（M-15）。ヘッドレス指標は改善していたが「一番嬉しい瞬間が消えていないか」を先に問うルールを使って凍結を選べた
- mir_textadv v05 共犯END（M-18）。「v3問題に答えると驚きが消える」ことに ENDING 追加直前で気づけた

■ できなかった実例（記憶があったのに使えなかった）
- shot_log v01 の Q-A/B/C を 16箇所以上適用した件。これは ADV 用の判断軸を STG に転用した。今朝の 09:29 で指摘されるまで自分で気づけなかった
- ABA 記事を結晶化した時、圧力 vs 禁止の処方箋として Pot を引用した。正解は avoid_log v02 v3 の禁止追加例で、私はその記憶を持っていたのに直近で結晶化した方を引いてしまった
- 「角を丸める」を出典の確認なしに判断基準として書いていた

■ 何が問題か（自分で見える範囲）
1. 直近に取り込んだ概念がホットキャッシュに乗って、過去のより精密な記憶を上書きする。鮮度が重みに化ける
2. 「これはあれと同じ構造だ」と思った瞬間に、表層の語の類似で当ててしまい、因果構造の同型性を確かめない
3. 一度作った思考フォーマット（Q-A/B/C みたいな）を全件に適用してしまう。形式適用は思考の節約＝惰性
4. arxiv 論文・著名アカウントの言葉を無批判に格上げする癖。「他人の作った基準に踊らされないで」が直接刺さる

■ 何を変える（具体）
- 概念を判断軸に使う前に3問通す: (a)元の発話文脈は何の問題への処方か (b)今の対象と因果構造として同型か (c)この概念を使わず別の言葉で言えるか。言えるなら引用は飾り
- MEMORY.md T:5 を「Nao_u 直接発話」と「外部摂取」で分け、後者は実適用で効いた実績があるものだけ T:5 を維持。実績なしは T:3 へ
- 新作 devlog 冒頭で「このゲームに必要な記憶は1〜3個」と絞って明示。形式適用ではなく、当該ゲームに必要な記憶だけ引く
- 検証期限 2026-05-04（一週間後）。shot_log devlog の Q-A/B/C ブロックから ADV 文脈外の引用を削除/注釈化、MEMORY.md の再ソートを先行

書いた: feedback_concept_relevance_judgment.md（本体、MEMORY.md には index 登録済だった）

— Log (2026-04-27 09:00/09:29 への応答)"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("human-steering", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "C138 memory-in-practice report")
