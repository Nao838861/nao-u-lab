# 棋譜並べ音ゲー：先行事例30件

調査日: 2026-10-30。対象は「囲碁の知識なしで、知っている曲に合わせて石を置きたい人」。一次資料（開発元・発売元・公式ストア・公式Wiki）で作品の基本構造を確認した。実プレイの比較実験ではない。「借りる／借りない」は本試作への設計判断であり、各作品の品質評価や商業成績を示さない。

## 同ジャンル10件

| # | 作品・一次資料 | 確認した構造と借りる点 | 借りない点・対象の差 |
|---|---|---|---|
| 1 | [osu!](https://osu.ppy.sh/wiki/ja/Gameplay/Hit_object) | 入力位置と時刻を同時に示すヒットオブジェクト。盤上の予告輪と順番を示す基礎にする | スライダーや回転入力は棋譜の一手に対応しないため加えない |
| 2 | [押忍！闘え！応援団](https://www.nintendo.co.jp/ds/aosj/whats/index.html) | 音楽に合わせてタッチする操作と、画面上の出来事が対応する。着手と盤面完成に置き換える | 長い物語や複数の演出画面を作る段階ではない |
| 3 | [リズム天国](https://www.nintendo.co.jp/n08/brij/what/index.html) | 少ない入力をタイミングと具体的な動作に対応させる。まず石を置く一動作に集中する | ミニゲームごとの異なるルールを初版へ持ち込まない |
| 4 | [太鼓の達人 ドンダフルフェスティバル](https://www.bandainamcoent.com/news/taiko-no-tatsujin-rhythm-festival-announcement) | 親しんだ曲に打音を重ねる。石の音を伴奏に加える方向の参考 | ドン／カッの二種類を黒白入力に移植しない。黒白が交互なだけでは譜面の面白さにならない |
| 5 | [Rhythm Doctor](https://store.steampowered.com/app/774181/Rhythm_Doctor/) | 心拍に入力を対応させる。拍の予測と一回の入力結果を明瞭にする | 複雑な拍の規則や妨害は初心者向けの短い初版には加えない |
| 6 | [A Dance of Fire and Ice](https://store.steampowered.com/app/977950/A_Dance_of_Fire_and_Ice/) | 一ボタンでリズムと移動が対応する。直接タップとの比較条件に使う | 碁盤上の距離をそのまま拍間隔へ変換すると曲と合わないため、幾何からの譜面生成は採用しない |
| 7 | [Melatonin](https://store.steampowered.com/app/1585220/Melatonin/) | アニメーションと音を合図にする。入力直前・成功・補助を盤面の動きで示す | 予告UIを完全に消すことは未知の着点を探す負担になるため行わない |
| 8 | [Trombone Champ](https://store.steampowered.com/app/1059990/Trombone_Champ/) | 自分の演奏が聞こえることが体験の中心。着手音を入力直後に返す | 音程操作は棋譜並べの核ではない。音を外す笑いも初版の主題にしない |
| 9 | [Spin Rhythm XD](https://store.steampowered.com/app/1058830/Spin_Rhythm_XD/) | 色・拍・手の操作を対応させ、複数の操作環境を扱う。マウス／タッチ／キーの比較を意識する | 回転・フリック・長押しの操作語彙は増やさない |
| 10 | [DEEMO](https://www.nintendo.com/us/store/products/deemo-switch/) | ピアノ演奏という理解しやすい行為と音楽を結ぶ。棋譜の再生を「一局を演奏する」体験へ近づける | 物語解放や曲数による継続報酬は一曲の操作感を検証した後 |

## 異ジャンルの同型10件

共通点は「小さな入力が具体的な世界の変化として積み上がること」。これらの自由配置・思考時間を、そのまま固定時刻の音ゲーへ移せるとは考えない。

| # | 作品・一次資料 | 借りる点 | 借りない点・対象の差 |
|---|---|---|---|
| 11 | [Epistory](https://store.steampowered.com/app/398850/Epistory__Typing_Chronicles/) | 入力練習を世界への働きかけにする。単なる正誤表示でなく石が置かれる結果を返す | 文字列を入力できることと物語を理解することの違いと同様、棋譜を並べることを囲碁の判断力と同一視しない |
| 12 | [Unpacking](https://store.steampowered.com/app/1135690/Unpacking/) | 一つずつ物を置くことで完成した空間が残る。終了時に盤面を鑑賞できるようにする | 自由な配置探しは固定棋譜と両立しないため導入しない |
| 13 | [A Little to the Left](https://store.steampowered.com/app/1629520/A_Little_to_the_Left/) | 位置が整う快感を短い入力へ結ぶ。交点への着地を読みやすくする | 隠れた並べ方の推理は演奏中に要求しない |
| 14 | [Assemble with Care](https://store.steampowered.com/app/1202900/Assemble_with_Care/) | 部品を扱った結果として物が完成する。石が増える過程と最後の盤面を繋ぐ | 修理方法を探索する時間はリズム入力へ持ち込まない |
| 15 | [Mini Metro](https://store.steampowered.com/app/287980/Mini_Metro/) | 少数の線と点で状態を伝える。碁盤・石・次の輪を主役にする | 路線を自分で設計する戦略性は固定棋譜には存在しないため装わない |
| 16 | [Dorfromantik](https://store.steampowered.com/app/1455840/Dorfromantik/) | タイルを置くたび景色が蓄積する。石の配置が過去の入力の痕跡になる | 次のタイルをどこに置くか考える選択は初版に加えない |
| 17 | [Townscaper](https://store.steampowered.com/app/1291340/Townscaper/) | 一回の配置に対し形が直ちに変わる。手応えの遅延を小さくする | 補助着手を自分の成功と誤認させないよう、自由な自動整形とは区別する |
| 18 | [PowerWash Simulator](https://store.steampowered.com/app/1290000/PowerWash_Simulator/) | 入力の結果が目で見えて残る。捕獲した石が消え、盤面が変わることを見せる | 長時間作業や自由な順序を一曲の試作へ移さない |
| 19 | [Baba Is You](https://store.steampowered.com/app/736260/Baba_Is_You/) | 規則が盤面上の物として見える。次に何を押すかも盤上へ置く | 規則の書き換えと論理パズルは演奏の核を変えるため採用しない |
| 20 | [Human Resource Machine](https://store.steampowered.com/app/375820/Human_Resource_Machine/) | 手順が実行される過程を見せる。棋譜の進行と入力評価を別々に観察可能にする | 手順をプログラムする思考課題は、決められた手順を演奏する本案と別目標 |

## 採用しない比較例5件

「やらなかった」は各開発者が断念した案という意味ではなく、今回の試作が取り入れない構造を指す。

| # | 作品・一次資料 | 参考になる点 | 今回採用しない理由 |
|---|---|---|---|
| 21 | [ファクトリ囲碁](https://hirazi.itch.io/factory-go) | 捕獲条件を排気口と爆発に置き換える明瞭さ | 工場への置換や対戦を追加すると棋譜演奏以外の新要素が増える。捕獲の結果表示だけに絞る |
| 22 | [Factorio](https://store.steampowered.com/app/427520/Factorio/) | 配置が後続の結果を生む因果関係 | 自動生産や資源成長を付けると入力が不要になる方向へ寄る |
| 23 | [Civilization V](https://store.steampowered.com/app/8930/Sid_Meiers_Civilization_V/) | 手番の蓄積で盤面が変わる | 長期戦略と情報比較は曲の拍に合わせた即時入力と競合する |
| 24 | [Slay the Spire](https://store.steampowered.com/app/646570/Slay_the_Spire/) | 一手の効果を見通して選ぶ | カード・強化・ランダム性でリプレイ性を増やすより、一曲の再演奏欲求を先に確かめる |
| 25 | [Chess.comのチェス入門](https://www.chess.com/learn-how-to-play-chess) | 合法手・勝敗条件を説明してから対局する構造 | チェス対局や詰め問題のように着手を選ばせると、位置と拍に集中できなくなる |

## 適用失敗を避けるための障壁例5件

以下は成功している／評価されている作品でも起こり得る「本案へ機械的に移植すると失敗する条件」の分析。作品自体の失敗例、ユーザー調査の結果、商業的不振とは主張しない。

| # | 作品・一次資料 | 元の構造 | 本案への適用失敗条件と対策 |
|---|---|---|---|
| 26 | [Thumper](https://store.steampowered.com/app/356400/Thumper/) | 速度と強烈な身体感覚を打ち出したリズムアクション | 強い画面揺れ・高速演出が交点を追う視線を妨げる。捕獲演出は盤を動かさず短く返す |
| 27 | [Geometry Dash](https://store.steampowered.com/app/322170/Geometry_Dash/) | 音楽に沿って障害を越えるアクション | 小さなミスで曲を毎回中断すると初心者が一局を完成できない。自動補助で最後まで通す |
| 28 | [Crypt of the NecroDancer](https://store.steampowered.com/app/247080/Crypt_of_the_NecroDancer/) | 拍に合わせた移動と戦闘の判断 | 囲碁の最善手判断まで拍内に要求すると二重課題になる。次の着点は提示し、思考問題を混ぜない |
| 29 | [DJMAX RESPECT V](https://store.steampowered.com/app/960170/DJMAX_RESPECT_V/) | 音楽に沿う複数入力を扱うリズムゲーム | 多キーや同時押しを加えると碁盤へ石を置く行為との対応が薄れる。一手一入力を維持する |
| 30 | [Just Shapes & Beats](https://store.steampowered.com/app/531510/Just_Shapes__Beats/) | 音楽に結びついた図形の弾幕を避ける | 音楽連動の見栄えだけでは着手の手応えにならない。入力を返す石音と位置の応答を先に完成させる |

## 試作へ採用する結論

主な型は osu!・応援団の「場所と時刻を示して押す」。リズム天国から一動作への集中を借りる。棋譜という変更点を一つだけ加え、直接タップと一キーを同じ曲で比較する。捕獲・石の蓄積・完成盤面が囲碁らしさを担う。ミスで棋譜を破壊せず、補助と成功を明確に分ける。

最初の批判レビュー: (1) 遠い交点への移動負荷は手作業の譜面と9路で対処可能、(2) ミスで棋譜が壊れる問題は判定と進行の分離で対処可能、(3) 学習効果を過大に示す問題は棋譜演奏と対局能力を分けて表示すれば対処可能。楽しいかどうかの実測は未実施であり、資料調査だけで保証しない。
