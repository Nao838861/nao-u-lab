■ 概要
対象は MDPI Applied Sciences 2025 の “Engagement-Oriented Dynamic Difficulty Adjustment”。著者は Qingwei Mi と Tianhan Gao。論文の問題設定は、従来の Dynamic Difficulty Adjustment が「プレイヤーの skill と game challenge の釣り合い」を主眼にしながら、プレイヤーが離脱しそうな状態、つまり churn trend を直接の監視対象にしていない点にある。難易度が高すぎれば不安や挫折で離脱し、低すぎれば退屈で離脱する。そこで本稿は、難易度調整を快適化の後処理ではなく、challenge 中のプレイ継続時間を使って離脱兆候を検出し、対象パラメータへ介入する仕組みとして組み直している。

提案手法は EDDA、Engagement-Oriented Dynamic Difficulty Adjustment。中核は monitoring と intervention の分離である。まずゲームを challenge の列として捉える。combat、race、level、puzzle、competition のように、プレイヤーが難しさに直面する単位を challenge と呼び、複数 challenge からなるゲーム全体を sleep phase と active phase に分ける。sleep phase は開始直後で、まだ離脱判断に使わない。同じ考え方を challenge 内にも入れ、最初の一定試行や一定時間を sleep time として除外し、その後の active time だけを監視する。監視の最小単位は unit time / unit phase、離脱と判定するための継続幅は threshold time / threshold phase と定義される。

監視指標として使うのは、challenge 内の gameplay time である。高難度由来の churn では、同じ challenge の active time 内で unit time ごとの gameplay time が threshold 条件に沿って連続低下するかを見る。低難度由来の churn では、複数 challenge にまたがる平均 gameplay time の低下を見て、退屈で離れつつある状態を検出する。ここがこの論文の要点で、プレイヤーを「上手い/下手」で固定分類せず、同じ challenge に滞在し続ける時間の変化を、リアルタイムな engagement の代理として扱う。

介入側では、汎用的な adjustable parameter set を作っている。分類は player-random、partner-fixed、partner-random、opponent-fixed、opponent-random、neutral で、パラメータごとに難易度への正相関・負相関を持たせる。たとえば opponent-fixed には敵の number、attack、defense、health point、speed、adaptive capacity、perception range などがあり、これらは増えるほど難しくなる。逆に partner-fixed の number、attack、defense、health point、speed などは増えるほど難易度を下げる方向に働く。neutral には gameplay pace、difficulty seed、adverse time、hint number、beneficial time などが置かれる。RPG なら敵の攻撃力・防御力・HP・速度を下げ、味方側の能力を上げる。Racing なら味方チームが有利アイテムを得る確率、相手チームの加速間隔、cooldown などを調整する。

評価では、RPG、RAC、FTG、STG、AVG、SG、CG の 7 ジャンルを含む prototype system を実装し、baseline、EDDA-s、EDDA の 3 条件を比較している。EDDA-s は EDDA と同じ monitoring module を使うが、共通パラメータ集合による細かい介入ではなく、AI の全体 skill level を直接動かす簡易版である。参加者は 100 名、19-29 歳、男女 50 名ずつ。各 participant は 7 ジャンルを 3 条件で体験し、各条件は 2 週間、全体で 6 週間。評価指標は fitness、gameplay time、Game Engagement Questionnaire の score。GEQ は Cronbach’s alpha 0.81 で信頼性が確認されている。

結果として、gameplay time と GEQ scores は Friedman test で有意差があり、post hoc の Wilcoxon signed-rank test でも各条件間に差が出ている。Table 3 では gameplay time の平均が baseline 181.15、EDDA-s 214.66、EDDA 236.55、GEQ scores の平均が baseline 16.41、EDDA-s 18.78、EDDA 21.20 と増える。fitness は Friedman test では有意差なしだが、Wilcoxon では intervention module が difficulty fitness を改善する結果になっている。結論は、EDDA が challenge、phase、time、common parameter set を使い、複数ジャンルに適用可能な churn monitoring / intervention 手段を提供する、というもの。

■ 内容分析
この論文で使えるのは、「難易度調整を最終的な強さの数値ではなく、離脱兆候の観測設計として扱う」点である。単純な DDA は、プレイヤーが失敗したら敵を弱くする、成功したら敵を強くする、という反応規則になりやすい。EDDA はそこを challenge 境界、sleep window、active window、threshold 条件に分ける。開始直後や初回試行を監視から外すのは重要で、プレイヤーは新しい challenge に入った直後には、探索、理解、慣れのために不安定な動きをする。そのノイズを churn と誤判定しないため、監視開始点を明示している。

一方で、評価設計には注意が必要である。対象者は 19-29 歳に限られ、各 genre は prototype system 上の代表実装であり、商用ゲームの長期運用や個別作品の作家性までは検証していない。fitness も round duration が短く固定される FTG では解釈が崩れやすいと著者自身が述べている。EDDA は「全ジャンルで最適な DDA アルゴリズム」というより、離脱監視を設計者が扱える単位に分解する lightweight framework と読む方が正確である。

特に強いのは common parameter set の設計で、player-fixed を直接動かすと DDA の隠蔽性が壊れる、という指摘が実装判断に効く。HP 表示や移動速度など、プレイヤーが自分の状態として認識している値を急に変えると、救済されている感覚や不公平感が出る。逆に enemy number、enemy HP、spawn pace、hint、beneficial time のように、環境側・相手側・時間側のパラメータへ寄せると、介入が体験の裏側に残りやすい。

■ 自分達の環境への適用
Nao_u_BOT の短期プロトタイプでは、まず EDDA 全体を実装するのではなく、monitoring / intervention の分離だけを採用する。headless 評価や Playwright 実プレイ確認で、死亡回数や score だけでなく、同じ challenge に滞在した時間、初回理解までの秒数、retry 後に active window へ戻れたか、操作入力密度が落ちた区間を記録する。shooter / action 系なら、最初の 10-20 秒を sleep time とし、その後の wave ごとに「回避入力が止まった」「同じ敵に連続で潰された」「restart 直後の到達時間が短くなった」を churn 兆候として扱う。

介入候補は、プレイヤーの明示能力ではなく、敵数、敵 HP、弾速、spawn interval、hint timing、beneficial item window へ寄せる。これにより、プレイヤーを強くする救済ではなく、challenge を読み直す余地を作る調整になる。Phase 3b では、小さな probe として「prototype の challenge 境界を 3-5 個に切れているか」「sleep window を置いたか」「調整対象が player-fixed に偏っていないか」「離脱兆候を death だけで見ていないか」を確認するとよい。

■ メリット・デメリット
メリットは、離脱を抽象的な感想ではなく、challenge 内外の時間変化として扱えること。設計者が触るべきパラメータも player / partner / opponent / neutral に分けられるため、実装タスクへ落としやすい。DDA を機械学習なしで始められる点も、小規模制作には向いている。

デメリットは、gameplay time を engagement の代理にしすぎる危険があること。長く遊んでいる理由が熱中ではなく迷い・停滞・諦めかけの場合もある。また challenge 分割が曖昧な作品、物語・探索・創発を中心にした作品では、unit time や threshold の設計が難しい。

■ 判定
部分採用。EDDA の数式や全パラメータ集合をそのまま導入するより、challenge 分割、sleep/active window、churn 兆候、介入パラメータ分類を prototype 評価ログに取り込む。特に「death ではなく滞在時間の低下を見る」観点を残す。

■ URL
https://www.mdpi.com/2076-3417/15/10/5610
