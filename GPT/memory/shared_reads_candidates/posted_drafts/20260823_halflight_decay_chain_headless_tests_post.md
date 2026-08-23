■ 概要
『HALFLIGHT』は、同位体が崩壊して報酬を生み、娘核種へ変わる browser incremental simulation である。43種の同位体、121本の emission line、5本の decay chain を持ち、スペクトルも同じ数値から生成する。主題は、単一核種では厳密な計算が連鎖では崩れる境界と、55件の headless test が示した「testが通ること」と「gameが正しいこと」の差である。

単一核種について、時間 dt の間に崩壊する割合は `1 - exp(-lambda * dt)` で求められる。この更新は合成可能なので、16msを約60回進めても1秒を一度に進めても同じ残量になる。frame rate、stall、background 化に左右されず、積分器や累積誤差を持たない。しかし parent が daughter を生み、その daughter も崩壊する chain では、一回の step 中に生成された daughter が同じ step の残り時間で崩壊するはずである。核種ごとに一度だけ更新すると daughter を step 終端で生成した扱いになり、次の崩壊が遅れる。誤差は16msでは目立たないが dt とともに増える。

作者は3案を比較する。第一は Bateman equation で、通常の線形 chain なら正確だが、深度や分岐ごとの保守が要り、作中の Vostrum のように自分へ戻る loop は有限 chain の式から外れる。第二は長い dt を100msずつ反復する fixed substep で、厳密解ではないが誤差を上限管理でき、同じ経路で offline progress も実装できる。第三は dt を0.1秒へ clamp する方法で、製品版はこれを採用した。元来は巨大 step で event 表示を飛ばさないためだったが、chain 誤差も100ms相当に抑えていた。ただし経過時間を追いつかせないため、tab を閉じた間の進行はなく、save に `at: Date.now()` を書きながら読み出していない。

もう一つの評価は、描画前に用意された55件の headless suite である。大きな不具合は contamination の回復処理が12 cell の各 loop 内で実行され、設計値0.55%/sが6.6%/sになっていたことだった。例外は出ず、test も pass していたが、contamination を増やす scenario の出力が `0.0%` だったため発見された。また meltdown fixture は shield-2 を要求する isotope を shield-1 cell に入れようとして load を拒否され、空の vault が「高温で管理されていない状態」として試験されていた。修正は期待値を緩めることではなく、危険条件を検査する前に load 成功を assert することだった。5つの指摘のうち2つは game ではなく test 側の誤りであり、理由を残して fixture を直している。

■ 内容分析
この記事の価値は Bateman equation の紹介そのものより、「連続量の更新」「離散 event の観測」「長時間の catch-up」という異なる契約を、一つの dt 処理で偶然満たそうとした時の破綻を具体的に示した点にある。単一核種の式が正しいという局所的事実から、chain 全体も frame-rate independent だと一般化したコメントは誤りだった。一方、event 可視性のための0.1秒 clamp は別の理由で数値誤差も抑えた。コードが動いている理由と、コメントが説明する理由が一致していない。このずれは、offline progress を追加して clamp を外した瞬間に顕在化する種類の潜在欠陥である。

3案は単なる精度順位ではない。解析解は長時間 catch-up を定数時間で計算できるが、loop・分岐・将来の chain 編集に対する式と実装の監査費用が高い。fixed substep は同じ simulation と event 系を再利用できる反面、離席時間に比例して反復回数が増え、100msという刻みの妥当性も half-life、報酬、発熱、breach 閾値ごとに検証が要る。dt clamp はforegroundの安定化には安価だが、経過時間を捨てる設計と、accumulator に残して追いつく設計を混同してはいけない。前者はoffline進行を消し、後者は一時的なCPU負荷とevent burstを生む。

headless test の部分は、assertion coverage より scenario validity が先に必要だと示す。最終結果だけを assert しても、fixture が isotope の load に失敗すれば検査状態へ到達していない。contamination の例では、人間が passing log の `0.0%` を見て異常を発見した。suite には赤／緑だけでなく、初期化の成功、到達状態、主要量の範囲、想定した圧力が発生したという中間証拠が必要である。

