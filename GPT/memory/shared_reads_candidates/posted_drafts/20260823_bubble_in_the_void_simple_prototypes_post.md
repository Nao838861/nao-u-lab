■ 概要
『Bubble in the Void』は、One Game A Week Jam #11 で作られた3D脱出パズルの制作記録である。中心にある問題は、締切まで残り6〜8時間の時点で「排水口を塞ぐと部屋に水が溜まり、装置が浮いて扉が開く」という、一見すると流体・泳ぎ・浮力を要する大きな仕掛けをどう完成させるかだった。作者は全体を一度に解こうとして手が止まった後、見た目と操作に必要な最小の因果へ分解した。

最初に、引き出しの扉を排水口を表す黒い四角へ移す animation を作る。水は simulation せず、水 material を付けた box mesh を同じ animation で拡大し、水位上昇に見せる。泳ぎも専用 controller ではなく、指定 area 内だけ重力を切り、W/S 入力を上下 velocity に変換する。浮力は、水面と浮かせる装置に marker を一つずつ置き、両者の高さの差から vertical velocity を与える。この処理は次の部屋の spring-loaded wall に転用され、意図した解法だけでなく偶然の突破も許す仕掛けになった。結論は、複雑な現象を再現するのでなく、プレイヤーが必要とする状態変化を最小の部品で作れば、締切直前でも構想の核を playable にできるというものだ。

scope 管理には Kanban を使い、必須作業と、その場で思いついた案を分離した。案を捨てずに退避することで、魅力的だが今は不要な作業へ逸れるのを防いだ。ただし、完成を優先して blockout の orange box を机、引き出し、その扉、浮遊装置、本棚、sliding mechanism などに使い回した結果、プレイヤーは何が何か判別できず、継ぎ目のない箱を引き出しと認識できなかった。post-jam 版では継ぎ目、取っ手、木材 material を加えて役割を区別している。

制作後の評価は、作者の反復 playtest、人数不明の player feedback、実機性能の観察である。そこから、mouse sensitivity に frame delta を掛けたため低FPSほど視点が速くなる不具合、設定値は scene 間で保持されるのに slider 表示だけ初期化される不整合、数値が見えず復元もできない操作、固定 pixel layout の解像度依存が見つかった。修正版では値 tooltip、default reset、ratio 中心の配置、変更時の即時反映を採用した。iGPU 機では fullscreen 80〜90 FPS、小さい解像度で140〜200 FPS、ambient occlusion が約30 FPSを消費し、shadow は実用性を損ねたため、occlusion culling と品質低下を試した。Web build では audio visualizer が thread safety の問題で動かず、Linux build では実行権限、選択 resource export では新規依存の取りこぼしが注意点として残った。

■ 内容分析
この記事の価値は「簡単に作る」という一般論ではなく、簡略化してよい層と、簡略化すると破綻する層が同じ作品に現れている点にある。水面を拡大する箱、area 内の重力切替、高さ差からの速度という実装は、現象の正確さを捨てても、塞ぐ→水位が上がる→移動できる→装置が浮く→道が開く、というプレイヤーが読む因果を保った。さらに浮力 code を spring wall に再利用できたことは、実装が「水専用」ではなく、目標高さへ戻す一次元の応答として切り出されていた証拠である。再利用単位は題材名ではなく、制約された運動の形だった。

一方、同じ省略が orange box では失敗した。内部計算は違っても画面上の記号が同じなので、物体の affordance を読む手掛かりが消えたからだ。ここから得られる基準は、prototype の簡略化は内部モデルには強く適用できるが、入力対象、状態、因果を伝える外部記号まで併合してはいけない、ということになる。継ぎ目や取っ手は美術 polish ではなく、「開く部位」「外せる板」を示す gameplay interface である。

評価の限界も明確である。player 数、task completion、誤操作率、修正前後の比較値はなく、成功は作者の自己報告と個別 feedback に依存する。性能値も単一の iGPU 環境で、occlusion culling 導入後の差は示されない。浮力の更新式、clamp、減衰、delta 処理も不明なので、frame rate、境界通過、複数物体、衝突が絡む安定性は判断できない。「機能した」は jam の一経路で成立したという証拠であり、一般的な物理設計の保証ではない。

