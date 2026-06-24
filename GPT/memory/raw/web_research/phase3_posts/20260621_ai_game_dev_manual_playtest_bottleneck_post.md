■ 概要
Jeff Schomay の記事は、AI coding assistant をゲーム制作に使う時の現実的な効き方を、個人制作ゲーム Crossword Dungeon の制作記録として説明している。焦点は「AI でゲームが一瞬で完成する」ではなく、コード実装の時間が短くなった結果、制作者の時間がどこへ移るかである。作者は普段のソフトウェア開発では AI coding tools を日常的に使い、最近はコードを手で書くこともレビューすることもほぼなくなったという前提を置く。ただしゲーム制作では、AI 生成アセットではなく、コード実装に限定して話している。

題材の Crossword Dungeon は、クロスワードの各文字をダンジョンの部屋として扱い、宝、罠、敵、RPG 的成長とパズル解答を絡めるゲームである。作者はまず、人間が手で書いた design doc sketch を用意し、Claude Code に質問させながら full design doc へ拡張した。その後、design doc を milestone 群に分解し、各 milestone に design、behavior、technical aspects、validation criteria を持たせた。重要なのは、この milestone が単なる作業リストではなく、「ダンジョンを描画できる」「移動できる」「固有 encounter が出る」のように、毎回 playable な価値単位へ区切られていた点である。AI に作らせる前に、作者が受け入れ判断できる小さな実装単位を設計していた。

実装前には technical design doc と CLAUDE.md も作っている。technical design doc では、既存ゲームで使ったライブラリや coding pattern、AI が間違えそうな箇所、過剰設計しがちな部分を先に書く。CLAUDE.md では、参照すべき prior art、milestone-driven workflow、実装後の validation steps を明示する。つまり AI は白紙から自由に作るのではなく、既存コード、設計文書、milestone、validation の枠内で作業する。この構造により、短い指示で Claude が必要文書を読み、質問し、重要判断を decisions doc に残し、数分後にブラウザで動くゲームを出す流れを作っている。

記事の核心は後半の time breakdown にある。MVP 後に新しい special room を追加する代表例では、作者は数日にわたってゲームを遊びメモを集め、Claude と 1 時間話して milestone に落とし、さらに 2 時間かけて表示文言や望ましい挙動を編集した。Claude の自律実装は 30 分で終わる。一方、その後に 5 時間以上の manual play-testing と tweaking が必要だった。通常の業務コードなら testing harness で検証できるが、ゲームでは look、feel、playability を確認する必要があり、単体テストや静的チェックだけでは受け入れ判断にならない。AI によって「書く」工程が速くなるほど、人間の仕事は実装から、遊びながら違和感を見つけ、仕様を言語化し、受け入れる工程へ移る。

記事末尾の update で、作者はこのボトルネックに対して autonomous AI play-testing を導入したと述べ、別記事で具体化している。ブラウザ自動操作だけではスクリーンショット数や状態の複雑さが重くなるため、ゲーム本体を変更せず、Node.js wrapper で text-based renderer と synthetic events を追加した。AI は HTTP 経由で snapshot を読み、key input を送り、同じ game logic と state machine を動かす。これにより AI は code path を踏むだけでなく、端末上で実際にプレイし、locked door、combat、shop、panel update などを確認できるようになった。さらに bug fixture を作らせ、特定バグを再現し、修正し、再度プレイして検証する流れまで接続している。

結論は、AI 導入の価値を「実装担当者の代替」と見るより、「実装後の検証を人間が観察可能な形に引き上げる設計」と見るべきだということになる。作者は AI に大きく依存しているが、それでも creative direction、milestone の受け入れ、manual playtest、feel issue の発見は残る。AI が速いほど、制作者が何を遊ばせ、何を合格にし、どの違和感を設計問題として扱うかが重要になる。

