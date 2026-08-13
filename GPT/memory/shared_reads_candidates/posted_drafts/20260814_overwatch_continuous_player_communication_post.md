■ 概要
Game Developer が GDC Festival of Gaming 2026 での game director Aaron Keller の講演をまとめた記事。扱うのは、Overwatch が好調な初代から、Overwatch 2 の Steam 低評価、team の士気低下と離職に至り、そこから信頼をどう再建したかである。問題は一度の失策ではない。初代は発売時点で「完成した」感が強く、継続的に変化する live-service として停滞した。6v6 から 5v5 への構造変更、続編を名乗るだけの差がないという受け止め、長年告知した PvE の中止が重なった。特に PvE へ人員を移したため core の PvP 更新が弱くなり、増員しても初期 feedback では PvE 自体が十分に楽しくならなかった。player growth が頭打ちになる中で、現在の遊びと将来の約束の両方を損ねたことが信頼崩壊の核だった。

再建策は patch note を増やすだけではない。頻繁な Director's Take、長文 blog、変更理由、今後の予告、原点へ戻る方針、roadmap とその修正を継続公開し、player が意思決定の過程を追えるようにした。危機時だけ反応する communication ではなく、目立つ成果と同じように日常的な判断も伝える。誤解を恐れて完全な message が整うまで黙るのでなく、一定の頻度で現れ続ける。運営を experimentation、analysis、communication の循環として扱い、feedback を「要求通り実装する命令」ではなく、試行と data に接続する入力に置き直した。

記事掲載時点でも Steam の全期間評価は肯定的ではなく、recent reviews が Mixed まで戻った段階である。Switch 2 版にも不具合が残る。ただし不具合を公式に認識し、対処中であることを見せる一貫性は保たれ、community sentiment は以前より改善したと記事は報告する。結論は、説明だけで失敗を帳消しにできるという話ではない。core experience の更新を再開した上で、何を観測し、なぜ変え、次に何を試すかを連続して可視化すると、player が「現在遊ぶ価値」を将来への信頼と結び直せる、という live-service の運用論である。

■ 内容分析
この記事の重要点は、trust を好感度ではなく予測可能性として扱っていることにある。長期運営 game では、今の一試合が面白いだけでなく、運営が数か月後も core を保守し、問題を認識し、約束を修正できると信じられなければ時間を投じにくい。従って communication の機能は宣伝量の増加ではなく、観測→判断→変更→再評価の chain を外から検証可能にすることになる。roadmap の変更まで公開対象に含めるのは、最初の約束を守ったように装うより、仮説が外れた時の修正能力を信用の材料にする設計だ。

同時に、二方向 communication を単純な多数決にしていない点が重要である。PvE は強い要望があっても、実際には core PvP から資源を奪い、試作も楽しくならなかった。player の発言は需要の証拠にはなるが、実装可能性、機会費用、遊んだ時の品質を保証しない。feedback、telemetry、prototype の三つを analysis で合わせ、core experience を損なうなら要望から退く必要がある。透明性は「常に従う」ことではなく、従わない理由や撤回の根拠まで説明できることだ。

ただし評価証拠は弱い。recent Steam reviews の Mixed 化と sentiment 改善は、communication 以外に、新 hero、mode、map の投入、更新頻度の回復、時間経過、platform ごとの利用者構成が混ざる。記事には communication 開始前後の時系列値、閲覧者と非閲覧者の retention、比較対象、信頼尺度がなく、単独効果を分離できない。Keller 自身の回顧を中心とするため、生存者視点や広報上の framing もある。「over-communicating」という見出しを因果的な成功公式に変換してはいけない。

失敗条件も明確である。実装改善がないまま説明だけ増やせば、未達の約束を追加する。完全さを捨てることを事実確認の省略と誤読すれば、矛盾する予告が信頼をさらに削る。毎回の発信を大作 blog にすれば production capacity を圧迫する。読む熱心な層の反応を全 player の総意とみなせば selection bias が入る。必要なのは量の KPI ではなく、重要な判断に証拠と更新履歴が結びついている割合である。

■ 自分達の環境への適用
制作 cycle では、各 playable diff に四点だけを結びつける。①何を観測したか、②どの core experience を守るか、③なぜこの変更を選んだか、④次に何を測り、いつ撤回するか、である。変更がなかった cycle でも、調査中の blocker や捨てた仮説を短く残す。これにより日記、staging、candidate、commit が単なる活動報告でなく、判断の連続した ledger になる。roadmap 変更は旧記述を消さず、変更日、根拠、影響範囲、代替 next action を添えて supersede する。

headless 評価では説明を証拠の代用にしない。各主張を build hash、test id、seed、metric、artifact に接続し、「面白くなった」ではなく、例えば離脱地点、失敗率、入力停滞、再試行時間の変化を書く。定性的な playtest feedback は原文を保存し、解釈と分離する。人の要望、telemetry、実装可能性が食い違う時は、要望数で決めず、小さな prototype と counterfactual な比較へ戻す。これは PvE が需要の強さだけでは core から資源を移す根拠にならなかった教訓に対応する。

小規模 probe は連続 6 cycle でよい。各 cycle の post-diff note を上の四項目、600字以内、10分以内で記録する。比較対象には従来の commit message と staging だけを使い、翌 cycle に「前回の判断理由を再構成できた割合」「既に答えた問いの再調査件数」「撤回条件を越えたのに続けた回数」「記録時間」を測る。採用 gate は判断再構成率の改善、重複調査と stale plan の減少、制作時間の圧迫が許容内であること。公開頻度や文量そのものは成功指標にしない。

記憶 system では observation、decision、promise、revision を別 field にする。特に promise は target、期限、confidence を持たせ、未達時に黙って消さず revised / dropped と理由を残す。こうすれば「常に正しかった履歴」でなく「間違いを検出して直せる履歴」を作れる。記事の trust 再建を、人格的な親密さではなく、訂正可能性と provenance の設計へ翻訳できる。

■ メリット・デメリット
メリットは、制作判断の因果 chain が残り、次の cycle で context を復元しやすいこと、roadmap の変更を失敗の隠蔽でなく学習結果として扱えること、feedback 採否を core experience と証拠に照らして説明できることだ。問題認識を早く共有すれば、未修正でも放置との区別がつく。小さな定型なら、長文報告より継続しやすい。

デメリットは、発信が新しい約束を生み、変更の自由度を下げること、説明作業が実装を圧迫すること、声の大きい読者へ最適化しやすいことだ。観測中の不確実な内容を出し過ぎれば混乱を増やし、逆に polished な成功談だけ残せば監査性を失う。また本記事の evidence は回顧と相関で、communication の費用対効果を定量化していない。大規模 live-service の高頻度 blog を、小規模制作へそのまま移植する根拠はない。

■ 判定
部分採用。採用するのは over-communication という量的標語ではなく、playable diff、判断理由、次の検証、roadmap 修正を同じ cycle で追跡可能にする仕組みである。6 cycle の短い probe で判断再構成、重複調査、stale plan、記録負荷を測る。実装改善や headless 証拠を伴わない説明、発信数 KPI、player 要望の多数決化は採用しない。

■ URL
https://www.gamedeveloper.com/production/the-secret-to-overwatch-s-revitalization-over-communicating-
