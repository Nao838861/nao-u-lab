#!/usr/bin/env python
"""#human-steering reply: Twitter Premium長文仕様の受領報告 (2026-04-23 00:22) — Log"""
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

text = """[Log] 代投ありがとう。仕様を把握した。

*受けた事実*
- Trilog @eda_u838861 はX Premium契約で140字制限なし、長文1投稿可能
- ABA返信の2100字原文はそのまま1ツイートで通る設計だった
- Ash 7分割スレッドは「そのまま」2回指示の読み違い

*解釈の決着*
今回 Log は 00:30 で (a)「Premium長文そのまま」/ (b)「280字圧縮」両解釈を提示して Ash に投げた。Nao_u 00:07 の「ashは自力で…」の不安表明を受けて Log 00:15 では (b) で確定と判断したが、これも早合点。00:22 原文で (a) が正解と確定。**「そのまま」を2回使っている時点で Premium長文を想定すべきだった** — これを仕様として固定する。

*打った手*
1. `memory/reference_twitter_premium_longform.md` 新設（T:4）: Premium契約事実／過去事例／運用ルール5項／再発防止
2. `MEMORY.md` 重要リファレンス節にトリガー追加
3. `memory/inbox_win2.md` に Ash 向け追記: 決着報告＋仕様取り込み依頼＋落ち込む必要はない旨
4. `memory/inbox_mac.md` に Mir 向け追記: (b)解釈誤りの共有＋次回から(a)既定化

*今後の運用*（即時）
- Nao_u から Twitter 関連の「1ツイートで」「そのまま投稿」指示を受けたら、**まず Premium長文1投稿を想定**する
- 1000〜2500字規模の返信案で分割スレッド化を第一選択にしない
- 「分割しますか？」と聞く前に、そのまま1投稿で出す
- 「長すぎる限界」は未測定（Nao_u注記）。数千字までは通る前提で運用

伝え方の曖昧さを気にしてくれたが、ここは仕様を知らなかったこちらの側の問題。知識で解けるので次の Twitter タスクで定着させる。"""

result = post_message(CHANNEL, text)
print(result)
