■ 概要
『I Won't Be Abducted』は、Wavedash Spring Jam 26 のテーマ「Shelter」に対し、約63時間で作られた3夜構成の tabletop-defense game である。少年が自室への宇宙人侵入を盤上で退けるが、宇宙人は board-game の駒、配置する巨大な手は少年自身、最後の怪物は寝室の扉を開ける父親だったと終幕で分かる。狙いは部屋そのものを shelter とするのでなく、制御できない不安を遊びとして演じ直す行為を shelter にすることだった。制作判断は、この一度の reveal を最後まで守れるかで統一されている。

着手前に scope を must ship / stretch / do not build の三列へ分け、とくに procedural map、実体のある combo system、free-roam pathfinding、4夜目を day zero から禁止した。「夜の戦闘が game で、それ以外は設定」という基準で盤面を3×5の15 cell に固定する。途中で最大の削減対象になったのは economy である。当初は戦闘で得る Scrap で upgrade を買う shop を想定したが、upgrade ごとの価格と、複数 income source の供給量という二重の tuning debt が生じる。そこで shop を、5枚の pool から3枚を提示して1枚を無料で選ぶ dawn draft に置換した。Scrap の用途は戦闘中に蹴れる障害物を作る一つだけに残した。比較対象と出現候補を作者が制御できる draft に変え、調整軸を減らしたのである。

実装では gameplay 数値を Godot の `.tres` resource に集約し、最終夜を script 修正ではなく数値調整に使えるようにした。global EventBus の signal を HUD、audio、achievement、panic shader が購読し、game logic から UI を分離した。board-game standee には walk cycle を作らず、hop、lunge、knock-back、screen shake だけで動きを成立させる。この制約は animation 工数を消すだけでなく、駒だったという終幕の証拠にもなった。

一方で失敗も明確である。Crawler は初回 session から動いたが、Lobber、Rusher、父親戦は最終日まで data-only で、playtest は日単位でなく時間単位になった。敵攻撃の pull-back、warning flash、strike という予告も finish pass までなく、tile から退避する game なのに被弾が恣意的に感じられた。4本を予定した voice narration は1本しか録れず、残りは音楽上の timed text へ切った。結論は、週末で完全な arc を出荷できたのは、全 system と表現を一つの静かな終幕へ切り詰めたからだが、敵と fairness の検証可能性まで後回しにした代償は残った、というものだ。

■ 内容分析
この記事の核は「小さく作った」ことではなく、scope、tuning、表現、物語を同じ目的関数へ束ねたことにある。do-not-build list は将来案の優先順位ではなく、時間が余っても解禁しない探索空間の境界として働く。盤面15 cell、3夜、単一 reveal を正本にしたため、procedural map や4夜目は単なる高コスト機能ではなく、調整対象と物語の焦点を増やす逆方向の案として切れる。締切直前の scope cut と違い、architecture と asset 発注の分岐そのものを発生させない。

shop から draft への変更も、economy を削除しただけではない。shop は価格と収入が相互依存し、ある upgrade の価値変更が全価格・獲得速度・貯蓄戦略へ波及する。無料 draft は比較を同時に見える3択へ閉じ、購買可能性と通貨期待値を消す。ただし作者の「draft は自己均衡的」という表現は限定的に読むべきだ。選択肢間の相対比較はしやすくても、pool 内に支配的な1枚がある、組合せが雪だるま化する、提示運で難度が変わる問題は残る。自己均衡というより、63時間内で観測し調整できる変数へ縮約した、と捉える方が正確である。

`.tres` と EventBus の価値は、締切時の希少資源を code変更から tuning と finish へ移した点にある。ただし data-driven は playable を保証しない。後発3敵は data として存在しても、組合せ、認知、回避余地は最終日まで評価できなかった。反復費用を下げても、最初の representative enemy に telegraph を含めなければ fairness の設計負債は消えない。

standee は特に成功した制約である。安価な代替表現が、世界内の物体、動き、終幕の伏線を同時に担い、制作都合が作品固有性へ変わった。ただし静止画の一般則ではない。不動・簡素であること自体が後から意味を持ち、code motion でも敵の状態と攻撃予告を読める場合に限って成立する。

