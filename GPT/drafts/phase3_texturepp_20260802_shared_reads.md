■ 概要
Texture++ は、低解像度の texture が原因で再利用しにくくなった 3D asset を、元の意匠を保ちながら 4 倍に超解像する手法である。単純に UV texture map を 2D 画像として拡大すると、3D 表面上では連続した模様が UV island の境界で切れ、離れた画像片として処理される。その結果、seam をまたぐ線・文字・木目などに不連続や異なる高周波 detail が生じる。本手法の中核は、これを UV 空間の画像修復ではなく、mesh を複数視点から render し、連続した表面を view space で局所的に超解像し、texture へ戻す反復問題に変えた点にある。

処理は四段階で進む。第一に、UV chart 内の表面をできるだけ正面から広く見る canonical view と、複数 chart へ分断された seam 周辺を 3D 上の一枚の連続面として見る observation view を作る。方向は対象 face の面積重み付き平均法線、位置は幾何中心から決める。UV island や seam strip が多い場合は、法線・位置・視線方向を用いて視点を階層的に統合し、visibility culling 後に見えない face を追加視点で補う。

第二に、各視点で surface normal と視線の正面度、camera からの距離の二乗逆数から幾何学的 quality map を作る。texture の各 texel が過去に得た最良値を global quality map に保存し、現在視点がそれ以上に良く観測できる領域だけを更新 mask にする。ただし pixel 単位の比較では mask 輪郭が細かく分断され、diffusion model がそれ自体を模様と誤認する。そこで quadtree で領域を分割し、最小 block 内に 0/1 が混在する境界はまとめて更新対象にする。

第三に、Stable Diffusion 2.1-base を改造した局所 SR model へ render 画像と mask を入れる。VAE latent 4 channel に mask 1 channel を連結し、内容保持用と mask 制御用の二つの LoRA を学習する。通常の拡散過程を何ステップも回すのではなく、必要な latent residual を一回で予測し、mask 内だけに適用する。学習 loss も mask 内の MSE と LPIPS の複合で、周囲を作り直さずに高周波 detail を接続する。第四に、生成結果を gradient optimization なしで HR texture へ直接投影する。これを視点ごとに反復し、表面全体を徐々に覆う。

評価は 4× SR で、TRELLIS と Sketchfab 由来の HR asset から Gaussian blur と bicubic downsampling で LR を合成し、五つの 2D image SR と三つの texture generation/refinement 手法と比較している。Texture++ は PSNR 37.5277、SSIM 0.9524、LPIPS 0.0637、DISTS 0.0736 で全指標首位、処理時間は 94.4 秒だった。最速の InvSR 42.0 秒や HYPIR 48.0 秒より遅いが、DiffBIR 586.2 秒や texture generation 系の 130.4〜321.5 秒より速い。定性比較では、2D SR の seam 破綻と texture generation による文字・構造の消失を抑えた。視点選択、quadtree、mask 条件付けを外す ablation でも各役割を確認し、xatlas と Blender の異なる UV 展開でも指標の大崩れはなかった。

■ 内容分析
本研究の良さは、diffusion model 自体の新奇性より、「どの領域を、どの視点から、一度だけ良い条件で更新するか」を幾何で制御した点にある。UV seam の本質は画像境界ではなく表現の分断なので、3D 上で連続に見える観測へ戻すのは合理的である。また、同じ texel を異なる視点の確率的出力で何度も上書きすると、detail が増えるどころか不整合とぼけが蓄積する。global quality map は生成器の自由度を減らし、更新の所有権を一つの視点に与える仕組みと読める。この「良い観測を選び、再処理を減らす」設計は、完全な生成より既存資産の保守的な再利用に向いている。

