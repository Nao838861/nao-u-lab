
## Slack新着 [2026-06-03 09:56] #nao-u
From: U0ALSUK8P9B
> <https://x.com/miya00907380/status/2061568471402697073?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/miya00907380/status/2061568471402697073?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 


## Slack新着 [2026-06-11 09:13] #nao-u
From: U0ALSUK8P9B
> Claudeを使って言う人は全員、定時サイクルを全て止めて、週間リクエストを使わないようにしてほしい。

## Slack新着 [2026-07-01 03:23] #shared-reads
From: U0ALSUK8P9B
> ■ 概要
GameVerse は、VLM agent をゲームに一回投げて成否を見る従来型の fire-and-forget 評価ではなく、「失敗したプレイ動画を見る」「expert tutorial を見る」「その差分を反省として圧縮する」「次の試行に反映する」という reflect-and-retry ループを評価対象にしたベンチマークである。対象は 15 本の実ゲームで、Tic-Tac-Toe / Baba Is You / 2048 のような抽象的な grid 系から、Ace Attorney / Civilization VI の長期記憶系、Plants vs. Zombies / Forza Horizon 5 の実時間系、Genshin Impact / Red Dead Redemption 2 の高忠実度 3D 系までを含む。分類は商業ジャンルではなく、画像構造、時間制約、因果の線形性という認知軸で組まれている。
手法の中核は三つある。第一に、semantic action と GUI control の二重 action space を用意し、高レベル方針が分かるかと、画面上で正確に操作できるかを分けて測る。第二に、失敗軌跡と expert tutorial をモデルに比較させ、戦略や実行のズレを短い経験則として次試行の prompt に入れる。第三に、単なる勝敗ではなく milestone evaluation で進捗を測る。実験では 7 種の VLM を比較し、動画ベースの反省は多くの条件で改善を出すが、効果は安定しない。失敗動画だけ、tutorial だけより、両方を組み合わせた時が最も良い一方で、複雑なゲームでは認知ボトルネック、実行精度、推論 latency が残り、人間のような経験の内在化には届かない、という結論である。

■ 内容分析
この記事の価値は「反省が効く」という楽観ではなく、反省を評価単位にした上で、どこで反省が壊れるかまで切っている点にある。GameVerse は既存 benchmark の弱点を三つ見ている。商業ジャンル分類はモデルの失敗原因を説明しにくい。内部 API や状態テキストに頼る scaffold は、人間が画面だけで遊ぶ条件から離れる。さらに一回限りの評価では、ゲームで重要な「失敗から方針を直す」能力を見落とす。そこで、視覚入力だけに寄せた taxonomy、dual action space、failure reflection を同じ枠に入れている。
評価設計も比較的よい。semantic action は「何をすべきか」を測り、GUI action は「それを画面操作に落とせるか」を測る。これは VLM agent の失敗を、方針の失敗と操作の失敗に分けるために重要である。milestone evaluation も、長いゲームで単純な clear/fail だけを見るより情報量が多い。Ace Attorney なら事件理解や証拠提示の節目、Angry Birds なら物理パズルの攻略段階、Plants vs. Zombies なら資源収集と配置のように、ゲームごとの進捗を段階化できる。
一方で、反省ループの限界も明確である。論文は、モデルが正しい洞察を言語化しても次の試行に安定して組み込めない cognitive bottleneck を挙げる。さらに、実時間ゲームでは latency が状態変化と推論をずらし、GUI 操作では「分かっているが押せない」physical disconnect が起きる。特に重要なのは、動画反省が GUI action では逆効果になる場合がある点である。過去の失敗を読む負荷が増えることで、ピクセル位置合わせやタイミングが悪化するなら、反省は万能な改善器ではなく、操作空間と時間制約に合わせて絞るべき道具になる。

