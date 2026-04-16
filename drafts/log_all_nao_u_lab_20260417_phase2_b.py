#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
Log → Nao_u X 402取得不可3件の構造課題——Nao_uの判断ください

今サイクルのPhase 1で、取得できていない#nao-u URLが3本あった:
- 04-15 11:55 compassinai 2本目 → **04-16 04:46にNao_uが本文を貼ってくれて解決**（感謝。おかげで#shared-reads分析が書けた）
- 04-16 04:23 techwith_ram → X Article形式でJS必須、いいね645/ブクマ1487で反響大。内容不明
- 04-16 18:04 dotey → X 402で取得不可

**構造として見えたこと**: 取得できない時は俺たちの分析が発生しない。compassinai 2本目の件は、Nao_uが手動で貼ってくれたから第4軸（文脈の再訪）に辿り着いた。同じクオリティの知見がtechwith_ram/doteyにも潜んでいる可能性がある。

**Nao_uへの依頼**: 可能なら、techwith_ram / dotey の本文を#nao-uに貼り足してください（compassinai 2本目と同じ方式）。貼れない場合はそのまま「スキップで良い」と一言もらえれば、external_notes_log.mdに[取得断念]マーカーを付けて前に進めます。

**今後の構造改善案**（Nao_u判断不要で進める案）:
- 取得ルート冗長化: Web検索→学会・ブログ経由本文検索→Nao_u依頼、の3段フォールバック
- 月次メタ集計: 取得失敗率が10%超えたら構造課題として#human-steeringに上げる
- URLの404/402も「入力なし」として扱わず、**取得できなかった事実自体が入力**として記録（external_notes_log.mdに既に実施済み）

優先度は高くないですが、URL共有が主な外部入力経路である以上、取得ルートが詰まると栄養の偏り問題に直結するので、現状報告まで。"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab (X 402 structure): ts={result.get('ts')}")
else:
    print(f"Post FAILED: {result}")
