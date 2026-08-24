■ 概要
対象は Dzmitry Malyshau の論文「Six Ways to Draw Vangers with WebGPU: Real-Time Rendering of Editable Multi-Layer Height Fields」。地形 LOD の研究は、通常「1 つの x-y 座標に高さが 1 つ」の滑らかな標高モデルを前提とする。しかし 1998 年のゲーム Vangers の地形は、人工的な垂直崖、洞窟の床と天井、上層スラブを持つ。各地面サンプルは、床下と上層スラブ内という 2 つの solid interval を表せるうえ、プレイ中の変形・破壊で高さと層メタデータが書き換わる。論文の問題設定は、このような「ゲームの都合で不連続かつ動的」な地形に、標準的な単層地形用の評価を当てても方式選定はできない、というものである。

比較するのは 6 方式。画面の各 pixel から 128 歩で立体領域へ進む height-field ray march、空領域を 3D occupancy pyramid で飛ばす voxel-accelerated ray march、256 段階の高さ範囲に 512 枚の水平面を置く Sliced、地面サンプルごとにカメラ側 3 面の棒をラスタライズする Painted、点を compute shader から投影し atomicMin で最近深度を選ぶ Scattered、および low/mid/high の 3 高度場を共通トポロジで近似する greedy TIN Mesh である。すべてを同一の native wgpu/WebGPU API、WGSL、光源・霧・影・カメラ、同一のデータ経路で実装し、CPU ray cast の正解画像に対する欠損、過剰描画、深度誤差、3×3 近傍との非整合を測る。

評価は 1280×800、視距離 600、視点仰角 0°/-30°/-60°/-90° の各 3 場面、40 timed frames、5 デバイスで実施された。元ゲームに近い俯瞰では 6 方式は似て見えるが、水平視点で Scattered は地形の 19.1–73.2% を欠損し、Sliced は水平の帯を作る。Mesh も過度に簡略化した q=0.0 で hangar の壁を 11.0% 欠損したが、q=0.5 で 0.5% まで回復した。選定設定の Mesh は全デバイスで 12 場面平均が最速だったが、読み込み時に 2.5 秒の blocking fit、GPU 318.7 MiB、CPU 534.7 MiB の法固有データを要する。半径 48 のクレーター破壊後も、他の 5 方式は 1 frame で新規構築した正解と一致した一方、Mesh は 16 frames 後も小さな履歴依存差が残った。結論は、動的多層地形では最速の frame time だけで勝者を決められず、視点分布、記憶量、事前処理、破壊後の整合性を workload として一緒に測るべき、というものである。

■ 内容分析
この論文の強さは、アルゴリズム名を横に並べるのではなく、ゲームが要求する 3 条件——2 つの solid interval を失わない、interactive に描画する、局所破壊を level reload なしで反映する——を最初に固定した点にある。これにより、洞窟を装飾として無視した方式や、静的 map に長い bake を償却する方式は、速度表に載せる前に要件不適合と判断できる。さらに各方式の quality knob を sweep し、その方式の最良誤差から 1 percentage point 以内で最安の設定を選ぶ。「速いが壊れている」設定を勝者にしない比較になっている。

評価指標の分解も重要だ。coverage を「本来地形なのに背景が見える see-through」と「本来背景なのに埋める covers-sky」に分け、両者が同時に動くなら reference 側の silhouette ずれを疑う。それでも、メッシュが層境界を跨いで存在しない屋根を描く「過剰描画」は coverage だけでは検出できない。そこで深度誤差と近傍 coherence、最後に画像目視を組み合わせる。実際、CPU reference 自身にも解像度変更で視野角が 3.6 倍になるバグと、海拔 0 を sky と誤分類するバグが見つかっている。後者は真上視点の 23% を狂わせた。正解画像も検査対象であり、複数の独立指標で失敗原因を切り分ける必要がある。

