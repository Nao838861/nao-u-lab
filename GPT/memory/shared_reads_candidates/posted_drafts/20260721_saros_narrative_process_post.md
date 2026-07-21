■ 概要
Housemarque が『Saros』で解こうとしたのは、gameplay-first の高速 action game に、前作『Returnal』より大きい cast と濃い物語を加えながら、design、programming、art、audio を narrative の後処理で詰まらせないことだ。改善は脚本術一つではなく、組織、pacing、game state、cinematics、actor preparation を同じ production system として組み直すものだった。cast と audio log が増えれば、台詞だけでなく収録、実装、音響、確認も増える。そこで creative director が担っていた範囲を narrative director と narrative producer に分け、PlayStation の dialogue team など社内横断の支援を受けた。film / trailer 経験者も cinematics に入り、新しい出力が既存部署の bottleneck にならない役割構成を取っている。

game 内では、物語を combat と別枠にせず、状態遷移と休息点へ配置した。『Returnal』では run の明確な休止が主に死亡後へ偏り、後に suspend cycle 機能が追加された。『Saros』では player を定期的に camp へ戻し、他 character との会話、能力 upgrade、休憩を一つの pacing node にまとめる。cinematic も script の映像化だけで判断せず、終了直後の player motive、次に向かう場所、通常状態か敵が強く弾・音響も激しくなる Eclipse State かを含めて設計する。death から home base での rebirth へ移る箇所には非常に短い vignette が入り、時には4秒しかない。その4秒を moving tableau と捉え、直前の gameplay 体験を受けて何を感じさせるかを一画面に圧縮する。

performance 面では、actor を収録直前に数ページの台本だけ渡される外注部品として扱わない。全員に導入 call の機会を用意し、game と役の context を説明し、script を可能な限り早く共有する。目的は director が表現を細かく指定することではなく、actor に準備時間を渡し、制作者が想定しなかった character 解釈を持ち込める状態を作ることだ。記事の結論は、action loop に物語を増やすには尺を増やすのではなく、誰が責任を持つか、player がいつ受け取れるか、直前直後の playable state とどう連続するか、演者がどの context を持つかを先に設計する必要がある、というものになる。

■ 内容分析
この記事の重要点は、narrative を content volume ではなく interface の問題として扱っていることだ。第一の interface は部署間で、narrative director が内容を、narrative producer が依存関係と進行を担う。audio log 一つが台本、収録、音響実装、localization、QA へ波及することを可視化し、creative decision と production control を分けた点に意味がある。小さな narrative team が大量の依頼を他部署へ流しても、writer の速度は全体速度にならない。

第二の interface は combat と story の間である。camp は会話メニューではなく、強い注意を要求する run と、理解・強化・離席を許す時間の切替器になっている。会話、upgrade、休憩を同じ node に置けば、player は物語を見るためだけに core loop から脱線せず、機械的な成長の確認と同じ心理状態で character 関係を受け取れる。ただし毎回同じ長さ・同じ頻度で会話を置けば、camp は休息ではなく compulsory exposition になる。戻る頻度、会話の任意性、未読情報の蓄積、再出撃までの操作数を含めて pacing を評価する必要がある。

第三の interface は cinematic と playable state の境界である。記事中の問いは「良い shot か」だけでなく、「終了後にどこへ行くのか」「Eclipse State か」に向く。これは cinematic spec に entry state と exit state を含める設計だと読める。直前に高密度な回避をした player へ長い説明を続けるのか、4秒の像で余韻だけ残すのかは、文章の重要度ではなく認知負荷で決まる。death / rebirth vignette を tableau として作る方法は、反復される transition に物語を載せつつ、操作停止を最小化する具体策である。

一方、記事は release 前の関係者 interview で、production metric や player study ではない。役割分離によって rework、収録遅延、bug、残業がどれだけ減ったか、camp が離脱率や理解度をどう変えたか、4秒 vignette が感情を伝えたかという数値はない。語られているのは有望な process と意図であり、効果の実証ではない。また Sony 傘下の internal dialogue team、専任 producer、多人数 cast、cinematics 人材を使える条件は、小規模制作と大きく異なる。採用すべきは組織図ではなく、依存関係を先に切り分ける原理である。

■ 自分達の環境への適用
我々の高速 prototype では、専任職を増やす代わりに、一つの narrative feature を三つの欄で管理できる。`intent` には player に残したい感情、`production_dependencies` には text・state・audio・visual・QA、`entry_exit_state` には直前の操作密度と直後の player goal を書く。たとえば死亡後の復帰なら、「敗北の意味を一像で残す」「必要 asset は1枚、4秒、skip 可能」「入力停止から復帰地点と次の目的表示へ接続」と定義する。これなら物語を足す前に、実装と評価の境界が見える。

最小 probe は、既存 prototype の death / restart または wave 間 transition 一箇所だけでよい。A は即時復帰、B は4秒以内の state-aware vignette、C は15秒の説明文とし、固定した headless run では restart latency、入力可能になる frame、state flag の整合、反復20回での遷移失敗を測る。人間レビューでは、直前の出来事を説明できるか、次の目的が分かるか、3回目以降に邪魔と感じるかを確認する。vignette の価値は初見の感情だけでなく、反復 loop の中で許容され続けるかで判定する。

camp 型 node は、会話画面を新設する前に upgrade 選択画面へ一行の reaction を同居させて試せる。測るのは再出撃までの操作数、滞在時間、skip 率、upgrade 選択の誤り、未読蓄積である。情報受領と意思決定が競合するなら、narrative を増やす前に node の責務を分ける。

actor context の原理は、音声収録がなくても利用できる。dialogue や演出を生成・レビューする際、断片的な一行だけを渡さず、character goal、直前の game state、相手との関係、言ってはいけない知識、scene 後の player action を短い context packet にする。記憶には完成台詞より、「context packet がないため tone が揺れた」「exit state が未定で scene が閉じなかった」という production failure を残す。これにより narrative の失敗を文章センスの問題だけにせず、入力不足と依存関係として次 cycle へ返せる。

■ メリット・デメリット
メリットは、物語追加による負荷を script 字数より前に見積もれること、camp や death / rebirth など既存 loop の境界を再利用できること、cinematic の品質を画面単体ではなく playable state との連続性で見られること、短い vignette なら action のテンポを保ったまま反復的な意味付けができること、context を早く共有して演者や制作者の解釈余地を増やせることである。

デメリットは、大規模 studio の役割分担を模倣すると coordination cost だけ増えること、camp に会話・upgrade・休憩を集めすぎると hub が義務作業になること、短さを優先しすぎると固有情報が伝わらず雰囲気映像で終わること、state ごとの vignette を増やすと組合せ QA が膨らむことである。早期 script 共有も変更凍結を意味せず、gameplay の変更と同期する版管理がなければ古い context を広く配る危険がある。何より記事に定量評価がないため、「改善した」という当事者説明をそのまま効果測定の代わりにはできない。

■ 判定
部分採用。専任職や制作規模ではなく、narrative feature ごとに production dependency と entry / exit state を書き、既存 transition に4秒以内の可逆な vignette を一つ置く方法を採る。restart latency、反復時の煩わしさ、次の目的理解を測り、改善が確認できた場合だけ camp や追加 scene へ広げる。

■ URL
https://www.gamedeveloper.com/design/inside-housemarque-s-improved-narrative-process-for-saros
