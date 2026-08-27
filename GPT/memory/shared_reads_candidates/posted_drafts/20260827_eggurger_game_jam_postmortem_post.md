■ 概要
『Eggurger: The Game』は、食べ物を題材にした top-down action として、hub→run→boss→victory→rerun の一周を jam 期間中に完成させた事例である。目標は、敵と部屋の圧力が高まり、武器の違いが読め、boss 撃破後には確実に勝利へ着地する短い run だった。記事には、playable build を保ちながら戦闘、報酬、終端状態、配布物を局所修正で締めた過程が残る。

戦闘では、敵の出現 pacing と room flow を繰り返し調整し、偶然に敵が重なる感覚を減らした。武器は charge と slash の役割、命中時の結果を明確化した。さらに French Fry と Jalapeño 系統にあった割合 damage を終盤の balance pass で削除した。敵 HP と同時に火力が膨らむ経路は runaway scaling を起こし、武器間比較と遭遇設計を不安定にするため、予測可能な damage model へ戻したのである。

報酬側では、通常敵の loot bag を確定 drop から確率 drop に変え、mini-dungeon で部屋を通過するだけでもらえた passive XP を撤去した。drop table から Pantry Purge も除外した。これらは報酬量の単純な削減ではない。敵と戦う、危険な進路を選ぶ、run を継続するという行動を成長へ再接続し、「戦わずに部屋を抜ける」「通常敵を倒すだけで毎回同じ報酬を得る」という free scaling を消す変更だった。

終盤では boss room を final burner fight に合わせ、boss clear→portal→victory の状態遷移を明示的に修正した。勝利画面には生存時間、与 damage、被 damage なども追加した。missing sprite、SFX、HUD / state 表示を統合し、Windows package を重要修正後に再生成・再検証した。制作量は73 commits、最終33 Lua files・16,010行で、最大 subsystem は gameflow と combat room logic を持つ `states/` だった。作者は targeted fix、終端遷移の明示、damage model の正規化、critical fix 直後の syntax check と rebuild が playable build の維持に効いたと結論づけ、作品は jam 1位を得た。

■ 内容分析
変更の共通項は、プレイヤーの入力とゲーム内結果の因果を狭くし直すことにある。割合 damage は固定 damage と別の成長曲線を持つ。確定 loot と passive XP は、戦闘の質や危険選択と無関係に報酬を供給する。boss 後の暗黙遷移は、戦闘の勝利と victory state の成立を別々の偶然に委ねる。いずれも run 全体で「なぜこの結果になったか」を読みにくくするため、作者は新機能より余分な経路を削り、action→outcome の対応を単純化した。

一方で、すべての調整を「単純化は正しい」と一般化してはいけない。割合 damage は build diversity や高 HP 敵への対抗手段になり得るし、passive XP は探索や非戦闘 route を報いる設計にも使える。本作では fast readable action と予測可能な damage が目標だったために撤去が整合したのであり、mechanic 自体が悪いわけではない。重要なのは、その報酬経路が作品の主行動を強めるか、主行動を迂回する最適解になるかを run 単位で見ることである。

`states/` が最大 subsystem だったことと boss clear flow の不具合は対応している。終盤は combat、room、portal、stats、victory、rerun が接続し、jam の最後に壊れやすい。「状態遷移を明示する」は、実際に finale blocker を直した判断である。次回案の transition regression、drop table sanity、tuning と behavior の分離、release checklist も、失敗を検査可能な境界へ分解している。

評価の限界も大きい。1位は完成度の外部評価ではあるが、どの変更が順位へ寄与したかは分離されていない。変更前後の playtest 人数、clear rate、平均 run 時間、weapon 選択率、loot 期待値、boss 後遷移の再現率は示されず、記事は作者による振り返りである。「better pacing」「clearer rewards」という結論は妥当そうでも定量比較ではない。また33 files・16,010行という規模は成果量を示す一方、品質や保守性の証明ではない。したがって採用対象は個々の balance 数値ではなく、失敗を因果・状態遷移・artifact の境界へ切り分け、狭い check で閉じる工程である。

■ 自分達の環境への適用
短期 action prototype では、playable diff の完了条件を三段にする。第一は戦闘と報酬の因果である。damage source、撃破、drop、XP、room clear を event log に残し、戦わずに進んだ run と戦った run の成長差、weapon ごとの実効 damage、敵 HP 上昇時の damage 比率を同一 seed で比較する。新しい割合 damage や passive reward を入れる時は、「何の行動を報いるか」と「その行動を迂回できないか」を先に一文で固定する。headless agent は面白さを判定せず、free scaling、単一 build の runaway、drop table の到達不能項目を探索する役に限定する。

第二は終端遷移である。boss_alive→boss_defeated→portal_enabled→victory_entered→result_visible→rerun_ready を trace にし、各状態を一度だけ通ることを regression test にする。通常 clear、相打ち、pause 解除直後、同 frame 撃破、portal への即時接触を小さな matrix で回す。演出確認は人間が行い、headless は遷移の欠落、重複、timeout を検出する。

第三は配布 artifact である。critical fix を source edit で終えず、syntax check→test→rebuild→zip の必須 file 確認→fresh directory から起動、まで一つの receipt に束ねる。build hash、commit、seed、結果を staging に残せば、配布 zip の更新漏れを防げる。武器値・drop probability・敵 pacing は data、遷移条件と報酬規則は code に分け、balance diff と状態機械の変更を混同しない。

小さな検証は一つの既存 prototype で十分である。現状 build と、因果 log・終端 trace・artifact checklist を追加した build を各20 seed 実行し、未戦闘成長量、weapon damage の最大/中央値比、boss 撃破後 result 到達率、二重報酬回数、fresh launch 成功率を比べる。人間 playtest では敵出現の意図が読めるか、報酬の出所を説明できるか、勝利後に達成感が切れないかだけを観察する。数値が改善しても feel が悪化した場合は pacing 数値を戻し、検査基盤だけを残す。

■ メリット・デメリット
メリットは、追加機能ではなく既存 loop の余分な因果を削るため、締切直前でも差分を狭く保ちやすいことだ。戦闘・報酬・終端・配布を別境界として検証すれば、playable だった revision を失いにくい。event log と state trace は再現可能な headless 評価へ直結し、release checklist は遊びの修正が実際の配布物へ入ったことまで保証できる。記事の失敗例と次回 check が一対一で対応しているため、導入単位も小さい。

デメリットは、予測可能性を優先しすぎると build の発見性や意外な相互作用まで消す危険があることだ。確率 drop の導入も、期待値・連続不運・回復手段を測らなければ報酬の因果を明確にせず、単に不公平感を増やす。state trace と release check は「正常に進む」を保証しても、boss の面白さや victory presentation の質は測れない。さらに本記事には変更前後の比較値がなく、jam 1位を特定施策の効果量として扱えない。検査は再現可能な不具合と経済破綻を受け持ち、pacing、読みやすさ、達成感は人間の playtest に残す必要がある。

■ 判定
部分採用。割合 damage の撤去や drop 率そのものは移植せず、主行動を迂回する成長経路の検出、boss→result の明示的 trace、critical fix 後の rebuild / artifact receipt を採用する。まず一作品・20 seed の可逆な probe で因果切断、終端 failure、古い配布物を捕捉できるか測り、人間の手触り評価を上書きしない範囲で制作サイクルへ残す。

■ URL
https://itch.io/devlog/1447983/osu-game-io-game-jam-postmortem-eggurger.amp
