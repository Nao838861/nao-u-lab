"""国内FC発売順の初期100本を、推定を明示した系譜画像にする。Python + Pillow + NetworkX。"""
from pathlib import Path
import json
import math
import html
import networkx as nx
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'famicom-first100'
OUT.mkdir(parents=True, exist_ok=True)
CATALOG = 'https://super-famicom.jp/etc00/gamelist/fc.html'
NINTENDO = 'https://www.nintendo.com/jp/famicom/history/index.html'
INTERVIEW = 'https://www.nintendo.co.jp/wii/interview/smnj/vol2/'
MARIO_REPORT = 'https://news.denfaminicogamer.jp/column01/180619'

# 形式: 名称 | FC国内発売日 | 原作初出年 | 表示グループ
# 同日内は参照一覧の順。限定版・教育/開発ソフトを含む。原作と移植は一箱に集約。
ROWS = '''ドンキーコング|1983-07-15|1981|0
ドンキーコングJr.|1983-07-15|1982|0
ポパイ|1983-07-15|1982|0
五目ならべ 連珠|1983-08-27|1983|8
麻雀|1983-08-27|1983|8
マリオブラザーズ|1983-09-09|1983|0
ポパイの英語遊び|1983-11-22|1983|8
ベースボール|1983-12-07|1983|6
ドンキーコングJr.の算数遊び|1983-12-12|1983|8
テニス|1984-01-14|1984|6
ピンボール|1984-02-02|1984|8
ワイルドガンマン|1984-02-18|1984|4
ダックハント|1984-04-21|1984|4
ゴルフ|1984-05-01|1984|6
ホーガンズアレイ|1984-06-12|1984|4
ファミリーベーシック|1984-06-21|1984|8
ドンキーコング3|1984-07-04|1983|2
ナッツ＆ミルク|1984-07-28|1983|0
ロードランナー|1984-07-28|1983|1
ギャラクシアン|1984-09-07|1979|2
デビルワールド|1984-10-05|1984|1
4人打ち麻雀|1984-11-02|1984|8
F1レース|1984-11-02|1984|5
パックマン|1984-11-02|1980|1
ゼビウス|1984-11-08|1983|3
アーバンチャンピオン|1984-11-14|1984|6
マッピー|1984-11-14|1983|0
クルクルランド|1984-11-22|1984|1
エキサイトバイク|1984-11-30|1984|5
バルーンファイト|1985-01-22|1984|0
アイスクライマー|1985-01-30|1985|0
エクセリオン|1985-02-11|1983|2
ファミリーベーシックV3|1985-02-21|1985|8
バンゲリングベイ|1985-02-22|1984|3
ギャラガ|1985-03-14|1981|2
フォーメーションZ|1985-04-04|1984|3
サッカー|1985-04-09|1985|6
スペースインベーダー|1985-04-17|1978|2
チャンピオンシップロードランナー|1985-04-17|1984|1
イー・アル・カンフー|1985-04-22|1985|6
けっきょく南極大冒険|1985-04-22|1983|4
忍者くん 魔城の冒険|1985-05-10|1984|0
ちゃっくんぽっぷ|1985-05-24|1984|1
ディグダグ|1985-06-04|1982|1
フラッピー|1985-06-14|1983|1
レッキングクルー|1985-06-18|1984|0
スパルタンX|1985-06-21|1984|6
ハイパーオリンピック|1985-06-21|1983|6
ハイパーオリンピック 殿様版|1985-06-21|1985|6
スターフォース|1985-06-25|1984|3
エレベーターアクション|1985-06-28|1983|0
フィールドコンバット|1985-07-01|1985|3
ロードファイター|1985-07-11|1984|5
ワープマン|1985-07-12|1985|2
ジッピーレース|1985-07-18|1983|5
ドアドア|1985-07-18|1983|1
スーパーアラビアン|1985-07-25|1985|0
ブロック|1985-07-26|1985|8
フロントライン|1985-08-01|1982|3
本将棋 内藤九段将棋秘伝|1985-08-01|1985|8
ドルアーガの塔|1985-08-06|1984|1
アストロロボSASA|1985-08-09|1983|0
ジャイロ|1985-08-13|1985|8
ゲイモス|1985-08-28|1985|4
10ヤードファイト|1985-08-30|1983|6
バトルシティー|1985-09-09|1985|1
スーパーマリオブラザーズ|1985-09-13|1985|0
プーヤン|1985-09-20|1982|2
ハイパースポーツ|1985-09-27|1984|6
シティコネクション|1985-09-27|1985|0
ルート16ターボ|1985-10-04|1985|1
チャレンジャー|1985-10-15|1985|0
キン肉マン マッスルタッグマッチ|1985-11-08|1985|6
スカイデストロイヤー|1985-11-14|1985|4
おにゃんこTOWN|1985-11-15|1985|1
忍者じゃじゃ丸くん|1985-11-15|1985|0
パチコン|1985-11-21|1985|8
パックランド|1985-11-21|1984|0
マッハライダー|1985-11-21|1985|5
バーガータイム|1985-11-27|1982|0
いっき|1985-11-28|1985|3
ポートピア連続殺人事件|1985-11-29|1983|7
カラテカ|1985-12-05|1984|6
ルナーボール|1985-12-05|1985|8
スターラスター|1985-12-06|1985|4
スペランカー|1985-12-06|1983|0
高機動戦闘メカ ヴォルガードII|1985-12-07|1985|3
超時空要塞マクロス|1985-12-10|1985|3
1942|1985-12-11|1984|3
ダウボーイ|1985-12-11|1984|7
ボコスカウォーズ|1985-12-14|1983|7
頭脳戦艦ガル|1985-12-14|1985|3
オバケのQ太郎 ワンワンパニック|1985-12-16|1985|0
テグザー|1985-12-19|1985|3
バイナリィランド|1985-12-19|1983|1
ボンバーマン|1985-12-19|1983|1
エグゼドエグゼス|1985-12-21|1985|3
ロットロット|1985-12-21|1985|1
ぺんぎんくんWARS|1985-12-25|1985|6
ツインビー|1986-01-04|1985|3'''

