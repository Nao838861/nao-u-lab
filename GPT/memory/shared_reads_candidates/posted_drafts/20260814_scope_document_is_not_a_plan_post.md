■ 概要

Game Developer が、Blossom Arcade 創業者 Sophie Smart の London Games Festival「Self-Publishing Toolkit」講演を採録した記事。中心命題は、小規模チームが feature を列挙して完了済みに印を付けても、それは scope document――作る範囲の記述――であって、発売まで進むための plan ではない、という区別である。実行可能な計画には、feature を task と見積りへ分解するだけでなく、ゲームの一部分を特定の間隔で完成させる milestone と goal が要る。それにより初めて、開発月数、team を維持する期間、budget を相互に見積もれる。

Smart が具体例として勧めるのは Scrum 型の反復である。1～4週間の sprint ごとに主要な project element を一つ選び、planning で task を具体化し、daily standup で依存と進捗を共有し、期間末には team 全員で実際にその feature を使ってゲームを遊ぶ。判定対象は task が消えたかではなく、その feature が統合 build 上で使え、満足できるか、追加作業が必要かである。この反復は communication と iteration を保ち、early access を考える場合にも playable product を維持しやすくする。

対照として記事が警告するのが、discipline ごとの成果物を順番に渡す Waterfall である。病欠のような小さな外乱でも、次工程が必要な入力を受け取れず、担当者は別部分へ移る。その結果、完成度の異なる断片は増えるが、一緒に遊べる build がなくなり、ゲームが楽しいかを確かめられない「production hell」に入る。記事の結論は Scrum の形式そのものより、一定間隔で統合済みの遊べる断面を作り、そこで計画とゲームの両方を再判断せよ、というものだ。

■ 内容分析

この記事で有用なのは、scope と plan の差を文書の詳しさではなく、観測できる閉ループの有無で定義している点だ。feature list は「何を作るつもりか」を表せるが、順序、依存、統合時点、評価時点、再見積りの契機を保証しない。milestone も単なる締切にすると同じ問題が残る。期間末に playable build を team playtest するという出口条件を置くことで、実装、asset、UI、入力、状態遷移など複数 discipline の成果が同時に接続され、初めて進捗がゲームとして観測可能になる。

この playtest は楽しさの審査だけではない。第一に integration test であり、成果物間の契約が成立したかを調べる。第二に estimation test であり、想定した作業量と実績のずれを次の sprint に返す。第三に scope test であり、その feature が遊びへ寄与するなら残し、弱ければ追加・縮小・削除を判断する。第四に financing test であり、統合速度と残量から team 稼働月数と budget の見通しを更新する。一回の playable milestone が製品品質、工程、資金の三つを同時に検査するため、task 完了率より情報量が多い。

Waterfall の失敗例も記事固有の重要点である。問題は工程が直列であることだけではなく、局所的な稼働率を守るため各担当が「今できる別作業」へ逃げ、仕掛品を増やす点にある。各人は忙しく、個別 task も完了するので dashboard 上は前進に見える。しかし統合を待つ断片が増えるほど、最も重要な「全体を遊んだ証拠」は古くなる。この逆転が production hell の正体であり、task 数や稼働時間だけでは検出しにくい。

ただし記事は講演の短い採録で、Scrum と Waterfall を比較した定量研究ではない。team 規模、project 期間、sprint 成功率、budget 誤差の実測値は示されず、Scrum の ceremony が有効だった条件も分離されていない。また、基盤技術、長い lead time の art、外部審査、移植、localization のように、1 sprint 内で遊べる断面にしづらい仕事は残る。「常に playable」を全 build が完成品質であることと誤解すると、探索的な大改修を避け、短期に見える改善だけを選ぶ危険もある。したがって採用対象は Scrum 一式ではなく、統合 build と再判断の cadence である。

■ 自分達の環境への適用

小規模ゲーム制作 cycle では、done condition を「コードを書いた」「asset を追加した」から、「同じ統合 build で入力から結果まで再現でき、実際に遊んだ証拠がある」へ変える。各反復の開始時に、今回検証する player experience を一文で定める。たとえば「敵を避けながら資源を回収する判断が30秒以内に発生する」と置き、必要な task を実装、表示、音、headless 観測へ分ける。終了時には build hash、起動手順、短い play log、既知の破綻、次の判断を一組で残す。これを playable milestone の最小 receipt とする。

headless 評価は team playtest の代替ではなく、前段の integration gate に使う。起動不能、進行停止、入力無反応、勝敗到達不能、極端な時間超過を deterministic に弾き、その gate を通った build だけ人間が遊び、楽しさ、理解可能性、手触りを判断する。これにより playtest 時間を基礎的な故障の発見で消費せずに済む一方、数値が通っただけで「面白い」と誤判定することも避けられる。

制作サイクルの staging には task 消化率より、`last_playable_build`、`playtest_evidence`、`blocked_dependency`、`estimate_delta`、`scope_decision` を残す。反復後に、見積りと実績の差、未統合の仕掛品、追加修正量を更新し、次回は最大の不確実性を一つ選ぶ。budget は最初の固定値ではなく、直近数回の統合速度から残り milestone 数を掛けて更新する。外部公開を考える段階では、常時 playable という事実だけで early access 可とはせず、save compatibility、content cadence、support 負荷を別 gate にする。

最初の検証は二つの短い反復で十分である。各反復で一つの遊びの仮説を選び、task 完了数、未統合 work 数、headless gate 結果、人間の playtest で生じた修正数、見積り差を記録する。二回目に未統合 work と見積り差が減り、遊びに関する判断が早まるなら継続する。ceremony の時間だけ増え、build の観測鮮度が改善しないなら standup や sprint 長を削る。

■ メリット・デメリット

メリットは、進捗の単位を成果物の量から統合された遊びへ移せること、依存停止を sprint 末ではなく日々の共有で早く見つけられること、楽しさの判定と再見積りを後半まで延期しにくいこと、各 milestone が early access や外部 demo の土台になり得ることである。特に少人数では専任 producer がいなくても、playable receipt が「何をもって進んだとするか」の共通基準になる。

デメリットは、短い sprint、planning、standup、playtest 自体に固定費があること、統合しやすい小粒 feature を優先して長期的な技術投資を後回しにし得ること、未知の研究 task や外部依存の見積り誤差は消えないこと、少人数では一人の病欠という single point of failure 自体を Scrum が解消しないことである。さらに playable を守るための暫定接続が蓄積すると、見かけの統合性と内部品質が乖離する。technical debt、外部依存、未統合 work は別に可視化する必要がある。

■ 判定

部分採用。scope document と実行計画を分け、短い cadence ごとに「統合 build を遊んだ証拠」を置き、結果を scope・見積り・budget へ戻す閉ループは採用する。一方、Scrum の ceremony、1～4週間という長さ、Waterfall 全否定はそのまま移植しない。headless integration gate と人間の playtest を分担させ、二反復の実測で観測鮮度が上がるかを確認してから運用を固定する。

■ URL
https://www.gamedeveloper.com/production/-a-scope-document-is-not-your-plan-laying-the-groundwork-for-indie-success
