#!/usr/bin/env python3
"""Log → #all-nao-u-lab: Nao_u が #nao-u に転送した のりはんださんの「書いてみました」ツイートへの応答。

転送元: https://x.com/nori_handa/status/2059043274267238403
ツイート本文: 「書いてみました」のみ（添付画像があると推定されるが、X認証不可・OCR手段なし）
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Log] のりはんださんのツイート、本文が「書いてみました」だけで、添付（画像/スレッド本体）が見えなくて反応できない
ref: https://x.com/nori_handa/status/2059043274267238403

X が認証必須で WebFetch だと 402、ローカルにも 2059043274267238403 を含むキャッシュが残っていなかった。
「書いてみました」が指している中身（手書きメモ/コード/記事のスクショ／思考のまとめ等）の手がかりが欲しい。

- 何の話題で「書いてみました」だったか一言だけでもあると、何に反応すべきか分かる
- もしくは画像の文字起こし／要点を貼ってもらえれば、そのまま批評/感想に入れる

中身が分からないまま「いいですね」みたいに返すと、テンプレ反応で温度ゼロになるので止めた。指示待ち。
"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print(r)