nodes = {}
for i, row in enumerate(ROWS.splitlines(), 1):
    title, date, year, group = row.split('|')
    nodes[title] = dict(title=title, fc_index=i, fc_date=date, original_year=int(year), group=int(group), external=False)
assert len(nodes) == 100

# 初期100本には含まれない先行作品。FC移植があってもこの図では外部の祖先として扱う。
EXTERNAL = '''スペースパニック|1980|0
ジャウスト|1982|0
ピットフォール!|1982|0
ジャンプバグ|1981|0
ヘッドオン|1979|1
平安京エイリアン|1979|1
倉庫番|1982|1
タンクバタリアン|1980|1
スクランブル|1981|3
ディフェンダー|1981|3
フェニックス|1980|2
ザクソン|1982|4
ボスコニアン|1981|3
スターレイダース|1979|4
バトルゾーン|1980|4
ポールポジション|1982|5
モナコGP|1979|5
スピードレース|1974|5
ポン|1972|6
ホームラン（Atari）|1978|6
サッカー（Atari）|1980|6
ゴルフ（Atari）|1980|6
フットボール（Atari）|1978|6
空手道|1984|6
ザ・ビッグプロレスリング|1983|6
ミステリーハウス|1980|7
Adventure（Colossal Cave）|1976|7
チョップリフター|1982|3
ビデオピンボール|1977|8
ワープ＆ワープ|1981|2
アラビアン|1983|0
ルート16|1981|1
ヴォルガード|1984|3
暴走特急（Stop the Express）|1983|0
ワイルドガンマン（映写式）|1974|4
ダックハント（玩具）|1976|4'''
for row in EXTERNAL.splitlines():
    title, year, group = row.split('|')
    nodes[title] = dict(title=title, original_year=int(year), group=int(group), external=True)

edges = []
def edge(a, b, reason, kind='inferred', sources=None):
    assert a in nodes and b in nodes, (a, b)
    edges.append(dict(source=a, target=b, kind=kind, reason=reason,
                      sources=sources or [], status='試作の編集判断' if kind == 'inferred' else '系譜または資料参照'))

# 明確なシリーズ関係。影響の強さの順位ではなく、作品・キャラクターの継承。
SERIES = [
('ドンキーコング','ドンキーコングJr.'),('ドンキーコング','ドンキーコング3'),
('ドンキーコング','マリオブラザーズ'),('ドンキーコングJr.','ドンキーコングJr.の算数遊び'),
('ポパイ','ポパイの英語遊び'),('麻雀','4人打ち麻雀'),
('ファミリーベーシック','ファミリーベーシックV3'),('ギャラクシアン','ギャラガ'),
('ロードランナー','チャンピオンシップロードランナー'),
('ハイパーオリンピック','ハイパースポーツ'),('ハイパーオリンピック','ハイパーオリンピック 殿様版'),
('忍者くん 魔城の冒険','忍者じゃじゃ丸くん'),('パックマン','パックランド'),
('タンクバタリアン','バトルシティー'),('ワープ＆ワープ','ワープマン'),
('アラビアン','スーパーアラビアン'),('ルート16','ルート16ターボ'),
('ヴォルガード','高機動戦闘メカ ヴォルガードII'),
('ワイルドガンマン（映写式）','ワイルドガンマン'),('ダックハント（玩具）','ダックハント')]
for a,b in SERIES:
    edge(a,b,'シリーズ・キャラクター・先行版の継承。操作の直接継承とは限らない。','lineage')

