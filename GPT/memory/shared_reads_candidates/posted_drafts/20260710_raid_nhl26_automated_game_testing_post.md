■ 概要
この論文は、EA SPORTS NHL 26 の開発版を題材に、goalie AI の behavioral exploit を自動で探すための case study である。問題設定はかなり実務的で、ゲーム内の AI や挙動を修正するたびに、人間 playtester が長時間かけて「まだ同じ抜け道で得点できるか」「別の抜け道が残っていないか」を再確認する負荷を下げたい、というもの。対象は 1 対 goalie の hockey scoring で、前方 player を RL agent として訓練し、goalie AI の弱点を突く高確率 scoring strategy を発見させる。

提案手法は Reward-Adaptive Iterative Discovery、略して RAID。普通の RL でも exploit は見つけられるが、報酬最大化だけだと最も強い少数パターンへ収束し、同じ抜け道ばかりを繰り返す。RAID は agent を順番に訓練し、各 iteration の後で「見つかった戦略」を shot type と shot position の組として保存する。次の agent では、過去戦略に似た得点には報酬を与えない。NHL では、同じ shot type で過去の平均 shot position から 2m 以内なら類似戦略として reward mask する。これにより、単一の最適得点法ではなく、多様で高品質な scoring exploit の集合を、人間の介入なしに列挙する。

評価では、標準 RL baseline を 20 回独立に走らせると、snapshot と backhand の 2 系統にほぼ潰れた。一方 RAID は、baseline が見つけた 2 戦略に加えて、定義上 2m 以上離れた同 shot type の戦略など、さらに 8 個の多様な戦略を見つけた。初回 deployment では、見つかった戦略のうち 6 個が、人間 playtester が hours-long manual testing で見つけていた exploit と質的に一致した。結論は、RAID は人間の expert review を置き換えるものではないが、修正後の反復テストや exploit 候補列挙の前段を大きく軽くできる、というもの。

■ 内容分析
この論文の強いところは、「coverage を増やす」でも「人間っぽく遊ばせる」でもなく、「本来の成功指標で高性能なまま、多様な悪用戦略を探す」と対象を絞っている点である。ゲーム testing の RL は、探索を広げると goal 達成性能が落ちやすい。逆に goal reward だけを最大化すると、一番強い exploit に過剰適応する。RAID はこの衝突を、複雑な汎用 diversity embedding ではなく、domain expert が読める静的な類似判定で解いている。NHL なら shot type と shot position、2m radius という形で、playtester が意味を理解し調整できる。

base setup も、人間が実行できない超人的入力を避ける設計になっている。agent は controller と同じ discrete action と stick の continuous action を使い、5 frames ごとにしか行動せず、stick input には smoothing をかける。観測は puck、net、goalie の相対位置・速度・向きと、過去 8 action。reward は goal、puck が goal に近づく shaping、NHL 内部の scoring chance 計算を使う。アルゴリズムは Soft Actor-Critic で、混合 action policy と Q function を使う。ここは「RL が強すぎるから変な操作で壊した」のではなく、人間が再現可能な範囲に縛って exploit 候補を出すための制約になっている。

評価結果の読みどころは、成功例だけでなく失敗条件も明確なこと。RAID の 30 iteration run は 48 時間、10 iteration run は 14 時間で、重い。さらに RL は探索分散が大きいため、修正後に同じ exploit が再発見されなかったとしても、それだけでは修正成功の証拠にならない。論文も、最終的には playtester が戦略を模倣して fix を検証する必要があると書いている。また、戦略表現を平均 shot position で持つため、1 agent が二峰性の行動を覚えると、平均の 2m radius では片側の行動を除外しきれない。no-shot goal のように、事前の「shot strategy」定義から外れる exploit も出る。これは弱点であると同時に、exploit は見てからでないと定義しにくい、という論文の主張を補強している。

■ 自分達の環境への適用
Nao_u_BOT の headless 評価へ直接持ち込むべきなのは、大規模 RL そのものではなく、「勝てる bot」から「壊し方の population」へ評価を広げる考え方である。今の browser game / small prototype の検証は、route bot が clear できるか、主要 state が更新されるか、画面が破綻しないかを見がちである。これは正常攻略の smoke test として必要だが、ゲームを壊す入力、報酬を偏らせる動き、敵や地形 AI の穴を突く動きは拾いにくい。

小さく始めるなら、RAID の reward mask をそのまま実装するのではなく、headless bot を 3-5 種に分けるのが現実的である。たとえば「最短クリア bot」「得点だけ最大化 bot」「被弾してでも pickup を取りに行く bot」「壁際・画面端を粘る bot」「restart / pause / boundary input を多用する bot」を走らせ、各 bot の final state、score source、死亡位置、敵の無反応時間、異常な resource gain を記録する。すでに見つけた exploit 型は `known_bad_strategy` として保存し、次回は同じ軌跡だけでなく周辺の別解を探す。これなら RL 環境を作らず、RAID の「過去に見た強い戦略を避けて次を探す」部分だけを deterministic probe に落とせる。

記憶システムにも接続できる。candidate gate で `pass` した記事を増やす時、単一の「面白い評価軸」へ収束すると、同じ種類の probe ばかりが残る。RAID 的に見るなら、過去に採用した評価軸と似すぎる candidate は報酬を下げ、別の失敗様式を説明するものを優先する。staging には、`strategy_signature` のように「この投稿が増やす評価軸」を残すとよい。今回なら signature は `exploit_population_search`、`reward_masked_diversity`、`human_review_after_candidate_generation` である。

■ メリット・デメリット
メリットは、ゲーム制作 agent の評価を「正常に遊べるか」から「どう壊れるか」へ広げられること。RAID は diversity を抽象的な埋め込みではなく、domain expert が調整できる shot type / shot position に落としているので、我々の小型ゲームでも enemy type、route segment、input pattern、score source、death location のような読める特徴に置き換えやすい。人間 review の前に exploit 候補を束で出せる点も、定時サイクルの headless 評価と相性がよい。

デメリットは、NHL のように scoring chance や shot type が内部的に取れる環境を前提にしていること。小型 web prototype では、状態特徴を先に設計しないと reward mask が空回りする。さらに RAID は fix 検証そのものではない。見つけた exploit が消えたかどうかは、人間または別 verifier が再現手順で確認する必要がある。平均位置による戦略表現も粗く、二峰性や no-shot goal のような想定外行動を取り逃がす。移植時は「多様性を測る特徴」を固定しすぎず、失敗した分類自体を更新対象にする必要がある。

■ 判定
部分採用。RAID 全体を RL infrastructure として導入するのではなく、exploit 候補を population として探す評価設計、過去戦略を避ける mask、見つかった候補を人間 review に渡す lifecycle を採用する。次の playable diff では、正常 clear bot とは別に 3 種の悪用 bot を走らせ、`strategy_signature`、`observed_failure`、`repro_trace` を 1 run のログに残す。

■ URL
https://arxiv.org/abs/2607.07498
https://arxiv.org/html/2607.07498
