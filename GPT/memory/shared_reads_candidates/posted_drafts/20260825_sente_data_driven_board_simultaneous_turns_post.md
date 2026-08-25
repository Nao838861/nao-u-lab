■ 概要
Unity の開発者取材記事。題材の『Sente』は、最大6人が hex board に token を置き、energy network を伸ばし、laser で相手の energy core を狙う strategy game である。token は防御・通電する metal 面と、充電後に laser を撃つ vulnerable 面を持つ。多人数で一人ずつ行動すると待ち時間が長すぎたため、各 player が timer 内に手を選び、全入力が揃うか時間切れになった時点で一斉解決する方式へ作り直した。

この変更は単なる高速化ではない。確実に見えた射線へ相手が同時に shield を差し込むなど、他者が次に作る盤面を予測する game になった。開発側は膠着を避ける調整に長年を費やし、通常の試合は10〜15分程度、強い player 同士では1時間を超える場合もあると説明する。ただしこれは経験値で、逐次手番版との比較実験ではない。

制作基盤の中核は、表示 scene から完全に分離した単一の logical board model である。同じ data が Unity 内の Board Template Manager、実行時の randomization、製品同梱 template を駆動する。盤面は一辺4〜10 cell に対応し、scene object を直接操作せず毎秒何度でも形状を変えられる。Unity を導入していない puzzle designer は spreadsheet で盤面を作り、encoded string として渡し、programmer がそのまま import する。将来は同じ経路を player-created board の共有にも使う計画である。

single-player campaign では Unity Timeline の custom track に dialogue、camera、board state の変化を載せ、signal / marker で勝利後の進行と retry を制御する。結論は、同一の盤面表現を gameplay、描画、editor、非 programmer authoring、campaign 演出、将来の共有機能へ通した制作事例である。

■ 内容分析
同時手番と data-driven tooling は、複雑さを player 側では「他者の意図を読むこと」、production 側では「一つの state transition を検証すること」へ集約する二層の回答になっている。logical model が人数・盤面寸法・配置・途中変形を scene object ごとの例外へ分散させないため、randomization、editor、spreadsheet import、Timeline animation が同じ状態を異なる入口から扱える。

ただし、同時解決の核心は記事に書かれていない。同じ cell への配置、相互 laser、core の同時破壊、移動先の競合、複数効果の発火順、通信遅延や切断、同点時の扱いを、どの規則で決定的に解くのかは不明である。「all at once」は表示上の説明であって、simulation が順序非依存だという証拠ではない。ここを曖昧に移植すると、先に処理された player が有利になる、replay が再現できない、preview と実結果がずれる、といった不公平が出る。また、相互予測は選択を深くする一方、相手の候補手が多すぎれば読みではなく当てずっぽうになる。膠着を崩す incentive も具体的な rule や観測値が示されていないため、一般解として借りることはできない。

data model の境界は有力だが実装詳細は不足している。encoded string の schema、version、validation、差分 review、破損診断、古い template の migration は説明されない。opaque な文字列だけを正本にすると diff と merge が弱くなる。Timeline も演出同期には向くが、複雑な分岐、save compatibility、途中再開まで同じ形で伸ばせるとは限らない。

評価資料としての限界も明確である。記事は Unity による studio 紹介で、player 数別の平均待機、match 長分布、膠着率、離脱率、editor 制作時間、designer の error 率を報告していない。比較対象、sample 数、失敗した設計案もない。したがって「同時手番で待ち時間が改善した」「単一 model で制作が速くなった」は妥当な事例報告ではあっても、効果量を持つ実証ではない。採用対象は成果の数字ではなく、入力、canonical state、複数の表示・編集経路を分離する architecture と、待機時間を意思決定へ変換する設計仮説である。

■ 自分達の環境への適用
board / puzzle prototype では、まず描画なしで動く `BoardState` と、一組の同時入力から次状態と event log を返す deterministic reducer を作る。描画、editor、AI、replay は reducer の出力だけを読む。同じ seed、初期 state、全 player の command bundle から常に同じ hash へ到達することを自動 test し、入力順を並べ替えても結果が変わらないかを調べる。変わる処理には明示的な priority rule を与え、UI の解決 animation も event log の順に再生する。これで「一斉に見える演出」と「再現可能な規則」を分けられる。

headless 評価では、2〜6体の単純 policy を同一 seed 群で走らせ、無進展 turn 数、合法手数、同一 cell 競合率、攻撃可能性の停滞、player ID と勝率の相関を記録する。逐次版と同時版を総 match 時間だけで比べず、操作待ち時間と結果を変え得る選択の頻度を分ける。headless は決定性、偏り、停止を検出し、人間 playtest では予測が成立したか、裏切られた理由を説明できるか、timer が思考を潰していないかを見る。

authoring は「一つの model、複数入口」を採るが、encoded string 自体は模倣しない。version 付き JSON または表形式を正本とし、spreadsheet importer は cell 座標、piece type、owner、orientation を検証して同じ model へ変換する。editor、generator、campaign script も共通 validator を通す。最初の probe は、6×6盤面1種を手書き data、spreadsheet、generator の3経路で生成し、canonical hash と playable test が一致するかの確認でよい。

記憶システムにも限定適用できる。candidate frontmatter を canonical state、Slack 本文を render、staging を処理履歴とみなし、同じ URL・decision・evidence から各 view を辿れる状態を守る。ただし自由記述を一つの record に圧縮せず、単一正本にするのは識別子と lifecycle state に限る。原文、判断、投稿文は provenance を保った別 artifact として結ぶ。

■ メリット・デメリット
メリットは、待機という多人数 game の弱点を、同時予測という固有の駆け引きへ変えたことと、logical state の分離が runtime だけでなく authoring と campaign 制作まで貫かれていること。pure state transition は headless test、replay、AI simulation、複数 editor、user-generated content と相性がよい。非 programmer が既に使う spreadsheet を入口にした判断も、専用 tool の操作教育より制作摩擦を下げられる。

デメリットは、最重要の解決規則と定量評価が欠け、成功条件をそのまま再現できないこと。同時手番は downtime を減らしても、競合結果が読めない場合は agency を損なう。単一 model は中心 schema の変更影響を広げ、万能 object に育つ危険もある。spreadsheet と encoded string は validation、versioning、diff、migration を足さなければ保守負債になる。Timeline への集約も Unity 依存と visual sequence の肥大化を招き得るため、simulation rule や campaign 永続 state まで持たせない境界が必要である。

■ 判定
部分採用。表示から独立した canonical board state、複数 authoring 経路の共通 validator、deterministic な同時入力 reducer は、小さな board prototype で直ちに試す価値がある。同時手番そのものは待ち時間削減策として先に固定せず、逐次版との headless 比較と人間による予測可能性 test を通過した場合だけ残す。encoded string と Timeline は製品固有の実装として保留し、schema version、再現性、diff 可能性を満たす自分達の軽量形式へ置き換える。

■ URL
https://unity.com/blog/data-driven-board-six-player-strategy-sente
