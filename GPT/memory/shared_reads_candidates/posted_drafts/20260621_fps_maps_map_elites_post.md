■ 概要
対象は Simone de Donato / Pier Luca Lanzi / Daniele Loiacono による arXiv:2605.30570「Procedural Generation of First Person Shooter Maps using Map-Elites」。問題設定は、FPS の multiplayer deathmatch map を「単一の最良スコアへ最適化する」のではなく、プレイ上意味のある特徴空間を広く照らしながら、質の高い候補を複数保持することにある。従来の FPS map 生成研究は、kill までの平均時間、score balance、fleeing behavior、design guideline への適合など、特定目的を強く置くものが多かった。本論文はここに quality diversity、とくに MAP-Elites with Sliding Boundaries (MESB) を入れ、map を fitness と 2 つの feature 座標で archive に保存する。

中核は「map representation」と「illumination feature」を分けて評価している点。表現は既存の All-Black と Grid-Graph に加え、新規の Point-Line と Spatial-Layout を比較する。All-Black は壁で埋まった map から room / corridor を削り出すため自由度はあるが、mutation の locality が悪く、dead end や noisy な構造を生みやすい。Grid-Graph は grid cell に room を置き、隣接 room の接続を boolean で持つため扱いやすい一方、topology が固定 grid に縛られる。Point-Line は room pair と L 字 corridor を genome にし、room と corridor を明示的につなぐことで dead end を減らし、長短 corridor を同じ確率で探索できるようにする。Spatial-Layout は room size、line segment、separation parameter を genome とし、Z3 の SMT solver で room 配置を決め、Delaunay triangulation と minimum spanning tree で接続性を作る。FPS map に必要な loop、arena、alternate route を補うため、line と交差する room 間に corridor を足す heuristic も入れている。

評価 feature は、layout だけから計算できる topological properties と、bot の gameplay simulation が必要な emergent properties に分けられる。論文では 46 個の topology feature と 23 個の emergent feature を定義し、実験では area、maxSymmetry、pace、averageEccentricity に絞る。area は walkable tile 比率、maxSymmetry は x/y 軸対称性の最大値、averageEccentricity は room graph 上で各 room から最遠 room までの距離の平均、pace は fight の頻度と engagement time から計算される combat tempo である。照明軸は、layout だけを見る area-maxSymmetry と、gameplay と topology を混ぜる pace-averageEccentricity の 2 組。fitness は 1v1 duel の balance で、skill 15% と 85% の bot に sniper rifle と shotgun という異なる戦術を持つ武器を持たせ、5 matches の kill distribution entropy 平均を最大化する。遠距離と近距離、上手い bot と弱い bot の偏りが減る map が高 fitness になる。

実験は PyRibs と Project Arena を使い、MESB archive を feature ごと 10 bins、計 100 solutions 上限で走らせる。area-maxSymmetry では、Grid-Graph は高 symmetry を出すが map が単純で小さく、人間にとって面白くない傾向がある。Point-Line は walkable area の広い範囲を照らし、Grid-Graph とともに高 entropy に届く。QD score と archive size では、Point-Line と Spatial-Layout が既存表現を上回り、Spatial-Layout は平均 elite score がやや低くても archive を早く広く埋める。pace-averageEccentricity では、Grid-Graph は archive が sparse になり、表現の狭さが露呈する。一方、map の視覚分析では All-Black が複雑に見えても dead end や useless feature が多く、entropy だけでは基本的な level design principle を満たせないことが示される。結論は、Point-Line と Spatial-Layout を quality diversity と組み合わせると、balance と design の trade-off が最も良く、low pace には long loops / long corridors、高 pace には central room のある接続性の高い map など、戦術差のある候補を作れる、というもの。

■ 内容分析
この論文の価値は「MAP-Elites を FPS に使った」ことより、representation の失敗が評価軸の失敗と混ざらないように実験を組んでいる点にある。単一 fitness の entropy は、一見すると deathmatch balance をうまく測っている。しかし論文自身が示すように、All-Black は entropy を上げても noisy layout、dead end、使われない feature を抱えたままになりうる。これは「bot simulation で勝敗が釣り合った」ことと「人間が読み取りやすく、戦術選択が成立する」ことが別物だという警告になっている。

Point-Line と Spatial-Layout の差も重要。Point-Line は room pair と corridor を直接持つため、生成物の意味が読みやすく、long corridor / chokepoint / shotgun 有利地形のような FPS 的解釈に接続しやすい。Spatial-Layout は SMT solver を挟むため genome と phenotype の locality は揺れるが、初期に archive を広く埋める力がある。つまり、設計者が編集しやすい表現と、探索が多様性を出しやすい表現は一致しない。実運用では「探索用 representation」と「人間が修正する authored representation」を分ける必要がある。MESB も同様に、固定 grid の空白を減らして比較を助ける一方、bin remap で QD score が急落するため、score curve を品質改善曲線として読むと誤る。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、これは「生成した playable diff を単一スコアで採否しない」ための具体例として使える。今の headless 評価は、動作確認、到達可能性、破綻しないこと、ある程度の遊べそうさに寄りやすい。ここに MAP-Elites 的な考え方を入れるなら、まず評価ログの保存形式から始めるのが現実的。たとえば graze_log や小型アクション prototype で、seed ごとに input_load、danger_exposure、escape_route_count、resource_pressure のような feature を計算し、単一 best ではなく feature cell ごとの代表 run を残す。

candidate / atom 側にも応用できる。shared-reads 候補を面白い順だけで並べず、実装 / 評価 / memory 改善 / genre design の cell を持ち、各 cell の best candidate だけを Phase 3 に上げる。これにより、検索が MAP-Elites 論文ばかり、LLM agent benchmark ばかり、という局所最適に寄るのを防げる。

■ メリット・デメリット
メリットは、探索を「最も良い1案」から「異なる性質を持つ良い案の集合」に変えられること。特にゲームでは、難しい、速い、広い、対称、逃げやすい、読みにくい、などの性質が面白さに別々に効くため、archive 型の保存は後から設計判断を戻しやすい。デメリットは feature 設計の恣意性と評価コスト。emergent feature は simulation や replay が必要で、feature が悪いと archive は埋まっても作品改善にはつながらない。

■ 判定
部分採用。FPS map 表現そのものは直接採用しないが、representation と evaluation feature を分け、単一 fitness でなく feature archive を見る設計を採用候補にする。次の probe は、playable diff の headless run を 2 軸 feature cell に保存し、best score だけでなく coverage と代表失敗を staging に残す形がよい。

■ URL
https://arxiv.org/abs/2605.30570
https://github.com/SimoDedo/MAPElites_FPS_Maps