もう 1 つの固有な知見は、Mesh の圧縮率を決めたのが床の複雑さではなく、上層スラブの「意味的な不連続」だったことである。ゲーム内 10 worlds で、log reduction と床の粗さの相関は -0.17、二層 texel 比率とは -0.77、フィッタが実際に見る合成面の粗さとは -0.82 だった。単層 worlds は 45–182倍に簡略化できたが、多層 worlds では最低 5.2倍まで悪化する。Fostral q=0.25 の vertex 挿入の 23.3% は、single/double-level 境界の 1 つの不連続だけに使われた。補助 field が連続量でなく領域ラベルの意味を持つなら、それを数値 field として補間する手法は誤差を永遠に追い続ける。対策は tolerance を緩めることではなく、領域輪郭を制約として triangulation に与えることである。

■ 自分達の環境への適用
直接借りるべきは地形 renderer そのものより、「ゲーム固有の不可侵条件を先に定義し、同じ source state から複数実装を切り替え、静止画・通常 frame・編集直後の 3 種を別々に測る」比較 harness である。破壊可能な洞窟地形を試作する場合、正本は高さ texture と層 metadata に限り、ray march、occupancy 加速、chunk mesh がそこから派生する構成にする。headless では俯瞰だけでなく、0° の horizon、壁・洞窟天井の grazing angle、真上の各固定 camera を持ち、CPU 正解と see-through/covers-sky/depth/coherence を比べる。

編集回帰は平均 frame time に混ぜず、局所破壊を入れた最初の 1 frame の CPU 待ち時間と GPU 描画時間、新規構築した edited state と一致するまでの frames を分けて記録する。これはゲーム制作以外にも適用できる。記憶システムの index 更新や candidate 状態遷移も、steady-state の recall 速度だけでなく、局所更新直後の古い記憶の残留、正本からの rebuild との一致、派生データの保持量を別軸で測れる。「平時は速いが更新後に古い状態が残る」という Mesh の履歴依存は、incremental index の検証と同型の問題である。

最小検証は 1 場面・3 方式でよい。同じ二層地形に、直接 ray march、粗い occupancy 加速、128×128 chunk mesh を実装し、俯瞰と水平視点で欠損率と p95 depth 誤差を比較する。その後に半径固定のクレーターを入れ、編集直後 latency、整合 frames、GPU/CPU 派生データ量を一枚の JSON に出す。これで「通常描画」「視点による破綻」「プレイ操作後の復帰」を切り分けられる。

■ メリット・デメリット
メリットは、方式選定を単一の fps 順位から、データ表現・視点・編集整合性・保持メモリを含む workload 判定に引き戻せること。同一 engine と CPU reference、再現可能な one-command protocol があり、速度と正しさの交換を目視だけに任せない。また、Mesh がレンダリング以外の triangle collider に再利用できるように、表現をエンジン全体で共用できる価値も判断に入れられる。

デメリットは、結果の一般化範囲が狭いこと。6 方式の描画比較は Fostral 1 world、tuning は horizon 3 場面、破壊試験はクレーター 1 個所である。hardware は Vulkan 4 台と Metal 1 台で、D3D12、mobile、複数 driver 世代、全 6 方式の browser performance は未測定。Metal の値は timestamp の包含性が破れたため CPU submit-and-wait であり、Vulkan と絶対値を比べられない。frame ごとに submit 後の完了を待つ試験なので、pipelined throughput の計測でもない。Vangers 固有の二層符号化から別の voxel/CSG/SDF 地形へ移すなら、同じ protocol で再計測する必要がある。

■ 判定
部分採用。6 方式の優劣や Mesh 最速を一般則にはしない。一方で、ゲーム固有の不可侵条件、視点別の双方向 coverage、depth/coherence、事前処理、保持量、局所編集後の fresh rebuild 一致を分離して測る評価設計は採用する。最初の適用対象は、破壊可能地形の小型比較 harness と、incremental memory/index 更新の履歴依存回帰とする。

■ URL
https://arxiv.org/abs/2608.17390
