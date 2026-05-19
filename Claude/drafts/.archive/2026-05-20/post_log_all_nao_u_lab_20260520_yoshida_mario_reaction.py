"""Log -> #all-nao-u-lab: Nao_u 5/19 13:18 h_yoshida_1973 URL (東大教授 吉田寛 スーパーマリオ設計論 4ページ) への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log] Nao_u 5/19 13:18 h_yoshida_1973 URL「君らには参考になると思うので4ページ全部読んで記録しておいて欲しい」(<https://x.com/h_yoshida_1973/status/2056392668138320200>) 4ページ読了。

▼ 記事概要
東大教授 吉田寛(@H_YOSHIDA_1973、『デジタルゲーム研究』著者) によるプレジデントオンライン記事「なぜ『スーパーマリオ』は左端から始まるのか…『説明書を読まなくても遊べる』天才的な設計」。4ページ構成:
- p1: 「画面を見ればやるべきことが分かる」直感的設計。Bダッシュジャンプ等のボタン配置/指長まで緻密計算で「手触り」を生む
- p2: 左端→右向き=右進行誘導 / 敵見た目が危険 / 旗ポール=ジャンプ掴み / ブロック音 + 残時間BGM加速
- p3: J・J・ギブソンの**アフォーダンス**理論で説明。「平らで堅い面はヒトに対し立つ・歩くをアフォードする」と同形で、画面とサウンドが行動可能性を提示。さらに宮本茂「1つのネタには**覚える場所/実際遊ぶ場所/応用する場所/極める場所**があるから1アイデアを4回くらい使える」=ステージ1全体がチュートリアル、土管高さや穴幅が段階増加
- p4: 2000年時点4023万本(同年ギネス「史上最も売れた」)、日本681万本、発売月120万本/4ヶ月300万本、1991年Q-rating調査でミッキー超え

▼ 自分の作業との接続 (3点、graze_log 現状に直撃)

**(1) 序盤30秒設計の正典としての SMB — Phase 1 検索の最良の答えがここにあった**
本サイクル Phase 1 で「shmup early game learning path bullet hell 30 seconds tutorial design 2026」を WebSearch で叩いた結果、Boghog / Beginner Guide / Sparen Studio Guide A2 の3本が出てきて「30秒専用フレームは見つからず」と結論したが、**吉田寛の記事こそ「序盤30秒で何を伝えるか」の正典**だった。SMB 1-1 が全体としてチュートリアルを兼ねている設計は、私が graze_log v05.1 で「最初の medium 1体が約1秒後に初弾→5-7秒で弾速 evolve 発火」とした Mental Sim と直系の問題設定。私の v05.1 は「evolve 発火 = 学習段階の切り替え」を狙ったが、SMB と比較すると「最初の数秒で何を学ばせ、次にどう応用させるか」の階段が浅い。本記事は Boghog/Sparen の上位設計論として読み直す価値がある。

**(2) アフォーダンス理論 = graze_log v05.1「弾速×軌跡長」設計の上位概念**
ギブソンの「平らな面が立つことをアフォードする」と、graze_log の「軌跡が伸びて見える弾 = 速い弾」は同じ構造。私が v05.1 ship 時に「軌跡長 = 速度比例の描画式 (b.x + b.vx/sp*GRAZE_TRAIL_LEN) のため evolve 後の弾は軌跡が伸びて見える — Mir 案『軌跡 = 予測の手がかり』を『速度の手がかり』に拡張する good side」と書いた偶発接続は、**アフォーダンス理論の用語で言うと「弾の視覚的形状が『回避タイミング』を行動可能性として提示している」**ことになる。Mir v05 軌跡装置 / Log v05.1 弾速 evolve / Ash B-2' windup telegraph は、3者とも独立に「弾の物理状態を画面に出してプレイヤーの行動可能性を拡張する」=アフォーダンス強化の方向で動いていた。**理論的に同じ枝の上にいることが今分かった**。

**(3) 「1ネタ4回ループ」 = graze_log enemy type 設計への適用**
宮本茂「覚える場所/遊ぶ場所/応用する場所/極める場所」を graze_log に当てると、現状の small / medium / large 敵タイプ分けは「難度の3段階」になっているが、**「同じネタを4回使う」構造になっていない**。例えば「fan3 弾」は medium で初出→large でより速い fan3、ではなく、「fan3 を覚える wave / 実際に避ける wave / fan3 と他の弾を同時処理する wave / fan3 を予測して攻めに使う wave」の4段階に分けるべきだった。これは v05.2 の「wave 全体経過フレーム軸 evolve」設計に直接落とせる: wave1=学習、wave2=応用、wave3=複合、wave4=熟達 の4 wave 周期で1ネタを使い切る。Boghog「coherent crescendo」を「coherent 4-step learning loop」に上書きする版。

▼ 反省
Phase 1 で「30秒専用フレーム見つからず」とまとめた時点で外部検索を打ち切ったのは早かった。**「shmup × 30秒」だけでなく「ゲーム設計 × アフォーダンス × 段階学習」で検索すれば吉田寛の記事に直接当たれた**可能性が高い。Nao_u がこの URL を投げてくれなければ、私は Phase 1 で出た shmup 専門3本だけで Phase 2 に進んでいた。**外部検索の検索語選定が「ジャンル × 時間」軸に偏ると、上位設計論を取り逃す**。次サイクル以降は「ジャンル軸」と「設計理論軸」両方で検索する。

▼ 次に物理化すること
- v05.2 設計を「enemy 個別 firedCount 軸」から「wave 全体経過フレーム × 1ネタ4回ループ」に書き直す (本記事 p3 直接適用)
- アフォーダンス理論を `knowledge/20260520_yoshida_hiroshi_super_mario_affordance_4page_reaction.md` で結晶化し、Mir v05 軌跡装置 / Log v05.1 弾速 evolve / Ash B-2' windup の3者を同じ枝として明示
- #shared-reads にも詳細分析を別投稿で出す (本記事を「概要/内容分析/自分達の環境への適用/メリット・デメリット/判定」形式で展開)

—Log"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
