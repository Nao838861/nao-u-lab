■ 概要
この論文は、LLM agent の長期的な行動改善を「過去の経験を文章で思い出させる」だけでは足りない、という問題から出発している。RAG や memory bank は、ユーザーの好み、制約、過去の事実のような declarative memory には強い。しかし、ゲーム環境や Web 操作のように、状態を見て、順序を守り、無効行動を避け、途中手順を落とさず実行する procedural memory では、自然言語のルールを context に入れても行動へ変換されないことがある。論文はこれを text-action disconnect と呼び、手順を「読ませる」だけではなく、過去の成功/失敗 trajectory から抽出した activation steering vector を推論中の residual stream に注入し、行動に近い内部表現を直接動かす Neural Procedural Memory (NPM) を提案する。

手法は training-free で、モデル重みは更新しない。過去ログから contrastive experience を作り、成功軌跡と失敗軌跡の差、または失敗軌跡の中の有効 step と無効 step の差を hidden state 上の方向として抽出する。推論時には現在 task に近い過去経験を retrieval し、複数の contrast から task-specific な steering vector を合成して、生成中の中後段 layer へ加える。評価は ALFWorld、WebShop、ScienceWorld、BabyAI の 4 benchmark、複数 backbone で行われ、NPM は no-memory より多くの条件で改善し、explicit textual memory と同程度の性能を示す。さらに Workflows のような明示的手順と NPM を併用した Hybrid が最も強く、論文の結論は「文章の workflow と内部表現への steering は競合ではなく相補的」というものになっている。

■ 内容分析
重要なのは、NPM が「記憶を別形式で圧縮する」だけではなく、procedural skill の取り出し方を失敗ログ中心に設計している点である。inter-trajectory contrast は成功例と失敗例が両方ある task で、全体として成功側へ移る方向を作る。一方、intra-trajectory contrast は成功例が少ない場合でも使える。連続同一 command の繰り返し、環境から無効と返された action、進展しない操作などを degenerate step とし、それ以外の effective step と比較する。これは、ゲーム bot の失敗ログでよく見る「同じ壁へ歩き続ける」「まだ鍵を持っていない扉を開け続ける」「攻撃範囲外で空振りする」のような状態を、単なる失敗 episode ではなく、内部表現の修正材料として使う発想に近い。

評価結果も、単に activation steering が万能という読み方ではない。論文では NPM が base model より改善し、MiniCPM3-4B の平均 score が 22.60 から 28.87、Qwen3-8B が 30.63 から 36.32 に上がる例を示している。ただし structured Workflows は強く、NPM 単独が常に最良ではない。強いのは Hybrid で、たとえば Qwen3-8B では ALFWorld の success rate が 66.42% まで上がり、ScienceWorld でも最高値を取る。つまり、抽象的な行動方針は明示テキストで与え、長い実行中に逸脱しない力を activation steering で補う構図で読むべきである。これは prompt engineering の代替ではなく、prompt が表現できない、または表現しても行動に落ちない部分を補助する層である。

限界も明確にある。第一に、モデル内部の hidden state へ介入できる環境が前提で、API 経由の black-box model ではそのまま使えない。第二に、steering vector は便利な行動補正である一方、なぜその方向が安全かを外部から完全に説明しにくい。論文は interpretability 分析で task logic が organized structure を作ると述べるが、production の agent に入れるなら、誤った skill を強化した場合の解除、対象 task 以外へ転移した時の副作用、古いログから抽出した vector の劣化を別途監査する必要がある。第三に、評価は agent benchmark 上の成功率/報酬が中心で、我々が欲しい「プレイヤー体験として自然か」「制作意図に合うか」までは測っていない。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、まず hidden state 介入を直接実装するより、NPM の contrastive data design を借りるのが現実的である。headless playtest や browser automation の replay を、success/failure だけで保存するのではなく、effective step と degenerate step に分ける。たとえば prototype ごとに `action_validity`、`state_progress`、`repeat_without_delta`、`blocked_by_missing_item`、`damage_without_gain` のような列を trace に足す。Phase 3b/4a では、shared-reads の知見を恒久ルールに増やすのではなく、「失敗ログから対照ペアを作れるか」を小さな probe にする。

具体的な検証案は二段階でよい。第一段階では LLM 内部へ steering せず、同じ失敗 trace から 3 行以内の skill note を生成し、次回 headless run に明示的 workflow として入れる。これで改善しない場合、文章化した procedural memory が action に落ちていない可能性を記録する。第二段階では、open-weight model を使う agent 実験だけに限定し、NPM 的な vector 介入を sandbox で試す。対象はゲーム全体ではなく、BabyAI 風の小さい grid task や PuzzleScript 的な短い環境にする。測るべきものは最終勝率だけでなく、同一 seed での無効行動率、繰り返し行動率、必要 intermediate step の欠落率である。

記憶システム側にも応用できる。candidate や atom の recall は declarative memory に寄っているが、実際の作業失敗は「読んだのに守れない」ことが多い。Phase 3 の投稿ルールで「URL は末尾」「他 AI への依頼文は禁止」と書いてあっても、ドラフト生成時に旧テンプレが混ざるなら、それは text-action disconnect と同型である。短期的には、投稿前レビューを単なるチェックリストではなく、違反例と修正版の contrastive pair として保存し、次回ドラフト生成の few-shot に使う。内部 activation は触らなくても、対照ログを明示的に残すだけで procedural memory の質は上がる。

■ メリット・デメリット
メリットは、失敗ログを再利用可能な skill に変える設計が具体的なこと。成功例が少なくても intra-trajectory contrast で「どこが退化した行動か」を抽出できるため、ゲーム bot の初期失敗、操作不能ログ、QA agent の詰まりに向く。context を長くしないので、明示 memory を増やすほど推論が重くなる問題にも別解を出している。Hybrid の結果は、我々の運用でも「ルール文を捨てる」のではなく「ルール文と行動補正ログを分ける」判断を支える。

デメリットは、実装可能性と監査性である。現行の主力 API agent では residual stream 介入ができないため、直接導入は open-weight 実験に限られる。さらに、steering は誤った癖も強化し得る。たとえば「敵を避ける」vector が探索やリスク取得まで弱める可能性がある。ゲーム制作では、勝率が上がっても面白さが下がることがあるため、behavior metric と体験評価を分けなければならない。

■ 判定
部分採用。NPM そのものを production に入れるのではなく、contrastive experience、degenerate/effective step 分離、Hybrid memory という設計を採用する。直近では headless playtest trace に失敗 step の分類を足し、文章化した workflow が実行に効いたかを同一 seed で測る。内部 activation steering は、open-weight の小環境でのみ検証対象にする。

■ URL
https://arxiv.org/abs/2606.29824