ただし、論文の「単調に良くなる」は強く読みすぎてはいけない。mask の採否を決める quality は、正面に近いか、camera が近いかという観測条件であり、生成された detail が原 texture の意匠に忠実かを測っていない。幾何学的に優れた視点から、もっともらしいが誤った模様を一度書き込む可能性は残る。特にロゴ、文字、機械部品の線、キャラクター固有の傷は、LPIPS 上の自然さと art direction 上の正しさが一致しない。

評価にも留保が必要である。公開 model の不足のため、既存の専用 texture SR 手法との直接比較はなく、2D SR は texture map 全体への一括適用、texture generation 系は refinement 段の転用である。これらは「既存手法を実務上最適な 3D-aware local SR 構成にした場合」の公平な比較ではない。また評価 LR は clean な HR texture へ blur と bicubic downsampling をかけた合成品で、JPEG/block artifact、古い hand-painted texture の色段差、異方性 filtering 後のぼけ、欠損 alpha といった実 asset の劣化分布は未検証である。作者自身も、複雑な自己遮蔽で見えない領域は更新できずぼけたまま残ること、PBR material には未対応であることを明記している。

■ 自分達の環境への適用
直接の対象は、旧 3D model、prototype 用に小さく作った texture、外部 asset pack の再利用である。ただし現時点では source code は将来公開とされ、学習に A6000 48GB を 3 枚、asset ごとの反復 refinement に A6000 1 枚を使っている。自前実装をすぐ導入するのは重い。まず採るべきは model ではなく評価の切り分け方である。

小さな probe として、①比較的平坦な hard-surface asset、②文字または規則模様が seam をまぐ asset、③腕や装飾が胴体を隠す self-occluded asset の 3 種を固定する。各 asset で元 texture、汎用 2D upscaler、入手できた専用手法を同じ 4× で出力し、ゲーム内の固定 camera path を回す。計測は texture-space の PSNR/LPIPS だけでなく、seam の両側に対応する色・勾配の差、frame 間 flicker、文字の可読性、原画と異なる detail の発生数、処理時間、VRAM を保存する。headless 側では同一 camera path の画像と seam crop を deterministic に出力し、最後に人間が art direction 上の改変を目視判定する。

この順序なら、「数値上は sharp だが、キャラクターの固有模様が変わった」と「seam が減り、実際の gameplay camera で読みやすくなった」を分けられる。導入条件は、正面から観測できる base-color 中心の asset で、seam 連続性の改善が明確に 2D upscaler を上回り、重要な図柄の改変が許容閾値以下であることとする。PBR の normal、roughness、metallic を base color と同じ生成処理に入れるのは、物理的対応を壊すので対象外にする。

■ メリット・デメリット
メリットは、第一に UV layout を作り直さず、3D 上の連続性を利用できること。第二に、良い視点から見える領域だけを一回ずつ更新するため、複数視点の不整合と gradient optimization の計算コストを抑えられること。第三に、mask 条件付きの局所処理で既存の済み領域を保持できることである。既存 asset の作り直しを「全体再生成」から「観測可能な劣化箇所の修復」へ変えられる。

デメリットは、専用 model と multi-view rendering が必要で、現時点の再現コストが高いこと。自己遮蔽領域は観測できないため、穴を埋める手法ではない。PBR 非対応で、material channel 間の物理的整合性も保証されない。さらに、学習は自然画像 LSDIR に乱数 mask と RealESRGAN 劣化を適用したもので、stylized texture、pixel-art 的な形、古い asset 固有の汚れにどこまで一般化するかは不明である。定量指標が高くても、意匠変更の目視ゲートは外せない。

■ 判定
部分採用。現状はそのまま production pipeline へ入れる段階ではないが、「UV seam を view-space の観測問題として扱う」「より良い観測がある領域だけを局所更新する」という設計は採る価値がある。source code 公開後に 3 asset の固定 probe を行い、seam 連続性、意匠忠実性、flicker、計算コストで 2D upscaler を上回った場合に限り、base-color asset の再利用工程に進める。

■ URL
https://arxiv.org/abs/2607.21504
