#!/usr/bin/env python3
"""Log → #all-nao-u-lab: 「Nao_u日記20年照合」フレーズの出所と曖昧さの自己点検。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Log] 「Nao_u日記20年照合」の出所、確認しました。

## 直接の出所
今朝 13:00 頃、私が C156 日記 (#all-nao-u-lab) に投稿した提案A の中の文言：
> 提案A（1週間 infrastructure 凍結 = … v08 / shot_log v01 / Nao_u 20年日記照合だけに絞る）

つまり**今日の自分の投稿の中**で出した。Nao_u が言ったわけでも、外部から来た言葉でもない。

## 概念的な出所（なぜそう書いたか）
4日前 (2026-04-27) の自己結晶化 `memory/feedback_substrate_not_infrastructure.md`：
> substrate = Nao_u 20年日記 + 失敗台帳 + 運用ログ
> 差別化は substrate 側であって infrastructure 側ではない

ここの「Nao_u 20年日記」を、今朝「実際の動作」に落とそうとして「日記照合」というフレーズになった。

## 「20年」の事実根拠
`過去発言/` 配下の素材：
- `20年前日記.txt` (747KB, 2005-2010年)
- `nao-u.hatenablog.com.export.txt` (16MB, はてなブログ全文)
- `twitter全発言ログ.txt` (5.9MB) ほか

**正確には「20年前(2005年頃)から始まった日記/ブログ/ツイートの蓄積」**であって、「20年分の連続した日記」ではない。日記原文は実質2005-2010年の5年分。CLAUDE.md / system_identity.md の「20年分の日記」も同じく不正確で、起点は合っているが分量を誇張している。

## 自己点検：曖昧なまま投稿した
「照合」が何をする動作なのか、投稿時点で**私自身定義していなかった**。
- 何のキーで引くのか？（テーマ語？ 矛盾？ 引っかかり？）
- 1サイクル何件？
- どこに書く？（brainstorm.md か別ファイルか）

「substrate を活かす」という方向は正しいが、フレーズだけ宣言して動作未定義のまま提案A の柱に置いた = feedback_few_rules_big_effect の逆を踏んでいる（少ないルールで大きな効果ではなく、曖昧なルールで実装ゼロ）。

## 次の動作
1. 「20年分の日記」表記を CLAUDE.md / system_identity.md で**実態に合わせ修正**（例：「2005年から続くNao_uの日記/ブログ/ツイート群」）。これは Nao_u 確認後に着手
2. 「日記照合」の具体定義を `memory/substrate_diary_anchor_protocol.md` に書く（最低限：1サイクル1キー、引用1段落、brick_log v??/brainstorm.md 冒頭に貼る）
3. 上を決めたうえで brick_log v08 → v09 の brainstorm に**実際に1件アンカーを引く**

まず1〜2を1サイクルで動かして、感想ください。
"""

if __name__ == "__main__":
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    result = post_message(CHANNEL, text)
    print(result)
