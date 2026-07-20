■ 概要
『Space Rescue Squad』は、2025 SNESDEV Game Jam で完成した3レベルのSNES向けプラットフォーマーである。この一次ポストモーテムは、作者が放棄していた自作 engine を実制作で検証し、音楽・効果音付き作品を締切までに出す過程を、成功した反復環境と公開後に発覚した softlock の両方から振り返っている。

準備段階では、ROM の memory mapping を HIROM から LOROM へ変える際、entity 関連を一度に別 code bank へ移そうとして依存関係を見失った。二度目は subroutine の大きさを測る script を作り、最大15件から手作業で移す方式へ縮小した。移動対象には `__far` suffix を付け、誤った `jsr` / `rtl` の組合せを assembler error で露出させた。結果、主要 code block の空きは8.3 KiBから18.7 KiBへ増えた。大改修ではなく、計測して大きい箇所から動かし、名前で境界違反を検出する方法が engine 復旧を前進させた。

制作では当初、最初の level を外部 test 可能にする期限を置いたが、blocky tile のまま遊べる版より完成 tile を優先して失敗した。中盤に規模を3〜4 levelと boss 1体へ縮め、particle、滑らかな animation、第二背景より gameplay を優先した。敵は単色の矩形と状態ごとに異なる仮 sprite から始め、挙動、当たり判定、player との寸法関係を確かめてから描き直した。

反復速度を支えたのが専用 debug build である。第二 controller から前後の部屋、debug room、次 level、回復、重力反転などへ移動でき、各 room load 前に永続 state を Save-RAM へ保存した。resource file の変更を検知して再 build・再起動し、同じ検証地点へ戻るまでを3秒未満にした。作者はこれを enemy、tile、room の調整に最も効いた成功要因としている。

一方、自己 test は実機、keyboard、Xbox controller、CRT overscan 相当、常時 run、walk のみ、と実行条件を広く覆ったが、見える敵を全滅させる遊び方、boss、後半2 level の blind playthrough を十分に試さなかった。公開日に2人が gravity labs の同じ部屋で、敵を倒した後に重力反転装置へ届かなくなる softlock を踏み、締切約3時間後に patch を出した。作者は動画から未想定の遊び方を知り、今後は公開前に第三者の blind playthrough を依頼し、そのプレイ自体を観察すると結論づけた。

■ 内容分析
この記事の中心は「反復が速ければ品質が上がる」ではない。3秒未満の loop は、作者が思いついた仮説を大量に試す能力を高めたが、試験集合に入っていない player policy は一度も評価しない。実行環境の coverage と行動方針の coverage は別物であり、前者を広く取っても後者の穴から致命的不具合が出る。公開後の softlock は、debug 手段の不足ではなく、何を試すかの不足だった。

debug build の価値も単なる compile 時間短縮ではない。部屋遷移、回復、重力反転、state 復元により、検証したい状態を再構築する手作業を削っている。変更から結果観察までの待ち時間だけでなく、同じ初期条件へ戻る摩擦を減らしたため、配置や挙動の微調整を反復できた。制作 harness では build の速さより「目的の状態へ再現可能に戻れるか」が重要だと分かる。

矩形 sprite も単なる仮素材ではなく、設計計測器として機能した。完成絵を先に描いた cleaning robot はサイズを固定し、後の挙動を絵へ合わせる制約になった。対して後続の敵は輪郭と状態記号だけにし、寸法や速度を容易に変え、各 state を画面上で識別できた。placeholder は美術工数の先送りではなく、当たり判定と state machine を目視可能にする debug UI と読むべきである。

失敗例にも条件依存性がある。boss は作者が壁から4 tileほど離れて試した時には簡単だったが、壁際では大幅に難しくなった。softlock も、隙間を飛び越え、敵を倒し、下向き重力のまま孤立する行動列で発生した。平均的な一周の確認ではなく、位置、行動順、敵の生死、能力状態の組合せを跨ぐ検査が必要になる。

ただし、これは一人・一作品の回顧であり、3秒という値の比較実験も、blind test の人数別効果もない。作者自身が挙げる major bug は4件で、修正済みは1件だけである。成功した debug workflow が release 品質全体を保証したとは言えず、短期 jam、SNES、独自 engine という条件を外して数値を一般化するのは危険である。

■ 自分達の環境への適用
短期 prototype では、制作 loop と release gate を分ける。制作 loop には、任意 scene / checkpoint への移動、主要能力の付与、敵状態の切替、同じ seed と state の復元を最初から入れる。目標は一律3秒ではなく、変更後に検証地点へ戻るまでを計測し、調整をためらわない時間へ抑えることとする。仮 sprite には状態ごとの色や記号を与え、最終 art 前に hitbox、遷移、攻撃予告を読めるようにする。

release gate では、通常クリアとは別に player-policy card を使う。例は、見える敵を全滅、戦闘回避、常時最大速度、最低速度、壁沿い、能力を温存、取得物を逆順、通過後に引き返す、である。各 policy について checkpoint、能力状態、敵の生死、到達不能、一定時間の進行停止をログへ残す。headless probe は同じ build と seed で複数 policy を走らせ、softlock 候補や難度の位置依存を抽出する。

ただし headless 成功を blind playtest の代用にはしない。自動 probe は既知の state 変数と不変条件には強いが、作者がそもそも定義していない遊び方、誤読、ためらい、局所的な難しさを発見しにくい。公開前に少なくとも一人へ説明なしの通しプレイを依頼し、質問で誘導せず、入力列と映像を保存する。作者の期待経路との差ではなく、停止、反復、見落とし、意図しない攻略がどこで起きたかを観察する。

制作サイクルの小さな検証としては、次の playable diff 1件だけで二つの指標を記録する。第一は edit から同一 checkpoint 復元までの中央値、第二は通常経路と異なる3 policy の到達・停止結果である。これで速い loop と探索範囲を混ぜずに評価できる。問題が見つかった時は個別の禁止ルールを増やすより、復元可能な debug state と policy 別 replay を証拠として残す。

記憶システムには、lesson を「外部 test を増やす」とだけ保存せず、`tested_environment`、`tested_player_policy`、`unvisited_state_combination`、`failure_evidence` に分けて残す。次回 recall では device coverage を blind coverage と誤認せず、どの行動列が未検証だったかまで引ける。postmortem の価値を抽象標語ではなく再実行可能な release checklist へ変換できる。

■ メリット・デメリット
メリットは、反復速度、placeholder、scope 調整、blind test 不足、公開後障害が一つの制作史で因果的につながっていること。低コストの debug command と state 復元はすぐ移植でき、行動方針別 test は headless と人間観察を役割分担させられる。失敗を「test 不足」で丸めず、環境 coverage と policy coverage に分解できる点も強い。

デメリットは、単一事例なので最適な復元時間、policy 数、外部 tester 数を導けないこと。debug 機能を増やしすぎれば本体との差分や保守負担が生まれ、scripted policy は想定外行動を新たな想定内へ変えるだけでもある。また placeholder が有効なのは挙動と寸法の検証段階であり、視認性、雰囲気、animation の気持ちよさを評価する段階まで残せば別の欠陥を隠す。

■ 判定
部分採用。3秒という値や個別 command は一般化せず、「同じ検証状態へすぐ戻れる制作 loop」と「作者と異なる player policy を踏む release gate」を独立に採用する。次の短期 prototype で checkpoint 復元時間と3 policy の replay を記録し、公開前の blind playthrough で自動検査の外側を確認する。

■ URL
https://undisbeliever.net/blog/20260709-srs-postmortem.html
