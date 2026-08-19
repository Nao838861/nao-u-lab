■ 概要

Frontier Developments の render programmer John Wigg が、『Planet Coaster 2』の水を万能 simulation にせず、知覚距離・相互作用の尺度・gameplay への影響が異なる三系統へ分けた実装を解説している。player は自由形状の pool を作り、wave machine を置き、first-person camera で水面直近や水中を観察できる。一つの park には数千の guest が存在し、多数の animation が水面を乱す。game speed は実時間の最大5倍まで上がるため、normal map による平面水でも、全用途を高精度な3D流体で解く方式でも要件を満たしにくい。

第一の系統は表示用の動的 water mesh である。camera からの距離に応じて triangle を細分化し、画面内の geometry 量を概ね一定に保ちながら、近距離では centimeter scale まで頂点を上下させる。浅い角度や一人称視点でも、波や ripple が照明だけでなく実形状として silhouette に出る。camera が水面を横切る split-shot では、screen-space shader で pixel position を world coordinate へ戻し、水面までの垂直距離を低解像度 texture に書き、threshold して滑らかな water line を作る。

第二は guest interaction 用の GPU 2D fluid simulation である。pool で必要なのを表面の垂直変位、flow、foam に限定し、深層を含む3D流体は扱わない。各 frame で displacement と flow vector を GPU texture の grid に持ち、guest や collider が水面と交差した位置へ変位量と object velocity を初期条件として注入する。semi-Lagrangian 形式の shallow-water equations を Crank–Nicolson 法で積分し、preconditioned conjugate-gradient 法で解く。出力を次 frame の初期条件へ戻し、flow から foam の生成と移流も行う。compute shader の並列性を使い、泳ぎの wake、渦、飛び込みの splash を連続的な場としてつなぐ。

第三は wave machine と shoreline 用の簡易 wave simulation である。pool を1m四方の cell に区切り、上下左右を仮想 pipe で結び、高さ差に応じて水を流す hydrostatic pipe model を採る。周期的に水を引いて戻すだけで trough と peak を作る。wave は guest の反応を変えるため CPU 上に置き、pool ごとは別 thread、巨大な単一 pool は手調整した SIMD で一度に8 cell を計算する。十分軽くなり shoreline にも再利用した。結論は、必要な現象だけを各 subsystem に担当させ、単純な方法から複雑さを局所化することである。

■ 内容分析

この記事の本質は、同じ見た目に異なる authority と解像度を重ねる設計にある。mesh は表示、GPU fluid は局所接触の伝播、CPU wave は guest が反応すべき大域状態を担当する。表示 detail は camera 依存でよいが、gameplay state を camera 距離で変えてはいけない。逆に、細かな ripple を authoritative state に載せる必要もない。この非対称な責務分割が、再現性が必要な状態と視覚的にもっともらしければよい状態を分けている。

距離適応 mesh は一般的 LOD 以上に、screen geometry を概ね一定にする budget 制御として読める。first-person camera で flat plane が破綻する条件にだけ実 geometry を割り当てた。water line も volumetric 表現ではなく、低解像度 distance texture と threshold で必要な境界だけを復元する。player が識別できる signal に計算を寄せる一貫性がある。

二つの流体 model は現象の大きさだけでなく、state の読者も違う。guest ripple は多数の速度注入と滑らかな局所応答が重要なので GPU grid が合う。wave pool は大波が gameplay に届き、pool 単位で参照しやすいことが重要なので pipe model を CPU に置く。CPU/GPU を速さだけでなく、誰が読むか、どう並列化するかで決めている。複数 pool は task parallelism、巨大 pool 内部は SIMD という粒度選択も具体的だ。

ただし、証拠は production deep dive で比較実験ではない。最大5倍速でも安定し、巨大 park でも滑らかと述べるが、frame time、GPU memory、grid resolution、PCG 反復回数、対象 hardware は示されない。三系統の境界で位相・振幅・foam をどう整合するか、自由形状境界、急な time-scale 変更、replay determinism も説明外である。「この数値方式なら常に高速」とは言えず、採れるのは要求を分解した architecture と継続的な performance test の工程である。

■ 自分達の環境への適用

環境表現の prototype では、出力を三層に分ける。visual layer は camera 距離で detail を変え、interaction layer は接触から短寿命の ripple や particle を作り、gameplay layer は判定に必要な少数の state だけを持つ。水面だけでなく草、煙、群衆、破壊表現にも使える。見た目の field を完全な game state にしないことで、反復速度と replay 性を守れる。

headless 評価は層ごとに oracle を置く。visual layer は camera を遠近に sweep し、triangle 数と frame cost を記録する。interaction layer は固定 seed で collider を投入し、変位 energy が増幅せず減衰し、境界外へ漏れないかを見る。gameplay layer は wave の周期、cell 間伝播、guest reaction の時刻を event log にし、1倍速と5倍速、30/60fps 相当で結果が一致するか比較する。画像差分と event invariant を分ければ、foam の微差と gameplay failure を混同しない。

検証は矩形 pool 一つ、固定 grid、接触 object 一つから始める。まず sine wave と減衰で近接形状・水面境界・接触 feedback を通し、必要な場合だけ flow と foam、最後に gameplay wave を独立 state として足す。各段階で CPU/GPU time、memory、最大変位、energy、event timing を同じ replay から保存する。複雑な solver は単純系が失敗した条件を特定してから置換する。

■ メリット・デメリット

メリットは、全体を最高精度へせずに近接品質、多数 object への反応、gameplay の安定性を両立しやすいこと。authority が明確になり、visual effect の変更が save data やAI挙動を壊しにくい。subsystem ごとに profile、replay、縮退でき、低性能 platform では foam や mesh detail だけを落とせる。責務が狭い部品は別用途へも転用しやすい。

デメリットは、model の接続部が失敗源になること。局所 ripple と大波、visual height と authoritative height、CPU/GPU 間の遅延、time step 差で見た目と判定がずれ得る。専門領域と platform 別の検証 matrix も増える。記事には定量 profile がなく、小規模作品では過剰設計になり得る。first-person 観察、数千 collider、5倍速、gameplay wave が不要なら、normal map、頂点波、particle で十分な場合がある。

■ 判定

部分採用。三つの水 simulation そのものではなく、観測距離・相互作用・gameplay authority で責務を分け、単純系の failure evidence が出た層だけを高度化する設計を採る。導入時は固定 replay による frame budget、安定性、event timing を先に定義し、記事にない定量性能は自分達の target hardware で測り直す。

■ URL
https://www.gamedeveloper.com/programming/deep-dive-crafting-detailed-and-dynamic-water-in-planet-coaster-2