■ 内容分析
この記事で強いのは、AI coding の成功例を「自動実装の速さ」だけで語っていない点である。多くの AI game dev 論は、prompt から prototype が出る瞬間を中心に置くが、ここでは playable MVP の後が主戦場になっている。特に 30 分の自律実装に対して 5 時間以上の manual play-testing が発生したという比率は、ゲーム制作では validation の性質が通常ソフトウェアと違うことをよく示している。

通常の業務アプリなら、仕様に対する入出力、API 契約、回帰テスト、UI snapshot でかなりの受け入れ判断ができる。しかしゲームでは、正しく動くこと、面白く感じること、UI が読めること、難度が納得できること、プレイヤーが次に何をすべきか分かることが混ざる。作者の workflow は、ここを曖昧な「人間の勘」に戻さず、milestone、validation criteria、decisions doc、architecture doc、playtesting wrapper へ分解している。これは AI の能力というより、AI が迷わず作業できる外部足場の設計である。

autonomous play-testing の部分も、AI に画面をそのまま見せる方向へ進んでいないのが重要である。ゲームの状態を text renderer と compact map へ落とし、synthetic events で操作し、同じ runtime logic を通す。これは人間向け UI を壊さず、AI 向け観測面を別に作る設計で、Nao_u_BOT の headless playtest に近い。AI は「人間の感性」を完全に代替しないが、機能確認、edge case、bug reproduction、fixture 化、修正後確認を肩代わりできる。結果として人間は最終的な play と feel に集中できる。

限界も明確である。これは単一作者、単一ゲーム、text-heavy turn-based game の事例であり、アクション性の高いゲーム、リアルタイム物理、視覚演出中心のゲームへそのまま移るわけではない。また AI が人間プレイヤーと同じ stumbling point に当たったという記述は興味深いが、定量評価ではなく制作実感である。読むべきなのは「AI playtester が人間代替になる」という主張ではなく、「AI が扱いやすい観測面をゲーム側に用意すると、実装後検証の一部を短い loop にできる」という制作パターンである。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、この事例を headless 評価の位置づけに使える。今後の prototype では、見た目の screenshot 評価だけでなく、ゲーム本体を変えずに state snapshot、compact map、event log、available actions、last popup、goal progress を返す AI-readable renderer を早めに用意する。AI には milestone ごとの acceptance criteria に対して happy path、edge case、regression path をプレイさせる。

特に Phase 3b/4a の probe としては、実装タスクの done condition に「manual feel check の前に AI playtest transcript を残す」を足すのが現実的である。死亡、詰まり、長時間停止、UI 誤読、同じ行動の反復、想定外のクリアを event anchor として残し、人間は transcript と browser 実機確認を見比べる。AI が feel を判定するのではなく、人間が feel を見る前に、機能バグと再現手順を薄く剥がしておく役にする。

記憶システム側には、prototype ごとに `playtest_surface`、`acceptance_criteria`、`ai_playtest_transcript`、`manual_feel_notes` を分けて保存したい。AI 実装ログと人間の違和感メモを混ぜると、「何が自動で検証でき、何が人間の判断だったか」が曖昧になる。

■ メリット・デメリット
メリットは、AI coding の速度差を制作工程全体で吸収できること。実装だけ速くしても、受け入れ検証が詰まれば playable diff は増えない。AI-readable renderer と synthetic input を用意すれば、bug reproduction、edge case、修正後確認を短い loop にできる。

デメリットは、検証面を作るコストと、AI が扱いやすい表現へ寄せすぎると、手触りの問題を見落とすこと。

■ 判定
部分採用。AI に人間 playtest を置き換えさせる話ではなく、manual feel check の前段に、AI が実行できる検証面と transcript を置く運用として採用する。実装完了条件に acceptance playtest を含める設計は、次の小型 prototype から試す価値がある。

■ URL
https://blog.jeffschomay.com/how-i-m-using-ai-for-game-dev-in-2026
https://blog.jeffschomay.com/letting-ai-play-my-game
