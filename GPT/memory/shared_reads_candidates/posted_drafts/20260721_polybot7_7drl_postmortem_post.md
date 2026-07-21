■ 概要
Josh Ge が Seven-Day Roguelike Challenge の一週間で、長期開発中の『Cogmind』を土台に、別の短編 roguelike『POLYBOT-7』を作った80時間超の制作記録。狙いは既存作の縮小版を作ることではなく、engine、tool、世界設定、content pipeline を再利用しながら、player の周囲にある部品が磁石のように寄ってきて自動装着される mechanic を中心に、プレイ時の判断そのものを別物へ変えることだった。engine を一から作らないことで、限られた一週間を gameplay と content に振れる一方、開始時点で詳細設計を詰め切れず、途中の変更が UI、map、upgrade、balance へ連鎖した過程まで開示している。

制作前には、106×30 grid に必要情報が収まるかを REXPaint の mockup で確認した。item category の header を消して表示行を稼ぎ、色は見た目を変えるために orange へ移す案を捨て、damage 状態を green→yellow→orange→red で読む既存の視覚文法を守った。実装では不要な Cogmind の window を削除せず画面外へ動かして処理を生かし、旧 console の描画結果を一行の info strip へコピーした。message log も既存の全画面 log を移動・伸縮して転用するなど、構造を美しく作り直すより、一週間後に動く体験へ時間を寄せた。

gameplay 側では inventory を廃止し、地面そのものを inventory と見なした。近傍部品は Dijkstra search と既存 pathfinding で player へ近づき、隣接部品のどれが装着されるかは random、個別取り外しも不可としたため、位置取りが build 制御を兼ねる。不要部品が地面に滞留する問題には salvage の時限 self-destruction を転用した。map 制作中には、狭い map では出口探索だけが優位になりやすい問題から permanent upgrade を追加し、敵を倒して強化を探すか早く脱出するかという risk/reward に変えた。ただし、この追加で content 作業が膨らみ、予定した balance 日を消費した。

終盤は既存値を盲目的に流用せず、表示範囲が50から30へ縮むことに合わせ射程値をまず0.6倍し、debug output で武器出現率の不足を見つけて最低割合を強制した。公開後には、削除したはずの操作が mouse 経路に残り、存在しない map へ入ると crash する不具合も即修正している。結論は「既存作を足場にすれば短期でも独自体験に届く」だが、成功要因は再利用そのものではなく、体験の核を変える箇所と、期限のため意図的に負債を受け入れる箇所を分けたことにある。

■ 内容分析
この記事で重要なのは、asset reuse を工数削減の一般論で終わらせず、「意味を再割当てできる既存機構」を何度も使っている点である。部品を引き寄せる既存 effect は主 mechanic に、全装備破棄 command は build を半分入れ替える Purge に、item self-destruction は地面の在庫圧縮に、旧 window は非表示の計算 backend に変わった。code を共有していても、player が向き合う選択は Cogmind の inventory 最適化から、空間・装着順・事故を含む即興的 build へ変わる。派生作を別ゲームにするのは新規 code 量ではなく、既存機能同士の因果関係を組み替えた差分だと読める。

一方、記事は「慣れた codebase なら速い」を無条件には支持しない。長年の前提が残るほど、画面外 window や mouse 専用 event のような hidden dependency が増える。短期では window を消さず移動する判断が合理的でも、入力経路の片方だけを無効化した結果、公開後 crash が出た。再利用は既知の機能を早く得る代わりに、見えていない契約まで継承する。したがって speed の源泉と defect の源泉が同じである。

もう一つの核は、scope を「機能数」だけでなく、decision density と表示制約で削っていることだ。inventory、slot category、遅い animation を減らし、短編の一手に必要な判断を圧縮する。106×30 mockup を先に作ったのも cosmetic な準備ではなく、何を画面上の常設判断に残すかを決める design test だった。ただし permanent upgrade の追加は map 動機を改善する一方、content と balance の予定を圧迫した。局所問題への優れた解決が全体 schedule では高価になり得るという、短期制作特有の失敗条件が明確である。