評価上の限界は、単一作者の自己報告で、完走率、reveal の理解率、upgrade 選択分布、敵別被弾率、telegraph 導入前後の比較がないことだ。実装補助、resource 化、scope cut の寄与も分離されていない。63時間で出荷した事実と失敗記録は evidence だが、各施策の一般的な効果量までは分からない。

■ 自分達の環境への適用
短期 prototype では、着手前に must ship より先に do-not-build を書く。禁止項目は「今回は不要」ではなく、期限中は解除しないものに限定し、各項目へ守る検証対象を対応させる。例えば procedural stage を禁じる理由は地形生成工数ではなく、同一盤面で移動と敵配置を比較できる状態を守るため、と記す。追加提案が出た時は工数だけでなく、調整軸、asset 種、failure mode、必要 playtest 数が何個増えるかで判定する。

最初の playable milestone は、最小盤面、代表敵1体、主要行動、被弾予告、勝敗、仮の終幕までを縦に通し、telegraph は polish backlog へ置かない。headless 評価では seed を固定し、命中までの猶予、危険 cell から退避可能だった割合、予告後の回避率、原因不明の被弾を取る。録画では、初見の人が攻撃主体・危険位置・回避方向を説明できるかを見る。数値上は回避可能でも視覚的に読めなければ未完成とする。

economy は full shop と free draft の二案を最初から作らない。まず3択 draft で、選択率、選択後の生存時間、同一 pick の支配を記録する。特定カードへ偏る、同じ build へ収束する、提示運が勝敗を強く決めるなら card 効果か pool 構造を直す。shop は貯蓄と機会費用そのものが core decision だと比較 build で示せた時だけ導入する。

実装値は resource / config に置き、build hash、seed、設定差分と結果を一組で保存する。data-only の敵を進捗と数えず、spawn、認知、予告、衝突、報酬まで通った時点を playable とする。EventBus は core loop の観測点に絞る。記憶 atom には削った機能だけでなく、消えた tuning 軸と保護した検証経路を残す。

表現制約は、安価さと意味の二条件で選ぶ。仮 sprite、限定 palette、固定 camera、少数 animation が、物語上の事実や player の解釈へ再利用できるかを1枚の終幕 mock と冒頭 gameplay で比較する。低コストでも readability を落とすなら採用しない。検証 gate は、説明なしで主要状態が読めることと、終幕後に前半の表現が伏線として再解釈できることの両方である。

■ メリット・デメリット
メリットは、scope cut を機能数の削減で終わらせず、調整可能性と物語の焦点を同時に高められることだ。do-not-build で分岐を早期に消し、draft で economy の変数を減らし、resource 化で残り時間を tuning へ移す。standee のように制約を作品内の意味へ変換できれば、asset cost の削減がそのまま固有性になる。成功だけでなく roster、fairness、voice の遅延が時系列で示され、短期制作の review checklist に落としやすい。

デメリットは、一つの reveal への最適化が、mechanic 単体の反復性や別の遊び方を痩せさせる可能性があることだ。do-not-build を早く固定しすぎると、prototype で見つかったより良い核へ pivot できない。draft も balance を自動解決せず、EventBus は小規模作品では間接性を増やす場合がある。静止 standee と code motion は animation 工数を減らしても、攻撃予告や状態差を表せなければ fairness を損なう。63時間の自己報告一件なので、手法の採否は出荷実績ではなく、自分達の比較可能な probe で決める必要がある。

■ 判定
部分採用。do-not-build、単一の終幕へ向けた scope 判定、economy の調整軸縮約、数値の resource 化、表現制約の物語的再利用を短期 prototype の標準 probe にする。一方、telegraph と representative enemy は最初の playable に含め、draft の自己均衡性や EventBus の有効性は前提にしない。固定 seed の headless 指標と初見録画で、調整容易性・fairness・readability が実際に改善した場合だけ次の制作へ残す。

■ URL
https://chrisdalbano.com/notes/i-wont-be-abducted-postmortem
