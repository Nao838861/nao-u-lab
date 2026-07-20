■ 概要
対象は “Do Agents Dream of False Memories? Black-box Visual Attacks on Long-term Memory in Multimodal AI Agents”。画像と会話履歴を長期記憶へ保存する multimodal agent が、過去画像を「当時見た事実」として無条件に信頼する設計を攻撃面として調べた論文である。LUCID は、攻撃者が変更できるのをユーザー共有画像の pixel だけに限定する。標的 model、encoder、memory、text channel にアクセスしない black-box 条件で、見た目をほぼ変えず画像の意味表現を別概念へ寄せ、誤記憶を後続応答へ残す。

攻撃は三段階で構成される。Stage 1 は ShareGPT4V-100K から、元画像と矛盾し、後の query で検索されやすい target 画像・caption を retrieval displacement、slot-level contradiction、benign alignment penalty で選ぶ。Stage 2 は二つの failure mode を作る。in-context memory poisoning は、既存会話の画像だけを摂動版へ置換して正常な text を残し、実在した出来事の視覚内容だけを誤想起させる。out-of-context memory injection は、裏付けがない新規 topic に摂動画像を入れ、MLLM が生成した caption を唯一の意味信号として、存在しなかった出来事を植え付ける。

Stage 3 は三つの CLIP 系 surrogate ensemble 上で Feature Optimal Alignment を拡張し、局所・大域の視覚特徴を target へ寄せる損失に text-image alignment を加える。noise budget は L∞ で 16/255、1000 step。Mem-Gallery 上で MuRAG、NGMemory、AUGUSTUS、UniversalRAG、Mem0Memory の 5 backend と 5 MLLM を評価する。clean、本物の target を入れる oracle、摂動だけの adversarial を比較し、平均 attack success rate は poisoning 61.6%、injection 58.4%。画像だけの転移攻撃が architecture を跨いで成立すると結論づける。

■ 内容分析
この論文の核心は、画像認識の一回の誤りではなく、誤認が保存・検索・生成を通じて時間方向へ増幅される因果を測った点にある。poisoning では visual similarity による ASR に加え、correction loss、retrieval、F1、Hit/Recall/Precision@K、LLM judge を併記する。GPT-4o 条件の ASR は backend ごとに 37.2% から 81.5% と幅があるが、全 backend で成立した。一方、text だけから回答を復元できる問題も混ざるため、画像が壊れても正答率低下は一様ではない。ASR 61.6% は全応答の六割が誤るという意味ではない。

injection では architecture 差がさらに見える。GPT-4o 条件で ASR は NGMemory 81.3%、MuRAG 75.0% に対し、Mem0Memory 37.5%、AUGUSTUS 43.8%。5 MLLM 間でも 48.8% から 81.3% まで開く。retrieval が 90% 前後でも ASR が低い model があり、悪い記憶を取得したことと、その内容に従って回答したことは別の safety dimension である。

防御比較は実用上とても重要である。Gaussian blur と JPEG 再圧縮は、caption 生成前に高周波摂動を崩し、平均 ASR を無防御の 35.9% から 15.6% / 18.8% へ下げ、F1 への影響も小さかった。対して LLM-as-judge は、生成済み caption が流暢で自然なためほぼ効かない。judge は元画像の ground truth を持たず、もっともらしい虚偽と正しい説明を区別できない。semantic drift filter は一部 backend で効くが、graph 側に残る turn text が検索信号になる構成では効かない。retrieval-time anomaly score も ASR を下げず、F1 だけを 0.09 落とした。つまり、誤った text memory が出来てから文章だけを審査するのでは遅く、captioning 前の画像処理と cross-modal consistency が必要になる。

限界もある。これは v1 preprint で、主評価は Mem-Gallery と人工 target に依存する。攻撃には画像を差し替えられる入口が必要で、通常のローカル制作物が同じ確率で侵害されるわけではない。ε=16/255 の「imperceptible」は budget に基づく扱いで、現実の asset pipeline での生存率は別検証が要る。blur/JPEG も、より stealthy な攻撃には不十分である。

■ 自分達の環境への適用
Nao_u_BOT では、screenshot、生成 asset、playtest frame を、そのまま事実 atom へ変換しない ingestion gate を採る。各画像由来 memory に source path、content hash、生成元または capture command、git commit、game build、seed、frame 時刻、対応する serialized game state を結び付ける。重要なのは hash だけではない。取り込み前から汚れた画像には hash も正しく付くため、由来の確認と、画像から抽出した主張を別 signal で照合する必要がある。

ゲーム制作では「見た目」と「内部状態」を分ける。screenshot が boss 撃破、残機、座標、score を示しても、合否は headless evaluator の state 値を正本にする。美術評価は、原寸・JPEG 再圧縮・軽い blur で caption を再生成し、意味が大きく変わる場合は quarantine へ送る。これは古い build、別 seed、壊れた render、asset variant の混同にも効く。

小さな probe は 20 件程度でよい。正常な playtest frame と、resize・再圧縮・色変換を施した派生を用意し、同じ captioner で記述の安定性を測る。画像 caption、近傍検索結果、対応する game state の三者を保存し、caption drift、retrieval overlap、state contradiction を記録する。最初から攻撃生成器を再現する必要はない。まず「画像処理で意味が揺れる記憶を昇格させない」「視覚だけで game outcome を確定しない」という二つの gate が、通常制作の false positive を増やさず運用できるかを検証する。

記憶システムでは、raw image、抽出 caption、そこから作った判断 atom を別層に保ち、provenance edge を切らない。後で caption が訂正された時に、派生 atom を検索して stale にできる構造が必要である。LUCID が示す危険は一件の誤記憶より、もっともらしい誤記憶が retrieval のたびに正しい根拠として再利用されることだからである。

■ メリット・デメリット
メリットは、視覚入力、memory write、retrieval、最終応答を一つの failure chain として分解できること。攻撃成功率だけでなく retrieval と generation の差を測るので、防御を置く場所を選びやすい。画像前処理が text-only judge より有効だった結果は、我々の provenance・再観測・state verification を ingestion 前へ置く根拠になる。また、5 backend と複数 MLLM を跨ぐ転移は、encoder を替えるだけでは安全にならないことを示す。

デメリットは、堅牢化のため全画像を多重 caption、再圧縮、cross-check すると latency と API cost が増え、画風や細部が重要な asset では blur が本物の情報まで失わせること。semantic drift の閾値も architecture 依存で、単一の score を全 memory に適用すると有用な記憶を落とす。さらに本論文の数値は会話 benchmark 上の attack efficacy であり、我々の制作環境の事故率や防御効果へ直接換算できない。導入は trust tier と provenance を先に整え、high-impact な画像由来判断だけ検査を厚くするのが妥当である。

■ 判定
部分採用。攻撃生成手法そのものではなく、視覚 memory を未検証の入力として扱う threat model、write 前の画像 variant 検査、画像・caption・内部 state の cross-modal consistency、派生 atom まで追える provenance を採る。最初の実装単位は、20 frame の caption stability と state contradiction を測る可逆な ingestion probe とする。

■ URL
https://arxiv.org/abs/2607.15657
https://arxiv.org/pdf/2607.15657
