■ 概要
James Rowbotham による『Ultra Ball』の postmortem は、約20時間の実装と約5時間の公開準備で、小さな arcade game を「思いつき」から配布可能な完成品まで閉じた記録である。題材は Pong、Breakout、Super Hexagon の要素を合わせ、上下の paddle で加速する ball を返し続ける反射神経ゲーム。当初は左右の mouse button で上下の paddle を別々に動かす案だったが、作者は実装前の再検討で、操作対象の選択と ball の追跡を同時に要求すると認知負荷が高く、感触も悪くなると判断した。そこで click を廃し、ball が進んでいる側の paddle だけを自動的に操作対象にする。player の注意を「次に ball が到達する場所」へ集約し、難しさを入力の取り違えではなく、位置合わせ・速度・障害物へ移した点が中核の設計変更である。

最初の約5時間では、ball と paddle の core mechanic だけでなく、開始・進行中・終了の match state、level data、level ごとの制限時間、best time の save、簡易 UI、cooked build まで一気に通した。次の約1時間で obstacle や paddle shape を level data から切り替える modifier 系と、予定していた10 level の placeholder、level select を追加した。これにより、個別 level を場当たり的に作るのではなく、同じ core loop に変数を差し替えて展開できる骨格が早期に成立している。

一方、30分から1時間の細切れ作業では、paddle の tilt、ball の scale、camera shake、bounce sound といった juice に進んだものの、完成へ近づいている感覚を失った。高速化した ball では shake と sound がほぼ常時発火し、単発では気持ちよい feedback が連続時には画面と音のノイズになることも判明した。作者は bounce sound の attack/release を極端に短くするなど密度を調整しつつ、紙に level 案を描き、実装難度ではなく player が感じる難度順に番号を振り直す。以後はその地図を基に obstacle、UI、bug、art、progression、balance を閉じていった。

終盤には editor と cooked build の挙動差で回転 obstacle が速くなり level が不可能になる問題、逆操作 level が通常進行には難しすぎる問題を発見した。前者は実配布 build 側を基準に速度を落とし、後者はいったん削除した後、通常の完走条件から切り離した最終 challenge に再配置した。数人への build 配布 playtest では bug と改善案を拾い、3 level と、通常 clear より厳しい任意目標「Ultra Time」を追加する。ただし追加余地が残っていても、目的が UE5 の練習と tight な prototype の完成であることへ戻り、そこで終了した。記事の結論は、早い playable 化、player 視点の計画、実 build での playtest、feedback 頻度の調整、公開工程を含む scope の明示が、短期制作を完成へ運ぶというものだ。

■ 内容分析
この事例の価値は「小さく作る」という一般論ではなく、短期制作で判断の順序がどう依存しているかを時系列で見せている点にある。入力簡略化によって core loop の評価対象を純化し、最初の5時間で save や cook まで含む縦切りを作り、modifier で content の増やし方を固定し、その後に level plan で完成条件を可視化している。特に cook を初期に通したことは単なる build hygiene ではない。終盤に editor と配布 build の速度差が実際に出たため、「動く」の正本を editor preview ではなく配布 artifact に置く判断が記事内で回収されている。

もう一つ重要なのは、難度を mechanic の有無ではなく配置場所で調整した点だ。逆操作は失敗 mechanic として捨て切らず、main progression から optional end challenge へ移した。これは難しい要素を弱体化する以外に、導入順、必須性、報酬との結び付きを変えることで利用者層を分離できることを示す。「Ultra Time」も既存 level に第二目標を重ねるため、少ない実装費で初心者の clear と熟練者の mastery を両立させている。

ただし、これは比較実験ではなく単一作者の事後記録である。playtest 人数、各 level の離脱率、best time 分布、変更前後の成功率は示されず、「1 more go feeling」や完成後の fun は作者の主観に留まる。大きな時間塊が創造性に効いた、数週間の休止が発想に効いたという結論も、作業内容や生活条件と分離されていない。さらに playtest 後に scope を止めた一方で3 level を追加しており、scope creep と価値ある late discovery の境界は定量化されていない。したがってこの記事は普遍則ではなく、再現可能な工程仮説の供給源として読むのが妥当である。

■ 自分達の環境への適用
我々の短期 game prototype では、最初の playable diff の完了条件を「主要入力、勝敗または終了、最低1つの challenge、headless で読める state、配布相当 build の起動」までの縦切りにする。見栄えを足す前に、入力が何へ注意を向けさせ、失敗が操作理解・判断・実行のどこから生じるかを1文で固定する。Ultra Ball の変更を借りるなら、複数対象の選択を自動化した時に面白さが消えるか、それとも本来見たい空間判断が鮮明になるかを比較する。

content は level ごとの固有 code を増やす前に、同じ loop へ modifier と parameter を注入できる形へ寄せる。ただし data-driven 化自体を目的にせず、最低3条件――基準 level、単一 modifier、複合または高速条件――を作って差が観測できた時点で止める。難度順は実装工数ではなく player の成功率、初回失敗までの時間、再挑戦率、入力ミスの種類で並べる。headless 評価では clear rate や所要時間を取れ、視覚・音の過密は capture を用いた人間レビューで補う。feedback については「1回の強さ」だけでなく、最速状態での1秒当たり発火数を測り、常時発火する effect は短縮、間引き、重要 event への予約のいずれかを試す。

小さな検証は1 cycle で閉じられる。A: 入力方式を2案用意し、初見3 run の誤操作と ball 追跡の破綻を記録する。B: level を想定難度順に並べ、bot rollout と人間 playtest の順位差を残す。C: editor、headless、配布 build の同一 seed で速度・collision・clear 可否を照合する。D: 通常 clear には不適切な mechanic を optional challenge へ移し、必須進行の離脱と熟練者の再挑戦がどう変わるかを見る。完成線は「仮説を判定できる playable artifact と記録が揃った時」とし、追加案は次作候補へ退避する。公開用 capture や説明文も総工数の外に置かず、作者の実績どおり開発時間の約2割まで膨らみ得る工程として見積もる。

■ メリット・デメリット
採用できるのは、core loop と配布 build を早期に縦切りすること、player 視点で level 順を決めること、高頻度時の feedback を別条件として評価すること、難しすぎる mechanic を削除だけでなく任意 challenge へ再配置すること、公開工程を scope に含めることだ。どれも成果物と観測値へ落としやすく、短期制作が polish の漂流や未検証の content 量産へ逸れるのを防げる。

危ないのは、5時間や20時間という時間配分をそのまま基準化すること、作者の「楽しい」を十分な評価とみなすこと、後半の content 追加を成功例として無条件に模倣することだ。初期に match state、save、UI まで作る範囲も、検証したい仮説によっては過剰である。modifier architecture は再利用に効く一方、一作限りの mechanic では抽象化費用が playable 化を遅らせる。記事の工程を checklist として固定せず、各項目が今回の不確実性を減らすかで取捨選択する必要がある。

■ 判定
部分採用。短期 prototype を完成へ閉じる判断列としては具体的で、特に「入力の注意配分」「配布 build を早く正本にする」「難度を配置で調整する」「feedback を最大頻度で評価する」は次の制作で直接検証する価値がある。一方、主観的 postmortem で効果量は不明なため、時間配分や level 数は移植せず、同一 seed の artifact 比較、成功率、誤操作、再挑戦を記録する小規模 probe として採用する。

■ URL
https://www.gamedeveloper.com/design/post-mortem-ultra-ball
