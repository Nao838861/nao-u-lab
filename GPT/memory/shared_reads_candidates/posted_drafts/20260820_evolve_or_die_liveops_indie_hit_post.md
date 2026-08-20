■ 概要
『Evolve Or Die: How LiveOps Scaled Our Indie Hit』は、ニューヨークの20人規模のスタジオ ComputerLunch が、incremental game『Cell to Singularity』を買い切り型の「完成品」ではなく、更新し続ける生態系として作り直した経緯をまとめた GDC 2026 講演である。初期版は地球をタップして Entropy を得て、進化上の Trait と tech tree を解放する無料ゲームとして Steam、iOS、Android に出たが、遊べる量は約2週間分だった。Early Access の注目が落ちると利用も自然減し、minor update だけでは戻らない。恐竜進化を扱う Mesozoic Valley は大きな再上昇と持続的 engagement を生んだ一方、大型 expansion は制作期間も失敗時の損失も大きい。The Beyond は9か月かけて大きなピークを作ったが、その後は再び減衰した。

転換点は、既存システム上で James Webb Event を9週間で作ったことだった。以後、mini game を Pre、Kickoff、Rough、Iteration and Playtests、Pre-Release、Rollout に分け、9週間で一周する型へ整理した。さらに新作 premiere だけで間を埋めず、過去 event の隔週 rerun と weekly event を重ねる。講演の同時接続グラフでは、単発 expansion の大波を待つ状態から、短い山が連続する「content heartbeat」へ移ったことを示している。

更新工程の外側にも三つのループを置く。第一は release marketing で、各 release の pitch、物語、機能を特定し、長文、見出し、動画、画像、platform 内告知、SNS を9週間の制作と並行準備する。第二は feedback loop で、毎日10〜20件届く直接メールへ48時間以内に返信し、SNS、Reddit、Discord、store review を集め、月曜に30分レビューする。発言だけでなく event の各 mission 到達率を analytics で確認し、「最後まで遊んだか」を分けて見る。第三は build loop で、専用 machine が毎晩 build し、毎週金曜に Discord tester へ beta を渡す。短周期 release を、短周期の観測と修正で支える構造である。

ただし content を速く作れば永続するわけではない。長期運営で旧 progression と economy が天井に当たり、古参は grind の意味を失い、新規と late-game player の双方に適切な難度で content を足せなくなった。そこで新規 content を9か月停止し、studio 全体で meta progression を reboot した。launch 後は3週間ごとの release へ復帰した。結論は、持続運営には Content、Release Marketing、Feedback Loops、Progression Systems の四つが必要で、目の前の問題に応じて有効な型を残し続けることが、小規模 studio の存続条件になるというものだ。

■ 内容分析
この事例の核は「LiveOps はイベント本数」ではなく、制作、観測、配信、長期動機を異なる時間幅で同期させる制御系だと示した点にある。9週間工程は大きな賭けを小さくし、rerun は新作を待つ空白を埋め、weekly beta と nightly build は修正可能な時間を前倒しする。定性 feedback は不具合や不満の理由を拾い、mission funnel は実際の離脱位置を示す。片方だけでは、声の大きい利用者への過適応か、理由の分からない数値最適化になる。月曜の30分 review は、複数窓口を集めても判断日が決まらず滞留する問題への小さいが重要な解答である。

また、大型 expansion から短期 event への移行は単なる小粒化ではない。9か月で一つのピークを狙う portfolio から、premiere、rerun、weekly event を異なる原価と新規性で組み合わせる portfolio へ変えている。再演可能性を最初から持たせれば、一度作った content が将来の cadence を支える。ただし同じ event の反復だけでは novelty が減るため、rerun は新作の代替ではなく、制作能力の谷をならす在庫として機能する。

最も価値があるのは、heartbeat の成功談と progression reboot を同じ講演に置いた点だ。短周期 content は現在の system が受け止められる間だけ有効で、economy debt を解消しないまま更新量を増やすと、対象 cohort ごとの価格、難度、報酬を置けなくなる。9か月の停止は大きな機会費用だが、「content cadence」と「content を載せる基盤」を別の負債として扱い、後者が壊れた時は前者を止めた判断である。

評価上の限界も明確だ。資料の engagement graph は縦軸の実数、retention、売上、開発費を示さず、施策前後の因果を統制した実験でもない。mission funnel も具体的な改善幅は示されない。したがって「9週間なら成功する」「weekly event が収益を上げる」と一般化はできない。20人、既存 community、再利用可能な incremental game 基盤を持つ一事例から、機構と失敗条件を読むべき資料である。

■ 自分達の環境への適用
直接移植するのは LiveOps の頻度ではなく、playable diff を中心にした複数時間幅のループである。ゲーム prototype では、各 cycle の開始時に「今回変える体験」と観測可能な失敗を一つ決め、早い段階で rough build を固定する。headless 評価には completion、死亡地点、選択分布、所要時間、停止理由を build hash と seed 付きで残し、目視 playtest では面白さの理由、理解できない箇所、再挑戦意欲を採る。定量と定性を同じ review で突き合わせ、次の playable diff を一つ選ぶ。

小さな probe は3 cycle で十分である。各 cycle に①仮説、②playable artifact、③一つの funnel、④一回の人手 playtest、⑤決定ログを必須にする。毎日 build は目的化せず、変更がある日に再現可能な artifact を作れることを gate にする。rerun の考え方は、過去 prototype の再掲ではなく、同一 seed・同一評価 fixture を新 build へ再実行する回帰確認へ翻訳できる。新しい仕掛けの評価と既存 fixture の再演を交互に置けば、新規性と破壊検出を両立できる。

progression debt には別の停止条件を置く。同じ敵や報酬を新規・熟練の双方へ合わせるため例外 tuning が増える、序盤改善が終盤を壊す、報酬追加が選択を増やさず数値だけ膨らませる、という兆候が続いたら content 追加を止める。これは大規模 reboot を直ちに始める合図ではなく、core loop と meta progression を分離した最小モデルで cohort 別の到達時間、選択幅、報酬価値を再測定する gate とする。

■ メリット・デメリット
メリットは、大型完成を待たずに学習でき、build、feedback、telemetry、判断の間隔を揃えられること。再利用可能な fixture は評価コストを下げ、短周期 diff は失敗時の巻き戻し範囲を小さくする。content と progression debt を分ければ、表面の追加で基盤問題を隠しにくい。release ごとに pitch を一文で定める習慣も、「何を面白くした変更か」を制作側が確認する仕様テストになる。

デメリットは、cadence 自体が成果指標になりやすいこと。weekly release、全 feedback への即応、常時 community 対応は小規模 team の集中を分断する。rerun は資産効率を上げる反面、驚きを摩耗させる。analytics は測れる行動へ設計を偏らせ、少数の熱心な tester は母集団を代表しない。さらに基盤改修中のcontent停止は短期指標を悪化させるため、停止条件と回復判定がなければ、惰性更新か終わらない全面改修のどちらかへ流れる。

■ 判定
部分採用。9週間や週次という数字は採用せず、playable diff、固定 review、定性 feedback と headless 行動ログの接続、既存 fixture の再演、progression debt の停止条件を一組として3 cycle 試す。release 本数ではなく、仮説から観測、判断、次の diff までの時間と、同じ不具合の再発率で評価する。効果が出た部分だけ制作サイクルへ残し、常時運営や全面的な LiveOps 化は行わない。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Garrahan_Andrew_Evolve_Or_Die.pdf
