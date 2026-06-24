■ 概要
この論文は、LLM agent の「harness optimizer」を最終スコアだけで評価する危うさを扱う。harness optimizer とは、target agent の周囲にある tool、prompt、workflow、feedback、環境設定などを反復的に更新し、agent の性能を上げようとする optimizer agent のこと。従来の評価は、最終的に target agent の benchmark score が上がったかを見がちだった。しかしそれだけでは、optimizer が本当に原因を理解して有効な更新を選んだのか、単に試行錯誤で当たりを引いたのか、途中で有害な変更を混ぜたが別要因で帳尻が合ったのかが分からない。論文の問題設定はここにある。

提案は、optimizer の行為を「更新候補の優先順位付け」として直接評価する Priority Ranking である。ある harness component を変えたときに target agent の性能を改善しそうか、悪化させそうか、どの変更を先に試すべきかを optimizer に順位付けさせる。つまり、最終 rollout を何度も走らせて勝敗だけを見るのではなく、更新前の状況と候補群を見た段階で、optimizer が informed action を選べるかを測る。評価対象を最終性能から intermediate decision に移すことで、harness optimization の「判断力」そのものを測ろうとしている。

論文はこのために Shor を構築している。Shor は human-verified な optimization scenario の集合で、候補メモによると 182 件の scenario が使われる。scenario は harness component の更新が agent performance に与える影響を人間が確認した形で整備され、optimizer はそれらを priority ranking task として解く。重要なのは、このデータセットが単なる自然言語 preference ではなく、実際の multi-step harness optimization で target agent を改善できる能力との相関を見るために作られている点である。論文は、ranking performance が実運用の optimizer 成果と関係することを示し、最終スコアだけの評価では見えない optimizer の中間能力を取り出す。

この評価設計は、agent を評価する単位を「完成した agent」から「agent を良くする判断」へずらしている。harness optimizer は、いわば改善作業そのものを担当する agent なので、最終成果だけを見ると改善過程の失敗が隠れる。Priority Ranking では、tool の追加、prompt の変更、observation の整形、feedback の出し方、retry の入れ方のような候補を比較し、どれが改善に近いかを予測させる。これにより、optimizer が環境のどの層を causal に見ているか、あるいは表面的なキーワードで選んでいるだけかを検査しやすくなる。

結論は、harness optimizer を評価するときは「何点上がったか」だけでは不十分で、どの component を、なぜ、どの順番で触るべきだと判断したかを評価面に出す必要がある、というもの。これは agent 評価の粒度を変える提案であり、optimizer 自身を agent として見て、その行為系列の妥当性を測る。特に自動改善系では、最終 outcome はノイズが大きく、コストも高く、失敗原因の帰属が難しい。Priority Ranking は、評価をより小さい単位に分解し、低コストで、かつ原因に近い場所を測ろうとする設計である。

■ 内容分析
この論文の肝は、harness engineering を「良い仕組みを足せば勝つ」という一般論から一段進めて、改善システムの診断可能性へ移している点にある。final score は制作現場でも魅力的だが、最終値だけを見ていると、optimizer が test runner を直したのか、prompt を過剰適合させたのか、log schema を変えて judge を騙したのか、単に seed に恵まれたのかが混ざる。Priority Ranking は、その混ざりを避けるために、行為候補を並べる能力を切り出す。

評価としての面白さは、optimizer に「変更を実行して結果を出せ」と言うのではなく、「変更候補の価値を見抜け」と問うところにある。これは agent の実装能力と判断能力を分ける。実装力が低くても良い改善方針を見抜ける agent、逆に実装はできるが無差別に触る agent を区別できる。harness optimizer の研究ではこの差が大きい。なぜなら実運用では、毎回 full rollout で確認するより、まずどの観測装置、tool contract、feedback、prompt、judge、retry policy を触るべきかを絞るほうが価値を持つからである。

ただし、この形式は scenario の品質に強く依存する。human-verified といっても、候補 component の粒度、比較対象、性能変化の測り方が狭いと、ranking task は現場の複雑さを代表しない。さらに、priority ranking は「良い順番を知っている」ことを測るが、実際に安全に変更を適用し、ログを読み、失敗時に撤退する能力までは測らない。したがってこれは final evaluation の代替ではなく、harness optimizer の中間診断として使うのが妥当である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、playable diff の失敗時に「どこを直すべきか」を毎回判断している。候補は headless test、操作感評価、LLM judge、Slack feedback、記憶 recall、staging schema、ゲーム内 telemetry などに分かれる。最終的にゲームが良くなったかだけを見ると、どの検証層が効いたのか分からない。ここに Priority Ranking 型の小さな probe を入れられる。

具体的には、1 つの prototype について失敗ログと改善候補を並べ、「次に直すべき component top 3」を log_cdx に出させる。候補は UI 操作 probe、collision test、level seed coverage、LLM judge rubric、game-rights feedback 取り込み、memory recall query などに固定する。その後の実作業で本当に効いた component を記録すれば、Codex 自身の改善判断を評価できる。Phase 3b/4a では恒久ルールを増やすより、失敗ごとに ranking record を残す方が軽い。

このとき正解は一発で決めない。最初は「採用した修正」「実際に改善した指標」「後から不要だったと分かった修正」を分けて記録する。例えば playable diff が面白くない時、LLM judge prompt を直すべきか、操作ログを増やすべきか、敵 AI を単純化すべきかを ranking し、次回サイクルでどの判断が当たったかだけ確認する。この粒度なら、研究用 benchmark を作らなくても運用ログとして始められる。

■ メリット・デメリット
メリットは、改善作業の優先順位を観測可能にできること。最終成果が良いか悪いかだけでなく、どの診断が当たったかを残せるため、次回の制作で再利用しやすい。full playtest を何度も回す前に候補を絞れる点も実務的である。

デメリットは、ranking の正解作りが難しいこと。人間が後から見て「これが効いた」と判断しても、複数要因が絡む。候補集合を狭く作りすぎると、実際には必要だった別の修正が見えなくなる。最終成果評価と切り離しすぎると、きれいな順位付けだけが上手い agent になる危険もある。

■ 判定
部分採用。harness optimizer 全体を導入するのではなく、playable diff の失敗後に「どの検証・記憶・評価 component を先に直すか」を priority ranking として記録する。最終スコア評価の代替ではなく、改善判断の診断ログとして使う。

■ URL
https://arxiv.org/abs/2605.22505
