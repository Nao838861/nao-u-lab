■ 概要
対象は、Mini Jam 212 の参加作『Stripped』について作者が書いた post-jam retrospective である。テーマは「Control」、制約は「You Are The Enemy」。作者はこの二つを、敵を倒して能力を得る通常の構図ではなく、「敵から入力キーそのものを奪い、その瞬間に自分の操作として登録する」という mechanic に変換した。プレイヤーはほとんど操作を持たずに敵地へ入り、guard を追って control を奪う。取得した key は Godot の InputMap に runtime で登録され、使える行動が増える。逆に被弾すると、現在持つ control の一つがランダムに剥がされ、world 上の物理 pickup として戻る。moveset が固定された character property ではなく、戦闘中に移動する資源になっている。

72 時間の制作では、runtime input 登録、player と複数 guard の ability state、被弾時の control 移送を成立させる実装に大半の時間を使った。core loop は動いたが、polish、level design、遊びながらルールを教える工程が後回しになった。初見 playtest では、能力は奪うまで使えないことが伝わらず、guard を捕まえる位置によって二つの能力を同時取得する場合と何も起きない場合が生じた。さらに被弾によるランダム喪失は、視覚・音響 feedback が弱く、意図された代償ではなく不公平または故障に見えた。

作者の結論は、着想自体は記憶に残るが、理解できる体験へ仕上げる時間が足りなかったというもの。再制作するなら、短い first level で「奪ってから使う」を教え、guard behavior を一貫させ、key の獲得と喪失を強く示すとしている。公開結果は 177 entries 中 5 ratings で、screenshot と説明文を含む初動の見せ方も課題に挙げる。「実装できた」状態と「規則として読めた」状態の差を追える記録である。

■ 内容分析
この事例の中核は、入力を資源化したこと以上に、内部状態と player の知覚状態がずれたことである。実装側では control の所有者、InputMap の登録、world pickup の存在が一つの state machine として動いている。しかし player が観測できるのは、guard に接触した、key が使えた、被弾後に何かが動かなくなった、という断片だけだ。内部遷移が正しくても、遷移の条件・結果・回復手段が見えなければ、player は同じ規則を再構成できない。特に入力は、画面上の inventory より一段深い「ゲームとの接続手段」なので、失うと単なる能力低下ではなく操作不能やバグに見えやすい。

獲得側の問題は onboarding と一貫性が結び付いている。最初に「guard を捕まえる→一つの key が移る→その key で新しい行動を一度使う」を孤立した場面で経験させれば、player は因果を学習できる。ところが接触位置によって二つ得たり何も起きなかったりすると、チュートリアル文を追加しても規則そのものを推定できない。ここで必要なのは説明量ではなく、同じ原因が同じ結果を返す遷移の安定性である。作者が短い first level と consistent guard behavior をセットで挙げているのは妥当で、level は説明用の容器ではなく、状態遷移を一つずつ観測させる実験装置になる。

喪失側はさらに厳しい。ランダムに一つ失う処理は緊張感と即興性を作れる一方、被弾、選ばれた control、world への排出、操作不能という四段階を瞬時に伝える必要がある。どの key を失ったかが分からなければ次の戦術を選べず、落ちた pickup の位置が分からなければ回復行動にも移れない。したがって音や flash を強くするだけでは足りず、失った key の明示、対応 action の一時的な表示変化、pickup までの空間的な連続性が必要になる。ランダム性が許容される条件は、結果が読めること、損失後にも最低限の回復手段が残ること、次の選択が可能なことだ。

jam scope の失敗も mechanic 固有である。通常の ability pickup なら既存 input binding の上に能力を足せるが、本作は input registry、actor ownership、drop object、UI 表示を同期する必要がある。つまり一つのアイデアが engine、gameplay、presentation、onboarding の四層へ同時に波及する。72 時間で engine 側の難所から着手した結果、動作成立が制作完了のように見え、player-facing な検証が残時間へ押し出された。独自性が高い mechanic ほど、技術 risk だけでなく「初見者が一貫した仮説を作れるか」を早期 risk として計上すべき事例になっている。