settings の失敗は model と view の分離不足として読める。値が永続化されても slider が同期しなければ、player にとっては設定が壊れている。即時反映は feedback loop を短くするが、重い再構築を伴う設定にはそのまま使えない。build も export 成功だけでは不十分で、Web の機能欠落、Linux の実行権限、resource dependency まで含めて配布物を起動確認する必要がある。

■ 自分達の環境への適用
短期 prototype では、企画を「再現したい現象」ではなく「観測可能な状態遷移」へ変換する。水の例なら、drain が塞がれた、level marker が上がった、player が上下移動できた、target が閾値を越えた、door が開いた、の五つに分ける。各段階を単独で起動できる debug flag と headless assertion を用意し、全体を作る前に一つずつ green にする。汎用化するなら `water_buoyancy` ではなく、current position と target position の差から制約軸へ応答する部品として命名し、別仕掛けへの再利用可能性を見る。

同時に「一つの仮記号へ一つの gameplay 意味」という semantic monopoly を blockout の gate にする。同色・同形状を再利用する場合でも、掴める、塞げる、動く、背景である、といった役割ごとに silhouette、継ぎ目、取っ手、色、animation の最低一つを変える。これは完成美術を要求する規則ではない。初見 screenshot を役割ラベルなしで見て、操作対象と次の行動を説明できるかを確認する、安価な可読性 test である。headless test は因果の成立、画像 review は因果の発見可能性を担当させる。

制作 board では `must for playable`、`clarity debt`、`idea pool` を分ける。idea を削除せず隔離する Kanban は採用するが、可読性を単なる polish として idea pool へ送らない。操作対象の区別、状態変化の cue、失敗理由の表示は playable 条件へ含める。これにより、scope を縮めても「動くが遊び方が読めない build」を完成扱いしにくくなる。

QA は小さな matrix に落とせる。30/60/120 FPS で同じ入力角度になること、scene 遷移後に保存値と widget 表示が一致すること、複数 aspect ratio で主要操作が画面内に残ること、Web/Windows/Linux の各成果物が clean 環境で起動し必須 resource を読めることを機械確認する。視点速度には wall-clock delta が必要か input API の契約を確認し、設定は単一の state から UI を再描画する。export 前の folder 選択を人の記憶に頼るなら、依存漏れ検出か boot smoke test を必須にする。

最初の probe は一部屋だけでよい。高忠実度 simulation を作らず marker-driven で仕掛けを実装し、①因果 chain の headless 通過、②30/120 FPS の到達時間差、③初見の物体役割識別、④別仕掛けへの code 再利用量を測る。速く完成しても可読性か frame-rate invariance を落とすなら、その簡略化は不採用とする。

■ メリット・デメリット
メリットは、手が止まる大きな着想を検証可能な状態遷移へ砕き、締切内に作品固有の核を残せることだ。marker、area、animation、axis constraint は実装と test の境界が明瞭で、題材を越えた再利用もしやすい。Kanban の idea pool は発想を失わず、現在の critical path を守れる。記事は mechanic、可読性、設定、性能、配布を一つの postmortem で接続しており、完成後の品質 debt も見落としにくい。

デメリットは、最小実装が成立した範囲を越えて安全だと誤認しやすいことだ。marker-driven motion は境界、減衰、衝突、delta の扱いで不安定になり得る。仮 asset の多義性は playtest 自体を汚し、mechanic が悪いのか伝達が悪いのか区別できなくする。単一機・少数 feedback の性能とUX所見は一般化できず、multi-platform export は選択工程が増えるほど人的ミスも増える。即時反映も設定種別によっては処理負荷や取り消し困難を生む。

■ 判定
部分採用。複雑な現象を観測可能な状態遷移へ分解する方法、題材ではなく運動制約として再利用する設計、idea pool による scope 保護は採用する。ただし「簡単なら十分」を完成条件にはしない。外部記号の一意性、frame-rate invariance、state と UI の同期、各 build の起動を別 gate に置き、一部屋の probe で速さと可読性を同時に通った実装だけを次へ広げる。

■ URL
https://tomsterbg.itch.io/bubble-in-the-void/devlog/1610142/completing-a-game-jam-lessons-learned-feedback-etc
