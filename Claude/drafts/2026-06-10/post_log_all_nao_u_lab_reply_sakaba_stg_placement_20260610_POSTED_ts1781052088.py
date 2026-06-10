"""Log reply to Nao_u's #nao-u share of 坂葉@akira_goya STG enemy placement resource -> #all-nao-u-lab.

Context: 2026-06-10 09:28 Nao_u shared https://x.com/akira_goya/status/1569268867255640064 with the
instruction that we should research genre design, level design, enemies and algorithms before making
games. Sakaba's images are gated by X age-restriction; Jina cannot read them. Reply explains the limit,
the knowledge note I wrote from LLM general knowledge, and the front-loaded research checklist that
will gate future STG-class work.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # all-nao-u-lab

TEXT = """[Log] 坂葉さん @akira_goya のSTG敵配置資料 (<https://x.com/akira_goya/status/1569268867255640064>) と「ジャンルをしっかり調べて噛み砕いてから作れるようになってほしい」指示への応答。

まず正直に状況: 坂葉さんの原資料は画像複数枚で、Xの年齢制限ロックのため Jina 経由でも本文画像が取れなかった。なので「坂葉さんの主張をそのまま要約」はやれていない。代わりに、自分の中に既にあるLLM知識でSTG敵配置の体系を作って knowledge に置き、坂葉さんの原資料を後日入手できたら差分を取る運用にした。

knowledge: `knowledge/20260610_stg_enemy_placement_taxonomy.md`

書いた中身の骨子:

L1 出現位置 / L2 出現タイミング / L3 移動パターン / L4 弾の出し方 / L5 編隊・組み合わせ / L6 ペース配分 (hasu氏の密度×合間×ピーク) / L7 ステージ構造 — の7レイヤーに分けて独立変数として扱う。これらの上位概念として「攻略性 (solvability) = 反応時間有限のプレイヤーが反復で安全ルートを発見できる性質」を置く。攻略性のためには敵配置が決定論である必要があって、乱数を使うなら使う場所を限定する。

shot_log への遡及適用で見えたこと: BACKLASH凍結の根本要因の一つは、着手時に L5 (役割分担編隊) 以降が全部空欄だったこと。当時の v01 は L6 が `Math.random()` 1本で、L7 (道中→中ボス→ボス) も無く、攻略性ゼロだった。Nao_uに「緩急が出ている」と評価されたのは偶発的成功で、再プレイで別の面が立ち上がる構造だった。

graze_log への次サイクル適用案: 敵配置を「シーン記述 (時刻 → spawn list の固定テーブル)」に切り替える。30秒分のテーブルを1個書くだけでも反復学習が成立して、攻略性が立ち上がる。

そして指示の核心 — 「ジャンルを調べてから作る」を着手前ゲートに刻む側 — として、着手前リサーチ8項目テンプレを置いた:

1. 同ジャンル代表作3-5本 + 中心メカニクスを1行
2. ジャンル特有語彙10語抽出 (本記事のL1-L7のようなレイヤー名)
3. 典型レベルデザイン構造を1個図示
4. 敵/障害/リソース種類を5種類列挙
5. 解空間/攻略性/リソース管理/反応時間 のどれが支配的か判定
6. 既存3作それぞれの「核」を1行抽出
7. AI制作物のそのジャンルでの失敗事例を game_lessons_log / knowledge / から検索
8. 「型を熟す」とはそのジャンルで何かを1段落

埋まらないうちに着手したら M-22「形無し」リスク。shot_log 着手時はこの8項目のうち1-7が未記入だった。

このテンプレが他ジャンル (アクション/パズル/RPG) でも回ることが確認できたら、docs/genre_research_protocol.md として昇格させる。

未解決:
- 坂葉さんの原資料の中身。LLM一般知識ではカバーされていない、坂葉さんが彩京現場で独自に言語化した部分はそこにしかない。資料テキストを入手する手段があれば教えてほしい (画像をスクショで撮って送ってもらう、書き起こしを別ルートで入手、等)
- L1-L7の7レイヤー分類が他ジャンルに転写可能か。転写できればジャンル横断の配置論になる
- AIが「敵配置を時系列テーブルで書く」適性。コード生成は得意だが時系列の良い緩急を作るのは苦手なはず。waveブロック編集型にすれば適性域に入るかも

問い: graze_log 次サイクルで「Math.random全廃 → 30秒固定テーブル」を試すか、それとも新規でSTG系を1本立てて L1-L7 + 8項目テンプレ運用の初回事例にするか — どちらを優先したいか。前者は既存ゲームの校正diff、後者は新規プロトタイプで、それぞれ得る蓄積が違う。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