このため、GameVerse は「VLM がゲームを遊べるようになった」論文ではなく、「VLM の改善能力を分解して測ると、方針更新、視覚理解、操作実行、時間追従が別々に壊れる」ことを示す評価設計として読むのが正しい。反省ありの平均点だけを見ると前向きに見えるが、失敗型の分布を見ると、制作現場で採用すべきなのは長い自己反省ではなく、失敗の種類を保存して次の実験条件を固定する手順である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルに直接入れるなら、GameVerse 全体を再現するより「失敗軌跡付き playable diff 評価」を先に切り出すのがよい。今の headless 評価やスクリーンショット確認は、単発の状態を見て「動くか」「破綻していないか」を判定しがちである。ここに、失敗した run の短い動画、操作ログ、終了理由、到達 milestone を保存し、次の修正前に「どの失敗が設計上の失敗で、どれが操作・認識・latency の失敗か」を分類する手順を足す。
小さな検証案は次の形で十分である。1 つの新作 prototype につき、headless または Playwright 操作で 3 run を記録し、各 run に milestone を 3 から 5 個だけ定義する。失敗時は、最終画面だけでなく 10 秒程度の直前軌跡と入力ログを残す。次に、修正案を書く前に、失敗を perception / reasoning / execution / latency の四分類に分ける。修正後に同じ seed と別 seed で再試行し、milestone 到達数が増えたか、別の失敗型に移ったかを見る。これなら、動画 benchmark 全体の重い基盤なしに、GameVerse の一番使える部分である「失敗を次試行の材料にする」構造だけを取り込める。
この軽量版では expert tutorial は必須にしない。代わりに、実装者が想定する最短成功手順を 5 行程度の oracle trace として残す。AI の失敗軌跡と oracle trace の差が、設計ミスなのか、UI 表示不足なのか、単に操作が難しすぎるのかを切り分ける材料になる。

記憶システムにも使える。単なる「このゲームは難しかった」という atom ではなく、failure trajectory atom として、観測、入力、失敗分類、修正仮説、再試行結果を同じ単位で残す。これにより、次の制作時に「反省文」だけでなく「反省が実際に改善したか」を recall できる。GameVerse の教訓は、反省の文章を増やすことではなく、反省を再試行と結び付けて検証可能にすることだと見る。

■ メリット・デメリット
メリットは、評価を結果点から改善能力へ移せること。ゲーム制作では、初回プレイの成否より、失敗を見てどの修正に進むかの方が実用的である。failure trajectory と expert trace の比較は、AI が作ったゲームの「どこで詰まったか」を説明しやすくし、単発スクリーンショット評価より設計修正に直結する。semantic / GUI の分離も、面白さの問題と操作不能の問題を混ぜないために有効である。

デメリットは、動画ログと milestone 設計のコストが高いこと。すべての prototype に expert tutorial 相当を用意するのは過剰で、制作速度を落とす。さらに、反省が増えるほど実行精度が落ちる場合があるため、GUI 操作がシビアなゲームでは長い反省 prompt を入れるより、入力補助、当たり判定可視化、ポーズ付き評価の方が効く可能性がある。もう一つの危険は、VLM の反省文を設計判断そのものと誤認すること。GameVerse 自身が示す通り、正しい言語化と次プレイの改善は別物である。

■ 判定
部分採用。採用するのは benchmark 全体ではなく、失敗動画、入力ログ、milestone、失敗分類、再試行結果を一つに束ねる reflect-and-retry 評価ループである。特に playable diff の検証では、単発の「動いた」判定をやめ、失敗軌跡が次の修正でどう変わったかを見る形に寄せる価値が高い。一方、15 ゲーム規模の taxonomy や expert tutorial 収集は現段階では重すぎるため、まずは 1 prototype 3 run、3 から 5 milestone、四分類 failure tagging の軽量版で十分である。

■ URL
<https://arxiv.org/abs/2603.06656>
<https://arxiv.org/html/2603.06656>
<https://openreview.net/forum?id=Q4enC6IyTP>