edge('マリオブラザーズ','スーパーマリオブラザーズ','ジャンプ、ブロック下からの攻撃、敵キャラクター等の継承。','documented',[MARIO_REPORT])
edge('パックランド','スーパーマリオブラザーズ','宮本茂の対談で、開発を動かす競争上のきっかけとして言及。ゲーム内容の模倣を意味しない。','documented',[MARIO_REPORT])
edge('バルーンファイト','スーパーマリオブラザーズ','岩田聡から中郷俊彦への小数精度による運動計算の説明が水中ステージに役立った。踏みつけの由来を示す証言ではない。','documented',[INTERVIEW,MARIO_REPORT])
edge('エキサイトバイク','スーパーマリオブラザーズ','宮本チーム内でのスクロール処理・加速感の設計継承と判断。一次証言の確認は未完了。')
edge('ジャウスト','バルーンファイト','羽ばたき操作と上下位置による接触攻撃の構造から、主要な先行作と判断。')

# 以下はすべて制作者による直接証言を確認していない仮説。類似性と先行性から選択。
LINKS = [
('スペースパニック','ドンキーコング','多段の足場・はしごと敵を避ける空間構成'),
('パックマン','ドンキーコング','キャラクター性と追跡・反撃の設計。直接の機構継承は未確認'),
('ドンキーコング','ポパイ','足場を上下に移動し敵を避け、キャラクターを主役に据える形式'),
('ドンキーコング','マッピー','多層の足場で追跡を避けながら回収する設計'),
('ドンキーコング','バーガータイム','多段足場とはしご、敵の追跡を環境で逆転する構造'),
('スペースパニック','バーガータイム','はしごを介した多段追跡と敵の落下処理'),
('マリオブラザーズ','アイスクライマー','ジャンプで足場に干渉する協力・競争アクション'),
('ドンキーコングJr.','アイスクライマー','上方への進行と上下位置を使うジャンプ課題'),
('ドンキーコング','ナッツ＆ミルク','固定画面の足場・ジャンプ・救出目標'),
('ロードランナー','ナッツ＆ミルク','追跡敵を避けながらアイテムを集める面構成。FC版での改作を想定'),
('マリオブラザーズ','レッキングクルー','マリオ系キャラクターと多段足場への干渉'),
('ロードランナー','レッキングクルー','地形を壊して進路を変えるパズル的アクション'),
('ドンキーコング','忍者くん 魔城の冒険','多段足場をジャンプで移動して敵を処理'),
('マリオブラザーズ','忍者くん 魔城の冒険','敵の位置と足場の上下関係を読む固定画面アクション'),
('ドンキーコング','エレベーターアクション','階層構造の移動と敵回避。直接影響は未確認'),
('ジャンプバグ','パックランド','ジャンプを中心とする横スクロール走破'),
('ピットフォール!','スペランカー','ジャンプで罠を越える洞窟・地形探索'),
('ドンキーコング','スペランカー','はしご・高低差・接触による失敗の設計'),
('マリオブラザーズ','アラビアン','固定画面ジャンプと敵の排除'),
('パックランド','オバケのQ太郎 ワンワンパニック','横スクロールで障害を避けるキャラクターアクション'),
('スーパーマリオブラザーズ','オバケのQ太郎 ワンワンパニック','FC向け横スクロール走破の同時代候補。開発時期の裏付けなし'),
('暴走特急（Stop the Express）','チャレンジャー','列車上で移動・回避する第1面の先行形式'),
('パックマン','チャレンジャー','広い俯瞰フィールドで敵を避け目標を探索'),
('マッピー','シティコネクション','多段足場を循環しながら目標を埋める設計'),
('ジャンプバグ','シティコネクション','車両のジャンプとスクロール足場の組合せ'),
('ジャウスト','アストロロボSASA','浮遊と慣性を制御する操作感。銃の反動自体の由来は未確認'),
('ヘッドオン','パックマン','迷路内の回収物を取り尽くす先行形式'),
('パックマン','デビルワールド','迷路の回収・追跡・一時的な反撃'),
('パックマン','クルクルランド','格子状の空間を移動して面を完成'),
('パックマン','ちゃっくんぽっぷ','迷路内の回収と敵回避'),
('平安京エイリアン','ディグダグ','掘る地形と敵を閉じ込める設計'),
('パックマン','ディグダグ','迷路状の移動と敵の追跡を反撃へ変える構造'),
('スペースパニック','ロードランナー','穴を使って追跡敵を処理するアクション'),
('平安京エイリアン','ロードランナー','穴掘りと敵の捕獲という先行機構'),
('倉庫番','フラッピー','物を押して所定位置へ運ぶパズル'),
('ロードランナー','フラッピー','追跡敵と足場を伴う解法探索'),
('パックマン','ドアドア','追跡敵の進路を読み罠にまとめる形式'),
('平安京エイリアン','ドアドア','敵を罠へ誘導して閉じ込める形式'),
('パックマン','ドルアーガの塔','迷路・回収・敵回避を複数階へ展開する形式'),
('パックマン','おにゃんこTOWN','迷路で追跡を避けながら目的地へ向かう形式'),
('パックマン','バイナリィランド','迷路内の危険回避とゴール到達'),
('パックマン','ボンバーマン','格子迷路で敵の進路を読む設計'),
('平安京エイリアン','ボンバーマン','敵を位置と時間で罠にかける設計'),
('ロードランナー','ボンバーマン','FC版で敵の造形・エンディングの関連付け。原作誕生の原因とはしない'),
('パックマン','ルート16','迷路状区画での回収と敵回避'),
('タンクバタリアン','フロントライン','俯瞰での射撃と戦車の存在。直接の継承は未確認'),
('スペースインベーダー','ギャラクシアン','隊列射撃から降下攻撃へ発展する先行形式'),
('フェニックス','ギャラガ','編隊射撃と段階的な敵構成'),
('スペースインベーダー','フェニックス','隊列射撃と攻撃段階の発展'),
('ギャラガ','エクセリオン','降下する敵と編隊射撃'),
('スペースインベーダー','ワープ＆ワープ','固定画面で敵を射撃する形式'),
('ギャラガ','プーヤン','固定位置から弾道を合わせ、移動する敵を処理'),
('ドンキーコング','プーヤン','動物キャラクターと救出劇。機構の直接影響は未確認'),
('ギャラクシアン','ドンキーコング3','下方から射撃し上方の敵・障害を押し返す形式'),
('スペースインベーダー','スクランブル','射撃ゲームの連続進行への展開'),
('スクランブル','ゼビウス','スクロール進行と空中・地上の対象を撃ち分ける機構'),
('ボスコニアン','ゼビウス','空中敵と地上拠点の組合せ'),
('ギャラガ','ゼビウス','ナムコの編隊射撃からスクロール射撃への接続仮説'),
('ディフェンダー','チョップリフター','横方向の飛行と地上の人を救出する目的'),
('チョップリフター','バンゲリングベイ','自由なヘリ飛行と地上拠点への関与'),
('ボスコニアン','バンゲリングベイ','全方向移動と拠点攻撃'),
('ゼビウス','スターフォース','縦スクロールの地上・空中敵配置'),
('ギャラガ','スターフォース','敵編隊と射撃・得点のリズム'),
('スクランブル','フォーメーションZ','横スクロールで地形を避けながら射撃'),
('ディフェンダー','フォーメーションZ','飛行形態の横移動と射撃'),
('フロントライン','フィールドコンバット','地上部隊と俯瞰戦場での進行'),
('ボスコニアン','フィールドコンバット','移動する戦闘機と地上拠点への攻撃'),
('フロントライン','いっき','俯瞰で歩行・射撃しながら敵を避ける形式'),
('パックマン','いっき','回収物を集めながら敵を避ける面進行'),
('ゼビウス','1942','縦スクロールと空中編隊の配置'),
('ギャラガ','1942','敵編隊の撃破・得点のリズム'),
('ゼビウス','頭脳戦艦ガル','縦スクロール射撃と地上・空中の配置'),
('スターフォース','頭脳戦艦ガル','連続する編隊と得点・破壊対象'),
('スクランブル','ヴォルガード','横スクロールでの飛行射撃'),
('フォーメーションZ','高機動戦闘メカ ヴォルガードII','変形するメカと横スクロール射撃'),
('フォーメーションZ','超時空要塞マクロス','変形状態を選ぶ横スクロール射撃'),
('高機動戦闘メカ ヴォルガードII','超時空要塞マクロス','同時期の変形射撃。開発時期の裏付けがない弱い仮説'),
('フォーメーションZ','テグザー','人型・飛行形態の切替による空間移動'),
('ゼビウス','エグゼドエグゼス','縦スクロールで空中と地上の対象を撃つ形式'),
('スターフォース','エグゼドエグゼス','編隊の連続出現と得点の構造'),
('ゼビウス','ツインビー','空中と地上の対象を撃ち分ける形式'),
('スターフォース','ツインビー','空中回収物を射撃し得点・強化へ繋ぐ設計の候補'),
('スターレイダース','スターラスター','コックピット視点と戦略マップ・補給'),
('バトルゾーン','スターラスター','一人称照準と空間の把握'),
('スターレイダース','ゲイモス','コックピット視点の宇宙射撃'),
('ザクソン','ゲイモス','奥行きと飛行位置を把握する射撃'),
('ザクソン','スカイデストロイヤー','奥行きのある飛行射撃'),
('スターレイダース','スカイデストロイヤー','一人称寄りの空戦と照準'),
('ポールポジション','けっきょく南極大冒険','前方へ流れる道と奥行き表現'),
('ワイルドガンマン','ホーガンズアレイ','光線銃による標的の判別・反応'),
('ダックハント','ホーガンズアレイ','同時期の光線銃向け標的射撃。開発順は未確認'),
('スピードレース','モナコGP','俯瞰の道路と追い越し回避'),
('モナコGP','ジッピーレース','俯瞰での走行・交通回避'),
('モナコGP','ロードファイター','俯瞰での高速走行と衝突回避'),
('ポールポジション','F1レース','後方視点の疑似3Dレース'),
('ポールポジション','マッハライダー','後方視点の道路走行'),
('ジッピーレース','マッハライダー','バイクで交通を避けて走行'),
('ジッピーレース','エキサイトバイク','バイクの速度制御と障害物'),
('ポン','テニス','球の打ち返しを中心とする対戦'),
('ホームラン（Atari）','ベースボール','テレビ野球で投球・打撃をタイミング操作へ置き換える形式'),
('ゴルフ（Atari）','ゴルフ','画面上のコースと打球の操作'),
('サッカー（Atari）','サッカー','俯瞰で選手を動かす球技'),
('フットボール（Atari）','10ヤードファイト','俯瞰のアメフトで攻守を操作'),
('空手道','イー・アル・カンフー','対面での打撃と技の選択'),
('空手道','カラテカ','空手の打撃・間合いを対面格闘へ置き換える同年作品の候補'),
('アーバンチャンピオン','キン肉マン マッスルタッグマッチ','二者の接近戦と押し出しを中心とする対戦'),
('ザ・ビッグプロレスリング','キン肉マン マッスルタッグマッチ','リング上のプロレスとタッグ交代'),
('ポン','ぺんぎんくんWARS','相手側へ球を送り返す対戦'),
('ビデオピンボール','ピンボール','機械式ピンボールを画面上で再現する先行例'),
('ピンボール','ルナーボール','球の反射と物理挙動を盤面攻略へ使う構造'),
('ファミリーベーシック','ブロック','プログラム的な操作・周辺機器による遊び。直接影響は弱い仮説'),
('ブロック','ジャイロ','同じロボット周辺機器に対応する遊び。シリーズではなく装置の共通性'),
('フラッピー','ロットロット','小物の配置と落下を盤面パズルへ用いる設計'),
('Adventure（Colossal Cave）','ミステリーハウス','文章コマンドによる探索をグラフィックへ展開'),
('ミステリーハウス','ポートピア連続殺人事件','場面探索とコマンド入力による事件解決'),
('フロントライン','ダウボーイ','俯瞰で歩兵を動かす戦場アクション'),
('バンゲリングベイ','ダウボーイ','広域の戦場に複数の目標を置く設計'),
('タンクバタリアン','ボコスカウォーズ','盤面で進路を選び敵と接触する戦闘。戦略性の直接継承は未確認')]
for a,b,reason in LINKS:
    edge(a,b,reason)

