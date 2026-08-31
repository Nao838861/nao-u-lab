■ 概要
『Harvesters』は、Unity を7年使ってきた作者が、Godot で初めて一人で完成させた宇宙採掘 clicker / incremental game の約3か月の開発記録である。当初は1か月以内を想定し、目標を二つに絞った。一つは AI に coding を補助させ、作者自身は game design と art creation を練習すること。もう一つは、何か一つを外注し、発注と受入を経験することだった。結果は「AI に丸ごと任せれば短期化する」という成功談ではない。小さな作品でも予定の3倍を要し、AI、外注、友人による反復 playtest を組み合わせても、balance は未解決のまま残った。その一方、最初の playable から試し続けたため、公開可能な状態まで持ち上げられたという報告である。

coding には Claude Code、GDScript、拡張なしの Godot を使い、作業中に `claude.md` を更新して文脈を保持した。ただし作者は、programming knowledge が必要で、AI が長時間試しても解けない bug があると明記する。特に Resource、Config、Scene、UI の初期構造を人間が整えておくと、その後の作業が楽になった。つまり自動化の中心は、設計責任の移譲ではなく、engine 内の境界と正本を人間が作った後の実装補助だった。

外注は Fiverr で menu / cover art を依頼し、納品は約10日。parallax 化には完成画像だけでなく、各要素を別 sprite として書き出し、後から編集できる source file が必要だと分かった。音楽も外注予定だったが、SunVox と音楽理論教材を使って自作へ切り替えた。build encryption では Windows / Web 向け engine source の compile、key、export 設定に1〜1.5時間を使ったものの、作者自身が「大作でも解析されるため重要度は低いかもしれない」と振り返っている。各選択には制作速度だけでなく、学習、編集可能性、保護に払う時間という別の目的が混在していた。

評価の中核は、複数の友人が最初の playable から bug 発見と feedback に参加し、全編を何度も完走したことにある。最速記録は16分50秒。それでも作者は incremental game は完走試験の量が多く、最終版にも balance 不足が残ったとする。公開コメントには、全強化まで約45分、終盤は労働者の約80%が一つの drill を待つ grind になったという具体例があり、作者も late-game upgrade cost を調整し切れなかったと認めている。一方、初回 test で小さな harvester が「かわいい」と受け取られた観察から、無名の採集者へ個性と愛着を足す方向が強化された。結論は、AI や外注が一人制作を自動的に短くするのではなく、人間が構造と受入条件を握り、first playable から実プレイを重ねることで、失敗を公開前に小さくするというものだ。

■ 内容分析
この記録の価値は、道具の列挙ではなく、solo development の四つの境界が見える点にある。第一は記憶の境界で、`claude.md` に継続文脈を残す。第二は engine 構造の境界で、Resource / Config / Scene / UI を人間が先に分ける。第三は外注物の境界で、完成画像ではなく分離された source と編集可能性まで受入条件にする。第四は評価の境界で、動く build を早期に他者へ渡す。この四つが曖昧なままでは、AI は誤った構造を速く増やし、外注物は実装時に分解できず、feedback は終盤の大改修になる。

特に重要なのは、playtest が defect 検出と design 発見を同時に担ったことだ。bug と balance 不足だけでなく、「harvester がかわいい」という反応が、採集者を単なる生産単位から愛着対象へ変える設計根拠になった。これは headless test では拾えない。一方、16分50秒と約45分という完走時間の開き、単一 drill への集中は、同じ「完走できた」でも progression の体験が違うことを示す。最速完走だけを最適化すると一般プレイヤーの停滞を隠し、平均だけを取ると速度分布の裾を隠す。incremental game では完走可否より、各 upgrade 間隔、遊休 worker 比率、入力密度、終盤の選択肢数を時系列で見る必要がある。

ただし、これは統制された比較ではない。tester 数、build 数、修正件数、AI なしの場合の工数、feedback が何を変えたかは記録されていない。友人 tester には好意的 bias があり、速度走者の反復完走は熟練者寄りである。予定超過も AI の失敗だけでなく、初の一人制作、art と音楽の学習、外注、暗号化を同時に入れた scope の影響が大きい。したがって「Claude Code で生産性が上がった」「早期 test で balance が解決した」とは言えない。確実に読めるのは、AI の限界点と構造化の必要を作者が観察し、早期 test がなければ品質はさらに悪かったと判断したことまでである。

■ 自分達の環境への適用
ゲーム制作では、最初の playable を「一つの採集者が移動し、一つの資源を掘り、帰還して加算し、一つの upgrade を買え、save / load できる」最小 loop として先に固定する。AI に広い feature 実装を渡す前に、scene ownership、resource schema、UI から domain state への一方向の接続、config の正本を人間側で決める。AI が同じ再現 bug に数回失敗したら prompt を伸ばし続けず、reproduction、関連 scene、期待 invariant を切り出して人間が境界を修正する。作業記憶には決定だけでなく、対象 build hash、未解決 bug、検証 command を残し、古い文脈による修正の巻き戻りを防ぐ。

headless 評価は実プレイの代替ではなく、反復完走の費用を下げる層にする。資源の非負、採掘量の保存、cost の単調性、save / load 一致、全 upgrade 到達可能性、一定時間進行後の遊休率を自動確認する。さらに event log へ upgrade 購入時刻、worker の待機時間、drill queue、手動 click 数を残し、複数の固定 bot 方策で終盤まで fast-forward する。human playtest では導線理解、愛着、退屈、選択の意味を観察し、自動計測の時間軸と同じ build に結び付ける。16分50秒のような最短値だけでなく、中央値、遅い側、区間ごとの停滞を比較する。

外注時は、依頼前に layered source、要素別 export、canvas size、parallax の余白、色空間、改変権、再納品条件を acceptance checklist にする。発注の目的も「完成品を得る」か「協働を学ぶ」かを分ける。暗号化のような保護作業は threat model と時間上限を先に置き、playable と balance 改善を押しのけない。小さな検証として、次の prototype 一本で初回 playable 時点から build ごとの自動指標と短い人間観察を併記し、終盤 bottleneck を公開直前ではなく二回目の反復で検出できるかを見る。

■ メリット・デメリット
メリットは、AI coding、外注、playtest を別々の万能策にせず、人間が境界を設計する一つの学習 loop として扱えることだ。最小 loop を早く触れるため、bug だけでなくキャラクターへの愛着のような設計機会も早期に見つかる。headless の invariant と実プレイの感触を分業させれば、incremental game の長い完走試験も反復しやすい。外注 source の受入仕様は、後工程の作り直しを減らす。

デメリットは、早期 test を始めても tester の偏りと完走コストは残り、balance が自動的に収束しないことだ。AI 用の文脈更新が誤った仕様を固定する危険もあり、engine 構造を理解しないまま自動化範囲を広げると負債を増やす。外注、音楽学習、暗号化を一度に入れると、制作目標と学習目標が競合して予定を押し広げる。記事には定量的な before / after がないため、個々の tool の効果量は移植できない。

■ 判定
部分採用。first playable からの反復 test、人間が Godot の構造を先に定義すること、外注物を source 単位で受け入れることは採用する。AI の生産性や早期 test の十分性は記事から確定できないため、build ごとの headless 指標と human observation を併記して検証する。scope を増やす学習課題と、公開品質へ直結する作業は時間枠を分ける。

■ URL
https://chuckiee3.itch.io/harvesters/devlog/1584663/harvesters-a-little-clicker-game-about-mining-in-space
https://chuckiee3.itch.io/harvesters/comments?before=4