評価の限界は大きい。具体的に記録された誤読は少数 playtest の逸話で、tester 数、条件、離脱地点、成功率は示されない。5 ratings は可視性の低さを示唆しても、mechanic の品質や screenshot の因果を分離できない。作者の「core idea は可能性がある」という判断も比較対象のない自己評価である。従って、ここから入力喪失 mechanic の一般的有効性を結論づけることはできない。使えるのは、失敗原因を仮説へ変換する材料である。

■ 自分達の環境への適用
短期 game prototype では、珍しい mechanic を完成後に説明するのではなく、最初の playable diff に「獲得・使用・喪失・回復」の最小閉路を入れる。例えば control を一つだけ持たない状態から開始し、固定位置の enemy から必ず一つ奪い、直後の障害でその action を一度使わせ、その後の安全な被弾で同じ control を落とし、見える場所で拾い直させる。この 60～90 秒の level が通らない段階では、敵種、広い map、複数 key、ランダム喪失を増やさない。

実装は `control_id / owner / enabled / world_position / last_transition_reason` を一つの正本にし、InputMap、actor ability、pickup 表示が別々の真実を持たないようにする。各遷移で `acquired`、`used_first_time`、`lost`、`recovered` を event log に残す。headless test は、同じ enemy・同じ接触条件なら同じ control が一度だけ移ること、失った action が無効になること、pickup が生成され再取得可能なこと、全移動手段を同時に失う softlock が起きないことを deterministic に検査する。

人間 playtest では説明文を先に読ませず、最初の獲得までの秒数、取得後に対応 key を初めて使うまでの秒数、被弾後に失った control を特定できたか、pickup を回収しようとしたかを記録する。終了後の自由回答だけでなく、「今なぜその action が使えないと思うか」を場面ごとに短く尋ねれば、state model の誤読箇所を特定できる。feedback の A/B では、UI icon だけ、音だけ、key が身体から world へ飛ぶ連続 animation の三条件を比べ、派手さではなく正答率と回復行動への移行で評価する。

制作サイクルへの教訓は、技術 spike と体験 probe を分離しないこと。runtime key registration が成功した時点で、同じ build を第三者に触ってもらい、獲得規則を説明できるかを見る。engine 上の成立、状態遷移の一貫性、初見理解、戦術的な面白さを別欄で評価すれば、「難しい実装が動いた」という達成感で onboarding 不足を見落としにくい。記憶に残す lesson も「feedback を強くする」ではなく、「不可視な状態を資源化する mechanic は、各遷移に観測可能な原因・結果・回復経路を持たせる」と具体化できる。

■ メリット・デメリット
メリットは、テーマと制約を表層的な物語ではなく操作体系へ落とし、moveset の変化そのものを戦術資源にした点である。獲得と喪失が同じ system で表現されるため、成功時の成長と被弾時の損失が強く結び付き、少ない asset でも固有の体験を作れる。また postmortem は、engine 実装、一貫性、onboarding、feedback、store presentation が一つの mechanic の周囲で競合する様子を短期制作の実例として示している。

デメリットは、input を奪う設計が accessibility と公平性を壊しやすいこと。移動、回避、確認操作までランダムに失えば、判断の失敗ではなく操作権の剥奪として感じられる。key 配列や controller への対応、再 bind、複数 control の同時入力も複雑になる。さらに本記事の根拠は作者の回顧と少数の反応に限られ、5 ratings から engagement や mechanic の魅力は測れない。移植時は「ランダムに失う」部分を既定解にせず、失う候補の制限、予告、選択式 sacrifice、即時回収可能性を比較する必要がある。

■ 判定
部分採用。入力キーを奪う mechanic 自体を汎用解として採用するのではなく、不可視な能力状態を変化させる時に、獲得・使用・喪失・回復を最初の level で一つずつ教え、内部 state と観測可能な feedback を同じ遷移として検証する方法を採用する。次の小型 prototype では最小閉路と event log を先に作り、ランダム喪失の面白さは human playtest で別途判定する。

■ URL
https://itch.io/devlog/1573537/post-jam-retrospective-a-strong-idea-that-needed-more-time