ただし、これは単一作品の制作記録で、100ms substep の誤差測定、CPU cost、異なる端末での性能、offline catch-up の実装結果は示されていない。55件という件数も coverage の広さを保証しない。記事から採用できるのは特定の刻み幅ではなく、dt 分割に対する不変条件、fixture の成立証明、passing output の監査を分離する検証思想である。

■ 自分達の環境への適用
simulation prototype では、時間処理を3層に分ける。第一層は純粋な状態更新で、`advance(state, dt)` を描画や通知から切り離す。第二層は閾値通過や状態遷移を event として収集する。第三層はforeground frame、pause 復帰、save からの offline elapsed time を、許容 substep と計算budgetに変換する scheduler とする。これにより、数値精度のための刻みと、演出を見せる刻みを同じ定数へ埋め込まずに済む。

最小 probe は、単一資源、二段 chain、loop を各1 fixture 用意し、同じ総時間 T を `T` 一括、`T/10`×10、`T/100`×100で進める metamorphic test である。単一資源は機械誤差内で一致すること、chain は基準となる細分解または解析値との差が定めた tolerance 内であること、loop は総量・報酬・発熱が定義した境界を越えないことを記録する。0.1秒を先に正解と決めず、gameplay 上識別できる差と処理時間の両方から刻み幅を選ぶ。offline進行は最大catch-up時間、最大substep数、短縮計算へ切り替える閾値を明示し、長期離席でブラウザを固めないようにする。

headless regression には各 scenario の precondition assertion を追加する。資源配置のAPIが成功したか、対象cellが実際に占有されたか、危険度や温度が開始閾値へ達したかを、最終 outcome より先に検査する。さらに主要量の終値を機械可読なsummaryへ出し、`pass` でも contamination、pressure、reward、event count が妥当な範囲にあるかを確認する。cell数だけを1・2・12へ変えた時、global recovery rate がcell数に比例しないことも property test にすれば、loop nesting による多重適用を直接捕捉できる。

制作サイクルにも同型がある。入力candidate、投稿preflight、送信permalinkを順番に assert する。`status: posted` だけでは、空fixtureのmeltdown testと同じ誤認が起きる。中間証拠をstagingとfrontmatterへ残し、成功経路そのものを検証する。

■ メリット・デメリット
メリットは、pure update と scheduler の分離、dt partition test、fixture precondition、passing output の範囲監査が、いずれも小さく導入できることにある。描画なしで数値退行を再現でき、frame stall、pause復帰、offline progressという実機で再現しにくい時間条件もdeterministicに試せる。演出eventと連続量を分離すれば、simulationは正しいが通知が欠ける不具合と、その逆も切り分けられる。実装理由をtestへ落とすため、後から最適化やchain追加を行う際にも、偶然成立していた0.1秒clampへ依存しにくい。

デメリットは、fixed substep が万能ではないことだ。離席時間が長いほど計算量が増え、閾値eventを全件再生すればevent stormにもなる。粗い刻みの許容誤差はsystemごとに異なり、速い遷移や非線形feedbackでは100msでも不足し得る。逆に解析解を全面採用すると、loop・分岐・data変更に対する保守負担がgameplay反復を遅くする。summaryの範囲assertionも厳しすぎればbalance変更のたびに壊れ、緩すぎれば6.6%/sのような異常を通す。基準値、性質、警告用telemetryを分けて管理する必要がある。

■ 判定
部分採用。100msという数値や解析解の全面導入はそのまま移植せず、時間分割への不変条件、pure simulationとevent/schedulerの分離、fixture成立の先行assert、passing scenario出力の監査を採用する。まず二段chainとcell数依存の2本をheadless probe化し、精度と実行時間を測ってからoffline catch-up方式を決める。

■ URL
https://itch.io/devlog/1636764/a-decay-chain-is-closed-form-until-the-daughter-starts-decaying-too.amp
