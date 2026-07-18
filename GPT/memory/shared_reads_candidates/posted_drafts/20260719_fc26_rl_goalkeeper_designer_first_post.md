■ 概要
EA SPORTS FC 26 の goalkeeper AI 導入事例は、手書き heuristic の商用ゲーム AI を、designer が修正でき、QA が回帰検査でき、実機で出荷できる production system へ変える話である。対象は goalkeeper 全体ではなく位置取り。従来 AI は状況別ルールの継ぎ目をプレイヤーに exploit されやすい。一方、大量 simulation と巨大 network を前提にする研究用 RL は、毎年更新される AAA title の反復速度と実機予算に合わない。

基礎 algorithm は continuous action 向けの Soft Actor-Critic。agent は相対目標位置 X/Z と移動強度の3値を出す。5層・各256 unit の MLP は約30万 parameter、FP32 約1161KB、game 内 inference 170μs。学習側では三つの工夫を組み合わせる。第一に既存 AI の transition を offline data とし、初期 batch を旧 AI と新 agent の replay buffer から50%ずつ採る。ただし各 curriculum phase の最初の hard reset 後には旧 data を外す。第二に10万 gradient step ごとに policy と value network を完全初期化し、保持した replay buffer に6400回の offline update をかける。第三に、球を拾う、1v1、2v1、corner、7v7へ難度を上げる3 phase・11/18/25 scenario の curriculum を作り、前 phase の一部を残す。GDC slide では4日を12時間へ短縮、論文では全 phase 18～24時間、fine-tuning 3～6時間と報告しており計測差はあるが、数日待つ学習を制作反復へ入れたことが核心である。

評価は一つの勝率で済ませない。未学習の shooting scenario で2,000 shot を試す自動定量評価、professional goalkeeper と QV による定性評価、開始位置・速度・回転と期待行動を固定した344件の expert-authored test suite を併用する。5 seed の結果は、training scenario 成功率90.0%対82.6%、独立した定量評価73.46%対65.58%で RL 側が上だが、旧 AI 向けに作られた test suite は91.5%対94.0%でわずかに下だった。experienced player が agent 種別を知らずに計400 game 攻撃した試験では、失点率25.25%対29.10%、save率54.12%対48.27%。結論は単純な全面勝利ではなく、性能を上げつつ既存の挙動契約の大半を維持し、FC 26 に実際に採用できた、というものになる。

■ 内容分析
最も重要なのは、学習器より「designer の言葉を、scenario・reward・test の三つへ翻訳する経路」である。professional goalkeeper の「中央線を覆う」「1v1では相手との空間を詰める」「無限 stamina を使った小刻み移動は人間らしくない」という知識は、save の sparse reward、中央位置の dense reward、noisy movement の penalty に変換された。性能だけなら早期に旧 AI を超えたが、動きが騒がしく信用できなかったため、滑らかさを優先したという記述は、game AI では objective score と player-facing quality が同じでないことを具体的に示している。

失敗修正も設計されている。tester が exploit や未学習状況を見つけたら、その一件だけの scenario を作る。新 buffer と過去の全 replay buffer を50:50で sampling し、200,000 step の fine-tuning 後に buffer を統合する。三つの failed scenario を順番に直す実験では平均成功率が33.0%から55.2%へ上がった一方、前に直した scenario の性能は少し後退した。つまり「古い data を混ぜれば忘れない」のではなく、plasticity と stability の衝突は残る。論文自身も catastrophic forgetting、built-in AI 由来 data の偏り、RL agent の動きが旧 AI より noisy である点を限界として挙げる。

ablation では hard reset と高 replay ratio を外すと悪化し、offline data は初期学習を速めた。一方 curriculum なしでも最終平均は近いが variance が増え、offline step なしも不安定になる。各部品は最終 score より到達時間と再現性を改善する。MuJoCo 100K では3 task で標準 SAC を上回ったが、Humanoid は大幅に下回った。高次元・長期協調では hard reset が表現学習を壊し得るため、複雑な NPC 全身制御への直輸入は危険である。

さらに評価の独立性にも限界がある。training scenario は RL 側に、expert test は旧 AI 側に偏るため、著者が最も重視するのは双方から独立した2,000 shot 評価である。しかし human 評価は経験者一名・400 game が中心で、human-likeness の大規模な統計検定ではない。344 test も実際の全 player exploit を覆う証明ではない。「300件あるから安全」ではなく、見つかった bug を一件ずつ deterministic regression へ変え続ける運用に価値がある。

■ 自分達の環境への適用
採るべきなのは RL stack 全体より、挙動変更を出荷可能にする四層である。まず既存の playable build や heuristic agent を捨てず、初期挙動と比較基準にする。次に自由 play だけで学ばせず、1機能を「基本操作→複合状況→通常 play」へ分けた scenario curriculum にする。第三に Nao_u の感覚的 feedback を、観察文のまま蓄積せず、再現 scene、行動条件、失敗 assertion へ変換する。第四に、平均性能、挙動契約、主観 playtest を別の gate とし、どれか一つの改善で出荷判定しない。

小さな probe なら RL は不要である。敵の間合い制御か回避 NPC を一体選び、固定 seed の10 scenario を作る。既存版と変更版を各3回 headless 実行し、task success、禁止挙動数、位置・速度の滑らかさ、frame cost を記録する。人手で見つけた失敗は初期 state と期待 event を固定して regression case に昇格する。未知 state や assertion 外の出力では旧 heuristic に戻す fail-safe も用意する。この器が先に機能し、手調整では探索し切れない連続 action が残った時だけ parameter search や RL を差し込めばよい。

記憶システムには、「新しい修正例だけで最適化すると古い代表事例が後退する」という評価原則を移す。新 directive や atom の反映後、過去の代表 probe も混ぜて recall・分類・lifecycle 判定を再実行し、平均改善と個別 regression を分けて記録する。

■ メリット・デメリット
メリットは、既存 AI を負債ではなく bootstrap data と baseline に使えること、designer feedback を数時間単位の scenario 修正へ接続できること、bug が test suite を強くすること、性能と人間らしさを分離評価できること、170μs級の小 network と fail-safe まで含めて実機制約を扱っていることにある。特に「quality は confidence と同じではない」として deterministic test を別に作った点は、headless 制作へ直接使える。

デメリットは、低解像度でも高速な本体 simulation、offline dataset、scenario authoring、expert、QV、344 test の保守費が必要なこと、reward と test に専門家の偏りが入ること、繰り返し修正で過去能力が落ちること、未知状況の coverage を証明できないことだ。旧 AI data は立ち上がりを速めるが旧挙動も継承し得る。hard reset は対象によって安定性を壊す。小型 prototype で全基盤を先に作れば、遊びを作るより harness 維持が主目的になる。

■ 判定
部分採用。legacy behavior からの bootstrap、scenario 単位の designer feedback、独立定量評価・挙動 test・主観 playtest の三層 gate、bug の regression 化、未知状態の fallback を制作パターンとして採る。SAC、hard reset、大規模 dataset 基盤は、headless probe で手調整の限界と反復時間の利益を確認した対象にだけ導入する。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Jones_Michael_ReinforcementLearninginFC26.pdf
https://arxiv.org/abs/2510.23216