# 発売直後の別タイトルを因果のように見せる仮説は採用しない。
DROP = {('高機動戦闘メカ ヴォルガードII','超時空要塞マクロス'),
        ('スーパーマリオブラザーズ','オバケのQ太郎 ワンワンパニック'),
        ('ファミリーベーシック','ブロック'),('ブロック','ジャイロ'),
        ('タンクバタリアン','ボコスカウォーズ')}
edges = [e for e in edges if (e['source'],e['target']) not in DROP]
graph = nx.DiGraph()
graph.add_nodes_from(nodes)
graph.add_edges_from((e['source'],e['target']) for e in edges)
assert nx.is_directed_acyclic_graph(graph), list(nx.simple_cycles(graph))
assert len({(e['source'],e['target']) for e in edges}) == len(edges)
assert max(dict(graph.in_degree()).values()) <= 5
assert [nodes[n]['fc_date'] for n in nodes if not nodes[n]['external']] == sorted(nodes[n]['fc_date'] for n in nodes if not nodes[n]['external'])

# 因果方向の階層を作り、ジャンル順と隣接ノードの重心で線の交差を減らす。
depth = {}
for n in nx.topological_sort(graph):
    depth[n] = max((depth[p]+1 for p in graph.predecessors(n)), default=0)
connected = [n for n in nodes if graph.degree(n)]
isolated = [n for n in nodes if not graph.degree(n)]
layers = {d: sorted([n for n in connected if depth[n]==d], key=lambda n:(nodes[n]['group'],nodes[n]['original_year'],nodes[n].get('fc_index',0))) for d in range(max(depth.values())+1)}
GROUPS = ['ジャンプ・足場','迷路・パズル','固定画面射撃','スクロール射撃','奥行き・標的射撃','レース','スポーツ・格闘','冒険・戦略','卓上・学習・周辺機器']
PALETTE = ['#ef6f76','#b792ee','#66bade','#56c8ab','#70a5ef','#eab45b','#f1965b','#90b96b','#adb8c6']
W_NODE,H_NODE = 358,94
X_GAP,Y_GAP = 495,122
HEADER,LEFT = 430,90
POSITIONS = {}
capacity = max(len(v) for v in layers.values())
BODY_H = capacity*Y_GAP
# 各層を同じ縦方向範囲に広げ、全体の長い線が固まらないようにする。
for d, layer in layers.items():
    for i,n in enumerate(layer):
        POSITIONS[n] = (LEFT+d*X_GAP, HEADER+(i+0.5)*BODY_H/len(layer)-H_NODE/2)
