■ 概要
対象は「ICAE-Bench: Evaluating Coding Agents as Interactive Project Builders」。問題設定は、coding agent の用途が、詳細に指定された関数修正から、曖昧な product intent を対話、計画、実装、debug によって working repository へ変える仕事へ移っているのに、benchmark は依然として静的で完全指定の task に偏っていることだ。曖昧な依頼を自由生成すると正解自体が定まらず、逆に完全仕様を渡すと要件確認能力を測れない。この矛盾を、実行可能な open-source repository を潜在的な正解として固定し、その仕様を段階的に隠すことで解こうとしている。

各 task は、元 repository から詳細な GroundPRD と black-box test cases を作り、API commitment、edge case、architecture requirement などを削って数百 token の fuzzy PRD にする。隠した情報は User Agent Data に保存し、coding agent は最大16回、自然言語で質問できる。User Agent は task 固有 record を router として検索し、一回答につき最大3点を返す。該当 record がなければ fallback を返すため、実装 artifact を漏らしたり、その場で新要件を捏造したりしにくい。agent が見るのは fuzzy PRD と solution を除いた実行環境であり、元 repository の identity、source、test、hidden detail は見えない。

dataset は12言語、各40 task、合計480 task。小さい50 task の Lite 版も持つ。完成 repository は Public、Native、Enhanced の black-box cases で機能評価される。Public は対話で回収可能な例、Native は元 test 由来、Enhanced は malformed input や boundary case を補う。加えて critic model が semantic/API similarity と design quality を診断し、file・LOC比、class・method・namespace 類似度で under-building、over-building、monolithic adapter 化を観察する。対話側は hidden constraint coverage、grounded record に当たらない fallback rate、budget usage を別々に測る。

full benchmark を Claude Code 上で六 model に解かせた結果、Overall pass rate の最高は Claude-Opus-4.8 の38.2%、次が GPT-5.5 の37.2%。Public は48.5%/50.3%だが Enhanced は35.5%/32.8%まで落ち、見える例を再現しても境界条件へ一般化できていない。さらに GPT-5.5 は hidden constraint を73.7%回収し、Opus の69.6%を上回るのに Overall は低い。完全な GroundPRD、全 record をまとめた RecoveredPRD、曖昧度の異なる fuzzy PRD を比べても、回収情報の増加は一様に正答へつながらない。論文はこれを、要件へアクセスする gap と、得た情報を保持・統合・実装・検証する information-to-execution gap に分ける。

■ 内容分析
本論文で強いのは、対話回数を能力とみなさず、「何を回収できたか」と「それを repository に反映できたか」を切り離した点である。constraint coverage が高くても正解率は上がらず、質問 budget を8→16→24へ増やす実験でも Overall は22.9%→37.4%→34.4%、coverage は増えるのに24回で悪化した。余分な turn は unmatched・重複情報と統合負荷を増やす。つまり、よい agent は質問好きな agent ではなく、実装を分岐させる不確実性を早く特定し、回答を testable contract に編み直せる agent である。

評価も単一 score を避けている。functional pass、semantic/API/design、repository structure、interaction quality は互いに順位が一致しない。Opus は full benchmark で file 数337.6%、LOC 981.1%まで膨らませながら38.2%で、GPT-5.5 は44.0%/154.9%の規模で37.2%。豊富な dependency を備えた image は GLM-5.1 の constraint coverage を増やした一方、Overall を37.4%から28.4%へ下げ、生成 LOC を674.1%にした。選択肢と部品の多さが under-specification を埋めるとは限らず、verification effort を散らして over-building を招くという結果である。

限界も明確にある。ground truth は既存 repository の挙動なので、同じ価値を別 architecture で実現する独創的 solution を structural similarity が低く見る可能性がある。black-box test は behavior を担保しても保守性を確定できず、critic model による design score は evaluator bias を持つ。User Agent Data は現実の stakeholder より整合的で、質問に対して固定 record を返す。人間の途中で変わる好み、矛盾、優先順位交渉までは測らない。これは product discovery 全体ではなく、固定された潜在要件を対話で回収する benchmark である。

■ 自分達の環境への適用
一文の game idea から playable prototype を作る評価へ、task の五分割を借りる。最初に designer が完全仕様を全部渡すのでなく、`fuzzy brief`、実行環境、対話で開示可能な `hidden design constraints`、public examples、最終評価 invariant を別 file にする。たとえば「押すほど危険になる one-button game」なら、brief には体験目標だけを書き、hidden 側に input repeat の扱い、reset、score 境界、失敗後の復帰、禁止 mechanic を置く。agent は実装前と最初の playable build 後に質問できる。

採点は、起動・入力・reset・到達可能性を headless test、core loop と feedback の成立を human playtest、file/LOC/state 数を scope diagnostic、質問を constraint coverage と fallback で見る。golden prototype との sprite 配置や class 構成の一致は正解条件にしない。構造差は under-build/over-build の警報に留め、「違うから減点」ではなく、player-facing invariant を満たしたかを主にする。

小さな probe として、同じ brief を二条件で3回ずつ作る。A は完全仕様を先渡し、B は8回まで質問可能な fuzzy brief とする。比較値は playable 到達率、hidden invariant pass、初回 playtest までの時間、質問で回収した制約、総変更量、不要 subsystem 数。B が質問数だけ増えて invariant pass が上がらなければ、対話機能ではなく回答を acceptance test へ変換する記憶・計画部分がボトルネックだと分かる。

■ メリット・デメリット
メリットは、曖昧さを再現可能にしつつ、対話能力と実装能力を別々に診断できること。Public/Enhanced の差は visible example への過適合を示し、constraint coverage と pass の差は memory・integration failure を示す。game 制作でも「質問しなかった」「聞いたが反映しなかった」「実装したが境界条件を壊した」を分離できる。

デメリットは、GroundPRD、User Agent Data、black-box cases を作る初期費用が高いこと。既存 repository 起点は再現性に強い一方、新規 game の面白さや意外性を既存完成形へ近づける圧力を持つ。自動 User Agent は現実の designer の揺れを消しすぎ、critic score は model 依存である。480 task の規模や16 query budget をそのまま持ち込むと、prototype より benchmark 構築が主作業になる。

■ 判定
部分採用。`fuzzy brief / hidden constraints / public examples / behavioral tests / structure diagnostics` の分離と、requirement-access gap と information-to-execution gap の区別を採る。golden repository への構造類似は主要 score にせず、少数 task・8質問上限の可逆な probe から始める。目的は質問回数を増やすことではなく、回収した設計制約を playable invariant へ変換できるかを測ることに置く。

■ URL
https://arxiv.org/abs/2607.21217
https://github.com/ALEX-nlp/ICAE-EVAL
