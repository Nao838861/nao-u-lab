■ 概要
この論文が扱うのは、少数の人間プレイ動画から画面入力型 agent を学習するときの二重の distribution shift である。task ごとの熟練 demonstration は収集費が高く、少数では rollout 中に未知状態へ外れやすい。さらに remote streaming では帯域低下、圧縮、buffering、遅延による破損が数 frame から数秒続く。各 frame を独立に変える color jitter や affine transform では、この時間構造を表現できない。

提案は配信映像の破損を四つに手設計する。scrub は縦長の pixel 化帯を移動させ、pixelation は局所矩形を block 化し、fuzziness は画面全体の Gaussian blur を増減させる。ghosting は前の augmented frame の一部を現在へ混ぜ、残像を再帰的に持続させる。各効果は50～100 frame の連続 chunk に適用し、位置や強度を正弦波で変え、両端に3 frame の fade を入れる。これにより frame 単位のちらつきでなく、滑らかな burst 状劣化を作る。

基盤は Predictive Inverse Dynamics Model（PIDM）で、THEIA の凍結 visual backbone と、現在・未来 latent から controller action を出す MLP を用いる。各 demonstration につき10 variant を事前計算し、clean trajectory を確率0.2で残す。比較は original のみ、affine＋color jitter の standard、四種の streaming、両者を5本ずつ混ぜた all の四条件である。

評価は二つの commercial 3D game、合計3 task。Game 1 の2 task は35～45秒、Game 2 は約2分32秒で timing の厳しい操作を含む。各 task 30本の expert demonstration を5 / 10 / 15 / 30本へ絞る。別 cloud region の game を streaming service 経由で30 Hz操作し、navigation、attack、interaction などの milestone 完了率を、方式を伏せた動画の人手注釈で測る。通常は5 seed×各10 rollout である。

clean 条件でも all augmentation は少数データほど効き、Game 1 Task 1 は15 demonstration で43.3%から84.7%、Task 2 は5本で36.5%から67.5%へ上がった。2～10 msの追加 lag では、30本の Task 2 で original-only が94.36%から44.55%へ49.82 point低下した一方、all は97.45%から90.00%への7.45 point低下に留まった。約50%の frame を人工破損する test でも streaming は standard より Task 1で87%対76.5%、Task 2で96.18%対53.45%。別 game の長期 Task 3 は55.20%から65.07%、難所 Third Jump は6%から26%になった。観測 channel 固有の時間相関が sample efficiency と robustness の双方に効く、という結論である。

■ 内容分析
本質は「映像を汚せば頑健になる」ことではなく、環境 dynamics と観測 channel を分離した domain randomization にある。game state を変えず、映像だけに channel shift を作り、持続時間、移動、fade、前 frame 依存まで表現した。事前学習 backbone があっても real lag で崩れ、frame-wise standard augmentation が synthetic corruption に弱かったことは、時間構造が独立した failure axis だと示す。

平均 score だけでなく milestone の深さを見た点もよい。長期 task は初期の誤認が後続を到達不能にする。Third Jump の6%対26%や、lag 時に後半で差が広がる結果は、単発認識より「失敗を連鎖させない観測安定性」への寄与を示唆し、工程別 survival curve に近く読める。

ただし sample efficiency を四種の streaming 効果だけへ帰属させるのは早い。5 demonstration の Task 1 では streaming-only が combined より悪い。ablation は standard / streaming / combined までで、四種個別の寄与や、chunk 長、正弦波、fade の感度は未分離だ。clean 条件の伸びには視覚多様性と regularization も混ざる。

外的妥当性も限定的だ。2 game・3 task、PIDM と固定 backbone、最大30 demonstration で、real lag の主比較はGame 1 Task 2の一条件だけ。2～10 ms追加は packet loss、frame drop、action delay を網羅しない。lag 条件は10 rollout 平均、通常条件は5 seed×10 rollout と集計単位も揃わない。別 game の+9.87 pointは有望だが一般的優位の確証ではない。

■ 自分達の環境への適用
直接使えるのは「観測経路 robustness probe」の設計である。画面入力型の自動テスト player や replay evaluator に、連続 frame の scrub、局所 block、全体 blur、残像、frame repeat / drop を注入する。seed、開始 frame、duration、強度、領域軌跡を保存し、同じ replay に clean と corrupted を対で流せば、rule-based bot や vision detector にも使える。

最終成否だけでなく task を ordered milestone に分け、到達率、最初の逸脱点、復帰 frame 数、不要 action 数、clean からの低下幅を記録する。序盤の誤認で後半が全滅する場合は milestone ごとの conditional survival を見る。headless cycle では build hash、seed、artifact parameters、動画、判定を一つの evidence bundle にする。

既存1 task、5～10 replay で clean / frame-wise noise / temporally coherent noise を同一 seed 比較する。検出器は認識 F1 と連続誤検出長、操作 agent は milestone completion と recovery latency を測る。次に四種の leave-one-out と、実 capture の burst 長へ合わせる calibration を行う。clean 性能を保ちつつ、最大連続失敗長と後半脱落が減れば採用する。

記憶の recall test にも、単発 typo ではなく、古い build 情報や誤 provenance が数 step 残る、取得失敗が続く、といった時間相関 corruption を入れられる。独立ノイズ耐性と、持続する stale context からの回復は別性能として測る。

■ メリット・デメリット
メリットは、既存動画へ後処理でき、engine や reward API の改造が不要なこと、cache と seed 固定で再現可能なこと、少数 demonstration で改善幅が大きいことだ。時間軸まで model 化するため、静止画 test が見逃す連鎖失敗を表面化でき、clean 性能と corruption 耐性を同じ pipeline で測れる。

デメリットは、四種が実 codec や capture stack の error 分布と一致する保証がないことだ。過度な blur や ghosting は必要な細部を無視する shortcut を学ばせうる。cache は保存量が11倍で多様性も制限する。visual artifact を直しても action delay、入力 queue、audio cue、解像度変更には効かない。実 capture で校正せず50～100 frameを移植するのは危険である。

■ 判定
部分採用。四種の見た目と固定 parameter をそのまま標準化するのではなく、「frame-wise noise と時間相関 noise を分け、milestone 深度と連続失敗で評価する」枠組みを観測 robustness probe に採る。最初は既存 replay に対する可逆な corruption suite として実装し、実 capture との分布差、clean degradation、各 augmentation の寄与を確認してから学習 data へ入れる。

■ URL
https://arxiv.org/abs/2607.14200
https://www.microsoft.com/en-us/research/articles/temporal-augmentations-for-streamed-video-games-supplementary-material/