評価は厳密な比較実験ではない。437 runs、882 downloads、itch.io での露出、Steam wishlist の前週比29.4%増が示されるが、宣伝や無料配布の影響を分離できず、面白さの因果証明にはならない。また weapon 出現率の最低保証は短期の破綻回避には有効でも、build 多様性や難易度曲線を十分に測ったものではない。これは完成された設計手法の検証というより、締切下の意思決定と残存リスクを追える一次記録として価値が高い。

■ 自分達の環境への適用
短期 prototype を既存作から派生させる時は、着手前に reuse inventory を「そのまま使う基盤」「意味を変えて使う機構」「継承すると危険な前提」の三列で作る。renderer、input、save、map generator は基盤候補、既存 attack や item interaction は意味を変える候補、window size、旧 UI event、特定 game state への暗黙参照は危険候補になる。新規実装量ではなく、player の主要な state→action→result が元作とどれだけ変わるかを派生作の独自性指標にする。

初日には実装より先に、最小解像度の UI mockup と、一回のプレイで繰り返す主要 loop の state table を作る。mockup で常時見えない情報は、単に縮小せず「判断から消す」「必要時だけ開く」「既存 backend の出力を要約する」のどれかに分類する。POLYBOT-7 の info strip のような表示転用は短期には有効だが、headless test では hidden console が更新され続けること、keyboard と mouse の両経路で無効な画面へ遷移しないことを invariant にする。

制作中は追加 mechanic ごとに局所価値と schedule cost を分けて記録する。map 探索を成立させる permanent upgrade のように価値が高くても、新規 content、UI、serialization、balance の四方向へ波及するなら、cut line を同時に決める。中盤以降の追加は「追加する代わりに何を落とすか」が書けない限り入れない。技術的 shortcut は禁止せず、期限、削除条件、壊れ得る入力経路を debt note に残す。これなら hack を意図的な一時構造として扱える。

最終日は感覚調整だけでなく、drop 出現率、空 slot 継続 turn、主要 weapon を得るまでの距離、到達不能 state、入力経路別 crash を deterministic seed で集計する。最低出現率の強制は emergency guard として分離し、後日分布を再設計できるようにする。小さな検証なら、既存 prototype から mechanic を一つ意味変換した派生版を作り、(1)基盤再利用時間、(2)新 loop 実装時間、(3)継承前提による defect、(4)元作と異なる行動の比率を記録する。再利用が本当に体験開発へ時間を移したかを、完成の有無だけでなく工数と挙動差分で判定できる。

■ メリット・デメリット
メリットは、熟知した engine と tool を使い、基礎機能ではなく新しい interaction、content、playable な調整へ時間を集中できること。既存機構の意味変換は少ない code で大きな体験差を作り、UI mockup と telemetry は締切前の致命的な制約を早く露出させる。派生作で見つけた engine bug や render 改善が元作へ還元される副産物もある。

デメリットは、旧作の暗黙前提と入力経路を丸ごと引き継ぎ、表面上消した機能が裏で動き続けること。設計詳細が未確定なまま開始すると、一つの mechanic 変更が map、content、balance を連鎖的に圧迫する。80時間超を一週間へ投入した事例なので、通常の持続可能な制作速度の基準にもできない。shortcut を恒久 architecture と誤認すると、派生を重ねるほど検証不能な負債になる。

■ 判定
部分採用。reuse inventory、制約 UI の先行 mockup、入力経路を含む regression check、終盤 telemetry は短期制作の標準手順に採る。一方、画面外へ旧機能を残す hack や極端な労働時間は jam 専用の期限付き手段とし、通常制作へ一般化しない。

■ URL
https://www.gamedeveloper.com/design/workflow-and-design-behind-creating-one-game-from-another-in-a-single-week-7drl-postmortem-