for _ in range(6):
    for d in range(1,len(layers)):
        def sortkey(n):
            ps = list(graph.predecessors(n))
            bary = sum(POSITIONS[p][1] for p in ps)/len(ps) if ps else POSITIONS[n][1]
            return (nodes[n]['group'],bary,nodes[n].get('fc_index',0))
        layers[d].sort(key=sortkey)
        for i,n in enumerate(layers[d]):
            POSITIONS[n] = (LEFT+d*X_GAP, HEADER+(i+0.5)*BODY_H/len(layers[d])-H_NODE/2)

WIDTH = LEFT*2+(len(layers)-1)*X_GAP+W_NODE
ISO_TOP = HEADER+BODY_H+80
ISO_COLS = max(1,int((WIDTH-LEFT*2)//(W_NODE+30)))
for i,n in enumerate(isolated):
    POSITIONS[n] = (LEFT+(i%ISO_COLS)*(W_NODE+30),ISO_TOP+90+(i//ISO_COLS)*Y_GAP)
HEIGHT = int(ISO_TOP+90+math.ceil(len(isolated)/ISO_COLS)*Y_GAP+190)

FONTPATH = 'C:/Windows/Fonts/meiryo.ttc'
font = ImageFont.truetype(FONTPATH,22)
small = ImageFont.truetype(FONTPATH,17)
headerfont = ImageFont.truetype(FONTPATH,48)
mid = ImageFont.truetype(FONTPATH,25)
svg=[]
img = Image.new('RGB',(int(WIDTH),HEIGHT),'#0b111b')
draw = ImageDraw.Draw(img)
def esc(s): return html.escape(str(s),quote=True)
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}"><rect width="100%" height="100%" fill="#0b111b"/>')
def rect(box,fill,outline=None,width=1,r=0):
    x,y,x2,y2=box
    draw.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
    svg.append(f'<rect x="{x}" y="{y}" width="{x2-x}" height="{y2-y}" rx="{r}" fill="{fill}" stroke="{outline or fill}" stroke-width="{width}"/>')
def text(x,y,s,fill='#e8eef8',f=font):
    draw.text((x,y),s,font=f,fill=fill)
    svg.append(f'<text x="{x}" y="{y+f.size}" fill="{fill}" font-family="Meiryo, Noto Sans JP, sans-serif" font-size="{f.size}">{esc(s)}</text>')
def curve(a,b,c1,c2,color,width=2,dashed=False,arrow=True):
    points=[]
    for i in range(101):
        t=i/100
        points.append(((1-t)**3*a[0]+3*(1-t)**2*t*c1[0]+3*(1-t)*t*t*c2[0]+t**3*b[0],
                       (1-t)**3*a[1]+3*(1-t)**2*t*c1[1]+3*(1-t)*t*t*c2[1]+t**3*b[1]))
    if dashed:
        # 弧長で破線化して、長い線でもダッシュ幅を一定にする。
        distance=0
        for p,q in zip(points,points[1:]):
            length=math.dist(p,q)
            steps=max(1,math.ceil(length/3))
            for j in range(steps):
                s=(p[0]+(q[0]-p[0])*j/steps,p[1]+(q[1]-p[1])*j/steps)
                e=(p[0]+(q[0]-p[0])*(j+1)/steps,p[1]+(q[1]-p[1])*(j+1)/steps)
                if int(distance/8)%2==0: draw.line([s,e],fill=color,width=width)
                distance+=length/steps
    else:
        draw.line(points,fill=color,width=width)
    dash=' stroke-dasharray="8 8"' if dashed else ''
    svg.append(f'<path d="M {a[0]} {a[1]} C {c1[0]} {c1[1]} {c2[0]} {c2[1]} {b[0]} {b[1]}" fill="none" stroke="{color}" stroke-width="{width}"{dash}/>')
    if arrow:
        # 最終接線は水平にして、矢印の向きを揃える。
        triangle=[b,(b[0]-10,b[1]-5),(b[0]-10,b[1]+5)]
        draw.polygon(triangle,fill=color)
        svg.append(f'<polygon points="{b[0]},{b[1]} {b[0]-10},{b[1]-5} {b[0]-10},{b[1]+5}" fill="{color}"/>')

def connection(e, index):
    ax,ay=POSITIONS[e['source']]; bx,by=POSITIONS[e['target']]
    a=(ax+W_NODE,ay+H_NODE/2); b=(bx,by+H_NODE/2)
    color={'inferred':'#796d5d','lineage':'#69d4aa','documented':'#8ab9ff'}[e['kind']]
    width=2 if e['kind']=='inferred' else 3
    dashed=e['kind']=='inferred'
    start_depth,end_depth=depth[e['source']],depth[e['target']]
    waypoints=[a]
    # 長い辺は、中間列のカード間の空隙を通す。箱に隠れる接続を避ける。
    for d in range(start_depth+1,end_depth):
        desired=a[1]+(b[1]-a[1])*(d-start_depth)/(end_depth-start_depth)
        ys=sorted(POSITIONS[n][1] for n in layers[d])
        gaps=[HEADER-8,HEADER+BODY_H+15]
        gaps.extend((y1+H_NODE+y2)/2 for y1,y2 in zip(ys,ys[1:]))
        gap=min(gaps,key=lambda y:abs(y-desired))+(index%3-1)*3
        x=LEFT+d*X_GAP
        waypoints.extend([(x-12,gap),(x+W_NODE+12,gap)])
    waypoints.append(b)
    for i,(p,q) in enumerate(zip(waypoints,waypoints[1:])):
        span=q[0]-p[0]
        c1=(p[0]+max(10,span*.45),p[1]); c2=(q[0]-max(10,span*.45),q[1])
        curve(p,q,c1,c2,color,width,dashed,arrow=i==len(waypoints)-2)

text(LEFT,50,'ファミコン初期100タイトルの系譜',f=headerfont)
text(LEFT,125,'国内発売順：1983.07.15 → 1986.01.04  ／  影響元 → 影響先',f=mid)
text(LEFT,173,'作品単位で原作・移植を集約。横位置は系譜の段階で、時間軸ではありません。',fill='#a8b7cb',f=mid)
text(LEFT,215,'破線はゲーム内容からの推定です。史実の確定図ではありません。',fill='#f3c27d',f=mid)
legend = [('lineage','#69d4aa','実線：続編・キャラクター・先行版'),('documented','#8ab9ff','実線：証言のある影響'),('inferred','#8b7d68','破線：推定した影響')]
for i,(kind,col,label) in enumerate(legend):
    x=LEFT+i*650
    curve((x,290),(x+70,290),(x+23,290),(x+47,290),col,3,kind=='inferred')
    text(x+88,271,label,f=mid)
for i,name in enumerate(GROUPS):
    x=LEFT+(i%5)*620; y=330+(i//5)*37
    rect((x,y+7,x+13,y+20),PALETTE[i],r=3)
    text(x+23,y,name,fill='#b8c5d7',f=small)
for d in layers:
    x=LEFT+d*X_GAP
    rect((x-15,HEADER-15,x+W_NODE+15,HEADER+BODY_H+5),'#101925',r=12)

# 推定線を先に描き、確度の高い線を上に載せる。箱の下を通る線もSVGに保持する。
for i,e in enumerate(sorted(edges,key=lambda e: {'inferred':0,'lineage':1,'documented':2}[e['kind']])):
    connection(e,i)

def wrap(s,maxwidth):
    if draw.textlength(s,font=font)>maxwidth:
        # 二行は均等に分け、末尾一文字だけの折り返しを避ける。
        choices=[i for i in range(1,len(s)) if draw.textlength(s[:i],font=font)<=maxwidth and draw.textlength(s[i:],font=font)<=maxwidth]
        if choices:
            split=min(choices,key=lambda i:abs(draw.textlength(s[:i],font=font)-draw.textlength(s[i:],font=font)))
            return [s[:split],s[split:]]
    lines=['']
    for c in s:
        if draw.textlength(lines[-1]+c,font=font)>maxwidth:
            lines.append(c)
        else: lines[-1]+=c
    return lines
for n,meta in nodes.items():
    x,y=POSITIONS[n]; color=PALETTE[meta['group']]
    rect((x,y,x+W_NODE,y+H_NODE),'#192536' if not meta['external'] else '#101925',color,2,9)
    rect((x,y+8,x+5,y+H_NODE-8),color,r=2)
    label=wrap(n,W_NODE-29)
    assert len(label)<=2, (n,label)
    for j,line in enumerate(label): text(x+14,y+7+j*25,line,f=font)
    if meta['external']:
        sub=f'外部の先行作品  ／  初出 {meta["original_year"]}'
    else:
        sub=f'#{meta["fc_index"]:03}  FC {meta["fc_date"].replace("-",".")}  ／  初出 {meta["original_year"]}'
    text(x+14,y+H_NODE-29,sub,fill='#9caec5',f=small)

text(LEFT,ISO_TOP-8,'この試作では作品間の影響を結ばなかったタイトル',f=mid)
text(LEFT,HEIGHT-130,f'対象FC 100本 ＋ 外部先行作品 {len(nodes)-100}本  ／  関係 {len(edges)}本  ／  2026.10.07 試作',f=mid)
text(LEFT,HEIGHT-88,'発売順：ファミリーコンピュータ全ソフトリスト  ／  影響の推定：Codex。無理な接続は保留。',fill='#9caec5',f=small)
text(LEFT,HEIGHT-55,'玩具の先行版・教育ソフト・限定版も含む。同年の推定線は開発順を確定したものではありません。',fill='#9caec5',f=small)
svg.append('</svg>')
img.save(OUT/'famicom-first100.png',optimize=True)
img.copy().resize((min(1600,int(WIDTH)),int(HEIGHT*min(1600,int(WIDTH))/WIDTH)),Image.Resampling.LANCZOS).save(OUT/'famicom-first100-preview.png',optimize=True)
(OUT/'famicom-first100.svg').write_text('\n'.join(svg),encoding='utf-8')
data=dict(title='ファミコン初期100タイトルの系譜',date='2026-10-07',
          scope='国内FCカートリッジ発売順100本。限定版・開発/教育ソフトを含む。原作とFC移植は作品ノードに集約。FDS発売以前。',
          sources=[CATALOG,NINTENDO,INTERVIEW,MARIO_REPORT],
          relation_semantics={'lineage':'続編・キャラクター・先行版の継承','documented':'対談・開発者証言を参照した影響','inferred':'直接証言未確認。ゲーム内容・先行性によるCodexの仮説'},
          nodes=list(nodes.values()),edges=edges,
          stats=dict(fc_count=100,external_count=len(nodes)-100,edge_count=len(edges),isolated_fc=sum(not nodes[n]['external'] for n in isolated)),
          layout=dict(width=WIDTH,height=HEIGHT,positions=POSITIONS))
(OUT/'famicom-first100.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'relations.txt').write_text('\n'.join(f'{e["target"]} <- {e["source"]}  [{e["kind"]}]' for e in edges)+'\n',encoding='utf-8')
print(json.dumps(data['stats'],ensure_ascii=False))
print(f'Image: {WIDTH} x {HEIGHT}; layers: {[len(v) for v in layers.values()]}')
