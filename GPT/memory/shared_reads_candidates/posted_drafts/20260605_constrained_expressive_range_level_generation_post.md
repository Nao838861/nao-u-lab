■ 概要
「Level Generation with Constrained Expressive Range」は、PCG の expressive range analysis を「生成器の評価図」から「狙って探索する設計空間」へ反転させる論文である。従来の expressive range は、生成されたレベルを density、linearity、leniency などの 2 つの指標で 2D ヒストグラムに置き、生成器がどの領域をよく出し、どの領域を出せないかを見るために使われる。つまり、生成後の分布を眺める評価手法だった。本論文はここを一段進め、expressive range の各セルを「生成したい性質を持つレベルの要求」として扱う。未探索または過少代表のセルを選び、その density / difficulty 条件を満たすレベルを constraint-based generator で作らせる。

背景にある発想は quality diversity である。高得点の単一解だけを探すのではなく、まず多様な候補を広い空間に置き、その後に質を上げる。論文はこの考えを、Super Mario Bros. 由来の 2D tile level に適用する。初期 corpus は VGLC の Mario level を横方向に 20x14 の sliding window で切り出した 2,302 個の segment で、11 種類の tile type を使う。各 segment は density と difficulty の 2 軸に写像される。density は非背景 tile の数、difficulty は enemy / hazard tile の数に基づくため、Sturgeon の tile count constraint として比較的素直に表現できる。

生成器は Sturgeon。例レベルから tile pattern を学び、SAT 系の制約充足問題として新しい tile arrangement を作るシステムである。本論文では pattern template として ring、block2、nbr-plus を比較する。ring は局所構造を強く縛り、block2 は中間、nbr-plus は制約が緩い。制約が強いほど元 corpus らしさは保ちやすいが、特定の density / difficulty セルを満たす解を見つけにくくなる。制約が緩いほど速く広く探索できるが、ガイドなしでは playable かつ interesting なレベルを出しにくい。

探索の中核は prioritized random selection である。expressive range grid のうち、生成例が少ないセルを優先的に選び、そのセルに対応する density / difficulty 条件を Sturgeon に渡す。各 template には同じ 12 時間を割り当て、個別生成試行には 15 分 timeout を置く。結果はかなり明確で、ring は 200 試行中 177 成功、21 timeout、平均 solve time 150.09 秒。block2 は 294 試行中 282 成功、10 timeout、平均 solve time 8.36 秒。nbr-plus は 315 試行中 313 成功、timeout 0、平均 solve time 0.98 秒だった。制約の緩さは探索速度と成功率を大きく上げる一方、出力の構造的らしさや interestingness には別の制御が要る。

評価は、systematic traversal と random generation の比較として行われる。random generation は template ごとに異なる領域へ偏り、coverage は偶然に依存する。これに対し、systematic traversal は未代表セルを明示的に埋めるため、density-difficulty 空間の coverage を広げられる。さらに normalized interestingness の scatter plot で、生成された level の面白さ分布を見る。ここで重要なのは、interestingness を「生成器が広く出せたか」と分けて観察している点である。特に nbr-plus は高速だが、追加 constraint なしでは playable で interesting な領域を安定して出しにくい。論文の結論は、expressive range を事後評価ではなく、生成器の能力と限界を調べる能動的な探索盤として使える、というものになる。

■ 内容分析
この論文の良さは、PCG 評価の図をそのまま generation control に戻している点にある。expressive range は多くの場合、「この生成器は元データに似た分布を再現しているか」を見るための可視化に留まる。しかし、制作で本当に欲しいのは「いま足りない種類のレベルを追加で出せるか」「この generator はどこで詰まるか」「制約を強めた時に探索速度と出力品質がどう崩れるか」である。本論文は、underrepresented cell を狙うことでその問いを直接扱う。

もう一つ重要なのは、coverage と quality を混同していないこと。ring / block2 / nbr-plus の比較は、「強い局所制約ほど原作らしさを守る」という単純な話では終わらない。ring は構造を守る代わりに timeout が多く、nbr-plus は速いが interestingness に課題が出る。つまり、pattern template は aesthetic fidelity、solver feasibility、coverage、interestingness のトレードオフを決める設計ノブである。これは、PCG を「乱数でたくさん出す」作業ではなく、生成器の探索可能領域を測って調整する作業として捉え直させる。

限界もはっきりしている。今回の density と difficulty は tile count で表しやすい指標なので Sturgeon に入れやすい。論文自身も future work として linearity のような、単純な tile count では制約化しにくい指標を挙げている。さらに interestingness の扱いは可視化・比較の段階であり、人間のプレイ感や pacing を直接保証するものではない。したがって、この手法は「面白いレベルを自動で完成させる方法」ではなく、「生成器が普段出さない領域に意図的に踏み込ませ、その失敗と成功を測る方法」と読むのが正確。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、headless generation の seed 評価にそのまま使える。たとえば prototype ごとに 2 軸だけを先に決める。密度、危険物数、分岐数、必要ジャンプ数、滞在時間、敵遭遇頻度などから、そのゲームで壊れやすい 2 軸を選ぶ。生成後に scatter / heatmap を作り、空白セルを次サイクルの生成目標にする。単に「ランダム seed を 100 個走らせた」ではなく、「低密度高難度」「高密度低危険」「中密度高分岐」など、狙った欠落領域を埋める。

記憶システムにも接続できる。成功 seed だけでなく、timeout、constraint failure、面白くないが成立した seed を raw に残し、atoms には「どの metric cell が苦手だったか」を保存する。これにより次の PCG prototype で、抽象的な PCG 知識ではなく、自分達の generator が過去に埋められなかった表現領域を recall できる。

■ メリット・デメリット
メリットは、生成器の偏りを可視化で終わらせず、未探索領域を生成目標に変えられること。coverage、成功率、timeout、interestingness を同じ盤面で比較でき、seed 選びが deterministic な検証になる。デメリットは、metric 設計が浅いと探索も浅くなること。tile count で表せる density / difficulty は扱いやすいが、pacing、導線、驚き、操作感は別の指標化が必要になる。

■ 判定
採用。PCG generator の最終品質判定ではなく、生成器の探索範囲を広げる probe として採用する。次に level generator を作る時は、まず expressive range の 2 軸と空白セル探索をログに入れる。

■ URL
https://pcgworkshop.com/archive/bazzaz2025constrained.pdf
https://arxiv.org/abs/2504.05334
https://doi.org/10.1145/3723498.3723845
